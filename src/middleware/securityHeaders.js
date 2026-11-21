/**
 * Security response headers + a CORS allowlist.
 *
 * Hand-rolled (no extra dependency) and limited to what this API needs: it
 * returns JSON and the secure-document stream, so there is no HTML to protect
 * with a page CSP here — that belongs on the frontend.
 */

// Browsers that load the admin/site from these origins may read API responses.
// Everything else (other sites' scripts) is refused at the browser.
export function corsAllowlist() {
  const fromEnv = (process.env.CORS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean);

  const defaults = [
    "https://traveon.in",
    "https://www.traveon.in",
    "https://thetraveon.com",
    "https://www.thetraveon.com",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
  ];

  const allowed = new Set([...defaults, ...fromEnv]);

  return function corsOrigin(origin, callback) {
    // Non-browser clients (curl, server-to-server, health checks) send no Origin.
    if (!origin) return callback(null, true);
    if (allowed.has(origin.replace(/\/+$/, ""))) return callback(null, true);
    return callback(new Error("Not allowed by CORS"), false);
  };
}

export function securityHeaders(req, res, next) {
  // Stop MIME sniffing and clickjacking; keep referrers tight.
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-XSS-Protection", "0"); // modern browsers: rely on CSP, not the buggy auditor
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");

  // Tell browsers to stay on HTTPS for a year (cPanel serves the API over TLS).
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

  next();
}
