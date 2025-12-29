
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import { motion } from "framer-motion";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [useSession, setUseSession] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api.login(formData);

      if (data.success) {
        
        login(data.token, { ...data.user, session: useSession });

        if (data.user.role === "patient") {
          navigate("/patient/dashboard");
        } else if (data.user.role === "nurse") {
          navigate("/nurse/dashboard");
        } else if (data.user.role === "admin") {
          navigate("/admin/dashboard");
        }
      }
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
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
        when: "beforeChildren",
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
      {}
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
        {}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex lg:w-1/2 relative rounded-3xl overflow-hidden shadow-2xl"
        >
          <img
            src="https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg"
            alt="Healthcare Professional"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-end p-12">
            <div className="text-white">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-4xl font-bold mb-4"
              >
                Welcome Back!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-lg opacity-90"
              >
                Connect with qualified healthcare professionals
              </motion.p>
            </div>
          </div>
        </motion.div>

        {}
        <div className="lg:hidden absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg"
            alt="Healthcare"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-purple-50/80 to-blue-50/80" />
        </div>

        {}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full lg:w-1/2 relative z-10"
        >
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center gap-2 mb-8"
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
            <motion.span
              className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0%", "100%", "0%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
            >
              Nursify
            </motion.span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-3xl font-bold text-center mb-2 text-gray-900"
          >
            Welcome Back
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-gray-600 text-center mb-8"
          >
            Sign in to your account
          </motion.p>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              </motion.div>
              <p className="text-red-800 text-sm">{error}</p>
            </motion.div>
          )}

          <motion.form
            variants={containerVariants}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <motion.div className="relative" whileFocus={{ scale: 1.02 }}>
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <motion.input
                  whileFocus={{
                    boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.1)",
                    borderColor: "rgb(139, 92, 246)",
                  }}
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none transition"
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
              <motion.div className="relative" whileFocus={{ scale: 1.02 }}>
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <motion.input
                  whileFocus={{
                    boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.1)",
                    borderColor: "rgb(139, 92, 246)",
                  }}
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none transition"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </motion.div>
            </motion.div>

            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <motion.span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? "Signing in..." : "Sign In"}
                {!loading && (
                  <ArrowRight className="w-5 h-5" />
                )}
              </motion.span>
            </motion.button>
          </motion.form>

          <motion.div variants={itemVariants} className="mt-6 text-center">
            <label className="flex items-center gap-2 justify-center mb-4">
              <input
                type="checkbox"
                checked={useSession}
                onChange={(e) => setUseSession(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-600">
                Sign in to all tabs (remember login)
              </span>
            </label>
            <p className="text-gray-600">
              Don't have an account?{" "}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/register")}
                className="text-purple-600 font-semibold hover:underline"
              >
                Sign up
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

export default LoginPage;
