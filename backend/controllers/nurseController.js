import NurseProfile from "../models/NurseProfile.js";
import Appointment from "../models/Appointments.js";
import Review from "../models/Reviews.js";
import PatientProfile from "../models/PatientProfile.js"; // ✅ ADDED THIS LINE

// @desc    Get nurse dashboard
// @route   GET /api/nurse/dashboard
// @access  Private (Nurse only)
const getDashboard = async (req, res) => {
  try {
    console.log("🔍 Looking for nurse profile with userId:", req.user._id);

    let nurseProfile = await NurseProfile.findOne({ userId: req.user._id });

    // If profile doesn't exist, create a default one
    if (!nurseProfile) {
      console.log("⚠️ Nurse profile not found, creating default profile...");

      nurseProfile = await NurseProfile.create({
        userId: req.user._id,
        fullName: req.user.email.split("@")[0], // Use email username as temp name
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

    // Get appointment statistics
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

    // Get unread messages count (set to 0 if Message model doesn't exist)
    let unreadMessages = 0;
    try {
      // Only count if Message model exists
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

// @desc    Update nurse profile
// @route   PUT /api/nurse/profile
// @access  Private (Nurse only)
const updateProfile = async (req, res) => {
  try {
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.userId;
    delete updates.rating;
    delete updates.totalReviews;

    let nurseProfile = await NurseProfile.findOne({ userId: req.user._id });

    // Create profile if it doesn't exist
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

// @desc    Update nurse availability
// @route   PUT /api/nurse/availability
// @access  Private (Nurse only)
const updateAvailability = async (req, res) => {
  try {
    const { availability, isAvailable } = req.body;

    let nurseProfile = await NurseProfile.findOne({ userId: req.user._id });

    // Create profile if it doesn't exist
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

// @desc    Add certification
// @route   POST /api/nurse/certifications
// @access  Private (Nurse only)
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

// @desc    Get nurse appointments
// @route   GET /api/nurse/appointments
// @access  Private (Nurse only)
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

    // FIXED: Simple population first
    const appointments = await Appointment.find(query)
      .populate("patientId", "email")
      .sort({ appointmentDate: -1 })
      .lean();

    // FIXED: Manually fetch patient profiles after
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

// @desc    Respond to appointment request
// @route   PUT /api/nurse/appointments/:id/respond
// @access  Private (Nurse only)
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

// @desc    Get nurse reviews
// @route   GET /api/nurse/reviews
// @access  Private (Nurse only)
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

export {
  getDashboard,
  updateProfile,
  updateAvailability,
  addCertification,
  getAppointments,
  respondToAppointment,
  getReviews,
};
