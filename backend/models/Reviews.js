import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    nurseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      trim: true,
      maxlength: 1000,
    },
    categories: {
      professionalism: {
        type: Number,
        min: [1, "Rating must be at least 1"],
        max: 5,
      },
      punctuality: {
        type: Number,
        min: [1, "Rating must be at least 1"],
        max: 5,
      },
      communication: {
        type: Number,
        min: [1, "Rating must be at least 1"],
        max: 5,
      },
      care: { type: Number, min: [1, "Rating must be at least 1"], max: 5 },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    nurseResponse: {
      message: String,
      respondedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);


reviewSchema.index({ appointmentId: 1 }, { unique: true });
reviewSchema.index({ nurseId: 1, createdAt: -1 });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
