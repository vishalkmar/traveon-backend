import { uploadBuffer } from "../services/cloudinary.js";

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const folder = req.body.folder || "general"; // allow specifying folder
    const result = await uploadBuffer(req.file.buffer, folder);

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Upload failed",
    });
  }
};
