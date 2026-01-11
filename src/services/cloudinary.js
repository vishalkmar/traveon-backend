import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadBuffer(buffer, folder = "oman-tour-visa") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

export async function destroyByPublicId(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (e) {
    console.error("cloudinary.destroy:error", e?.message);
  }
}

export function extractPublicIdFromUrl(url) {
  try {
    const uploadIdx = url.indexOf("/upload/");
    if (uploadIdx === -1) return null;
    const path = url.substring(uploadIdx + "/upload/".length);
    const parts = path.split("/");
    const withoutVersion = parts[0].startsWith("v") ? parts.slice(1) : parts;
    const last = withoutVersion[withoutVersion.length - 1];
    const withoutExt = last.replace(/\.[^/.]+$/, "");
    const publicId = [...withoutVersion.slice(0, -1), withoutExt].join("/");
    return publicId || null;
  } catch {
    return null;
  }
}
