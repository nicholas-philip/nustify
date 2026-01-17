
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Calendar,
  DollarSign,
  Star,
  TrendingUp,
  Activity,
  Bell,
  LogOut,
  Menu,
  X,
  Sparkles,
  Eye,
  MessageSquare,
  Lock,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const data = await api.getAdminDashboard();
      if (data.success) {
        setDashboard(data.dashboard);
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
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

  const statCards = [
    {
      title: "Total Users",
      value: dashboard?.userStats?.total || 0,
      icon: Users,
      color: "gray",
      subtext: `${dashboard?.userStats?.newThisMonth || 0} new this month`,
    },
    {
      title: "Total Appointments",
      value: dashboard?.appointmentStats?.total || 0,
      icon: Calendar,
      color: "gray",
      subtext: `${dashboard?.appointmentStats?.pending || 0} pending`,
    },
    {
      title: "Potential Cash Revenue",
      value: `$${dashboard?.financialStats?.totalRevenue || "0.00"}`,
      icon: DollarSign,
      color: "gray",
      subtext: `Avg: $${dashboard?.financialStats?.avgAppointmentCost || "0.00"
        }`,
    },
    {
      title: "Average Rating",
      value: dashboard?.reviewStats?.averageRating || "0.0",
      icon: Star,
      color: "gray",
      subtext: `${dashboard?.reviewStats?.total || 0} reviews`,
    },
  ];

  const quickLinks = [
    { label: "Manage Users", icon: Users, path: "/admin/users" },
    { label: "View Appointments", icon: Calendar, path: "/admin/appointments" },
    { label: "Manage Reviews", icon: Star, path: "/admin/reviews" },
    { label: "View Analytics", icon: TrendingUp, path: "/admin/analytics" },
  ];

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
      { }
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white shadow-sm sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-8 h-8 text-black" />
              </motion.div>
              <span className="text-2xl font-bold text-black">
                Nursify
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-900 text-xs font-semibold rounded">
                ADMIN
              </span>
            </div>

            <div className="hidden md:flex items-center gap-6">
              {[
                { label: "Dashboard", path: "/admin/dashboard", active: true },
                { label: "Users", path: "/admin/users" },
                { label: "Appointments", path: "/admin/appointments" },
                { label: "Reviews", path: "/admin/reviews" },
                { label: "Analytics", path: "/admin/analytics" },
              ].map((item) => (
                <motion.button
                  key={item.path}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(item.path)}
                  className={
                    item.active
                      ? "text-black font-semibold"
                      : "text-gray-600 hover:text-black"
                  }
                >
                  {item.label}
                </motion.button>
              ))}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-gray-100 rounded-lg"
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

          { }
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
                      { label: "Dashboard", path: "/admin/dashboard" },
                      { label: "Users", path: "/admin/users" },
                      { label: "Appointments", path: "/admin/appointments" },
                      { label: "Reviews", path: "/admin/reviews" },
                      { label: "Analytics", path: "/admin/analytics" },
                    ].map((item) => (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          setShowMenu(false);
                        }}
                        className="block w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg"
                      >
                        {item.label}
                      </button>
                    ))}
                    <div className="border-t border-gray-100 my-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        { }
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome, Admin! 👋
          </h1>
          <p className="text-gray-600">
            Here's what's happening on your platform today
          </p>
        </motion.div>

        { }
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              variants={itemVariants}
              whileHover={{
                y: -10,
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
              }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className={`w-12 h-12 bg-${stat.color}-100 rounded-full flex items-center justify-center`}
                >
                  <stat.icon className={`w-6 h-6 text-${stat.color === 'gray' ? 'black' : stat.color + '-600'}`} />
                </motion.div>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.3 + index * 0.1 }}
                  className="text-3xl font-bold text-gray-900"
                >
                  {stat.value}
                </motion.span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">
                {stat.title}
              </h3>
              <p className="text-gray-500 text-xs">{stat.subtext}</p>
            </motion.div>
          ))}
        </motion.div>

        { }
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link, index) => (
              <motion.button
                key={link.path}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(link.path)}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <link.icon className="w-6 h-6 text-black" />
                <span className="font-semibold text-gray-900">
                  {link.label}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        { }
        <div className="grid lg:grid-cols-2 gap-8">
          { }
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Recent Appointments
              </h2>
              <motion.button
                whileHover={{ x: 5 }}
                onClick={() => navigate("/admin/appointments")}
                className="text-black hover:text-gray-900 text-sm font-semibold"
              >
                View All →
              </motion.button>
            </div>
            {dashboard?.recentAppointments?.length > 0 ? (
              <div className="space-y-3">
                {dashboard.recentAppointments.slice(0, 5).map((apt) => (
                  <motion.div
                    key={apt._id}
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {apt.serviceType}
                      </p>
                      <p className="text-xs text-gray-500">
                        {apt.patientId?.email} → {apt.nurseId?.email}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${apt.status === "confirmed"
                        ? "bg-black text-white"
                        : apt.status === "pending"
                          ? "bg-gray-200 text-gray-800"
                          : "bg-gray-100 text-gray-800"
                        }`}
                    >
                      {apt.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No recent appointments
              </p>
            )}
          </motion.div>

          { }
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            { }
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-6 h-6 text-black" />
                System Health
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Unread Messages
                  </span>
                  <span className="font-semibold text-gray-900">
                    {dashboard?.systemHealth?.unreadMessages || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Locked Accounts
                  </span>
                  <span className="font-semibold text-gray-900">
                    {dashboard?.systemHealth?.lockedAccounts || 0}
                  </span>
                </div>
              </div>
            </div>

            { }
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Top Rated Nurses
              </h2>
              {dashboard?.topNurses?.length > 0 ? (
                <div className="space-y-3">
                  {dashboard.topNurses.slice(0, 3).map((nurse, index) => (
                    <motion.div
                      key={nurse._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-black">
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {nurse.userId?.email}
                        </p>
                        <p className="text-xs text-gray-500">
                          {nurse.specialization}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-semibold">
                          {nurse.rating || 0}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No nurses yet</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
