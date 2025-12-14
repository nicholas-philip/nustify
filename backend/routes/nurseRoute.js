import express from "express";
import {
  getDashboard,
  updateProfile,
  updateAvailability,
  addCertification,
  getAppointments,
  respondToAppointment,
  getReviews,
} from "../controllers/nurseController.js";

import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes are protected and only accessible by nurses
router.use(protect);
router.use(authorize("nurse"));

// Dashboard
router.get("/dashboard", getDashboard);

// Profile management
router.put("/profile", updateProfile);

// Availability management
router.put("/availability", updateAvailability);

// Certifications
router.post("/certifications", addCertification);

// Appointments
router.get("/appointments", getAppointments);
router.put("/appointments/:id/respond", respondToAppointment);

// Reviews
router.get("/reviews", getReviews);

export default router;
