
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    TrendingUp,
    Users,
    Calendar,
    Award,
    ArrowLeft,
    Sparkles,
    BarChart2,
    PieChart,
    Clock,
} from "lucide-react";
import api from "../../services/api";

const AdminAnalytics = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [dateRange, setDateRange] = useState({
        startDate: "",
        endDate: "",
    });

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const result = await api.getAnalytics(dateRange);
            if (result.success) {
                setData(result.analytics);
            }
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    if (loading && !data) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-4 pb-12">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col gap-4 mb-6">
                    <div>
                        <motion.button
                            whileHover={{ x: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate("/admin/dashboard")}
                            className="flex items-center gap-2 text-black font-medium mb-3"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </motion.button>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2 md:gap-3">
                            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-black" />
                            Analytics
                        </h1>
                        <p className="text-sm md:text-base text-gray-500 mt-1">Platform insights</p>
                    </div>

                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
                                <input
                                    type="date"
                                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none w-full sm:w-auto"
                                    value={dateRange.startDate}
                                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                                />
                                <span className="text-gray-400 text-sm text-center sm:text-left">to</span>
                                <input
                                    type="date"
                                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none w-full sm:w-auto"
                                    value={dateRange.endDate}
                                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={fetchAnalytics}
                                className="px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-900 transition-colors w-full sm:w-auto"
                            >
                                Apply
                            </motion.button>
                        </div>
                    </div>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6"
                >
                    {/* User Growth Chart (Simulated visualizing aggregation) */}
                    <motion.div variants={cardVariants} className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between mb-4 md:mb-6">
                            <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Users className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
                                User Growth
                            </h3>
                            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                        </div>
                        <div className="space-y-3 md:space-y-4">
                            {data?.userGrowth?.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 md:gap-4">
                                    <div className="w-16 md:w-24 text-xs md:text-sm text-gray-500 font-medium">
                                        {item._id.month}/{item._id.year}
                                    </div>
                                    <div className="flex-1 bg-gray-100 h-6 md:h-8 rounded-lg overflow-hidden flex">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(item.count / 20) * 100}%` }}
                                            className={`h-full ${item._id.role === 'nurse' ? 'bg-black' : 'bg-blue-500'}`}
                                        />
                                    </div>
                                    <div className="w-8 md:w-12 text-xs md:text-sm font-bold text-gray-700 text-right">
                                        {item.count}
                                    </div>
                                </div>
                            ))}
                            <div className="flex justify-center gap-3 md:gap-4 pt-3 md:pt-4 border-t">
                                <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-gray-500">
                                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-black rounded-sm"></div> Specialists
                                </div>
                                <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-gray-500">
                                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-blue-500 rounded-sm"></div> Patients
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Specialization Popularity */}
                    <motion.div variants={cardVariants} className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-lg border border-gray-100">
                        <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2 mb-4 md:mb-6">
                            <Award className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
                            Top Specializations
                        </h3>
                        <div className="space-y-4 md:space-y-6">
                            {data?.popularSpecializations?.map((spec, idx) => (
                                <div key={idx} className="relative">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm font-bold text-gray-700">{spec._id}</span>
                                        <span className="text-sm text-black font-bold">{spec.count} Bookings</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(spec.count / (data.popularSpecializations[0]?.count || 1)) * 100}%` }}
                                            className="h-full bg-black"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Appointment Status Distribution */}
                    <motion.div variants={cardVariants} className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-lg border border-gray-100 lg:col-span-2">
                        <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2 mb-4 md:mb-6">
                            <Calendar className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                            Appointment Status
                        </h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                            {['completed', 'paid-cash', 'cancelled', 'pending'].map((status) => {
                                const count = data?.appointmentTrends?.filter(item => item._id.status === status).reduce((acc, curr) => acc + curr.count, 0) || 0;
                                return (
                                    <div key={status} className="p-3 md:p-4 rounded-lg md:rounded-xl bg-gray-50 border border-gray-100 hover:border-black transition-colors">
                                        <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase mb-1 truncate">{status.replace('-', ' ')}</div>
                                        <div className="text-xl md:text-2xl font-black text-gray-900">{count}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Peak Booking Times (Bar Chart Visualization) */}
                    <motion.div variants={cardVariants} className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-lg border border-gray-100 lg:col-span-2">
                        <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2 mb-4 md:mb-6">
                            <Clock className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                            Weekly Demand
                        </h3>
                        <div className="flex items-end justify-between h-32 md:h-48 gap-1 md:gap-2 pt-4">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => {
                                const dayData = data?.peakBookingTimes?.find(item => item._id === idx + 1);
                                const height = dayData ? (dayData.count / (Math.max(...data.peakBookingTimes.map(d => d.count)) || 1)) * 100 : 5;
                                return (
                                    <div key={day} className="flex-1 flex flex-col items-center gap-2 md:gap-3">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${height}%` }}
                                            className="w-full max-w-[24px] md:max-w-[40px] bg-gray-100 rounded-t-lg relative group"
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                {dayData?.count || 0}
                                            </div>
                                            <div className="absolute inset-0 bg-black opacity-20 rounded-t-lg" />
                                        </motion.div>
                                        <span className="text-[10px] md:text-xs font-bold text-gray-400">{day}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
