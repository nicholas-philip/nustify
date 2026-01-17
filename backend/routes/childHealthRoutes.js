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
router.use(authorize("patient")); // Only patients (parents) can manage child health

// Child health routes
router.post("/", createChildHealthRecord);
router.get("/", getChildHealthRecords);
router.put("/:id", updateChildHealthRecord);
router.get("/:id/vaccinations", getVaccinationSchedule);
router.post("/:id/milestone", recordMilestone);

export default router;
