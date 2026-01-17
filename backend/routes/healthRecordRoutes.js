import express from "express";
import {
    getHealthRecords,
    getHealthTimeline,
    createHealthRecord,
    updateHealthRecord,
    deleteHealthRecord,
    getHealthSummary,
} from "../controllers/healthRecordController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Health records
router.get("/", getHealthRecords);
router.get("/timeline", getHealthTimeline);
router.get("/summary", getHealthSummary);
router.post("/", createHealthRecord);
router.put("/:id", updateHealthRecord);
router.delete("/:id", deleteHealthRecord);

export default router;
