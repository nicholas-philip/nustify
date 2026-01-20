import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shield,
    CheckCircle,
    XCircle,
    Clock,
    FileText,
    User,
    Calendar,
    AlertCircle,
} from "lucide-react";
import api from "../../services/api";

const AdminCredentials = () => {
    const [credentials, setCredentials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [selectedCredential, setSelectedCredential] = useState(null);

    useEffect(() => {
        fetchPendingCredentials();
    }, []);

    const fetchPendingCredentials = async () => {
        try {
            setLoading(true);
            const data = await api.getPendingCredentials();
            setCredentials(data.credentials || []);
        } catch (error) {
            setError("Failed to load pending credentials");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (nurseId, approved) => {
        try {
            setError("");
            setSuccess("");
            await api.verifyCredentials(nurseId, {
                approved,
                verifiedAt: new Date().toISOString(),
            });
            setSuccess(
                `Credentials ${approved ? "approved" : "rejected"} successfully`
            );
            setSelectedCredential(null);
            fetchPendingCredentials();
        } catch (error) {
            setError(`Failed to ${approved ? "approve" : "reject"} credentials`);
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading credentials...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white shadow-sm"
            >
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="w-8 h-8 text-black" />
                        Credential Verification
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Review and verify healthcare professional credentials
                    </p>
                </div>
            </motion.div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Alerts */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
                        >
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-red-800 text-sm">{error}</p>
                        </motion.div>
                    )}
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3"
                        >
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <p className="text-green-800 text-sm">{success}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Credentials List */}
                {credentials.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-xl shadow-lg p-12 text-center"
                    >
                        <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No Pending Credentials
                        </h3>
                        <p className="text-gray-600">
                            All credential submissions have been reviewed
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid gap-6">
                        {credentials.map((credential, index) => (
                            <motion.div
                                key={credential._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold text-lg">
                                                {credential.nurse?.fullName?.charAt(0) || "N"}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">
                                                    {credential.nurse?.fullName || "Unknown Nurse"}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {credential.nurse?.email}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <FileText className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-600">License:</span>
                                                <span className="font-semibold">
                                                    {credential.licenseType || "N/A"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-600">Number:</span>
                                                <span className="font-semibold">
                                                    {credential.licenseNumber || "N/A"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-600">Issued:</span>
                                                <span className="font-semibold">
                                                    {credential.issuingAuthority || "N/A"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-600">Submitted:</span>
                                                <span className="font-semibold">
                                                    {new Date(credential.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        {credential.documents && credential.documents.length > 0 && (
                                            <div className="mb-4">
                                                <p className="text-sm font-semibold text-gray-700 mb-2">
                                                    Attached Documents:
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {credential.documents.map((doc, idx) => (
                                                        <a
                                                            key={idx}
                                                            href={doc.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-3 py-1 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                                                        >
                                                            Document {idx + 1}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2 ml-4">
                                        <motion.button
                                            onClick={() => handleVerify(credential.nurse._id, true)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition-colors flex items-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Approve
                                        </motion.button>
                                        <motion.button
                                            onClick={() => handleVerify(credential.nurse._id, false)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 transition-colors flex items-center gap-2"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Reject
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCredentials;
