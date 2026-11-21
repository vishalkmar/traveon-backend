/**
 * Two-factor helpers for the admin login.
 *
 *  - TOTP (RFC 6238, the 6-digit code in Google Authenticator / Authy),
 *    implemented on Node's crypto so there is no extra npm dependency.
 *  - AES-256-GCM encryption for TOTP secrets stored in the database.
 *  - Hashing for one-time email codes (only a hash is ever stored).
 */
import crypto from "crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const TOTP_PERIOD_SECONDS = 30;
const TOTP_DIGITS = 6;

/* ───────────────────────── keys ───────────────────────── */

function encryptionKey() {
  const raw = process.env.TWO_FACTOR_ENC_KEY || process.env.JWT_SECRET;
  if (!raw) throw new Error("TWO_FACTOR_ENC_KEY (or JWT_SECRET) must be set");
  return crypto.createHash("sha256").update(`2fa-enc:${raw}`).digest();
}

function hmacKey() {
  const raw = process.env.TWO_FACTOR_ENC_KEY || process.env.JWT_SECRET || "";
  return `2fa-otp:${raw}`;
}

/* ───────────────────────── base32 ───────────────────────── */

export function base32Encode(buffer) {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return output;
}

export function base32Decode(input) {
  const clean = String(input).toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const bytes = [];
  for (const char of clean) {
    value = (value << 5) | BASE32_ALPHABET.indexOf(char);
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

/* ───────────────────────── TOTP ───────────────────────── */

export function generateTotpSecret() {
  return base32Encode(crypto.randomBytes(20)); // 160-bit, the RFC default
}

function hotp(secretBase32, counter) {
  const counterBuf = Buffer.alloc(8);
  counterBuf.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto
    .createHmac("sha1", base32Decode(secretBase32))
    .update(counterBuf)
    .digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    (hmac[offset + 1] << 16) |
    (hmac[offset + 2] << 8) |
    hmac[offset + 3];
  return String(binary % 10 ** TOTP_DIGITS).padStart(TOTP_DIGITS, "0");
}

export function currentTotpStep(now = Date.now()) {
  return Math.floor(now / 1000 / TOTP_PERIOD_SECONDS);
}

/**
 * Checks a 6-digit code against the secret, allowing one 30s step of clock
 * drift either way. Returns the matched time step (so the caller can refuse
 * to accept the same code twice) or null.
 */
export function verifyTotp(secretBase32, code, { lastUsedStep = null, window = 1 } = {}) {
  const token = String(code || "").replace(/\s+/g, "");
  if (!/^\d{6}$/.test(token)) return null;
  const now = currentTotpStep();
  for (let drift = -window; drift <= window; drift += 1) {
    const step = now + drift;
    if (lastUsedStep !== null && step <= Number(lastUsedStep)) continue; // replay
    const expected = hotp(secretBase32, step);
    if (crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token))) {
      return step;
    }
  }
  return null;
}

export function buildOtpAuthUrl({ secret, account, issuer = "Traveon Admin" }) {
  const label = encodeURIComponent(`${issuer}:${account}`);
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: String(TOTP_DIGITS),
    period: String(TOTP_PERIOD_SECONDS),
  });
  // URLSearchParams writes spaces as "+", which some authenticator apps show literally
  return `otpauth://totp/${label}?${params.toString().replace(/\+/g, "%20")}`;
}

/* ───────────────────── secret encryption ───────────────────── */

export function encryptSecret(plain) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(plain), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, encrypted].map((b) => b.toString("base64")).join(".");
}

export function decryptSecret(payload) {
  if (!payload) return null;
  try {
    const [iv, tag, data] = String(payload).split(".").map((p) => Buffer.from(p, "base64"));
    const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

/* ───────────────────── email one-time codes ───────────────────── */

export function generateEmailCode() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, "0");
}

export function hashEmailCode(userId, purpose, code) {
  return crypto
    .createHmac("sha256", hmacKey())
    .update(`${userId}:${purpose}:${String(code).trim()}`)
    .digest("hex");
}

export function safeEqualHex(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}

export function maskEmail(email) {
  if (!email || !email.includes("@")) return "";
  const [name, domain] = email.split("@");
  const visible = name.slice(0, Math.min(2, name.length));
  return `${visible}${"*".repeat(Math.max(1, name.length - visible.length))}@${domain}`;
}
