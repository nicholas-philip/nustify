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

// Maternal health routes
router.post("/", authorize("patient"), createPregnancyRecord);
router.get("/", authorize("patient", "nurse"), getPregnancyRecords);
router.put("/:id", authorize("patient"), updatePregnancyRecord);
router.get("/:id/timeline", authorize("patient", "nurse"), getPregnancyTimeline);

export default router;
