import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    nurseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "USD",
    },
    paymentMethod: {
      type: String,
      enum: ["card", "paypal", "bank_transfer", "cash", "insurance"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "refunded"],
      default: "pending",
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    paymentGateway: {
      type: String,
      enum: ["stripe", "paypal", "manual"],
    },
    platformFee: {
      type: Number,
      default: 0,
    },
    nursePayout: {
      type: Number,
      default: 0,
    },
    paymentDetails: {
      cardLast4: String,
      cardBrand: String,
      paypalEmail: String,
    },
    refundDetails: {
      refundId: String,
      refundAmount: Number,
      refundReason: String,
      refundedAt: Date,
    },
    metadata: {
      type: Map,
      of: String,
    },
    errorMessage: String,
    paidAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
paymentSchema.index({ appointmentId: 1 });
paymentSchema.index({ patientId: 1, status: 1 });
paymentSchema.index({ nurseId: 1, status: 1 });
paymentSchema.index({ transactionId: 1 });

// Calculate platform fee and nurse payout before saving
paymentSchema.pre("save", function (next) {
  if (this.isNew || this.isModified("amount")) {
    // Platform takes 15% fee
    this.platformFee = this.amount * 0.15;
    this.nursePayout = this.amount - this.platformFee;
  }
  next();
});

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
