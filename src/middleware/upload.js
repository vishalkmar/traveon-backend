import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

// Only the formats the app actually needs: images for banners/blogs/destinations
// and documents (image or PDF) for passport/visa validation.
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".pdf"]);

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();
  if (ALLOWED_MIME.has(file.mimetype) && ALLOWED_EXT.has(ext)) {
    return cb(null, true);
  }
  // Reject anything else (SVG, HTML, scripts, executables, mismatched types).
  const err = new Error("Only JPG, PNG, WEBP, GIF or PDF files are allowed");
  err.statusCode = 400;
  err.code = "INVALID_FILE_TYPE";
  return cb(err, false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 1,
  },
});

// The real file signature (magic bytes), so a renamed script/HTML with a .png
// name and a faked "image/png" header is still rejected. Runs AFTER multer,
// where the buffer is available (fileFilter cannot see the bytes).
function matchesMagic(buf) {
  if (!buf || buf.length < 12) return false;
  const b = buf;
  const jpg = b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  const png = b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
  const gif = b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38;
  const webp =
    b.slice(0, 4).toString("latin1") === "RIFF" &&
    b.slice(8, 12).toString("latin1") === "WEBP";
  const pdf = b.slice(0, 5).toString("latin1") === "%PDF-";
  return jpg || png || gif || webp || pdf;
}

export function verifyFileMagic(req, res, next) {
  if (!req.file || !req.file.buffer) return next(); // no file uploaded
  if (matchesMagic(req.file.buffer)) return next();
  const err = new Error("File content does not match an allowed image or PDF");
  err.statusCode = 400;
  err.code = "INVALID_FILE_TYPE";
  return next(err);
}

export default upload;
