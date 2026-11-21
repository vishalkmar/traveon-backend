const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../models");
const { sendEmail } = require("../services/email.service");
const tf = require("../utils/twoFactor");

const { User } = db;

const { JWT_SECRET } = require("../config/secrets");
// Signed with a different key, so a half-finished login can never be used as
// a normal admin token (authenticateToken only accepts JWT_SECRET).
const CHALLENGE_SECRET = `${JWT_SECRET}:2fa-challenge`;
const CHALLENGE_TTL = "10m";

const EMAIL_CODE_TTL_MS = 10 * 60 * 1000;
const EMAIL_RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_CODE_ATTEMPTS = 5;

/* ───────────────────────── helpers ───────────────────────── */

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24h, matches the JWT expiry
const AUTH_COOKIE = "token";

function issueSessionToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
}

// httpOnly so JavaScript (and therefore any XSS or devtools copy-paste) cannot
// read the token. SameSite=None+Secure in production so it works across the
// site's domains over HTTPS; Lax over plain HTTP in local dev.
function authCookieOptions() {
  const prod = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: prod,
    sameSite: prod ? "none" : "lax",
    maxAge: SESSION_MAX_AGE_MS,
    path: "/",
  };
}

function sessionResponse(res, user) {
  const token = issueSessionToken(user);
  res.cookie(AUTH_COOKIE, token, authCookieOptions());
  return res.status(200).json({
    success: true,
    data: {
      // Still returned for backward compatibility; the browser client no longer
      // stores it — the httpOnly cookie is the source of truth.
      token,
      user: { id: user.id, username: user.username, role: user.role },
    },
  });
}

exports.logout = (req, res) => {
  res.clearCookie(AUTH_COOKIE, { ...authCookieOptions(), maxAge: undefined });
  return res.json({ success: true, message: "Logged out" });
};

function enabledMethods(user) {
  const methods = [];
  if (user.totpEnabled && user.totpSecret) methods.push("totp");
  if (user.emailOtpEnabled && user.emailOtpAddress) methods.push("email");
  return methods;
}

function securityStatus(user) {
  return {
    totpEnabled: Boolean(user.totpEnabled && user.totpSecret),
    emailOtpEnabled: Boolean(user.emailOtpEnabled && user.emailOtpAddress),
    emailOtpAddress: user.emailOtpAddress || null,
    username: user.username,
  };
}

async function loadUserFromRequest(req) {
  await db.schemaReady;
  if (!req.user || !req.user.id) return null;
  return User.findByPk(req.user.id);
}

function readChallenge(token) {
  try {
    const payload = jwt.verify(String(token || ""), CHALLENGE_SECRET);
    return payload && payload.purpose === "2fa-login" ? payload : null;
  } catch {
    return null;
  }
}

/**
 * Generates a 6-digit code, stores only its hash, and emails it.
 * Returns { ok, status, message }.
 */
async function sendEmailCode(user, { to, purpose }) {
  const lastSent = user.otpSentAt ? new Date(user.otpSentAt).getTime() : 0;
  if (user.otpPurpose === purpose && Date.now() - lastSent < EMAIL_RESEND_COOLDOWN_MS) {
    const wait = Math.ceil((EMAIL_RESEND_COOLDOWN_MS - (Date.now() - lastSent)) / 1000);
    return { ok: false, status: 429, message: `Please wait ${wait}s before requesting another code.` };
  }

  const code = tf.generateEmailCode();
  await user.update({
    otpCodeHash: tf.hashEmailCode(user.id, purpose, code),
    otpPurpose: purpose,
    otpExpiresAt: new Date(Date.now() + EMAIL_CODE_TTL_MS),
    otpSentAt: new Date(),
    otpAttempts: 0,
  });

  const heading = purpose === "email-setup" ? "Confirm your email for sign-in codes" : "Your admin sign-in code";
  const result = await sendEmail({
    to,
    subject: `${code} is your Traveon admin verification code`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#1f2937">
        <h2 style="margin:0 0 12px;color:#0f4c45">${heading}</h2>
        <p style="margin:0 0 16px">Use this code to continue. It expires in 10 minutes.</p>
        <div style="font-size:32px;font-weight:700;letter-spacing:8px;background:#f1f5f4;border-radius:10px;padding:16px;text-align:center">${code}</div>
        <p style="margin:16px 0 0;font-size:13px;color:#6b7280">If you did not try to sign in to the Traveon admin console, change your password immediately.</p>
      </div>`,
  });

  if (!result) {
    return { ok: false, status: 502, message: "Could not send the email. Please try again." };
  }
  return { ok: true };
}

/** Checks an emailed code. Returns { ok, status, message }. */
async function checkEmailCode(user, purpose, code) {
  if (user.otpPurpose !== purpose || !user.otpCodeHash) {
    return { ok: false, status: 400, message: "Request a new code first." };
  }
  if (!user.otpExpiresAt || new Date(user.otpExpiresAt).getTime() < Date.now()) {
    return { ok: false, status: 400, message: "This code has expired. Request a new one." };
  }
  if (user.otpAttempts >= MAX_CODE_ATTEMPTS) {
    return { ok: false, status: 429, message: "Too many wrong attempts. Request a new code." };
  }

  const matches = tf.safeEqualHex(tf.hashEmailCode(user.id, purpose, code), user.otpCodeHash);
  if (!matches) {
    await user.update({ otpAttempts: user.otpAttempts + 1 });
    return { ok: false, status: 401, message: "Incorrect code." };
  }

  await user.update({ otpCodeHash: null, otpPurpose: null, otpExpiresAt: null, otpAttempts: 0 });
  return { ok: true };
}

/** Checks an authenticator-app code against a stored (encrypted) secret. */
async function checkTotpCode(user, encryptedSecret, code) {
  const secret = tf.decryptSecret(encryptedSecret);
  if (!secret) return false;
  const step = tf.verifyTotp(secret, code, { lastUsedStep: user.totpLastStep });
  if (step === null) return false;
  await user.update({ totpLastStep: step });
  return true;
}

/**
 * Step-up check for sensitive settings changes (turning 2FA off).
 * The code must come from a factor the admin currently holds — an authenticator
 * code, or a code emailed to the configured address. A person who only knows
 * the password cannot produce either, so they cannot disable protection.
 */
async function verifyStepUp(user, code) {
  if (user.totpEnabled && user.totpSecret && (await checkTotpCode(user, user.totpSecret, code))) {
    return true;
  }
  if (user.emailOtpEnabled && user.emailOtpAddress) {
    const check = await checkEmailCode(user, "stepup", code);
    if (check.ok) return true;
  }
  return false;
}

async function requirePassword(user, password) {
  if (!password) return false;
  return bcrypt.compare(String(password), user.password);
}

/* ───────────────────────── login ───────────────────────── */

exports.login = async (req, res) => {
  try {
    await db.schemaReady;
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username and password are required" });
    }

    const user = await User.findOne({ where: { username: String(username).trim() } });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(String(password), user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const methods = enabledMethods(user);
    if (methods.length === 0) {
      return sessionResponse(res, user);
    }

    // Password is right; a second factor is still needed.
    const challengeToken = jwt.sign({ id: user.id, purpose: "2fa-login" }, CHALLENGE_SECRET, {
      expiresIn: CHALLENGE_TTL,
    });

    let emailSent = false;
    if (methods.length === 1 && methods[0] === "email") {
      const sent = await sendEmailCode(user, { to: user.emailOtpAddress, purpose: "login" });
      emailSent = sent.ok;
    }

    return res.status(200).json({
      success: true,
      data: {
        requires2FA: true,
        challengeToken,
        methods,
        emailHint: methods.includes("email") ? tf.maskEmail(user.emailOtpAddress) : null,
        emailSent,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.sendLoginEmailCode = async (req, res) => {
  try {
    await db.schemaReady;
    const challenge = readChallenge(req.body.challengeToken);
    if (!challenge) {
      return res.status(401).json({ success: false, message: "Sign-in session expired. Please log in again." });
    }

    const user = await User.findByPk(challenge.id);
    if (!user || !enabledMethods(user).includes("email")) {
      return res.status(400).json({ success: false, message: "Email verification is not enabled." });
    }

    const sent = await sendEmailCode(user, { to: user.emailOtpAddress, purpose: "login" });
    if (!sent.ok) return res.status(sent.status).json({ success: false, message: sent.message });

    res.json({ success: true, message: `Code sent to ${tf.maskEmail(user.emailOtpAddress)}` });
  } catch (error) {
    console.error("Send login code error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.verifyLogin = async (req, res) => {
  try {
    await db.schemaReady;
    const { challengeToken, method, code } = req.body;
    const challenge = readChallenge(challengeToken);
    if (!challenge) {
      return res.status(401).json({ success: false, message: "Sign-in session expired. Please log in again." });
    }

    const user = await User.findByPk(challenge.id);
    const methods = user ? enabledMethods(user) : [];
    if (!user || !methods.includes(method)) {
      return res.status(400).json({ success: false, message: "This verification method is not enabled." });
    }

    if (method === "totp") {
      const ok = await checkTotpCode(user, user.totpSecret, code);
      if (!ok) return res.status(401).json({ success: false, message: "Incorrect or expired code." });
    } else {
      const check = await checkEmailCode(user, "login", code);
      if (!check.ok) return res.status(check.status).json({ success: false, message: check.message });
    }

    return sessionResponse(res, user);
  } catch (error) {
    console.error("Verify login error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/* ───────────────────── security settings (logged-in admin) ───────────────────── */

exports.getSecurityStatus = async (req, res) => {
  try {
    const user = await loadUserFromRequest(req);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: securityStatus(user) });
  } catch (error) {
    console.error("Security status error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.startTotpSetup = async (req, res) => {
  try {
    const user = await loadUserFromRequest(req);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const secret = tf.generateTotpSecret();
    await user.update({ totpPendingSecret: tf.encryptSecret(secret) });

    res.json({
      success: true,
      data: {
        secret,
        otpauthUrl: tf.buildOtpAuthUrl({ secret, account: user.username }),
      },
    });
  } catch (error) {
    console.error("TOTP setup error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.enableTotp = async (req, res) => {
  try {
    const user = await loadUserFromRequest(req);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (!user.totpPendingSecret) {
      return res.status(400).json({ success: false, message: "Start the setup again." });
    }

    const secret = tf.decryptSecret(user.totpPendingSecret);
    const step = secret ? tf.verifyTotp(secret, req.body.code) : null;
    if (step === null) {
      return res.status(401).json({ success: false, message: "Incorrect code. Check the time on your phone and try again." });
    }

    await user.update({
      totpSecret: user.totpPendingSecret,
      totpPendingSecret: null,
      totpEnabled: true,
      totpLastStep: step,
    });
    res.json({ success: true, message: "Authenticator app enabled", data: securityStatus(user) });
  } catch (error) {
    console.error("TOTP enable error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Emails a step-up code to the admin's configured address, for confirming a
// sensitive change (turning a 2FA method off) when email is one of the factors.
exports.sendStepUpCode = async (req, res) => {
  try {
    const user = await loadUserFromRequest(req);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (!user.emailOtpEnabled || !user.emailOtpAddress) {
      return res.status(400).json({ success: false, message: "Email verification is not enabled." });
    }
    const sent = await sendEmailCode(user, { to: user.emailOtpAddress, purpose: "stepup" });
    if (!sent.ok) return res.status(sent.status).json({ success: false, message: sent.message });
    res.json({ success: true, message: `Code sent to ${tf.maskEmail(user.emailOtpAddress)}` });
  } catch (error) {
    console.error("Step-up code error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.disableTotp = async (req, res) => {
  try {
    const user = await loadUserFromRequest(req);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (!(await requirePassword(user, req.body.password))) {
      return res.status(401).json({ success: false, message: "Incorrect password." });
    }
    // Also require a code from a current factor, so a password alone can't disable 2FA.
    if (!(await verifyStepUp(user, req.body.code))) {
      return res.status(401).json({ success: false, message: "Incorrect or missing verification code." });
    }

    await user.update({ totpEnabled: false, totpSecret: null, totpPendingSecret: null, totpLastStep: null });
    res.json({ success: true, message: "Authenticator app turned off", data: securityStatus(user) });
  } catch (error) {
    console.error("TOTP disable error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.startEmailSetup = async (req, res) => {
  try {
    const user = await loadUserFromRequest(req);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const email = String(req.body.email || "").trim().toLowerCase();
    if (!isEmail(email)) {
      return res.status(400).json({ success: false, message: "Enter a valid email address." });
    }

    await user.update({ emailOtpPendingAddress: email });
    const sent = await sendEmailCode(user, { to: email, purpose: "email-setup" });
    if (!sent.ok) return res.status(sent.status).json({ success: false, message: sent.message });

    res.json({ success: true, message: `Code sent to ${tf.maskEmail(email)}` });
  } catch (error) {
    console.error("Email setup error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.enableEmail = async (req, res) => {
  try {
    const user = await loadUserFromRequest(req);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (!user.emailOtpPendingAddress) {
      return res.status(400).json({ success: false, message: "Enter your email and request a code first." });
    }

    const check = await checkEmailCode(user, "email-setup", req.body.code);
    if (!check.ok) return res.status(check.status).json({ success: false, message: check.message });

    await user.update({
      emailOtpAddress: user.emailOtpPendingAddress,
      emailOtpPendingAddress: null,
      emailOtpEnabled: true,
    });
    res.json({ success: true, message: "Email verification enabled", data: securityStatus(user) });
  } catch (error) {
    console.error("Email enable error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.disableEmail = async (req, res) => {
  try {
    const user = await loadUserFromRequest(req);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (!(await requirePassword(user, req.body.password))) {
      return res.status(401).json({ success: false, message: "Incorrect password." });
    }
    // Require a code from a current factor too (authenticator, or the step-up
    // email code), so a password alone can't disable 2FA.
    if (!(await verifyStepUp(user, req.body.code))) {
      return res.status(401).json({ success: false, message: "Incorrect or missing verification code." });
    }

    await user.update({ emailOtpEnabled: false, emailOtpAddress: null, emailOtpPendingAddress: null });
    res.json({ success: true, message: "Email verification turned off", data: securityStatus(user) });
  } catch (error) {
    console.error("Email disable error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
