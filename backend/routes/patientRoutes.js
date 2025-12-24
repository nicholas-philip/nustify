
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


router.use(protect);
router.use(authorize("patient"));


router.get("/dashboard", getDashboard);


router.put("/profile", updateProfile);


router.get("/nurses/search", searchNurses);
router.get("/nurses/:id", getNurseDetails);


router.post("/appointments", bookAppointment);
router.get("/appointments", getAppointments);
router.put("/appointments/:id/cancel", cancelAppointment);


router.post("/messages", sendMessage);


router.post("/reviews", submitReview);

export default router;
