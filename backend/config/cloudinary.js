// backend/config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// Use environment variables or fallback for testing
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "dgobm7mco";
const API_KEY = process.env.CLOUDINARY_API_KEY || "212974261498666";
const API_SECRET = process.env.CLOUDINARY_API_SECRET || "vOkna4NGrnSD1XzihuDME6yM6v0";

console.log("🔍 Cloudinary Configuration Check:");
console.log("Cloud Name:", CLOUD_NAME);
console.log("API Key:", API_KEY ? "✓ Set" : "✗ Missing");
console.log("API Secret:", API_SECRET ? "✓ Set" : "✗ Missing");

// Configure Cloudinary
cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
  secure: true,
});

console.log("☁️ Cloudinary configured");

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

// Create multer upload middleware for profiles
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    console.log("📁 Profile image filter:", file.originalname, file.mimetype);

    if (!file.mimetype.startsWith("image/")) {
      console.error("❌ Not an image");
      return cb(new Error("Only image files allowed"), false);
    }

    console.log("✅ Image accepted");
    cb(null, true);
  },
});

// Configure Multer Storage for Medical Documents
const docStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "nursify/medical-documents",
    resource_type: "auto",
    public_id: (req, file) => {
      const cleanName = file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_');
      return `doc_${Date.now()}_${cleanName}`;
    },
  },
});

// Create multer upload middleware for medical documents
export const docUpload = multer({
  storage: docStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    console.log("📁 Document filter:", file.originalname, file.mimetype);

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg"
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      console.error("❌ Invalid file type:", file.mimetype);
      return cb(new Error("Only PDF, JPG, and PNG files are allowed"), false);
    }

    console.log("✅ Document accepted");
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
