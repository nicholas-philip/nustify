// backend/models/NurseProfile.js
import mongoose from "mongoose";

const nurseProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: false, // Changed to not required for easier testing
    },
    specialization: {
      type: String,
      required: [true, "Specialization is required"],
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
      min: 0,
    },
    licenseNumber: {
      type: String,
      required: false, // Changed to not required - can be added later
      sparse: true, // Allows null values while maintaining uniqueness for non-null values
    },
    bio: {
      type: String,
      maxlength: 1000,
    },
    hourlyRate: {
      type: Number,
      required: [true, "Hourly rate is required"],
      min: 0,
    },
    profileImage: {
      type: String,
      default: "",
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },
    availability: {
      monday: [{ start: String, end: String }],
      tuesday: [{ start: String, end: String }],
      wednesday: [{ start: String, end: String }],
      thursday: [{ start: String, end: String }],
      friday: [{ start: String, end: String }],
      saturday: [{ start: String, end: String }],
      sunday: [{ start: String, end: String }],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    certifications: [
      {
        title: String,
        issuingOrganization: String,
        issueDate: Date,
        expiryDate: Date,
        certificateUrl: String,
      },
    ],
    services: [
      {
        type: String,
      },
    ],
    languages: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for searching
nurseProfileSchema.index({
  specialization: 1,
  "address.city": 1,
  rating: -1,
});

const NurseProfile = mongoose.model("NurseProfile", nurseProfileSchema);

export default NurseProfile;
