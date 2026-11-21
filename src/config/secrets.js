/**
 * Central place for the app's secrets.
 *
 * No hard-coded fallback secrets anywhere: a missing or obviously-weak secret
 * makes the server refuse to start, instead of silently signing tokens with a
 * value an attacker could guess ("supersecretkey", "jktyagi", ...).
 */
import dotenv from "dotenv";
dotenv.config();

const WEAK = new Set([
  "supersecretkey",
  "jktyagi",
  "secure-doc-dev-secret",
  "secret",
  "changeme",
  "password",
]);

function required(name, { minLength = 16 } = {}) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`[config] Missing required secret ${name}. Set it in .env before starting the server.`);
  }
  if (WEAK.has(value.trim().toLowerCase())) {
    throw new Error(`[config] ${name} is set to a known weak value. Use a long random string.`);
  }
  if (value.trim().length < minLength) {
    throw new Error(`[config] ${name} is too short (min ${minLength} chars). Use a long random string.`);
  }
  return value;
}

export const JWT_SECRET = required("JWT_SECRET");

// Used to encrypt stored TOTP secrets; falls back to JWT_SECRET by design.
export const TWO_FACTOR_ENC_KEY = process.env.TWO_FACTOR_ENC_KEY || JWT_SECRET;

export default { JWT_SECRET, TWO_FACTOR_ENC_KEY };
