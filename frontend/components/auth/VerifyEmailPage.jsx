import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Bot,
  CheckCircle2,
  AlertCircle,
  Mail,
  Loader,
  ArrowRight,
  Cpu,
  RefreshCw,
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

  const [processingText, setProcessingText] = useState("Analyzing...");

  useEffect(() => {
    if (status === "verifying" || resending) {
      const texts = ["Authenticating Token...", "Decrypting Signature...", "Validating Identity...", "Establishing Session..."];
      let i = 0;
      const interval = setInterval(() => {
        setProcessingText(texts[i % texts.length]);
        i++;
      }, 800);
      return () => clearInterval(interval);
    }
  }, [status, resending]);

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
        setMessage("Identity Verified. Redirecting to Secure Gateway...");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (error) {
      setStatus("error");
      setMessage(
        error.message || "Token Expired or Invalid. Manual verification required."
      );
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    try {
      const e =
        email || prompt("Enter registered email ID for new token:");
      if (!e) {
        setResending(false);
        return;
      }

      const data = await api.resendVerification({ email: e });

      if (data.success) {
        setMessage("New security token dispatched to inbox.");
        setStatus("success_resend"); // Custom status to show success message but stay on form
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Failed to dispatch token.");
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
        setMessage("Code Accepted. Redirecting...");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      setStatus("error");
      setMessage(
        error.message || "Invalid Security Code."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden text-slate-200">
      {/* AI Grid Background */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}>
      </div>

      {/* Glowing Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/30 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute bottom-0 right-0 w-80 h-80 bg-violet-600/30 rounded-full blur-[100px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8 w-full max-w-md relative z-10 overflow-hidden"
      >
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-violet-500 to-cyan-500" />

        <div className="text-center mb-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center justify-center gap-3 mb-6 cursor-pointer"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border border-dashed border-cyan-400 opacity-50"
              />
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700 shadow-lg shadow-cyan-500/20">
                <Bot className="w-7 h-7 text-cyan-400" />
              </div>
            </div>
            <span className="text-3xl font-black text-white tracking-tight">Nursify <span className="text-cyan-400">AI</span></span>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {status === "verifying" && (
            <motion.div
              key="verifying"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center py-8"
            >
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl animate-pulse" />
                  <Cpu className="w-16 h-16 text-cyan-400 animate-pulse relative z-10" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Processing Request
              </h2>
              <p className="text-cyan-400 font-mono text-sm animate-pulse">
                {processingText}
              </p>
            </motion.div>
          )}

          {(status === "idle" || status === "success_resend") && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h2 className="text-xl font-bold text-white mb-2 text-center">
                Manual Verification
              </h2>
              <p className="text-slate-400 mb-6 text-center text-sm">
                Enter the security code dispatched to your inbox.
              </p>

              {status === "success_resend" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2 text-green-400 text-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {message}
                </motion.div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@nursify.ai"
                    className="block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Security Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    className="block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-600 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all outline-none font-mono tracking-[0.5em] text-lg text-center"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleVerifyByCode}
                  className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-bold shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                >
                  Authenticate
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-900 px-2 text-slate-500">Or Options</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleResendVerification}
                    disabled={resending}
                    className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold border border-slate-700 flex items-center justify-center gap-2 transition-all"
                  >
                    {resending ? <Loader className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    Resend Code
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/login")}
                    className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold border border-slate-700 flex items-center justify-center gap-2 transition-all"
                  >
                    <ArrowRight className="w-3 h-3" />
                    Login
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                type="spring"
                className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30"
              >
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </motion.div>
              <h2 className="text-xl font-bold text-white mb-2">
                Access Granted
              </h2>
              <p className="text-slate-400 font-mono text-sm mb-6">{message}</p>
              <div className="flex items-center justify-center gap-2 text-cyan-400 text-sm animate-pulse">
                <Loader className="w-4 h-4 animate-spin" />
                <span>Redirecting to secure dashboard...</span>
              </div>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                type="spring"
                className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30"
              >
                <AlertCircle className="w-10 h-10 text-red-500" />
              </motion.div>
              <h2 className="text-xl font-bold text-white mb-2">
                Access Denied
              </h2>
              <p className="text-red-400 font-mono text-sm mb-8">{message}</p>

              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStatus("idle")} // Go back to manual entry
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-bold shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry Manual Entry
                </motion.button>

                <motion.button
                  onClick={() => navigate("/login")}
                  className="w-full py-3 bg-slate-800 text-slate-300 rounded-lg font-bold border border-slate-700 hover:bg-slate-700 transition-all"
                >
                  Back to Login
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
