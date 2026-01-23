import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Heart,
    Baby,
    Calendar,
    Activity,
    Plus,
    ChevronRight,
    AlertCircle
} from "lucide-react";
import api from "../../../services/api";

const MaternalHealth = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewForm, setShowNewForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [formData, setFormData] = useState({
        lastMenstrualPeriod: "",
        estimatedDueDate: "",
        pregnancyNumber: 1,
    });

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            setError("");
            const data = await api.getPregnancyRecords();
            if (data.success) {
                setRecords(data.records);
            }
        } catch (error) {
            console.error("Error fetching pregnancy records:", error);
            setError("Unable to load pregnancy records. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRecord = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            const data = await api.createPregnancyRecord(formData);
            if (data.success) {
                setSuccess("Pregnancy journey started successfully! 🎉");
                setTimeout(() => setSuccess(""), 3000);
                fetchRecords();
                setShowNewForm(false);
                setFormData({ lastMenstrualPeriod: "", estimatedDueDate: "", pregnancyNumber: 1 });
            }
        } catch (error) {
            console.error("Error creating record:", error);
            setError(error.message || "Failed to create pregnancy record. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const calculateProgress = (record) => {
        if (!record.currentWeek) return 0;
        return Math.min((record.currentWeek / 40) * 100, 100);
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Success Notification */}
            <AnimatePresence>
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3"
                    >
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-green-800 font-medium">{success}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Notification */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
                    >
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-red-800 font-medium">{error}</p>
                            <button
                                onClick={() => { setError(""); fetchRecords(); }}
                                className="text-red-600 text-sm underline mt-1 hover:text-red-700"
                            >
                                Try again
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Header / Call to Action */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Maternal Health Journey</h2>
                    <p className="text-gray-500 text-sm">Track your pregnancy and prenatal care</p>
                </div>
                {!showNewForm && (
                    <button
                        onClick={() => setShowNewForm(true)}
                        className="flex items-center gap-2 bg-black text-white px-6 py-2 rounded-full font-semibold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
                    >
                        <Plus className="w-4 h-4" />
                        New Pregnancy
                    </button>
                )}
            </div>

            {/* New Pregnancy Form */}
            <AnimatePresence>
                {showNewForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8">
                            <h3 className="text-lg font-bold mb-4">Start New Pregnancy Journey</h3>
                            <form onSubmit={handleCreateRecord} className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Last Menstrual Period
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-black outline-none"
                                            value={formData.lastMenstrualPeriod}
                                            onChange={(e) => setFormData({ ...formData, lastMenstrualPeriod: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Estimated Due Date
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-black outline-none"
                                            value={formData.estimatedDueDate}
                                            onChange={(e) => setFormData({ ...formData, estimatedDueDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowNewForm(false)}
                                        className="flex-1 px-6 py-2 border border-gray-200 rounded-full font-semibold hover:bg-gray-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 px-6 py-2 bg-pink-500 text-white rounded-full font-semibold hover:bg-pink-600 shadow-lg shadow-pink-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        {submitting ? "Creating..." : "Start Journey"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Active Pregnancies */}
            <div className="grid gap-6">
                {records.length === 0 && !showNewForm ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                        <Baby className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-gray-900 font-medium">No pregnancy records found</h3>
                        <p className="text-gray-500 text-sm mt-1">Start tracking your journey today</p>
                    </div>
                ) : (
                    records.map((record) => (
                        <motion.div
                            key={record._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100 relative overflow-hidden"
                        >
                            {record.pregnancyStatus === "pregnant" && (
                                <div className="absolute top-0 right-0 p-6">
                                    <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                        Current
                                    </span>
                                </div>
                            )}

                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                {/* Leading Icon */}
                                <div className="p-4 bg-pink-50 text-pink-500 rounded-2xl flex-shrink-0">
                                    <Baby className="w-8 h-8" />
                                </div>

                                {/* Details */}
                                <div className="flex-1 w-full">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                                        Week {record.currentWeek || 0}
                                    </h3>
                                    <p className="text-gray-500 mb-6 flex items-center gap-2">
                                        Trimester {record.currentTrimester || 1} • {record.pregnancyNumber}{getOrdinal(record.pregnancyNumber)} Pregnancy
                                    </p>

                                    {/* Progress Bar */}
                                    <div className="space-y-2 mb-6">
                                        <div className="flex justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            <span>Conception</span>
                                            <span>Due Date</span>
                                        </div>
                                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${calculateProgress(record)}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className="h-full bg-gradient-to-r from-pink-400 to-pink-500 rounded-full"
                                            />
                                        </div>
                                        <div className="text-right text-xs text-pink-600 font-medium">
                                            Due {new Date(record.estimatedDueDate).toLocaleDateString()}
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="p-3 bg-gray-50 rounded-xl">
                                            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                                                <Calendar className="w-3 h-3" />
                                                Next Checkup
                                            </div>
                                            <div className="font-semibold text-gray-900">
                                                {record.nextAppointment ? new Date(record.nextAppointment).toLocaleDateString() : 'Not scheduled'}
                                            </div>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-xl">
                                            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                                                <Activity className="w-3 h-3" />
                                                Risk Level
                                            </div>
                                            <div className={`font-semibold ${record.highRiskPregnancy ? 'text-red-600' : 'text-green-600'}`}>
                                                {record.highRiskPregnancy ? 'High Risk' : 'Standard'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

// Helper for ordinal suffixes (1st, 2nd, 3rd)
const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
};

export default MaternalHealth;
