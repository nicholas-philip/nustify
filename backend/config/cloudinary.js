// backend/config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// HARDCODE YOUR CREDENTIALS HERE TEMPORARILY FOR TESTING
// Replace these with YOUR actual values from Cloudinary dashboard
const CLOUD_NAME = "dgobm7mco";
const API_KEY = "212974261498666";
const API_SECRET = "vOkna4NGrnSD1XzihuDME6yM6v0"; // ← REPLACE THIS!

console.log("🔍 Cloudinary Configuration Check:");
console.log("Cloud Name:", CLOUD_NAME);
console.log("API Key:", API_KEY);
console.log("API Secret:", API_SECRET.substring(0, 5) + "...");

// Configure Cloudinary with hardcoded values
cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
  secure: true,
});

console.log("☁️ Cloudinary configured with hardcoded values");

// Verify configuration
const config = cloudinary.config();
console.log("📋 Verification:", {
  cloud_name: config.cloud_name,
  api_key: config.api_key,
  api_secret: config.api_secret ? "SET ✅" : "NOT SET ❌",
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "nursify/profiles",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    public_id: (req, file) => `nurse_${Date.now()}`,
    transformation: [
      { width: 500, height: 500, crop: "fill", gravity: "face" },
      { quality: "auto" },
      { fetch_format: "auto" },
    ],
  },
});

// Create multer upload middleware
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    console.log("📁 File filter:", file.originalname, file.mimetype);

    if (!file.mimetype.startsWith("image/")) {
      console.error("❌ Not an image");
      return cb(new Error("Only image files allowed"), false);
    }

    console.log("✅ File accepted");
    cb(null, true);
  },
});

// Helper function to delete image
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("✅ Deleted:", publicId);
    return result;
  } catch (error) {
    console.error("❌ Delete error:", error);
    throw error;
  }
};

// Helper function to extract public_id
export const extractPublicId = (url) => {
  if (!url) return null;
  const matches = url.match(/\/v\d+\/(.+)\.(jpg|jpeg|png|webp|gif)/);
  return matches ? matches[1] : null;
};

export default cloudinary;
