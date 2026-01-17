import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
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
    appointmentDate: {
      type: Date,
      required: [true, "Appointment date is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
    },
    serviceType: {
      type: String,
      required: [true, "Service type is required"],
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "in-progress",
        "completed",
        "cancelled",
        "rejected",
      ],
      default: "pending",
    },
    location: {
      type: String,
      enum: ["home", "clinic", "hospital", "online"],
      default: "home",
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
      instructions: String,
    },
    symptoms: {
      type: String,
    },
    notes: {
      type: String,
    },
    nurseNotes: {
      type: String,
    },
    totalCost: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      default: 1,
    },
    cancellationReason: {
      type: String,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    cancelledAt: {
      type: Date,
    },

    reminderSent: {
      type: Boolean,
      default: false,
    },
    // Health Record Integration
    vitalSignsRecorded: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VitalSigns",
    },
    prescriptionGiven: {
      type: Boolean,
      default: false,
    },
    prescriptionDetails: {
      type: String,
    },
    followUpRequired: {
      type: Boolean,
      default: false,
    },
    followUpDate: {
      type: Date,
    },
    diagnosisNotes: {
      type: String,
      maxlength: 2000,
    },
    treatmentPlan: {
      type: String,
      maxlength: 1000,
    },
    healthRecordsCreated: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HealthRecord",
      },
    ],
  },
  {
    timestamps: true,
  }
);


appointmentSchema.index({ patientId: 1, appointmentDate: 1 });
appointmentSchema.index({ nurseId: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
