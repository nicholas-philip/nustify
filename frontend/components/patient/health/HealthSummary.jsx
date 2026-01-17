import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    AlertCircle,
    Pill,
    Activity,
    Thermometer,
    Droplet,
    Wind
} from "lucide-react";
import api from "../../../services/api"; // Assuming we'll add health record methods here

const HealthSummary = () => {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        try {
            const [summaryData, dashboardData, vitalsData] = await Promise.all([
                api.getHealthSummary(),
                api.getPatientDashboard(),
                api.getLatestVitalSigns()
            ]);

            const profile = dashboardData.dashboard?.profile || {};
            const vitals = vitalsData.vitalSigns || {};
            const healthSummary = summaryData.summary || {};

            setSummary({
                activeConditions: healthSummary.activeConditions || [],
                currentMedications: healthSummary.currentMedications || [],
                allergies: healthSummary.allergies || [],
                bloodType: profile.bloodGroup || "--",
                height: vitals.height ? `${vitals.height.value} ${vitals.height.unit}` : "--",
                weight: vitals.weight ? `${vitals.weight.value} ${vitals.weight.unit}` : "--",
                bmi: vitals.bmi ? vitals.bmi.value : "--",
                lastCheckup: vitals.measurementDate ? new Date(vitals.measurementDate).toLocaleDateString() : "--"
            });
        } catch (error) {
            console.error("Error fetching health summary", error);
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Blood Type</p>
                            <h3 className="text-3xl font-bold text-gray-900">{summary?.bloodType || "--"}</h3>
                        </div>
                        <div className="p-3 bg-red-50 rounded-xl">
                            <Droplet className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">BMI</p>
                            <h3 className="text-3xl font-bold text-gray-900">22.8</h3>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <Activity className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-sm text-green-600 font-medium">Healthy Weight</p>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Last Checkup</p>
                            <h3 className="text-3xl font-bold text-gray-900">12 Days</h3>
                        </div>
                        <div className="p-3 bg-green-50 rounded-xl">
                            <Thermometer className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500">Ago</p>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Active Conditions */}
                <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-red-500" />
                            Active Conditions
                        </h3>
                        <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">
                            {summary?.activeConditions?.length || 0} Active
                        </span>
                    </div>
                    <div className="p-6">
                        {summary?.activeConditions?.length > 0 ? (
                            <div className="space-y-4">
                                {summary.activeConditions.map((condition, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                        <span className="font-medium text-gray-900">{condition.title}</span>
                                        <span className="text-sm px-3 py-1 bg-white rounded-lg border border-gray-200 text-gray-600 capitalize">
                                            {condition.severity}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">No active conditions recorded.</p>
                        )}
                    </div>
                </motion.div>

                {/* Current Medications */}
                <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                            <Pill className="w-5 h-5 text-blue-500" />
                            Current Medications
                        </h3>
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                            {summary?.currentMedications?.length || 0} Active
                        </span>
                    </div>
                    <div className="p-6">
                        {summary?.currentMedications?.length > 0 ? (
                            <div className="space-y-4">
                                {summary.currentMedications.map((med, idx) => (
                                    <div key={idx} className="p-4 bg-gray-50 rounded-xl">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-medium text-gray-900">{med.medicationName}</span>
                                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                {med.dosage}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">{med.frequency}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">No medications currently prescribed.</p>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Allergies */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                        Allergies
                    </h3>
                </div>
                <div className="p-6">
                    <div className="flex flex-wrap gap-3">
                        {summary?.allergies?.length > 0 ? (
                            summary.allergies.map((allergy, idx) => (
                                <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-800 rounded-lg border border-orange-100">
                                    <span className="font-medium">{allergy.allergen}</span>
                                    <span className="text-sm opacity-75">({allergy.reaction})</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">No known allergies.</p>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default HealthSummary;
