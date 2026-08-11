import crypto from "crypto";
import { Readable, pipeline } from "stream";

import SECURE_DOCS, {
  getSecureDoc,
  getTokenSecret,
  getAllowedOrigins,
  TOKEN_TTL_SECONDS,
  TOKEN_MAX_USES,
} from "../config/secureDocs.js";

/* ------------------------------------------------------------------ *
 * In-memory session store: nonce -> { slug, key, iv, exp, uses, fp }
 * Tokens live ~2 minutes, so this never grows large.
 * ------------------------------------------------------------------ */
const sessions = new Map();

const sweepSessions = () => {
  const now = Date.now();
  for (const [nonce, s] of sessions) {
    if (s.exp <= now) sessions.delete(nonce);
  }
};

/* ------------------------------------------------------------------ *
 * In-memory document cache so S3 is hit once, not once per visitor.
 * ------------------------------------------------------------------ */
const DOC_CACHE_TTL_MS = Number(process.env.SECURE_DOC_CACHE_TTL_MS || 30 * 60 * 1000);
const docCache = new Map(); // slug -> { buf, fetchedAt }
const inFlight = new Map(); // slug -> Promise<Buffer>

const fetchDocument = async (slug, url) => {
  const cached = docCache.get(slug);
  if (cached && Date.now() - cached.fetchedAt < DOC_CACHE_TTL_MS) return cached.buf;

  if (inFlight.has(slug)) return inFlight.get(slug);

  const task = (async () => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Upstream responded ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.slice(0, 5).toString("latin1") !== "%PDF-") {
      throw new Error("Upstream did not return a PDF");
    }
    docCache.set(slug, { buf, fetchedAt: Date.now() });
    return buf;
  })();

  inFlight.set(slug, task);
  try {
    return await task;
  } finally {
    inFlight.delete(slug);
  }
};

/**
 * Pull every registered document into memory at boot so the first visitor
 * doesn't sit through a cold S3 download (~20 MB from ap-southeast-2).
 */
export const warmSecureDocs = () => {
  Object.entries(SECURE_DOCS).forEach(([slug, doc]) => {
    fetchDocument(slug, doc.url)
      .then((buf) => console.log(`[secure-docs] cached ${slug} (${buf.length} bytes)`))
      .catch((err) => console.warn(`[secure-docs] warm-up failed for ${slug}:`, err.message));
  });
};

/* ------------------------------------------------------------------ *
 * Token helpers — payload is signed, never encrypted; the AES key that
 * actually unlocks the bytes is kept server-side and handed to the
 * client in the /session response body (never in a URL).
 * ------------------------------------------------------------------ */
const b64url = (buf) => Buffer.from(buf).toString("base64url");

const sign = (payloadB64) =>
  crypto.createHmac("sha256", getTokenSecret()).update(payloadB64).digest("base64url");

const makeToken = (payload) => {
  const body = b64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
};

const readToken = (token) => {
  if (typeof token !== "string" || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
};

/** Loose client fingerprint — no IP, so mobile network hops don't break it. */
const fingerprint = (req) =>
  crypto
    .createHash("sha256")
    .update(`${req.headers["user-agent"] || ""}|${req.headers["accept-language"] || ""}`)
    .digest("hex")
    .slice(0, 24);

const originAllowed = (req) => {
  const allowed = getAllowedOrigins();
  if (!allowed.length) return true; // not configured => open (local dev)

  const raw = req.headers.origin || req.headers.referer || "";
  if (!raw) return false;
  try {
    const origin = new URL(raw).origin;
    return allowed.includes(origin);
  } catch {
    return false;
  }
};

/* ------------------------------------------------------------------ *
 * POST /api/v1/secure-docs/:slug/session
 * ------------------------------------------------------------------ */
export const createSession = async (req, res) => {
  try {
    const { slug } = req.params;
    const doc = getSecureDoc(slug);

    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }
    if (!originAllowed(req)) {
      return res.status(403).json({ success: false, message: "Origin not allowed" });
    }

    sweepSessions();

    const nonce = crypto.randomBytes(16).toString("hex");
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const exp = Date.now() + TOKEN_TTL_SECONDS * 1000;

    sessions.set(nonce, { slug, key, iv, exp, uses: 0, fp: fingerprint(req) });

    // Warm the cache in the background so /stream doesn't wait on S3.
    fetchDocument(slug, doc.url).catch(() => {});

    return res.status(200).json({
      success: true,
      data: {
        token: makeToken({ slug, nonce, exp }),
        key: key.toString("base64"),
        iv: iv.toString("base64"),
        title: doc.title,
        expiresAt: exp,
      },
    });
  } catch (error) {
    console.error("secureDoc.createSession:", error);
    return res.status(500).json({ success: false, message: "Could not start document session" });
  }
};

/* ------------------------------------------------------------------ *
 * GET /api/v1/secure-docs/:slug/stream?t=<token>
 * Returns AES-256-CTR encrypted bytes — meaningless without the key
 * from /session, so pasting this URL in a browser downloads garbage.
 * ------------------------------------------------------------------ */
export const streamDocument = async (req, res) => {
  // Express 4 does not catch rejections from an async handler, so anything
  // that throws past this point would take the whole process down.
  try {
    await sendDocument(req, res);
  } catch (error) {
    console.error("secureDoc.streamDocument:", error);
    if (!res.headersSent && !res.destroyed) {
      res.status(500).json({ success: false, message: "Document temporarily unavailable" });
    } else if (!res.destroyed) {
      res.end();
    }
  }
};

const sendDocument = async (req, res) => {
  const { slug } = req.params;
  const doc = getSecureDoc(slug);

  if (!doc) {
    return res.status(404).json({ success: false, message: "Document not found" });
  }
  if (!originAllowed(req)) {
    return res.status(403).json({ success: false, message: "Origin not allowed" });
  }

  const payload = readToken(req.query.t);
  if (!payload || payload.slug !== slug) {
    return res.status(401).json({ success: false, message: "Invalid session token" });
  }

  const session = sessions.get(payload.nonce);
  if (!session || session.slug !== slug) {
    return res.status(401).json({ success: false, message: "Session expired" });
  }
  if (session.exp <= Date.now()) {
    sessions.delete(payload.nonce);
    return res.status(401).json({ success: false, message: "Session expired" });
  }
  if (session.fp !== fingerprint(req)) {
    return res.status(401).json({ success: false, message: "Session does not match this client" });
  }

  session.uses += 1;
  if (session.uses > TOKEN_MAX_USES) {
    sessions.delete(payload.nonce);
    return res.status(429).json({ success: false, message: "Session already used" });
  }

  let buf;
  try {
    buf = await fetchDocument(slug, doc.url);
  } catch (error) {
    console.error("secureDoc.fetchDocument:", error);
    if (!res.destroyed) {
      res.status(502).json({ success: false, message: "Document temporarily unavailable" });
    }
    return;
  }

  // Fetching the document can take a while on a cold cache, and the reader may
  // have closed the tab in the meantime. Piping into a dead socket throws
  // synchronously, so bail out before touching it.
  if (res.destroyed || res.writableEnded) return;

  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Content-Length", buf.length);
  res.setHeader("Content-Disposition", "inline");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Accept-Ranges", "none");

  const cipher = crypto.createCipheriv("aes-256-ctr", session.key, session.iv);
  pipeline(Readable.from([buf]), cipher, res, (err) => {
    // A reader navigating away mid-download is normal, not an error worth
    // logging — and the response is already gone, so there is nothing to send.
    if (!err || res.destroyed || res.headersSent) return;
    res.status(500).end();
  });
};

export default { createSession, streamDocument, warmSecureDocs };
