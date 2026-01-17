import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

import routes from "./routes/index.routes.js";

const app = express();

/* Cors middleware */
app.use(cors({ origin: "*" }));

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
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

app.set("etag", false);

/* Routes */
app.use("/api", routes);

app.get("/*", (req, res) => {
  res.status(404).send("We couldn't find the endpoint you were looking for!");
});

/* Error handler (next) */
app.use(function (err, req, res, next) {
  if (err === "AccessDenied") {
    return res.status(403).send({ status: "error", message: "Access Denied!" });
  }

  console.error(err);
  res.statusMessage = err;
  res.status(500).send({
    status: "error",
    message: "Server error, Something went wrong!",
    error: err,
  });
});

export default app;
