import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Star,
  DollarSign,
  User,
  Bell,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Users,
  Sparkles,
  Phone,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import NotificationCenter from "../common/NotificationCenter";

const NurseDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const data = await api.getNurseDashboard();
      console.log("📊 Dashboard data:", data);
      if (data.success) {
        setDashboard(data.dashboard);
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-green-100 text-green-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
      rejected: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      logout();
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full"
        />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="bg-white shadow-sm sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2"
            >
              <span className="text-2xl font-bold text-black">
                Nursify
              </span>
              <span className="px-2 py-1 bg-gray-100 text-black text-xs font-semibold rounded">
                SPECIALIST
              </span>
            </motion.div>

            <div className="hidden md:flex items-center gap-6">
              {[
                { label: "Dashboard", path: "/nurse/dashboard", active: true },
                { label: "Appointments", path: "/nurse/appointments" },
                { label: "Messages", path: "/nurse/messages" },
                { label: "Profile", path: "/nurse/profile" },
              ].map((item) => (
                <motion.button
                  key={item.path}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(item.path)}
                  className={
                    item.active
                      ? "text-black font-semibold border-b-2 border-black"
                      : "text-gray-600 hover:text-black"
                  }
                >
                  {item.label}
                </motion.button>
              ))}
              <NotificationCenter />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setShowMenu(!showMenu)}
            >
              {showMenu ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.button>
          </div>

          <AnimatePresence>
            {showMenu && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black z-40 md:hidden"
                  onClick={() => setShowMenu(false)}
                />
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 25 }}
                  className="fixed top-0 right-0 bottom-0 w-64 bg-white shadow-xl z-50 md:hidden p-6 flex flex-col"
                >
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold text-gray-900">Menu</h2>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowMenu(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="w-6 h-6" />
                    </motion.button>
                  </div>
                  <div className="space-y-4 flex-1">
                    {[
                      { label: "Appointments", path: "/nurse/appointments" },
                      { label: "Messages", path: "/nurse/messages" },
                      { label: "Profile", path: "/nurse/profile" },
                    ].map((item) => (
                      <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className="block w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg"
                      >
                        {item.label}
                      </button>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Logout
                    </button>
                  </div>
                  <div className="border-t border-gray-200 pt-4 flex justify-end">
                    <NotificationCenter />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-black" />
            </motion.div>
            <span className="truncate">Welcome, {dashboard?.profile?.fullName || user?.email}!</span>
          </motion.h1>
          <p className="text-sm md:text-base text-gray-600">Here's your professional dashboard</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8"
        >
          {[
            {
              icon: Calendar,
              color: "text-gray-900",
              label: "Total Appointments",
              value: dashboard?.stats?.totalAppointments || 0,
            },
            {
              icon: Clock,
              color: "text-yellow-600",
              label: "Pending Requests",
              value: dashboard?.stats?.pendingAppointments || 0,
            },
            {
              icon: Star,
              color: "text-yellow-500",
              label: `Rating (${dashboard?.stats?.totalReviews || 0} reviews)`,
              value: dashboard?.stats?.rating || 0,
            },
            {
              icon: Users,
              color: "text-blue-600",
              label: "Unread Messages",
              value: dashboard?.stats?.unreadMessages || 0,
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              whileHover={{
                y: -10,
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
              }}
              className="bg-white p-4 md:p-6 rounded-lg md:rounded-xl shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <stat.icon className={`w-6 h-6 md:w-8 md:h-8 ${stat.color}`} />
                </motion.div>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.3 + index * 0.1 }}
                  className="text-xl md:text-2xl font-bold text-gray-900"
                >
                  {stat.value}
                </motion.span>
              </div>
              <p className="text-gray-600 text-xs md:text-sm truncate">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* ⭐ UPDATED: Profile Card with Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{
            scale: 1.02,
            boxShadow: "0 25px 50px rgba(0, 0, 0, 0.2)",
          }}
          className="bg-black text-white rounded-lg md:rounded-xl shadow-lg p-4 md:p-6 mb-6 md:mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Profile Image */}
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
              className="flex-shrink-0"
            >
              {dashboard?.profile?.profileImage ? (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-4 border-white/30 shadow-lg">
                  <img
                    src={dashboard.profile.profileImage}
                    alt={dashboard.profile.fullName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div
                    className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center"
                    style={{ display: "none" }}
                  >
                    <User className="w-8 h-8 md:w-10 md:h-10" />
                  </div>
                </div>
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30 shadow-lg">
                  <User className="w-8 h-8 md:w-10 md:h-10" />
                </div>
              )}
            </motion.div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl md:text-2xl font-bold mb-1 truncate">
                {dashboard?.profile?.fullName}
              </h3>
              <p className="opacity-90 text-sm md:text-base truncate">{dashboard?.profile?.specialization}</p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 text-xs md:text-sm">
                <span className="truncate">
                  License: {dashboard?.profile?.licenseNumber || "N/A"}
                </span>
                <span className="hidden sm:inline">•</span>
                <span>${dashboard?.profile?.hourlyRate}/hour</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/nurse/profile")}
              className="px-4 md:px-6 py-2 bg-white text-black rounded-lg font-semibold text-sm md:text-base whitespace-nowrap self-start sm:self-auto"
            >
              Edit Profile
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-lg md:rounded-xl shadow-lg p-4 md:p-6"
        >
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              Upcoming Appointments
            </h2>
            <motion.button
              whileHover={{ x: 5 }}
              onClick={() => navigate("/nurse/appointments")}
              className="text-black hover:text-gray-900 font-semibold text-sm"
            >
              View All →
            </motion.button>
          </div>

          {!dashboard?.upcomingAppointments ||
            dashboard.upcomingAppointments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              </motion.div>
              <p className="text-gray-500">No upcoming appointments</p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {dashboard.upcomingAppointments.map((appointment) => (
                <motion.div
                  key={appointment._id}
                  variants={itemVariants}
                  whileHover={{
                    y: -5,
                    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
                  }}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {appointment.serviceType}
                      </h3>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>
                            {appointment.patientId?.fullName ||
                              appointment.patientId?.email ||
                              "N/A"}
                          </span>
                        </p>
                        {appointment.patientId?.phone && (
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{appointment.patientId.phone}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {appointment.status}
                    </motion.span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-1"
                    >
                      <Calendar className="w-4 h-4" />
                      {new Date(
                        appointment.appointmentDate
                      ).toLocaleDateString()}
                    </motion.div>
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-1"
                    >
                      <Clock className="w-4 h-4" />
                      {appointment.startTime} - {appointment.endTime}
                    </motion.div>
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-1"
                    >
                      <DollarSign className="w-4 h-4" />${appointment.totalCost}
                    </motion.div>
                  </div>
                  {appointment.status === "pending" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-2 mt-3"
                    >
                      <motion.button
                        whileHover={{
                          scale: 1.05,
                          boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)",
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate("/nurse/appointments")}
                        className="px-4 py-2 bg-black text-white rounded-lg text-sm"
                      >
                        Respond
                      </motion.button>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default NurseDashboard;
