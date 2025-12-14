// patientRoutes.js
import express from "express";
import {
  getDashboard,
  updateProfile,
  searchNurses,
  getNurseDetails,
  bookAppointment,
  getAppointments,
  cancelAppointment,
  sendMessage,
  submitReview,
} from "../controllers/patientController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes are protected and only accessible by patients
router.use(protect);
router.use(authorize("patient"));

// Dashboard
router.get("/dashboard", getDashboard);

// Profile management
router.put("/profile", updateProfile);

// Nurse search + details
router.get("/nurses/search", searchNurses);
router.get("/nurses/:id", getNurseDetails);

// Appointments
router.post("/appointments", bookAppointment);
router.get("/appointments", getAppointments);
router.put("/appointments/:id/cancel", cancelAppointment);

// Messages
router.post("/messages", sendMessage);

// Reviews
router.post("/reviews", submitReview);

export default router;
