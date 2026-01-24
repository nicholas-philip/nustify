import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, ArrowLeft, Heart, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import api from "../../services/api";

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: Code + Reset
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: "", message: "" });
    const [showPassword, setShowPassword] = useState(false);

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: "", message: "" });

        try {
            // Step 1: Request Reset Code
            const data = await api.forgotPassword({ email });
            if (data.success) {
                setStatus({
                    type: "success",
                    message: "Reset code sent! Please check your email.",
                });
                setTimeout(() => {
                    setStatus({ type: "", message: "" });
                    setStep(2);
                }, 1500);
            }
        } catch (error) {
            setStatus({
                type: "error",
                message: error.message || "Something went wrong. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setStatus({ type: "error", message: "Passwords do not match" });
            return;
        }

        setLoading(true);
        setStatus({ type: "", message: "" });

        try {
            // Step 2: Verify Code and Reset Password
            const data = await api.resetPassword({ email, code, password });
            if (data.success) {
                setStatus({
                    type: "success",
                    message: "Password reset successfully! You can now login.",
                });
            }
        } catch (error) {
            setStatus({
                type: "error",
                message: error.message || "Failed to reset password. Check the code and try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Decorative Orbs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 50, 0],
                        y: [0, 30, 0],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-24 -left-24 w-96 h-96 bg-gray-200 rounded-full blur-3xl opacity-30"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        x: [0, -30, 0],
                        y: [0, 50, 0],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute Top-1/2 -Right-24 w-80 h-80 bg-gray-300 rounded-full blur-3xl opacity-20"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full mx-auto relative z-10"
            >
                <div className="text-center mb-10">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center justify-center gap-2 mb-6"
                        onClick={() => navigate("/")}
                        style={{ cursor: "pointer" }}
                    >
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Heart className="w-10 h-10 text-black fill-current" />
                        </motion.div>
                        <span className="text-3xl font-black text-black tracking-tight">Nursify</span>
                    </motion.div>
                    <h2 className="text-4xl font-black text-gray-900 mb-2">
                        {step === 1 ? "Forgot Password?" : "Reset Password"}
                    </h2>
                    <p className="text-gray-600">
                        {step === 1
                            ? "No worries, we'll send you a reset code."
                            : "Enter the code sent to your email and your new password."}
                    </p>
                </div>

                <motion.div
                    className="bg-white py-10 px-8 rounded-3xl shadow-2xl border border-gray-100"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                >
                    <AnimatePresence mode="wait">
                        {status.type === "success" && step === 2 ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center space-y-6"
                            >
                                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold text-gray-900">Success!</h3>
                                    <p className="text-gray-600 leading-relaxed text-sm">
                                        {status.message}
                                    </p>
                                </div>
                                <div className="pt-4">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate("/login")}
                                        className="w-full flex justify-center py-4 px-4 bg-black text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all"
                                    >
                                        Back to Login
                                    </motion.button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.form
                                key={step === 1 ? "email-form" : "reset-form"}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={step === 1 ? handleEmailSubmit : handleResetSubmit}
                                className="space-y-6"
                            >
                                {status.type && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`p-4 rounded-2xl border flex items-center gap-3 text-sm font-medium ${status.type === 'error'
                                                ? 'bg-red-50 border-red-100 text-red-700'
                                                : 'bg-green-50 border-green-100 text-green-700'
                                            }`}
                                    >
                                        {status.type === 'error' ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
                                        {status.message}
                                    </motion.div>
                                )}

                                {step === 1 ? (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 px-1">
                                            Email Address
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
                                            </div>
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black focus:ring-0 text-gray-900 font-medium transition-all outline-none sm:text-sm"
                                                placeholder="you@example.com"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 px-1">
                                                Verification Code
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                maxLength={6}
                                                value={code}
                                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                                className="block w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black focus:ring-0 text-gray-900 font-medium transition-all outline-none sm:text-sm text-center tracking-[1em] text-xl"
                                                placeholder="000000"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 px-1">
                                                New Password
                                            </label>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="block w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black focus:ring-0 text-gray-900 font-medium transition-all outline-none sm:text-sm"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 px-1">
                                                Confirm New Password
                                            </label>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="block w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black focus:ring-0 text-gray-900 font-medium transition-all outline-none sm:text-sm"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                id="show-password"
                                                type="checkbox"
                                                className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                                                checked={showPassword}
                                                onChange={() => setShowPassword(!showPassword)}
                                            />
                                            <label htmlFor="show-password" class="ml-2 block text-sm text-gray-900">
                                                Show password
                                            </label>
                                        </div>
                                    </>
                                )}

                                <div className="pt-2">
                                    <motion.button
                                        whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)" }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={loading}
                                        type="submit"
                                        className="w-full flex justify-center py-4 px-4 bg-black text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                                    >
                                        <span className="flex items-center gap-2">
                                            {loading ? (
                                                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    {step === 1 ? "Send Reset Code" : "Reset Password"}
                                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </span>
                                    </motion.button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 text-center"
                >
                    <button
                        onClick={() => step === 2 ? setStep(1) : navigate("/login")}
                        className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-black transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        {step === 2 ? "Back to Email" : "Back to Login"}
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;
