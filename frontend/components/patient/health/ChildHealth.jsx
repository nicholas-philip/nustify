import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Baby,
    Syringe,
    Ruler,
    Weight,
    Plus,
    Calendar,
    ChevronDown,
    ChevronUp,
    Sparkles,
    TrendingUp
} from "lucide-react";
import { Line } from "react-chartjs-2";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import api from "../../../services/api";

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const ChildHealth = () => {
    const [children, setChildren] = useState([]);
    const [expandedChild, setExpandedChild] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [formData, setFormData] = useState({
        childName: "",
        dateOfBirth: "",
        gender: "male",
    });

    useEffect(() => {
        fetchChildren();
    }, []);

    const fetchChildren = async () => {
        try {
            setError("");
            const data = await api.getChildHealthRecords();
            if (data.success) {
                setChildren(data.records);
            }
        } catch (error) {
            console.error("Error fetching child health records:", error);
            setError("Unable to load child health records. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateChild = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            const data = await api.createChildHealthRecord(formData);
            if (data.success) {
                setSuccess(`${formData.childName}'s profile added successfully! 🎉`);
                setTimeout(() => setSuccess(""), 3000);
                fetchChildren();
                setShowForm(false);
                setFormData({ childName: "", dateOfBirth: "", gender: "male" });
            }
        } catch (error) {
            console.error("Error creating child record:", error);
            setError(error.message || "Failed to add child profile. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const toggleExpand = (id) => {
        setExpandedChild(expandedChild === id ? null : id);
    };

    const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
            years--;
            months += 12;
        }
        return years > 0 ? `${years}y ${months}m` : `${months}m`;
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
                        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">!</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-red-800 font-medium">{error}</p>
                            <button
                                onClick={() => { setError(""); fetchChildren(); }}
                                className="text-red-600 text-sm underline mt-1 hover:text-red-700"
                            >
                                Try again
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Pediatric Health</h2>
                    <p className="text-gray-500 text-sm">Track vaccinations and growth</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Child
                    </button>
                )}
            </div>

            {/* Add Child Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8">
                            <h3 className="text-lg font-bold mb-4">Add Child Profile</h3>
                            <form onSubmit={handleCreateChild} className="space-y-4">
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-black outline-none"
                                            value={formData.childName}
                                            onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-black outline-none"
                                            value={formData.dateOfBirth}
                                            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                        <select
                                            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-black outline-none bg-white"
                                            value={formData.gender}
                                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="px-6 py-2 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-6 py-2 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? "Adding..." : "Add Profile"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Children List */}
            <div className="grid gap-6">
                {children.length === 0 && !showForm ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                        <Baby className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-gray-900 font-medium">No child profiles found</h3>
                        <p className="text-gray-500 text-sm mt-1">Add a profile to track vaccinations and growth</p>
                    </div>
                ) : (
                    children.map((child) => (
                        <motion.div
                            key={child._id}
                            layout
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                        >
                            <div
                                onClick={() => toggleExpand(child._id)}
                                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${child.gender === 'female' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                                        <Baby className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{child.childName}</h3>
                                        <p className="text-sm text-gray-500">{calculateAge(child.dateOfBirth)} old • Born {new Date(child.dateOfBirth).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                {expandedChild === child._id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                            </div>

                            <AnimatePresence>
                                {expandedChild === child._id && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: "auto" }}
                                        exit={{ height: 0 }}
                                        className="overflow-hidden border-t border-gray-100 bg-gray-50"
                                    >
                                        <div className="p-6 space-y-6">
                                            {/* Growth Chart */}
                                            {child.growthRecords && child.growthRecords.length > 1 && (
                                                <div className="bg-white p-6 rounded-xl shadow-sm">
                                                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                        <TrendingUp className="w-5 h-5 text-green-600" />
                                                        Growth Progress
                                                    </h4>
                                                    <div className="h-64">
                                                        <Line
                                                            data={{
                                                                labels: child.growthRecords.map(r =>
                                                                    new Date(r.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
                                                                ),
                                                                datasets: [
                                                                    {
                                                                        label: 'Height (cm)',
                                                                        data: child.growthRecords.map(r => r.height?.value || 0),
                                                                        borderColor: 'rgb(59, 130, 246)',
                                                                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                                        yAxisID: 'y',
                                                                        tension: 0.4,
                                                                    },
                                                                    {
                                                                        label: 'Weight (kg)',
                                                                        data: child.growthRecords.map(r => r.weight?.value || 0),
                                                                        borderColor: 'rgb(16, 185, 129)',
                                                                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                                        yAxisID: 'y1',
                                                                        tension: 0.4,
                                                                    },
                                                                ],
                                                            }}
                                                            options={{
                                                                responsive: true,
                                                                maintainAspectRatio: false,
                                                                interaction: {
                                                                    mode: 'index',
                                                                    intersect: false,
                                                                },
                                                                plugins: {
                                                                    legend: {
                                                                        position: 'top',
                                                                    },
                                                                },
                                                                scales: {
                                                                    y: {
                                                                        type: 'linear',
                                                                        display: true,
                                                                        position: 'left',
                                                                        title: {
                                                                            display: true,
                                                                            text: 'Height (cm)'
                                                                        }
                                                                    },
                                                                    y1: {
                                                                        type: 'linear',
                                                                        display: true,
                                                                        position: 'right',
                                                                        title: {
                                                                            display: true,
                                                                            text: 'Weight (kg)'
                                                                        },
                                                                        grid: {
                                                                            drawOnChartArea: false,
                                                                        },
                                                                    },
                                                                },
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="grid md:grid-cols-2 gap-6">
                                                {/* Vaccinations */}
                                                <div className="bg-white p-4 rounded-xl shadow-sm">
                                                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                        <Syringe className="w-4 h-4 text-purple-600" />
                                                        Recent Vaccinations
                                                    </h4>
                                                    {child.vaccinations && child.vaccinations.length > 0 ? (
                                                        <ul className="space-y-3">
                                                            {child.vaccinations.slice(0, 3).map((vax, idx) => (
                                                                <li key={idx} className="text-sm flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                                                                    <span className="font-medium text-gray-700">{vax.vaccineName}</span>
                                                                    <span className={`px-2 py-0.5 rounded text-xs ${vax.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                                        {vax.status}
                                                                    </span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-sm text-gray-400 italic">No vaccination records yet</p>
                                                    )}
                                                </div>

                                                {/* Growth Stats */}
                                                <div className="bg-white p-4 rounded-xl shadow-sm">
                                                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                        <Ruler className="w-4 h-4 text-blue-600" />
                                                        Latest Growth
                                                    </h4>
                                                    {child.growthRecords && child.growthRecords.length > 0 ? (
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="p-3 bg-gray-50 rounded-lg text-center">
                                                                <div className="text-xs text-gray-500 mb-1">Height</div>
                                                                <div className="font-bold text-gray-900">{child.growthRecords[0].height?.value} {child.growthRecords[0].height?.unit}</div>
                                                            </div>
                                                            <div className="p-3 bg-gray-50 rounded-lg text-center">
                                                                <div className="text-xs text-gray-500 mb-1">Weight</div>
                                                                <div className="font-bold text-gray-900">{child.growthRecords[0].weight?.value} {child.growthRecords[0].weight?.unit}</div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-gray-400 italic">No growth records yet</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Milestones */}
                                            {child.milestones && child.milestones.length > 0 && (
                                                <div className="bg-white p-4 rounded-xl shadow-sm">
                                                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                        <Sparkles className="w-4 h-4 text-yellow-600" />
                                                        Developmental Milestones
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {child.milestones.slice(0, 5).map((milestone, idx) => (
                                                            <div key={idx} className="flex items-start gap-3 pb-3 border-b last:border-0">
                                                                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${milestone.status === 'achieved' ? 'bg-green-500' :
                                                                    milestone.status === 'delayed' ? 'bg-red-500' : 'bg-gray-300'
                                                                    }`}></div>
                                                                <div className="flex-1">
                                                                    <div className="flex justify-between items-start">
                                                                        <p className="text-sm font-medium text-gray-800">{milestone.milestone}</p>
                                                                        <span className="text-xs text-gray-500 capitalize">{milestone.category}</span>
                                                                    </div>
                                                                    {milestone.achievedDate && (
                                                                        <p className="text-xs text-gray-500 mt-1">
                                                                            Achieved: {new Date(milestone.achievedDate).toLocaleDateString()}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ChildHealth;
