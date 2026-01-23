import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Heart,
  CheckCircle,
  XCircle,
  Mail,
  Loader,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const queryEmail = searchParams.get("email") || "";
  const [status, setStatus] = useState(token ? "verifying" : "idle");
  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState(queryEmail);
  const [code, setCode] = useState("");

  useEffect(() => {
    if (token) {
      verifyEmail();
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      const data = await api.verifyEmail(token);

      if (data.success) {
        setStatus("success");
        setMessage("Email verified successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (error) {
      setStatus("error");
      setMessage(
        error.message || "Verification failed. The link may be expired."
      );
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    try {
      const e =
        email || prompt("Please enter your email to resend verification:");
      if (!e) {
        setResending(false);
        return;
      }

      const data = await api.resendVerification({ email: e });

      if (data.success) {
        setMessage("Verification email sent! Please check your inbox.");
        setStatus("success");
      }
    } catch (error) {
      setMessage(error.message || "Failed to resend verification email.");
    } finally {
      setResending(false);
    }
  };

  const handleVerifyByCode = async () => {
    setStatus("verifying");
    try {
      const data = await api.verifyEmailByCode({ email, code });
      if (data.success) {
        setStatus("success");
        setMessage("Email verified successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      setStatus("error");
      setMessage(
        error.message || "Verification failed. Check code and try again."
      );
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
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
        className="absolute top-0 left-0 w-96 h-96 bg-gray-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
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
        <div className="flex items-center justify-center gap-2 mb-8">
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
        </div>

        <AnimatePresence mode="wait">
          {status === "verifying" && (
            <motion.div
              key="verifying"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="inline-block mb-6"
              >
                <Loader className="w-16 h-16 text-black" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verifying Your Email
              </h2>
              <p className="text-gray-600">
                Please wait while we verify your email address...
              </p>
            </motion.div>
          )}

          {status === "idle" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verify Your Email
              </h2>
              <p className="text-gray-600 mb-4">
                Enter the verification code sent to your email.
              </p>

              <div className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="6-digit code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />

                <motion.button
                  onClick={handleVerifyByCode}
                  className="w-full py-3 bg-black text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Verify Code
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleResendVerification}
                  disabled={resending}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-full font-semibold hover:bg-gray-200 transition-all"
                >
                  {resending ? "Sending..." : "Resend Code"}
                </motion.button>
              </div>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center"
            >
              <motion.div
                variants={iconVariants}
                initial="hidden"
                animate="visible"
                className="inline-block mb-6"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Email Verified! ✓
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                }}
                className="flex items-center justify-center gap-2 text-black"
              >
                <Loader className="w-5 h-5 animate-spin" />
                <span>Redirecting to login...</span>
              </motion.div>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center"
            >
              <motion.div
                variants={iconVariants}
                initial="hidden"
                animate="visible"
                className="inline-block mb-6"
              >
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-12 h-12 text-red-600" />
                </div>
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>

              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleResendVerification}
                  disabled={resending}
                  className="w-full py-3 bg-black text-white rounded-full font-semibold disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                >
                  <Mail className="w-5 h-5" />
                  {resending ? "Sending..." : "Resend Verification Email"}
                </motion.button>

                <motion.button
                  onClick={() => navigate("/login")}
                  className="w-full py-3 bg-black text-white rounded-full font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                >
                  Back to Login
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
