import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import db from "./models/index.js";

dotenv.config();

const { sequelize } = db;




import routes from "./routes/index.routes.js";
import { warmSecureDocs } from "./controller/secureDoc.controller.js";
import { corsAllowlist, securityHeaders } from "./middleware/securityHeaders.js";

const app = express();

// Don't advertise Express to attackers.
app.disable("x-powered-by");

// Pre-load protected documents so the flipbook never waits on S3.
warmSecureDocs();

/* Security headers on every response */
app.use(securityHeaders);

/* CORS — only the site's own origins may read API responses in a browser.
   credentials:true so the httpOnly auth cookie is accepted from those origins. */
app.use(cors({ origin: corsAllowlist(), credentials: true }));

/* Parse cookies so auth can read the httpOnly token cookie */
app.use(cookieParser());

// Enable trust proxy for rate limiter behind load balancers/proxies
app.set("trust proxy", 1);

/* Express middleware */
app.use((req, res, next) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.header("Expires", "-1");
  res.header("Pragma", "no-cache");
  next();
});

// Fix for __dirname in ESM (if Babel doesn't polyfill it, but preset-env usually handles module interop.
// However, since we are transpiling, __dirname works in CJS output, BUT babel-node runs it directly.
// Let's assume standard path usage or use path.resolve.
app.use("/public", express.static(path.join(process.cwd(), "public")));

/* express middleware for body requests */
// 10mb is generous for JSON (base64 banner/team images) while blocking the
// 50mb memory-pressure abuse the old limit allowed. File uploads use multer,
// not JSON, so they are unaffected.
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.set("etag", false);

/* Routes */
app.use("/api", routes);

app.get("/", (req, res) => {
  res.status(200).send("Server is running successfully");
});

app.get("/db-check", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ success: true, message: "DB connected successfully" });
  } catch (error) {
    console.error(error);
    // Don't leak the DB error details to the public.
    res.status(500).json({ success: false, message: "DB connection failed" });
  }
});

/* Error handler (next) */
app.use(function (err, req, res, next) {
  if (err === "AccessDenied") {
    return res.status(403).send({ status: "error", message: "Access Denied!" });
  }

  // Bad file type / size from multer and similar client errors.
  if (err && (err.code === "INVALID_FILE_TYPE" || err.code === "LIMIT_FILE_SIZE")) {
    return res.status(400).send({ status: "error", message: err.message });
  }
  if (err && err.message === "Not allowed by CORS") {
    return res.status(403).send({ status: "error", message: "Origin not allowed" });
  }

  // Log the full error server-side; never send internals to the client.
  console.error(err);
  res.status(500).send({
    status: "error",
    message: "Server error, Something went wrong!",
  });
});

export default app;
