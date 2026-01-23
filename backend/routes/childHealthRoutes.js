import express from "express";
import {
    createChildHealthRecord,
    getChildHealthRecords,
    updateChildHealthRecord,
    getVaccinationSchedule,
    recordMilestone,
} from "../controllers/childHealthController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Child health routes
router.post("/", authorize("patient"), createChildHealthRecord);
router.get("/", authorize("patient", "nurse"), getChildHealthRecords);
router.put("/:id", authorize("patient"), updateChildHealthRecord);
router.get("/:id/vaccinations", authorize("patient", "nurse"), getVaccinationSchedule);
router.post("/:id/milestone", authorize("patient"), recordMilestone);

export default router;
