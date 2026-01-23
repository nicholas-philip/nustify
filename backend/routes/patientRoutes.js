
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
  getProfile,
} from "../controllers/patientController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();


router.use(protect);


router.get("/dashboard", authorize("patient"), getDashboard);
router.get("/profile", authorize("patient"), getProfile);
router.get("/profile/:id", authorize("patient", "nurse"), getProfile);
router.put("/profile", authorize("patient"), updateProfile);


router.get("/nurses/search", authorize("patient"), searchNurses);
router.get("/nurses/:id", authorize("patient"), getNurseDetails);


router.post("/appointments", authorize("patient"), bookAppointment);
router.get("/appointments", authorize("patient"), getAppointments);
router.put("/appointments/:id/cancel", authorize("patient"), cancelAppointment);


router.post("/messages", authorize("patient"), sendMessage);


router.post("/reviews", authorize("patient"), submitReview);

export default router;
