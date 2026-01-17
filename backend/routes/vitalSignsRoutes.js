import express from "express";
import {
    recordVitalSigns,
    getVitalSigns,
    getVitalSignsTrends,
    updateVitalSigns,
    deleteVitalSigns,
    getLatestVitalSigns,
    getAbnormalVitalSigns,
} from "../controllers/vitalSignsController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Vital signs
router.post("/", recordVitalSigns);
router.get("/", getVitalSigns);
router.get("/trends", getVitalSignsTrends);
router.get("/latest", getLatestVitalSigns);
router.get("/abnormal", getAbnormalVitalSigns);
router.put("/:id", updateVitalSigns);
router.delete("/:id", deleteVitalSigns);

export default router;
