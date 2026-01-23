import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../contexts/AuthContext";
import {
    Activity,
    FileText,
    Clock,
    File,
    ChevronRight,
    Heart,
    Baby,
} from "lucide-react";
import HealthSummary from "./HealthSummary";
import MedicalHistory from "./MedicalHistory";
import VitalSignsTracker from "./VitalSignsTracker";
import MedicalDocuments from "./MedicalDocuments";
import MaternalHealth from "./MaternalHealth";
import ChildHealth from "./ChildHealth";

const HealthPassport = () => {
    console.log("🛡️ HealthPassport Rendered");
    const { profile } = useAuth();
    const [activeTab, setActiveTab] = useState("summary");

    const allTabs = [
        {
            id: "summary",
            label: "Health Summary",
            icon: Heart,
            component: HealthSummary,
            color: "text-red-600",
            bgColor: "bg-red-50",
        },
        {
            id: "maternal",
            label: "Pregnancy",
            icon: Baby,
            component: MaternalHealth,
            color: "text-pink-600",
            bgColor: "bg-pink-50",
            gender: "female",
        },
        {
            id: "child",
            label: "Child Health",
            icon: Baby,
            component: ChildHealth,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
        },
        {
            id: "history",
            label: "Medical History",
            icon: Clock,
            component: MedicalHistory,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            id: "vitals",
            label: "Vital Signs",
            icon: Activity,
            component: VitalSignsTracker,
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            id: "documents",
            label: "Documents",
            icon: FileText,
            component: MedicalDocuments,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
        },
    ];

    const tabs = useMemo(() => {
        if (!profile?.gender) return allTabs;
        const gender = profile.gender.toLowerCase();
        return allTabs.filter(tab => {
            if (tab.gender && tab.gender !== gender) return false;
            return true;
        });
    }, [profile?.gender]);

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
                            <div className="p-3.5 bg-black rounded-2xl shadow-lg shadow-black/10">
                                <File className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                    Health Record
                                </h1>
                                <p className="text-gray-500 text-sm font-medium">
                                    Your complete medical journey & history
                                </p>
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
                                        className={`w-4.5 h-4.5 transition-colors duration-300 ${activeTab === tab.id ? tab.color : "text-gray-400 group-hover:text-gray-600"
                                            }`}
                                    />
                                    <span>{tab.label}</span>
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activePill"
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

            {/* Main Content Area */}
            <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {tabs.map((tab) => {
                            if (tab.id === activeTab) {
                                const Component = tab.component;
                                return <Component key={tab.id} />;
                            }
                            return null;
                        })}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default HealthPassport;
