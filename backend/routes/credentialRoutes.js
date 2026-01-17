import express from "express";
import {
    submitCredentials,
    getCredentialStatus,
    verifyCredentials,
    getPendingVerifications,
    getBadges,
    updateTrustScore,
} from "../controllers/credentialController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Nurse routes
router.post("/submit", authorize("nurse"), submitCredentials);
router.get("/status", getCredentialStatus);
router.get("/badges", getBadges);
router.get("/badges/:nurseId", getBadges);
router.put("/trust-score", updateTrustScore);
router.put("/trust-score/:nurseId", updateTrustScore);

// Admin routes
router.get("/pending", authorize("admin"), getPendingVerifications);
router.put("/verify/:nurseId", authorize("admin"), verifyCredentials);

export default router;
