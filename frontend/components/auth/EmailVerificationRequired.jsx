
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Mail, AlertCircle, CheckCircle, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

const EmailVerificationRequired = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleResendVerification = async () => {
    setResending(true);
    setMessage("");

    try {
      const data = await api.resendVerification({ email: user?.email });

      if (data.success) {
        setMessageType("success");
        setMessage(
          "Verification email sent! Please check your inbox and spam folder."
        );
      }
    } catch (error) {
      setMessageType("error");
      setMessage(error.message || "Failed to resend verification email.");
    } finally {
      setResending(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      { }
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
        className="absolute top-0 left-0 w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
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

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative z-10"
      >
        { }
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
            <Heart className="w-10 h-10 text-black" />
          </motion.div>
          <span className="text-3xl font-bold text-black">
            Nursify
          </span>
        </motion.div>

        { }
        <motion.div
          variants={itemVariants}
          className="flex justify-center mb-6"
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center"
          >
            <Mail className="w-10 h-10 text-black" />
          </motion.div>
        </motion.div>

        <motion.h2
          variants={itemVariants}
          className="text-2xl font-bold text-center mb-2 text-gray-900"
        >
          Verify Your Email
        </motion.h2>

        <motion.p
          variants={itemVariants}
          className="text-gray-600 text-center mb-6"
        >
          We've sent a verification link to{" "}
          <span className="font-semibold text-black">{user?.email}</span>
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
        >
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Next Steps:
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-black font-bold">1.</span>
              <span>Check your email inbox (and spam folder)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-black font-bold">2.</span>
              <span>Click the verification link in the email</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-black font-bold">3.</span>
              <span>Return here and log in</span>
            </li>
          </ul>
        </motion.div>

        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${messageType === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
              }`}
          >
            {messageType === "success" ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <p
              className={`text-sm ${messageType === "success" ? "text-green-800" : "text-red-800"
                }`}
            >
              {message}
            </p>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="space-y-3">
          <motion.button
            onClick={handleResendVerification}
            disabled={resending}
            className="w-full py-3 bg-black text-white rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Mail className="w-5 h-5" />
            {resending ? "Sending..." : "Resend Verification Email"}
          </motion.button>

          <motion.button
            onClick={handleLogout}
            className="w-full py-3 bg-black text-white rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </motion.button>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-6 text-center text-sm text-gray-500"
        >
          <p>
            Didn't receive the email? Check your spam folder or try resending.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EmailVerificationRequired;
