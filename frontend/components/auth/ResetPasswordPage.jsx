import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowRight, Eye, EyeOff, Heart, AlertCircle, CheckCircle2 } from "lucide-react";
import api from "../../services/api";

const ResetPasswordPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: "", message: "" });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setStatus({ type: "error", message: "Passwords do not match." });
        }

        setLoading(true);
        setStatus({ type: "", message: "" });

        try {
            const data = await api.resetPassword(token, { password });
            if (data.success) {
                setStatus({
                    type: "success",
                    message: "Your password has been reset successfully. You can now login with your new password.",
                });
                setTimeout(() => navigate("/login"), 3000);
            }
        } catch (error) {
            setStatus({
                type: "error",
                message: error.message || "Something went wrong. The link may be invalid or expired.",
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
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full mx-auto relative z-10"
            >
                <div className="text-center mb-10">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
                        <Heart className="w-10 h-10 text-black fill-current group-hover:scale-110 transition-transform" />
                        <span className="text-3xl font-black text-black tracking-tight">Nursify</span>
                    </Link>
                    <h2 className="text-4xl font-black text-gray-900 mb-2">Reset Password</h2>
                    <p className="text-gray-600">Enter your new secure password below.</p>
                </div>

                <motion.div
                    className="bg-white py-10 px-8 rounded-3xl shadow-2xl border border-gray-100"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                >
                    <AnimatePresence mode="wait">
                        {status.type === "success" ? (
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
                                    <p className="text-sm text-gray-500 animate-pulse">Redirecting to login...</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.form
                                key="form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onSubmit={handleSubmit}
                                className="space-y-6"
                            >
                                {status.type === "error" && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3 text-red-700 text-sm font-medium"
                                    >
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        {status.message}
                                    </motion.div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 px-1">
                                            New Password
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="block w-full pl-11 pr-12 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black focus:ring-0 text-gray-900 font-medium transition-all outline-none sm:text-sm"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-black transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 px-1">
                                            Confirm New Password
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black focus:ring-0 text-gray-900 font-medium transition-all outline-none sm:text-sm"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>

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
                                                    Reset Password
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
            </motion.div>
        </div>
    );
};

export default ResetPasswordPage;
