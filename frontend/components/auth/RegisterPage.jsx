// src/components/auth/RegisterPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Mail,
  Lock,
  User,
  Phone,
  Briefcase,
  AlertCircle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import api from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("patient");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    specialization: "",
    licenseNumber: "",
    hourlyRate: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const apiCall =
        role === "nurse" ? api.registerNurse : api.registerPatient;
      const data = await apiCall(formData);

      if (data.success) {
        setSuccess(
          "Registration successful! Please check your email to verify your account."
        );
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, -90, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
      />

      <div className="flex max-w-6xl w-full gap-8 relative z-10">
        {/* Left Side - Image (Desktop) / Background (Mobile) */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex lg:w-1/2 relative rounded-3xl overflow-hidden shadow-2xl"
        >
          <img
            src="https://images.pexels.com/photos/7551581/pexels-photo-7551581.jpeg"
            alt="Healthcare Team"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent flex items-end p-12">
            <div className="text-white">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-4xl font-bold mb-4"
              >
                Join Our Community
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-lg opacity-90"
              >
                Connect with healthcare professionals or provide quality care
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Mobile Background Image */}
        <div className="lg:hidden absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/7551581/pexels-photo-7551581.jpeg"
            alt="Healthcare"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-purple-50/80 to-blue-50/80" />
        </div>

        {/* Right Side - Form */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full lg:w-1/2 my-8 max-h-[90vh] overflow-y-auto relative z-10"
        >
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            >
              <Heart className="w-10 h-10 text-purple-600" />
            </motion.div>
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Nursify
            </span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-3xl font-bold text-center mb-2 text-gray-900"
          >
            Create Account
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-gray-600 text-center mb-6"
          >
            Join our healthcare community
          </motion.p>

          {/* Role Selection */}
          <motion.div variants={itemVariants} className="flex gap-4 mb-6">
            {["patient", "nurse"].map((r) => (
              <motion.button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`flex-1 py-3 rounded-lg font-semibold transition ${
                  role === r
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                I'm a {r.charAt(0).toUpperCase() + r.slice(1)}
              </motion.button>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{error}</p>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-green-800 text-sm">{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.form
            variants={containerVariants}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Common Fields */}
            <motion.div
              variants={itemVariants}
              className="grid md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="fullName"
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </motion.div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+1 234 567 8900"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </motion.div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </motion.div>
            </motion.div>

            {/* Role-specific fields */}
            <AnimatePresence mode="wait">
              {role === "patient" ? (
                <motion.div
                  key="patient"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 pt-4 border-t"
                >
                  <h3 className="font-semibold text-gray-900">
                    Emergency Contact
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="emergencyContactName"
                      placeholder="Emergency contact"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                      value={formData.emergencyContactName}
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="tel"
                      name="emergencyContactPhone"
                      placeholder="Contact phone"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                      value={formData.emergencyContactPhone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="nurse"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 pt-4 border-t"
                >
                  <h3 className="font-semibold text-gray-900">
                    Professional Information
                  </h3>
                  <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="specialization"
                      placeholder="e.g., Pediatric Nurse"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                      value={formData.specialization}
                      onChange={handleChange}
                      required
                    />
                  </motion.div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="licenseNumber"
                      placeholder="License number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="number"
                      name="hourlyRate"
                      placeholder="Hourly Rate ($)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                      value={formData.hourlyRate}
                      onChange={handleChange}
                      min="0"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              variants={itemVariants}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)",
              }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="group w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold shadow-lg disabled:opacity-50 mt-6 relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? "Creating Account..." : "Create Account"}
                {!loading && (
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                )}
              </span>
            </motion.button>
          </motion.form>

          <motion.div variants={itemVariants} className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/login")}
                className="text-purple-600 font-semibold hover:underline"
              >
                Sign in
              </motion.button>
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-4 text-center">
            <motion.button
              whileHover={{ x: -5 }}
              onClick={() => navigate("/")}
              className="text-gray-500 text-sm hover:text-gray-700 flex items-center gap-1 mx-auto"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to home
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
