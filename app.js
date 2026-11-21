/**
 * cPanel / Passenger entry point.
 *
 * The Node.js app in cPanel is configured with this file as its
 * "Application startup file". It just boots the compiled server, which
 * listens on process.env.PORT.
 *
 * Local development still uses `npm run dev` (src) or `npm start` (dist).
 */
require("./dist/bin/app.js");
