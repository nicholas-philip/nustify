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


router.use(protect);
router.use(authorize("admin"));


router.get("/dashboard", getDashboard);


router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id/status", updateUserStatus);
router.delete("/users/:id", deleteUser);


router.get("/appointments", getAppointments);


router.get("/reviews", getReviews);
router.delete("/reviews/:id", deleteReview);


router.get("/analytics", getAnalytics);

export default router;
