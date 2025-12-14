import express from "express";
import {
  getDashboard,
  getUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getAppointments,
  getReviews,
  deleteReview,
  getAnalytics,
} from "../controllers/adminController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes are protected and only accessible by admins
router.use(protect);
router.use(authorize("admin"));

// Dashboard
router.get("/dashboard", getDashboard);

// User management
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id/status", updateUserStatus);
router.delete("/users/:id", deleteUser);

// Appointment management
router.get("/appointments", getAppointments);

// Review management
router.get("/reviews", getReviews);
router.delete("/reviews/:id", deleteReview);

// Analytics
router.get("/analytics", getAnalytics);

export default router;
