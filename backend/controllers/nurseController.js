// backend/controllers/nurseController.js
import NurseProfile from "../models/NurseProfile.js";
import Appointment from "../models/Appointments.js";
import Review from "../models/Reviews.js";
import PatientProfile from "../models/PatientProfile.js";
import { deleteImage, extractPublicId } from "../config/cloudinary.js";

// @desc Get nurse dashboard
// @route GET /api/nurse/dashboard
// @access Private (Nurse only)
const getDashboard = async (req, res) => {
  try {
    console.log("🔍 Looking for nurse profile with userId:", req.user._id);
    let nurseProfile = await NurseProfile.findOne({ userId: req.user._id });

    if (!nurseProfile) {
      console.log("⚠️ Nurse profile not found, creating default profile...");
      nurseProfile = await NurseProfile.create({
        userId: req.user._id,
        fullName: req.user.email.split("@")[0],
        phone: "",
        specialization: "General Nursing",
        hourlyRate: 50,
        isAvailable: true,
        availability: {
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
          saturday: [],
          sunday: [],
        },
      });
      console.log("✅ Default nurse profile created:", nurseProfile._id);
    }

    const totalAppointments = await Appointment.countDocuments({
      nurseId: req.user._id,
    });

    const pendingAppointments = await Appointment.countDocuments({
      nurseId: req.user._id,
      status: "pending",
    });

    const upcomingAppointments = await Appointment.find({
      nurseId: req.user._id,
      status: "confirmed",
      appointmentDate: { $gte: new Date() },
    })
      .limit(5)
      .sort({ appointmentDate: 1 });

    let unreadMessages = 0;
    try {
      const Message = (await import("../models/Message.js")).default;
      unreadMessages = await Message.countDocuments({
        receiverId: req.user._id,
        isRead: false,
      });
    } catch (err) {
      console.log("ℹ️ Message model not found, skipping unread count");
    }

    res.status(200).json({
      success: true,
      dashboard: {
        profile: nurseProfile,
        stats: {
          totalAppointments,
          pendingAppointments,
          unreadMessages,
          rating: nurseProfile.rating || 0,
          totalReviews: nurseProfile.totalReviews || 0,
        },
        upcomingAppointments,
      },
    });
  } catch (error) {
    console.error("❌ Get dashboard error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc Update nurse profile
// @route PUT /api/nurse/profile
// @access Private (Nurse only)
const updateProfile = async (req, res) => {
  try {
    const updates = req.body;

    delete updates.userId;
    delete updates.rating;
    delete updates.totalReviews;
    delete updates.profileImage;

    let nurseProfile = await NurseProfile.findOne({ userId: req.user._id });

    if (!nurseProfile) {
      console.log("⚠️ Nurse profile not found during update, creating...");
      nurseProfile = await NurseProfile.create({
        userId: req.user._id,
        ...updates,
      });
    } else {
      nurseProfile = await NurseProfile.findOneAndUpdate(
        { userId: req.user._id },
        { $set: updates },
        { new: true, runValidators: true }
      );
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: nurseProfile,
    });
  } catch (error) {
    console.error("❌ Update profile error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc Update nurse availability
// @route PUT /api/nurse/availability
// @access Private (Nurse only)
const updateAvailability = async (req, res) => {
  try {
    const { availability, isAvailable } = req.body;

    let nurseProfile = await NurseProfile.findOne({ userId: req.user._id });

    if (!nurseProfile) {
      console.log(
        "⚠️ Nurse profile not found during availability update, creating..."
      );
      nurseProfile = await NurseProfile.create({
        userId: req.user._id,
        fullName: req.user.email.split("@")[0],
        specialization: "General Nursing",
        hourlyRate: 50,
        availability: availability || {},
        isAvailable: isAvailable !== undefined ? isAvailable : true,
      });
    } else {
      nurseProfile = await NurseProfile.findOneAndUpdate(
        { userId: req.user._id },
        {
          $set: {
            availability: availability || {},
            isAvailable: isAvailable !== undefined ? isAvailable : true,
          },
        },
        { new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: "Availability updated successfully",
      availability: nurseProfile.availability,
      isAvailable: nurseProfile.isAvailable,
    });
  } catch (error) {
    console.error("❌ Update availability error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc Add certification
// @route POST /api/nurse/certifications
// @access Private (Nurse only)
const addCertification = async (req, res) => {
  try {
    const {
      title,
      issuingOrganization,
      issueDate,
      expiryDate,
      certificateUrl,
    } = req.body;

    let nurseProfile = await NurseProfile.findOne({ userId: req.user._id });

    if (!nurseProfile) {
      return res.status(404).json({
        success: false,
        message: "Nurse profile not found. Please update your profile first.",
      });
    }

    nurseProfile = await NurseProfile.findOneAndUpdate(
      { userId: req.user._id },
      {
        $push: {
          certifications: {
            title,
            issuingOrganization,
            issueDate,
            expiryDate,
            certificateUrl,
          },
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Certification added successfully",
      certifications: nurseProfile.certifications,
    });
  } catch (error) {
    console.error("❌ Add certification error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc Get nurse appointments
// @route GET /api/nurse/appointments
// @access Private (Nurse only)
const getAppointments = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;

    let query = { nurseId: req.user._id };

    if (status) {
      query.status = status;
    }

    if (startDate && endDate) {
      query.appointmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const appointments = await Appointment.find(query)
      .populate("patientId", "email")
      .sort({ appointmentDate: -1 })
      .lean();

    const appointmentsWithPatientDetails = await Promise.all(
      appointments.map(async (appointment) => {
        if (appointment.patientId) {
          const patientProfile = await PatientProfile.findOne({
            userId: appointment.patientId._id,
          }).select("fullName phone");

          return {
            ...appointment,
            patientId: {
              _id: appointment.patientId._id,
              email: appointment.patientId.email,
              fullName: patientProfile?.fullName || "N/A",
              phone: patientProfile?.phone || "N/A",
            },
          };
        }
        return appointment;
      })
    );

    res.status(200).json({
      success: true,
      count: appointmentsWithPatientDetails.length,
      appointments: appointmentsWithPatientDetails,
    });
  } catch (error) {
    console.error("❌ Get appointments error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc Respond to appointment request
// @route PUT /api/nurse/appointments/:id/respond
// @access Private (Nurse only)
const respondToAppointment = async (req, res) => {
  try {
    const { status, nurseNotes } = req.body;
    const appointmentId = req.params.id;

    if (!["confirmed", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be confirmed or rejected",
      });
    }

    const appointment = await Appointment.findOneAndUpdate(
      { _id: appointmentId, nurseId: req.user._id, status: "pending" },
      {
        $set: {
          status,
          nurseNotes: nurseNotes || "",
        },
      },
      { new: true }
    ).populate("patientId", "email");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found or already processed",
      });
    }

    res.status(200).json({
      success: true,
      message: `Appointment ${status} successfully`,
      appointment,
    });
  } catch (error) {
    console.error("❌ Respond to appointment error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc Complete appointment
// @route PUT /api/nurse/appointments/:id/complete
// @access Private (Nurse only)
const completeAppointment = async (req, res) => {
  try {
    const { completionNotes } = req.body;
    const appointmentId = req.params.id;

    // Find the appointment and verify it belongs to this nurse
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      nurseId: req.user._id,
      status: "confirmed",
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found or cannot be completed",
      });
    }

    // Check if appointment date has passed or is today
    const appointmentDate = new Date(appointment.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (appointmentDate > today) {
      return res.status(400).json({
        success: false,
        message: "Cannot complete future appointments",
      });
    }

    // Update appointment status to completed
    appointment.status = "completed";
    appointment.completedAt = new Date();

    if (completionNotes) {
      appointment.nurseNotes = completionNotes;
    }

    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Appointment marked as completed",
      appointment,
    });
  } catch (error) {
    console.error("❌ Complete appointment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc Get nurse reviews
// @route GET /api/nurse/reviews
// @access Private (Nurse only)
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ nurseId: req.user._id })
      .populate("patientId", "email")
      .populate({
        path: "patientId",
        populate: {
          path: "userId",
          model: "PatientProfile",
          select: "fullName",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("❌ Get reviews error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc Upload nurse profile picture
// @route POST /api/nurse/profile/upload-image
// @access Private (Nurse only)
const uploadProfileImage = async (req, res) => {
  try {
    console.log("📤 Upload endpoint hit");
    console.log("👤 User ID:", req.user?._id);
    console.log("📁 File received:", req.file ? "YES" : "NO");

    if (req.file) {
      console.log("📁 File details:", {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
      });
    }

    if (!req.file) {
      console.error("❌ No file in request");
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    let nurseProfile = await NurseProfile.findOne({ userId: req.user._id });
    console.log("🔍 Nurse profile found:", nurseProfile ? "YES" : "NO");

    if (!nurseProfile) {
      console.error("❌ Nurse profile not found");
      return res.status(404).json({
        success: false,
        message: "Nurse profile not found. Please complete your profile first.",
      });
    }

    // Delete old image if exists
    if (nurseProfile.profileImage) {
      console.log("🗑️ Deleting old image:", nurseProfile.profileImage);
      const oldPublicId = extractPublicId(nurseProfile.profileImage);
      if (oldPublicId) {
        await deleteImage(oldPublicId).catch((err) =>
          console.log("⚠️ Error deleting old image:", err)
        );
      }
    }

    // Update with new image URL
    nurseProfile.profileImage = req.file.path;
    await nurseProfile.save();

    console.log("✅ Profile image uploaded successfully:", req.file.path);

    res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully",
      imageUrl: req.file.path,
      profile: nurseProfile,
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to upload image",
      error: error.message,
    });
  }
};

// @desc Delete nurse profile picture
// @route DELETE /api/nurse/profile/delete-image
// @access Private (Nurse only)
const deleteProfileImage = async (req, res) => {
  try {
    console.log("🗑️ Delete image endpoint hit");
    console.log("👤 User ID:", req.user?._id);

    let nurseProfile = await NurseProfile.findOne({ userId: req.user._id });

    if (!nurseProfile || !nurseProfile.profileImage) {
      return res.status(404).json({
        success: false,
        message: "No profile image to delete",
      });
    }

    console.log("🗑️ Deleting image:", nurseProfile.profileImage);

    // Delete from Cloudinary
    const publicId = extractPublicId(nurseProfile.profileImage);
    if (publicId) {
      await deleteImage(publicId);
    }

    // Remove from database
    nurseProfile.profileImage = "";
    await nurseProfile.save();

    console.log("✅ Profile image deleted successfully");

    res.status(200).json({
      success: true,
      message: "Profile image deleted successfully",
      profile: nurseProfile,
    });
  } catch (error) {
    console.error("❌ Delete error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete image",
      error: error.message,
    });
  }
};

export {
  getDashboard,
  updateProfile,
  updateAvailability,
  addCertification,
  getAppointments,
  respondToAppointment,
  completeAppointment,
  getReviews,
  uploadProfileImage,
  deleteProfileImage,
};
