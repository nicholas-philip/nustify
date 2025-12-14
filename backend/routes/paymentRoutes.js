import express from "express";
import {
  createPayment,
  getPayment,
  getPayments,
  requestRefund,
  getPaymentStatistics,
} from "../controllers/paymentController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Payment statistics (admin and nurses)
router.get("/statistics", authorize("admin", "nurse"), getPaymentStatistics);

// Create payment (patients only)
router.post("/", authorize("patient"), createPayment);

// Get all payments
router.get("/", getPayments);

// Get single payment
router.get("/:id", getPayment);

// Request refund (patients only)
router.post("/:id/refund", authorize("patient"), requestRefund);

export default router;
