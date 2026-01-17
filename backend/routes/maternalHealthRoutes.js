import express from "express";
import {
    createPregnancyRecord,
    getPregnancyRecords,
    updatePregnancyRecord,
    getPregnancyTimeline,
} from "../controllers/maternalHealthController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);
router.use(authorize("patient")); // Only patients can manage maternal health

// Maternal health routes
router.post("/", createPregnancyRecord);
router.get("/", getPregnancyRecords);
router.put("/:id", updatePregnancyRecord);
router.get("/:id/timeline", getPregnancyTimeline);

export default router;
