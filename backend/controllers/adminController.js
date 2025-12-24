import User from "../models/User.js";
import NurseProfile from "../models/NurseProfile.js";
import PatientProfile from "../models/PatientProfile.js";
import Appointment from "../models/Appointments.js";
import Review from "../models/Reviews.js";
import Message from "../models/Messages.js";




const getDashboard = async (req, res) => {
  try {
    
    const totalUsers = await User.countDocuments();
    const totalNurses = await User.countDocuments({ role: "nurse" });
    const totalPatients = await User.countDocuments({ role: "patient" });
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const activeUsers = await User.countDocuments({ isActive: true });

    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({
      status: "pending",
    });
    const confirmedAppointments = await Appointment.countDocuments({
      status: "confirmed",
    });
    const completedAppointments = await Appointment.countDocuments({
      status: "completed",
    });
    const cancelledAppointments = await Appointment.countDocuments({
      status: "cancelled",
    });

    
    const revenueData = await Appointment.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalCost" },
          avgAppointmentCost: { $avg: "$totalCost" },
        },
      },
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;
    const avgAppointmentCost = revenueData[0]?.avgAppointmentCost || 0;

    
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Appointment.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$totalCost" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    
    const totalReviews = await Review.countDocuments();
    const averageRatingData = await Review.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
        },
      },
    ]);
    const averageRating = averageRatingData[0]?.avgRating || 0;

    
    const topNurses = await NurseProfile.find()
      .sort({ rating: -1, totalReviews: -1 })
      .limit(5)
      .populate("userId", "email isVerified");

    
    const recentAppointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("patientId", "email")
      .populate("nurseId", "email");

    
    const unreadMessages = await Message.countDocuments({ isRead: false });
    const lockedAccounts = await User.countDocuments({
      lockUntil: { $gt: Date.now() },
    });

    res.status(200).json({
      success: true,
      dashboard: {
        userStats: {
          total: totalUsers,
          nurses: totalNurses,
          patients: totalPatients,
          verified: verifiedUsers,
          active: activeUsers,
          newThisMonth: newUsersThisMonth,
        },
        appointmentStats: {
          total: totalAppointments,
          pending: pendingAppointments,
          confirmed: confirmedAppointments,
          completed: completedAppointments,
          cancelled: cancelledAppointments,
        },
        financialStats: {
          totalRevenue: totalRevenue.toFixed(2),
          avgAppointmentCost: avgAppointmentCost.toFixed(2),
          monthlyRevenue,
        },
        reviewStats: {
          total: totalReviews,
          averageRating: averageRating.toFixed(2),
        },
        topNurses,
        recentAppointments,
        systemHealth: {
          unreadMessages,
          lockedAccounts,
        },
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




const getUsers = async (req, res) => {
  try {
    const {
      role,
      isVerified,
      isActive,
      search,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    let query = {};

    if (role) query.role = role;
    if (isVerified !== undefined) query.isVerified = isVerified === "true";
    if (isActive !== undefined) query.isActive = isActive === "true";
    if (search) {
      query.email = { $regex: search, $options: "i" };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const users = await User.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select("-password");

    const total = await User.countDocuments(query);

    
    const usersWithProfiles = await Promise.all(
      users.map(async (user) => {
        let profile = null;
        if (user.role === "nurse") {
          profile = await NurseProfile.findOne({ userId: user._id });
        } else if (user.role === "patient") {
          profile = await PatientProfile.findOne({ userId: user._id });
        }
        return {
          ...user.toObject(),
          profile,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      users: usersWithProfiles,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};




const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let profile = null;
    if (user.role === "nurse") {
      profile = await NurseProfile.findOne({ userId: user._id });
    } else if (user.role === "patient") {
      profile = await PatientProfile.findOne({ userId: user._id });
    }

    
    const appointments = await Appointment.find({
      $or: [{ patientId: user._id }, { nurseId: user._id }],
    })
      .sort({ createdAt: -1 })
      .limit(10);

    
    let reviews = [];
    if (user.role === "nurse") {
      reviews = await Review.find({ nurseId: user._id })
        .sort({ createdAt: -1 })
        .limit(5);
    } else if (user.role === "patient") {
      reviews = await Review.find({ patientId: user._id })
        .sort({ createdAt: -1 })
        .limit(5);
    }

    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        profile,
        appointments,
        reviews,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};




const updateUserStatus = async (req, res) => {
  try {
    const { isActive, isVerified } = req.body;

    const updates = {};
    if (isActive !== undefined) updates.isActive = isActive;
    if (isVerified !== undefined) updates.isVerified = isVerified;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User status updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};




const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    
    if (user.role === "nurse") {
      await NurseProfile.deleteOne({ userId: user._id });
    } else if (user.role === "patient") {
      await PatientProfile.deleteOne({ userId: user._id });
    }

    
    await Appointment.deleteMany({
      $or: [{ patientId: user._id }, { nurseId: user._id }],
    });
    await Message.deleteMany({
      $or: [{ senderId: user._id }, { receiverId: user._id }],
    });
    await Review.deleteMany({
      $or: [{ patientId: user._id }, { nurseId: user._id }],
    });

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};




const getAppointments = async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 20 } = req.query;

    let query = {};

    if (status) query.status = status;
    if (startDate && endDate) {
      query.appointmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const appointments = await Appointment.find(query)
      .populate("patientId", "email")
      .populate("nurseId", "email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(query);

    res.status(200).json({
      success: true,
      count: appointments.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      appointments,
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




const getReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20, minRating, maxRating } = req.query;

    let query = {};

    if (minRating) query.rating = { $gte: parseFloat(minRating) };
    if (maxRating)
      query.rating = { ...query.rating, $lte: parseFloat(maxRating) };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find(query)
      .populate("patientId", "email")
      .populate("nurseId", "email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(query);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      reviews,
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};




const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    
    const allReviews = await Review.find({ nurseId: review.nurseId });
    const avgRating = allReviews.length
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0;

    await NurseProfile.findOneAndUpdate(
      { userId: review.nurseId },
      {
        $set: {
          rating: avgRating.toFixed(2),
          totalReviews: allReviews.length,
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};




const getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    
    const userGrowth = await User.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            role: "$role",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    
    const appointmentTrends = await Appointment.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            status: "$status",
          },
          count: { $sum: 1 },
          revenue: { $sum: "$totalCost" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    
    const popularSpecializations = await Appointment.aggregate([
      {
        $lookup: {
          from: "nurseprofiles",
          localField: "nurseId",
          foreignField: "userId",
          as: "nurse",
        },
      },
      { $unwind: "$nurse" },
      {
        $group: {
          _id: "$nurse.specialization",
          count: { $sum: 1 },
          revenue: { $sum: "$totalCost" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    
    const peakBookingTimes = await Appointment.aggregate([
      {
        $group: {
          _id: { $dayOfWeek: "$appointmentDate" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        userGrowth,
        appointmentTrends,
        popularSpecializations,
        peakBookingTimes,
      },
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export {
  getDashboard,
  getUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getAppointments,
  getReviews,
  deleteReview,
  getAnalytics,
};
