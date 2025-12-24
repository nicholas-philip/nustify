import Payment from "../models/Payment.js";
import Appointment from "../models/Appointments.js";
import { createNotification } from "./notificationController.js";




const createPayment = async (req, res) => {
  try {
    const { appointmentId, paymentMethod, paymentDetails } = req.body;

    
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId: req.user._id,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Appointment must be confirmed before payment",
      });
    }

    
    const existingPayment = await Payment.findOne({ appointmentId });
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "Payment already exists for this appointment",
      });
    }

    
    const payment = await Payment.create({
      appointmentId,
      patientId: req.user._id,
      nurseId: appointment.nurseId,
      amount: appointment.totalCost,
      paymentMethod,
      paymentDetails,
      status: "processing",
      transactionId: `TXN-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`,
    });

    
    
    setTimeout(async () => {
      payment.status = "completed";
      payment.paidAt = new Date();
      await payment.save();

      
      await createNotification(
        appointment.nurseId,
        "payment_received",
        "Payment Received",
        `You received $${payment.nursePayout.toFixed(
          2
        )} for appointment #${appointmentId}`,
        {
          relatedId: appointmentId,
          relatedModel: "Appointment",
          priority: "high",
        }
      );
    }, 2000);

    res.status(201).json({
      success: true,
      message: "Payment initiated successfully",
      payment,
    });
  } catch (error) {
    console.error("Create payment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};




const getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("appointmentId")
      .populate("patientId", "email")
      .populate("nurseId", "email");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    
    if (
      req.user._id.toString() !== payment.patientId._id.toString() &&
      req.user._id.toString() !== payment.nurseId._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this payment",
      });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Get payment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};




const getPayments = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query;
    if (req.user.role === "patient") {
      query = { patientId: req.user._id };
    } else if (req.user.role === "nurse") {
      query = { nurseId: req.user._id };
    } else if (req.user.role === "admin") {
      query = {};
    } else {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const payments = await Payment.find(query)
      .populate("appointmentId")
      .populate("patientId", "email")
      .populate("nurseId", "email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(query);

    
    let totalEarnings = 0;
    if (req.user.role === "nurse") {
      const earningsData = await Payment.aggregate([
        { $match: { nurseId: req.user._id, status: "completed" } },
        { $group: { _id: null, total: { $sum: "$nursePayout" } } },
      ]);
      totalEarnings = earningsData[0]?.total || 0;
    }

    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      totalEarnings: req.user.role === "nurse" ? totalEarnings : undefined,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      payments,
    });
  } catch (error) {
    console.error("Get payments error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};




const requestRefund = async (req, res) => {
  try {
    const { reason } = req.body;

    const payment = await Payment.findOne({
      _id: req.params.id,
      patientId: req.user._id,
      status: "completed",
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found or cannot be refunded",
      });
    }

    
    const appointment = await Appointment.findById(payment.appointmentId);
    const now = new Date();
    const appointmentDate = new Date(appointment.appointmentDate);

    if (now > appointmentDate) {
      return res.status(400).json({
        success: false,
        message: "Cannot refund payment for past appointments",
      });
    }

    
    payment.status = "refunded";
    payment.refundDetails = {
      refundId: `REF-${Date.now()}`,
      refundAmount: payment.amount,
      refundReason: reason,
      refundedAt: new Date(),
    };
    await payment.save();

    
    appointment.status = "cancelled";
    appointment.cancellationReason = `Refund requested: ${reason}`;
    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      payment,
    });
  } catch (error) {
    console.error("Request refund error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};




const getPaymentStatistics = async (req, res) => {
  try {
    let matchQuery = {};

    if (req.user.role === "nurse") {
      matchQuery.nurseId = req.user._id;
    } else if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const stats = await Payment.aggregate([
      { $match: { ...matchQuery, status: "completed" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          totalPlatformFee: { $sum: "$platformFee" },
          totalNursePayout: { $sum: "$nursePayout" },
          totalTransactions: { $sum: 1 },
          avgTransactionAmount: { $avg: "$amount" },
        },
      },
    ]);

    const monthlyStats = await Payment.aggregate([
      {
        $match: {
          ...matchQuery,
          status: "completed",
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.status(200).json({
      success: true,
      statistics: stats[0] || {},
      monthlyStats,
    });
  } catch (error) {
    console.error("Get payment statistics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export {
  createPayment,
  getPayment,
  getPayments,
  requestRefund,
  getPaymentStatistics,
};
