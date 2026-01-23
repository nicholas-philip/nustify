import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    FileText,
    Activity,
    Heart,
    Baby,
    Download,
    Eye,
    Lock,
    AlertCircle
} from "lucide-react";
import api from "../../services/api";

const PatientHealthRecordView = () => {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("documents");
    const [patientData, setPatientData] = useState({
        documents: [],
        vitals: [],
        maternal: [],
        child: [],
        profile: null
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPatientHealthData();
    }, [patientId]);

    const fetchPatientHealthData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch medical documents
            const docsResponse = await api.getMedicalDocuments({ patientId });

            // Fetch vital signs
            const vitalsResponse = await api.getVitalSigns({ patientId });

            // Fetch maternal health records
            let maternalRecords = [];
            try {
                const maternalResponse = await api.getPregnancyRecords({ patientId });
                maternalRecords = maternalResponse.records || [];
            } catch (e) {
                console.log("No maternal records");
            }

            // Fetch child health records
            let childRecords = [];
            try {
                const childResponse = await api.getChildHealthRecords({ patientId });
                childRecords = childResponse.records || [];
            } catch (e) {
                console.log("No child records");
            }

            // Fetch patient profile for gender check
            const profileResponse = await api.getPatientProfile(patientId);

            setPatientData({
                documents: docsResponse.documents || [],
                vitals: vitalsResponse.vitalSigns || [],
                maternal: maternalRecords,
                child: childRecords,
                profile: profileResponse.profile
            });
        } catch (error) {
            console.error("Error fetching patient health data:", error);
            setError(error.message || "Failed to load patient health records");
        } finally {
            setLoading(false);
        }
    };

    const tabs = useMemo(() => {
        const allTabs = [
            { id: "documents", label: "Medical Documents", icon: FileText, count: patientData.documents.length },
            { id: "vitals", label: "Vital Signs", icon: Activity, count: patientData.vitals.length },
            { id: "maternal", label: "Pregnancy Records", icon: Baby, count: patientData.maternal.length, gender: "female" },
            { id: "child", label: "Child Health", icon: Heart, count: patientData.child.length },
        ];

        if (!patientData.profile?.gender) return allTabs;
        const gender = patientData.profile.gender.toLowerCase();

        return allTabs.filter(tab => {
            if (tab.gender && tab.gender !== gender) return false;
            return true;
        });
    }, [patientData]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full"
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header Section */}
            <div className="bg-white sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between py-10 gap-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-4"
                        >
                            <button
                                onClick={() => navigate(-1)}
                                className="p-3 hover:bg-gray-100 rounded-2xl transition-all group"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-black transition-colors" />
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="p-3.5 bg-black rounded-2xl shadow-lg shadow-black/10">
                                    <FileText className="w-7 h-7 text-white" />
                                </div>
                                <div className="hidden sm:block">
                                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                        Patient Health Record
                                    </h1>
                                    <p className="text-gray-500 text-sm font-medium">
                                        Viewing medical journal for patient
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Tab Navigation */}
                        <div className="flex p-1.5 bg-gray-100/80 backdrop-blur-md rounded-2xl overflow-x-auto hide-scrollbar">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        relative flex items-center gap-2.5 px-6 py-2.5 rounded-xl transition-all duration-300 whitespace-nowrap text-sm font-bold
                                        ${activeTab === tab.id
                                            ? "text-black"
                                            : "text-gray-500 hover:text-gray-800"
                                        }
                                    `}
                                >
                                    <tab.icon
                                        className={`w-4.5 h-4.5 transition-colors duration-300 ${activeTab === tab.id ? "text-black" : "text-gray-400 group-hover:text-gray-600"
                                            }`}
                                    />
                                    <span>{tab.label}</span>
                                    {tab.count > 0 && (
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? "bg-black text-white" : "bg-gray-200 text-gray-700"
                                            }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activePillNurse"
                                            className="absolute inset-0 bg-white rounded-xl -z-10"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === "documents" && (
                            <div className="space-y-4">
                                {patientData.documents.length === 0 ? (
                                    <div className="bg-white rounded-xl p-12 text-center">
                                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">No documents shared</p>
                                    </div>
                                ) : (
                                    patientData.documents.map((doc) => (
                                        <motion.div
                                            key={doc._id}
                                            whileHover={{ y: -2 }}
                                            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-blue-50 rounded-lg">
                                                        <FileText className="w-6 h-6 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">{doc.title}</h3>
                                                        <p className="text-sm text-gray-500">
                                                            {new Date(doc.documentDate || doc.createdAt).toLocaleDateString()} • {doc.documentType}
                                                        </p>
                                                        {doc.isPrivate && (
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <Lock className="w-3 h-3 text-gray-400" />
                                                                <span className="text-xs text-gray-400">Private</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => window.open(doc.fileUrl, '_blank')}
                                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="View"
                                                    >
                                                        <Eye className="w-5 h-5 text-gray-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => window.open(doc.fileUrl, '_blank')}
                                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="Download"
                                                    >
                                                        <Download className="w-5 h-5 text-gray-600" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === "vitals" && (
                            <div className="bg-white rounded-xl p-8">
                                {patientData.vitals.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">No vital signs recorded</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {patientData.vitals.slice(0, 5).map((vital, index) => (
                                            <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                                                <p className="text-sm text-gray-500 mb-2">
                                                    {new Date(vital.recordedAt).toLocaleString()}
                                                </p>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    {vital.bloodPressure && (
                                                        <div>
                                                            <p className="text-xs text-gray-500">Blood Pressure</p>
                                                            <p className="font-semibold">{vital.bloodPressure.systolic}/{vital.bloodPressure.diastolic}</p>
                                                        </div>
                                                    )}
                                                    {vital.heartRate && (
                                                        <div>
                                                            <p className="text-xs text-gray-500">Heart Rate</p>
                                                            <p className="font-semibold">{vital.heartRate} bpm</p>
                                                        </div>
                                                    )}
                                                    {vital.temperature && (
                                                        <div>
                                                            <p className="text-xs text-gray-500">Temperature</p>
                                                            <p className="font-semibold">{vital.temperature}°C</p>
                                                        </div>
                                                    )}
                                                    {vital.oxygenSaturation && (
                                                        <div>
                                                            <p className="text-xs text-gray-500">SpO2</p>
                                                            <p className="font-semibold">{vital.oxygenSaturation}%</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "maternal" && (
                            <div className="bg-white rounded-xl p-8 text-center">
                                <Baby className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">
                                    {patientData.maternal.length === 0
                                        ? "No pregnancy records"
                                        : `${patientData.maternal.length} pregnancy record(s) available`}
                                </p>
                            </div>
                        )}

                        {activeTab === "child" && (
                            <div className="bg-white rounded-xl p-8 text-center">
                                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">
                                    {patientData.child.length === 0
                                        ? "No child health records"
                                        : `${patientData.child.length} child health record(s) available`}
                                </p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PatientHealthRecordView;
