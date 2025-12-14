import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "appointment_created",
        "appointment_confirmed",
        "appointment_rejected",
        "appointment_cancelled",
        "appointment_completed",
        "appointment_reminder",
        "new_message",
        "new_review",
        "profile_verified",
        "payment_received",
        "system_alert",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      // Can reference Appointment, Message, Review, etc.
    },
    relatedModel: {
      type: String,
      enum: ["Appointment", "Message", "Review", "User"],
    },
    actionUrl: {
      type: String,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
