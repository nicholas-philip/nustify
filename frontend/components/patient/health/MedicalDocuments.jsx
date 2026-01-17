import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText,
    Download,
    Trash2,
    Upload,
    Eye,
    File
} from "lucide-react";

import api from "../../../services/api"; // Ensure top-level import

const MedicalDocuments = () => {
    console.log("📄 MedicalDocuments Rendered");
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const data = await api.getMedicalDocuments();
            if (data.success) {
                const formattedDocs = data.documents.map(doc => ({
                    id: doc._id,
                    name: doc.title || doc.fileName || "Untitled",
                    date: new Date(doc.uploadDate).toLocaleDateString(),
                    size: doc.size ? `${(doc.size / 1024 / 1024).toFixed(2)} MB` : "Unknown size",
                    type: doc.fileType || "application/pdf",
                    url: doc.fileUrl
                }));
                setDocuments(formattedDocs);
            }
        } catch (error) {
            console.error("Error fetching documents", error);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setLoading(true);
        try {
            const data = await api.uploadMedicalDocument(file, {
                title: file.name,
                documentType: "medical_report"
            });

            if (data.success) {
                fetchDocuments();
            }
        } catch (error) {
            console.error("Error uploading document", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this document?")) {
            try {
                await api.deleteMedicalDocument(id);
                setDocuments(docs => docs.filter(d => d.id !== id));
            } catch (error) {
                console.error("Error deleting document", error);
            }
        }
    };

    return (
        <div className="space-y-8">
            {/* Upload Area */}
            <label className="block">
                <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.jpg,.jpeg,.png"
                    disabled={loading}
                />
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    className={`border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                    <div className="bg-white mx-auto w-16 h-16 rounded-full flex items-center justify-center shadow-sm mb-4">
                        <Upload className="w-8 h-8 text-black" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {loading ? "Uploading..." : "Upload Medical Records"}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">Drag & drop files here or click to browse</p>
                    <div className="px-6 py-2 bg-black text-white rounded-lg text-sm font-semibold inline-block">
                        Select Files
                    </div>
                </motion.div>
            </label>

            {/* Documents List */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Uploaded Documents</h3>
                <div className="grid gap-4">
                    <AnimatePresence>
                        {documents.map((doc) => (
                            <motion.div
                                key={doc.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="group bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-gray-200 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${doc.type === 'pdf' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 group-hover:text-black transition-colors">{doc.name}</h4>
                                        <span className="text-xs text-gray-500 mr-3">{doc.date}</span>
                                        <span className="text-xs text-gray-400">{doc.size}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => window.open(doc.url, '_blank')}
                                        className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg"
                                        title="View"
                                        disabled={!doc.url}
                                    >
                                        <Eye className="w-5 h-5" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => window.open(doc.url, '_blank')}
                                        className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg"
                                        title="Download"
                                        disabled={!doc.url}
                                    >
                                        <Download className="w-5 h-5" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleDelete(doc.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default MedicalDocuments;
