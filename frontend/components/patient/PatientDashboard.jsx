
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Search,
  User,
  Bell,
  LogOut,
  Menu,
  X,
  Heart,
  Sparkles,
  Star,
  MapPin,
  DollarSign,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import NotificationCenter from "../common/NotificationCenter";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    
    if (user) {
      fetchDashboard();
    } else {
      setLoading(false);
    }
  }, [user]); 

  const fetchDashboard = async () => {
    
    if (!user) {
      console.log("⚠️ No user, skipping dashboard fetch");
      setLoading(false);
      return;
    }

    try {
      console.log("📊 Fetching dashboard for user:", user.email);
      const data = await api.getPatientDashboard();
      if (data.success) {
        setDashboard(data.dashboard);
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      
      if (error.message.includes("Not authorized")) {
        console.log("🚪 Unauthorized, logging out");
        await logout();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log("🚪 Logging out...");
      await logout();
      console.log("✅ Logged out successfully");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      
      navigate("/login", { replace: true });
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full"
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
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Heart className="w-8 h-8 text-purple-600" />
              </motion.div>
              <span className="text-2xl font-bold text-purple-600">
                Nursify
              </span>
            </motion.div>

            <div className="hidden md:flex items-center gap-6">
              {[
                {
                  label: "Dashboard",
                  path: "/patient/dashboard",
                  active: true,
                },
                { label: "Find Nurses", path: "/patient/search" },
                { label: "Appointments", path: "/patient/appointments" },
                { label: "Profile", path: "/patient/profile" },
              ].map((item) => (
                <motion.button
                  key={item.path}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(item.path)}
                  className={
                    item.active
                      ? "text-purple-600 font-semibold"
                      : "text-gray-600 hover:text-purple-600"
                  }
                >
                  {item.label}
                </motion.button>
              ))}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-gray-100 rounded-lg relative"
              >
                <Bell className="w-5 h-5 text-gray-600" />
              </motion.button>
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

            <button
              className="md:hidden"
              onClick={() => setShowMenu(!showMenu)}
            >
              {showMenu ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
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
                      { label: "Find Nurses", path: "/patient/search" },
                      { label: "Appointments", path: "/patient/appointments" },
                      { label: "Profile", path: "/patient/profile" },
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-8 h-8 text-purple-600" />
            </motion.div>
            Welcome, {dashboard?.profile?.fullName || user?.email}!
          </motion.h1>
          <p className="text-gray-600">Your health, our priority</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          {[
            {
              icon: Calendar,
              color: "text-purple-600",
              label: "Total Appointments",
              value: dashboard?.stats?.totalAppointments || 0,
            },
            {
              icon: Clock,
              color: "text-yellow-600",
              label: "Upcoming",
              value: dashboard?.stats?.upcomingAppointments || 0,
            },
            {
              icon: Heart,
              color: "text-red-600",
              label: "Completed",
              value: dashboard?.stats?.completedAppointments || 0,
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
              className="bg-white p-6 rounded-xl shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </motion.div>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.3 + index * 0.1 }}
                  className="text-2xl font-bold text-gray-900"
                >
                  {stat.value}
                </motion.span>
              </div>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{
            scale: 1.02,
            boxShadow: "0 25px 50px rgba(139, 92, 246, 0.3)",
          }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg p-8 mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Need Healthcare?</h3>
              <p className="opacity-90 mb-4">
                Find qualified nurses near you in minutes
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/patient/search")}
                className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                Find a Nurse
              </motion.button>
            </div>
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="hidden md:block"
            >
              <Heart className="w-32 h-32 opacity-20" />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Upcoming Appointments
            </h2>
            <motion.button
              whileHover={{ x: 5 }}
              onClick={() => navigate("/patient/appointments")}
              className="text-purple-600 hover:text-purple-700 font-semibold text-sm"
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
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 30px rgba(139, 92, 246, 0.3)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/patient/search")}
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg"
              >
                Book Now
              </motion.button>
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
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {appointment.serviceType}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Nurse:{" "}
                        {appointment.nurseId?.fullName ||
                          appointment.nurseId?.email ||
                          "N/A"}
                      </p>
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
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PatientDashboard;
