import PatientProfile from "../models/PatientProfile.js";
import NurseProfile from "../models/NurseProfile.js";
import Appointment from "../models/Appointments.js"; // ✅ ADD THIS LINE
import Message from "../models/Messages.js";
import Review from "../models/Reviews.js";

// @desc    Update patient profile
// @route   PUT /api/patient/profile
// @access  Private (Patient only)
const updateProfile = async (req, res) => {
  try {
    const updates = req.body;

    // Remove userId from updates
    delete updates.userId;

    const patientProfile = await PatientProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!patientProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Patient profile not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: patientProfile,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Search nurses
// @route   GET /api/patient/nurses/search
// @access  Private (Patient only)
const searchNurses = async (req, res) => {
  try {
    const {
      specialization,
      city,
      minRating,
      maxRate,
      sortBy = "rating",
      page = 1,
      limit = 10,
    } = req.query;

    let query = { isAvailable: true };

    if (specialization) {
      query.specialization = { $regex: specialization, $options: "i" };
    }

    if (city) {
      query["address.city"] = { $regex: city, $options: "i" };
    }

    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    if (maxRate) {
      query.hourlyRate = { $lte: parseFloat(maxRate) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let sortOptions = {};
    if (sortBy === "rating") {
      sortOptions = { rating: -1, totalReviews: -1 };
    } else if (sortBy === "price-low") {
      sortOptions = { hourlyRate: 1 };
    } else if (sortBy === "price-high") {
      sortOptions = { hourlyRate: -1 };
    } else if (sortBy === "experience") {
      sortOptions = { yearsOfExperience: -1 };
    }

    const nurses = await NurseProfile.find(query)
      .populate("userId", "email isVerified")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Add userIdString to each nurse for easy booking
    const nursesWithUserId = nurses.map((nurse) => ({
      ...nurse,
      userIdString: nurse.userId?._id?.toString() || nurse.userId,
    }));

    const total = await NurseProfile.countDocuments(query);

    res.status(200).json({
      success: true,
      count: nurses.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      nurses,
    });
  } catch (error) {
    console.error("Search nurses error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get nurse details
// @route   GET /api/patient/nurses/:id
// @access  Private (Patient only)
const getNurseDetails = async (req, res) => {
  try {
    const nurse = await NurseProfile.findById(req.params.id).populate(
      "userId",
      "email isVerified createdAt"
    );

    if (!nurse) {
      return res
        .status(404)
        .json({ success: false, message: "Nurse not found" });
    }

    // Get recent reviews
    const reviews = await Review.find({ nurseId: nurse.userId })
      .populate({
        path: "patientId",
        populate: {
          path: "userId",
          model: "PatientProfile",
          select: "fullName",
        },
      })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      nurse,
      reviews,
    });
  } catch (error) {
    console.error("Get nurse details error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Book appointment
// @route   POST /api/patient/appointments
// @access  Private (Patient only)
const bookAppointment = async (req, res) => {
  try {
    const {
      nurseId,
      appointmentDate,
      startTime,
      endTime,
      serviceType,
      location,
      address,
      symptoms,
      notes,
      duration,
    } = req.body;

    // Try to find nurse by profile ID first, then by userId
    let nurse = await NurseProfile.findById(nurseId);
    let actualNurseUserId = nurseId;

    if (nurse) {
      // If found by profile ID, use the userId from the profile
      actualNurseUserId = nurse.userId;
    } else {
      // Try to find by userId directly
      nurse = await NurseProfile.findOne({ userId: nurseId });
      if (!nurse) {
        return res
          .status(404)
          .json({ success: false, message: "Nurse not found" });
      }
      actualNurseUserId = nurseId;
    }

    // Check if nurse is available
    if (!nurse.isAvailable) {
      return res
        .status(400)
        .json({ success: false, message: "Nurse is not currently available" });
    }

    // Calculate total cost
    const totalCost = nurse.hourlyRate * (duration || 1);

    // Create appointment
    const appointment = await Appointment.create({
      patientId: req.user._id,
      nurseId: actualNurseUserId,
      appointmentDate,
      startTime,
      endTime,
      serviceType,
      location: location || "home",
      address,
      symptoms,
      notes,
      totalCost,
      duration: duration || 1,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Appointment request sent successfully",
      appointment,
    });
  } catch (error) {
    console.error("Book appointment error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get patient appointments
// @route   GET /api/patient/appointments
// @access  Private (Patient only)
const getAppointments = async (req, res) => {
  try {
    const { status } = req.query;
    let query = { patientId: req.user._id };

    if (status) {
      query.status = status;
    }

    // FIXED: Simple population first
    const appointments = await Appointment.find(query)
      .populate("nurseId", "email")
      .sort({ appointmentDate: -1 })
      .lean();

    // FIXED: Manually fetch nurse profiles after
    const appointmentsWithNurseDetails = await Promise.all(
      appointments.map(async (appointment) => {
        if (appointment.nurseId) {
          const nurseProfile = await NurseProfile.findOne({
            userId: appointment.nurseId._id,
          }).select("fullName phone specialization profileImage");

          return {
            ...appointment,
            nurseId: {
              _id: appointment.nurseId._id,
              email: appointment.nurseId.email,
              fullName: nurseProfile?.fullName || "N/A",
              phone: nurseProfile?.phone || "N/A",
              specialization: nurseProfile?.specialization || "N/A",
              profileImage: nurseProfile?.profileImage || null,
            },
          };
        }
        return appointment;
      })
    );

    res.status(200).json({
      success: true,
      count: appointmentsWithNurseDetails.length,
      appointments: appointmentsWithNurseDetails,
    });
  } catch (error) {
    console.error("Get appointments error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Cancel appointment
// @route   PUT /api/patient/appointments/:id/cancel
// @access  Private (Patient only)
const cancelAppointment = async (req, res) => {
  try {
    const { cancellationReason } = req.body;

    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: req.params.id,
        patientId: req.user._id,
        status: { $in: ["pending", "confirmed"] },
      },
      {
        $set: {
          status: "cancelled",
          cancellationReason,
          cancelledBy: req.user._id,
          cancelledAt: new Date(),
        },
      },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found or cannot be cancelled",
      });
    }

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment,
    });
  } catch (error) {
    console.error("Cancel appointment error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Send message to nurse
// @route   POST /api/patient/messages
// @access  Private (Patient only)
const sendMessage = async (req, res) => {
  try {
    const { receiverId, message, appointmentId } = req.body;

    const newMessage = await Message.create({
      senderId: req.user._id,
      receiverId,
      message,
      appointmentId: appointmentId || null,
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("Send message error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Submit review for nurse
// @route   POST /api/patient/reviews
// @access  Private (Patient only)
const submitReview = async (req, res) => {
  try {
    const { nurseId, appointmentId, rating, comment, categories } = req.body;

    // Check if appointment exists and is completed
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId: req.user._id,
      nurseId,
      status: "completed",
    });

    if (!appointment) {
      return res.status(400).json({
        success: false,
        message: "Appointment not found or not completed",
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ appointmentId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "Review already submitted for this appointment",
      });
    }

    // Create review
    const review = await Review.create({
      nurseId,
      patientId: req.user._id,
      appointmentId,
      rating,
      comment,
      categories,
      isVerified: true,
    });

    // Update nurse rating
    const allReviews = await Review.find({ nurseId });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await NurseProfile.findOneAndUpdate(
      { userId: nurseId },
      {
        $set: {
          rating: avgRating.toFixed(2),
          totalReviews: allReviews.length,
        },
      }
    );

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    console.error("Submit review error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
const getDashboard = async (req, res) => {
  try {
    // Get patient profile
    const profile = await PatientProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    // Get appointment statistics
    const totalAppointments = await Appointment.countDocuments({
      patientId: req.user._id,
    });

    const upcomingAppointments = await Appointment.countDocuments({
      patientId: req.user._id,
      status: { $in: ["pending", "confirmed"] },
      appointmentDate: { $gte: new Date() },
    });

    const completedAppointments = await Appointment.countDocuments({
      patientId: req.user._id,
      status: "completed",
    });

    // Get upcoming appointments with nurse details
    const upcomingAppointmentsList = await Appointment.find({
      patientId: req.user._id,
      status: { $in: ["pending", "confirmed"] },
      appointmentDate: { $gte: new Date() },
    })
      .populate({
        path: "nurseId",
        select: "email",
      })
      .sort({ appointmentDate: 1, startTime: 1 })
      .limit(5)
      .lean();

    // Populate nurse profile details
    const appointmentsWithNurseDetails = await Promise.all(
      upcomingAppointmentsList.map(async (appointment) => {
        const nurseProfile = await NurseProfile.findOne({
          userId: appointment.nurseId._id,
        }).select("fullName phone specialization profileImage");

        return {
          ...appointment,
          nurseId: {
            ...appointment.nurseId,
            fullName: nurseProfile?.fullName || "N/A",
            phone: nurseProfile?.phone || "N/A",
            specialization: nurseProfile?.specialization || "N/A",
            profileImage: nurseProfile?.profileImage || null,
          },
        };
      })
    );

    res.status(200).json({
      success: true,
      dashboard: {
        profile,
        stats: {
          totalAppointments,
          upcomingAppointments,
          completedAppointments,
        },
        upcomingAppointments: appointmentsWithNurseDetails,
      },
    });
  } catch (error) {
    console.error("Get dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export {
  getDashboard,
  updateProfile,
  searchNurses,
  getNurseDetails,
  bookAppointment,
  getAppointments,
  cancelAppointment,
  sendMessage,
  submitReview,
};
