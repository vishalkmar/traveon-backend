/**
 * Registry of documents that are served ONLY through the secure-doc proxy.
 *
 * The real (S3) URL never leaves the server: the browser talks to
 * /api/v1/secure-docs/:slug/session + /stream and receives AES-CTR encrypted
 * bytes that are useless without the per-session key handed out by /session.
 *
 * Add a new document by adding a slug here + the matching *_URL env var.
 */
const SECURE_DOCS = {
  "oman-mice-toolkit": {
    title: "Oman MICE Toolkit",
    // Source of truth is the env var; the literal is only a dev fallback.
    url:
      process.env.OMAN_TOOLKIT_PDF_URL ||
      "https://traveon-pdf-files.s3.ap-southeast-2.amazonaws.com/Oman_MICE_Toolkit_with_Watermark_compressed.pdf",
  },
};

export const getSecureDoc = (slug) => SECURE_DOCS[slug] || null;

/** Secret used to sign session tokens. */
export const getTokenSecret = () =>
  process.env.SECURE_DOC_SECRET || process.env.JWT_SECRET || "secure-doc-dev-secret";

/** Seconds a session token stays valid after /session. */
export const TOKEN_TTL_SECONDS = Number(process.env.SECURE_DOC_TOKEN_TTL || 120);

/** How many times one token may be redeemed (retries / StrictMode double-mount). */
export const TOKEN_MAX_USES = Number(process.env.SECURE_DOC_TOKEN_USES || 3);

/**
 * Origins allowed to open a session. Empty list = allow any origin
 * (keep it empty locally, set it in production).
 */
export const getAllowedOrigins = () =>
  (process.env.SECURE_DOC_ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean);

export default SECURE_DOCS;
