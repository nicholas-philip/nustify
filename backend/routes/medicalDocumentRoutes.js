import express from "express";
import {
    uploadDocument,
    getDocuments,
    getDocument,
    deleteDocument,
    shareDocument,
    verifyDocument,
} from "../controllers/medicalDocumentController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import { docUpload } from "../config/cloudinary.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Medical documents
router.post("/upload", docUpload.single("document"), uploadDocument);
router.get("/", getDocuments);
router.get("/:id", getDocument);
router.delete("/:id", deleteDocument);
router.post("/:id/share", shareDocument);

// Admin only
router.put("/:id/verify", authorize("admin"), verifyDocument);

export default router;
