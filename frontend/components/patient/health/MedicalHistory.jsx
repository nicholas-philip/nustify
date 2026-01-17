import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Calendar,
    Stethoscope,
    Pill,
    FileText,
    Syringe,
    Filter,
    Activity
} from "lucide-react";
import api from "../../../services/api";

const MedicalHistory = () => {
    const [filter, setFilter] = useState("all");
    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const data = await api.getHealthRecords();
            if (data.success) {
                const formattedHistory = data.records.map(record => ({
                    id: record._id,
                    date: record.eventDate,
                    type: record.recordType,
                    title: record.title,
                    provider: record.prescribedBy?.email || record.recordedBy?.email || "Unknown Provider",
                    description: record.description || record.notes || "No description provided",
                    icon: getIconForType(record.recordType)
                }));
                setHistory(formattedHistory);
            }
        } catch (error) {
            console.error("Error fetching medical history", error);
        }
    };

    const getIconForType = (type) => {
        switch (type) {
            case "diagnosis": return Stethoscope;
            case "prescription": return Pill;
            case "immunization": return Syringe;
            case "lab_result": return FileText;
            default: return Activity;
        }
    };

    const filteredHistory = filter === "all" ? history : history.filter(item => item.type === filter);

    const getIconColor = (type) => {
        switch (type) {
            case "diagnosis": return "text-blue-600 bg-blue-100";
            case "prescription": return "text-green-600 bg-green-100";
            case "immunization": return "text-purple-600 bg-purple-100";
            case "lab_result": return "text-indigo-600 bg-indigo-100";
            default: return "text-gray-600 bg-gray-100";
        }
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Timeline</h3>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                        className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">All Events</option>
                        <option value="diagnosis">Diagnoses</option>
                        <option value="prescription">Medications</option>
                        <option value="immunization">Immunizations</option>
                        <option value="lab_result">Lab Results</option>
                    </select>
                </div>
            </div>

            {/* Timeline */}
            <div className="relative pl-8 border-l-2 border-gray-200 space-y-8">
                {filteredHistory.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative"
                    >
                        {/* Timeline Dot */}
                        <div className={`absolute -left-[41px] top-0 p-2 rounded-full border-4 border-white shadow-sm ${getIconColor(item.type)}`}>
                            <item.icon className="w-4 h-4" />
                        </div>

                        {/* Content Card */}
                        <motion.div
                            whileHover={{ y: -2, boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                                <div>
                                    <span className="text-xs font-bold px-2 py-1 rounded bg-gray-100 text-gray-600 uppercase tracking-wider mb-2 inline-block">
                                        {item.type.replace("_", " ")}
                                    </span>
                                    <h4 className="text-lg font-bold text-gray-900">{item.title}</h4>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(item.date).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                            </div>

                            <p className="text-gray-600 mb-4">{item.description}</p>

                            <div className="flex items-center gap-2 text-sm text-gray-500 pt-4 border-t border-gray-50">
                                <span className="font-medium">Provider:</span>
                                {item.provider}
                            </div>
                        </motion.div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default MedicalHistory;
