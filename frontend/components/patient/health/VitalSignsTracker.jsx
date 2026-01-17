import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Activity,
    Heart,
    Wind,
    Plus,
    ArrowUp,
    ArrowDown,
    Minus
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

import api from "../../../services/api";

const VitalSignsTracker = () => {
    const [selectedMetric, setSelectedMetric] = useState("bp");
    const [metrics, setMetrics] = useState([]);
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLatestVitals();
    }, []);

    useEffect(() => {
        if (selectedMetric) {
            fetchTrends(selectedMetric);
        }
    }, [selectedMetric]);

    const fetchLatestVitals = async () => {
        try {
            const data = await api.getLatestVitalSigns();
            if (data.success && data.vitalSigns) {
                const vs = data.vitalSigns;
                const newMetrics = [
                    {
                        id: "bp",
                        label: "Blood Pressure",
                        value: vs.bloodPressure ? `${vs.bloodPressure.systolic}/${vs.bloodPressure.diastolic}` : "--/--",
                        unit: "mmHg",
                        icon: Activity,
                        status: "normal" // You might want to compute this based on values
                    },
                    {
                        id: "heartRate",
                        label: "Heart Rate",
                        value: vs.heartRate?.value || "--",
                        unit: "bpm",
                        icon: Heart,
                        status: "normal"
                    },
                    {
                        id: "oxygenSaturation",
                        label: "Oxygen Saturation",
                        value: vs.oxygenSaturation?.value || "--",
                        unit: "%",
                        icon: Wind,
                        status: "normal"
                    },
                    {
                        id: "temperature",
                        label: "Temperature",
                        value: vs.temperature?.value || "--",
                        unit: "°C",
                        icon: Activity, // Use Thermometer if imported
                        status: "normal"
                    },
                    {
                        id: "weight",
                        label: "Weight",
                        value: vs.weight?.value || "--",
                        unit: "kg",
                        icon: Activity,
                        status: "normal"
                    }
                ];
                setMetrics(newMetrics);
            }
        } catch (error) {
            console.error("Error fetching latest vitals", error);
        }
    };

    const fetchTrends = async (metric) => {
        try {
            const data = await api.getVitalSignsTrends(metric);
            if (data.success && data.trends) {
                const labels = data.trends.labels;
                const datasets = [];

                if (metric === "bp") {
                    datasets.push({
                        label: "Systolic",
                        data: data.trends.datasets.bloodPressureSystolic || [],
                        borderColor: "rgb(0, 0, 0)",
                        backgroundColor: "rgba(0, 0, 0, 0.1)",
                        tension: 0.4,
                    });
                    datasets.push({
                        label: "Diastolic",
                        data: data.trends.datasets.bloodPressureDiastolic || [],
                        borderColor: "rgb(156, 163, 175)",
                        backgroundColor: "rgba(156, 163, 175, 0.1)",
                        tension: 0.4,
                    });
                } else {
                    // Generic dataset for single value metrics
                    // The API returns datasets keys matching the metric name usually, or I need to check the API response key mapping
                    // vitalSignsController.js:154 trends.datasets.heartRate...
                    const datasetKey = metric;
                    datasets.push({
                        label: metric.charAt(0).toUpperCase() + metric.slice(1),
                        data: data.trends.datasets[datasetKey] || [],
                        borderColor: "rgb(0, 0, 0)",
                        backgroundColor: "rgba(0, 0, 0, 0.1)",
                        tension: 0.4,
                    });
                }

                setChartData({ labels, datasets });
            }
        } catch (error) {
            console.error("Error fetching trends", error);
        }
    };

    const getStatusColor = (status) => {
        if (!status || status === "normal") return "text-green-600 bg-green-50";
        if (status === "elevated") return "text-yellow-600 bg-yellow-50";
        return "text-red-600 bg-red-50";
    };

    const getStatusIcon = (status) => {
        if (!status || status === "normal") return <Minus className="w-4 h-4 rotate-90" />;
        if (status === "elevated") return <ArrowUp className="w-4 h-4" />;
        return <ArrowDown className="w-4 h-4" />;
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    boxWidth: 8
                }
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                grid: {
                    display: true,
                    color: "rgba(0,0,0,0.05)"
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    return (
        <div className="space-y-8">
            {/* Header Actions */}
            <div className="flex justify-between items-center bg-black text-white p-6 rounded-2xl shadow-lg">
                <div>
                    <h2 className="text-xl font-bold">Vital Signs Tracking</h2>
                    <p className="text-gray-400 text-sm">Monitor your health metrics over time</p>
                </div>
                <button className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                    <Plus className="w-4 h-4" />
                    Add Reading
                </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {metrics.map((metric) => (
                    <motion.button
                        key={metric.id}
                        onClick={() => setSelectedMetric(metric.id)}
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-6 rounded-2xl border text-left transition-all ${selectedMetric === metric.id
                            ? "bg-black text-white border-black shadow-xl"
                            : "bg-white text-gray-900 border-gray-100 hover:border-gray-200 shadow-sm"
                            }`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${selectedMetric === metric.id ? "bg-gray-800" : "bg-gray-50"}`}>
                                <metric.icon className={`w-6 h-6 ${selectedMetric === metric.id ? "text-white" : "text-black"}`} />
                            </div>
                            <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded ${selectedMetric === metric.id ? "bg-gray-800 text-white" : getStatusColor(metric.status)
                                }`}>
                                {getStatusIcon(metric.status)}
                                {(metric.status || "normal").toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold mb-1">
                                {metric.value} <span className="text-sm font-normal opacity-60 ml-1">{metric.unit}</span>
                            </h3>
                            <p className={`text-sm ${selectedMetric === metric.id ? "text-gray-400" : "text-gray-500"}`}>
                                {metric.label}
                            </p>
                        </div>
                    </motion.button>
                ))}
            </div>

            {/* Chart Section */}
            <motion.div
                layout
                className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100"
            >
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Trends: {metrics.find(m => m.id === selectedMetric)?.label}</h3>
                    <p className="text-gray-500 text-sm">Last 6 months history</p>
                </div>
                <div className="h-[300px] w-full">
                    <Line options={chartOptions} data={chartData} />
                </div>
            </motion.div>
        </div>
    );
};

export default VitalSignsTracker;
