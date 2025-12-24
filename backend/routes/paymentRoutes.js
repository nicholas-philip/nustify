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


router.use(protect);


router.get("/statistics", authorize("admin", "nurse"), getPaymentStatistics);


router.post("/", authorize("patient"), createPayment);


router.get("/", getPayments);


router.get("/:id", getPayment);


router.post("/:id/refund", authorize("patient"), requestRefund);

export default router;
