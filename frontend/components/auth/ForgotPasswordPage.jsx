import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, ArrowLeft, Bot, Sparkles, AlertCircle, CheckCircle2, Lock, Cpu } from "lucide-react";
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

    // Simulate AI "Processing" text
    const [processingText, setProcessingText] = useState("Analyzing...");

    useEffect(() => {
        if (loading) {
            const texts = ["Establishing Secure Handshake...", "Verifying Identity...", "Encrypting Request...", "AI Analysis Complete."];
            let i = 0;
            const interval = setInterval(() => {
                setProcessingText(texts[i % texts.length]);
                i++;
            }, 800);
            return () => clearInterval(interval);
        }
    }, [loading]);

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: "", message: "" });

        try {
            const data = await api.forgotPassword({ email });
            if (data.success) {
                setStatus({
                    type: "success",
                    message: "Identity Verified. Security Code Sent.",
                });
                setTimeout(() => {
                    setStatus({ type: "", message: "" });
                    setStep(2);
                }, 1500);
            }
        } catch (error) {
            setStatus({
                type: "error",
                message: error.message || "Identification Failed. Please retry.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setStatus({ type: "error", message: "Password mismatch detected." });
            return;
        }

        setLoading(true);
        setStatus({ type: "", message: "" });

        try {
            const data = await api.resetPassword({ email, code, password });
            if (data.success) {
                setStatus({
                    type: "success",
                    message: "Access Credentials Updated Successfully.",
                });
            }
        } catch (error) {
            setStatus({
                type: "error",
                message: error.message || "Security Code Invalid.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-slate-200">
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
                    className="absolute top-1/2 -right-24 w-80 h-80 bg-violet-600/30 rounded-full blur-[100px]"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full mx-auto relative z-10"
            >
                {/* Brand Header */}
                <div className="text-center mb-10">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center justify-center gap-3 mb-6 cursor-pointer"
                        onClick={() => navigate("/")}
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

                    <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                        {step === 1 ? "Identity Recovery" : "Secure Reset"}
                    </h2>
                    <p className="text-slate-400 font-mono text-sm">
                        {step === 1
                            ? "> Initiating recovery protocol..."
                            : "> Awaiting security clearance code..."}
                    </p>
                </div>

                {/* Glass Card */}
                <motion.div
                    className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden relative"
                    whileHover={{ boxShadow: "0 0 30px rgba(6, 182, 212, 0.15)" }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Top Accent Line */}
                    <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-violet-500 to-cyan-500" />

                    <div className="p-8">
                        <AnimatePresence mode="wait">
                            {status.type === "success" && step === 2 ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
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
                                    <h3 className="text-white text-xl font-bold mb-2">Protocol Verified</h3>
                                    <p className="text-slate-400 text-sm mb-8">{status.message}</p>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate("/login")}
                                        className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-bold shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        Return to Portal
                                        <ArrowRight className="w-4 h-4" />
                                    </motion.button>
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
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className={`p-4 rounded-lg border flex items-center gap-3 text-sm font-medium ${status.type === 'error'
                                                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                                    : 'bg-green-500/10 border-green-500/30 text-green-400'
                                                }`}
                                        >
                                            {status.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                                            {status.message}
                                        </motion.div>
                                    )}

                                    {step === 1 ? (
                                        <div>
                                            <label className="block text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
                                                Registered Email ID
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                                                </div>
                                                <input
                                                    type="email"
                                                    required
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="block w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all outline-none"
                                                    placeholder="user@nursify.ai"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="block text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
                                                    6-Digit Security Token
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                        <Cpu className="h-5 w-5 text-slate-500" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        required
                                                        maxLength={6}
                                                        value={code}
                                                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                                        className="block w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-600 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all outline-none font-mono tracking-[0.5em] text-lg"
                                                        placeholder="000000"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
                                                        New Credentials
                                                    </label>
                                                    <div className="relative group">
                                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                            <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                                                        </div>
                                                        <input
                                                            type={showPassword ? "text" : "password"}
                                                            required
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            className="block w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all outline-none"
                                                            placeholder="••••••••"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
                                                        Confirm Credentials
                                                    </label>
                                                    <div className="relative group">
                                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                            <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                                                        </div>
                                                        <input
                                                            type={showPassword ? "text" : "password"}
                                                            required
                                                            value={confirmPassword}
                                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                                            className="block w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all outline-none"
                                                            placeholder="••••••••"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center">
                                                <input
                                                    id="show-password"
                                                    type="checkbox"
                                                    className="w-4 h-4 text-cyan-500 bg-slate-800 border-slate-600 rounded focus:ring-cyan-500 focus:ring-offset-slate-900"
                                                    checked={showPassword}
                                                    onChange={() => setShowPassword(!showPassword)}
                                                />
                                                <label htmlFor="show-password" class="ml-2 block text-sm text-slate-400">
                                                    Reveal Credentials
                                                </label>
                                            </div>
                                        </>
                                    )}

                                    <div className="pt-2">
                                        <motion.button
                                            whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(6, 182, 212, 0.4)" }}
                                            whileTap={{ scale: 0.98 }}
                                            disabled={loading}
                                            type="submit"
                                            className="w-full py-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-[length:200%_auto] animate-gradient text-white rounded-lg font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                            <span className="relative flex items-center justify-center gap-2">
                                                {loading ? (
                                                    <>
                                                        <Cpu className="w-5 h-5 animate-pulse" />
                                                        {processingText}
                                                    </>
                                                ) : (
                                                    <>
                                                        {step === 1 ? "Initialize Scan" : "Execute Reset"}
                                                        {step === 1 ? <Sparkles className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                                                    </>
                                                )}
                                            </span>
                                        </motion.button>
                                    </div>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 text-center"
                >
                    <button
                        onClick={() => step === 2 ? setStep(1) : navigate("/login")}
                        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-cyan-400 transition-colors group uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        {step === 2 ? "Abort & Return" : "Terminate"}
                    </button>
                </motion.div>
            </motion.div>

            <style>{`
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-gradient {
                    animation: gradient 3s ease infinite;
                }
            `}</style>
        </div>
    );
};

export default ForgotPasswordPage;
