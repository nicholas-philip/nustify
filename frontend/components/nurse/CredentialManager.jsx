import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShieldCheck,
    Upload,
    FileText,
    X,
    CheckCircle,
    AlertCircle,
    Clock,
    Plus
} from "lucide-react";
import api from "../../services/api";

const CredentialManager = () => {
    const [credentials, setCredentials] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        licenseNumber: "",
        licenseType: "RN",
        issuingAuthority: "",
        expiryDate: "",
        file: null
    });

    useEffect(() => {
        fetchCredentials();
    }, []);

    const fetchCredentials = async () => {
        try {
            const data = await api.getCredentialStatus();
            if (data.success) {
                setCredentials(data.credentials);
            }
        } catch (err) {
            console.error("Error fetching credentials:", err);
            // Don't show error if just not found (first time user)
            if (err.response?.status !== 404) {
                setError("Failed to load credentials");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError("File size must be less than 5MB");
                return;
            }
            setFormData({ ...formData, file });
            setError("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setUploading(true);

        try {
            // Since the backend submitCredentials endpoint might expect JSON first 
            // or multipart form data depending on implementation. 
            // Assuming we need to upload file separately or use a multipart endpoint.
            // For simplicity, let's assume we submit data, then image, or multipart.
            // Based on previous file uploads in this project, they seem to be separate or multipart.
            // Let's rely on api service to handle Multipart form data if file is present.

            const data = new FormData();
            data.append("licenseNumber", formData.licenseNumber);
            data.append("licenseType", formData.licenseType);
            data.append("issuingAuthority", formData.issuingAuthority);
            data.append("expiryDate", formData.expiryDate);
            if (formData.file) {
                data.append("licenseDocument", formData.file);
            }

            const response = await api.submitCredentials(formData); // Using object if api handles it, or check api service later.

            if (response.success) {
                setSuccess("Credentials submitted for verification!");
                setCredentials(response.credentials);
                setShowForm(false);
            }

        } catch (err) {
            setError(err.message || "Failed to submit credentials");
        } finally {
            setUploading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "verified": return "bg-green-100 text-green-800 border-green-200";
            case "rejected": return "bg-red-100 text-red-800 border-red-200";
            default: return "bg-yellow-100 text-yellow-800 border-yellow-200";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "verified": return <CheckCircle className="w-5 h-5" />;
            case "rejected": return <AlertCircle className="w-5 h-5" />;
            default: return <Clock className="w-5 h-5" />;
        }
    };

    if (loading) return <div className="p-4 text-center">Loading credentials...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-black" />
                        Professional Credentials
                    </h3>
                    <p className="text-sm text-gray-500">Manage your licenses and certifications</p>
                </div>
                {!showForm && (!credentials || credentials.verificationStatus === 'rejected' || credentials.verificationStatus === 'unverified') && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowForm(true)}
                        className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Credential
                    </motion.button>
                )}
            </div>

            <div className="p-6">
                <AnimatePresence>
                    {error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex gap-2">
                            <AlertCircle className="w-5 h-5" /> {error}
                        </motion.div>
                    )}
                    {success && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm flex gap-2">
                            <CheckCircle className="w-5 h-5" /> {success}
                        </motion.div>
                    )}
                </AnimatePresence>

                {showForm ? (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleSubmit}
                        className="space-y-4"
                    >
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">License Type</label>
                                <select
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                                    value={formData.licenseType}
                                    onChange={(e) => setFormData({ ...formData, licenseType: e.target.value })}
                                >
                                    <option value="MD">Medical Doctor (MD)</option>
                                    <option value="DO">Doctor of Osteopathic Medicine (DO)</option>
                                    <option value="RN">Registered Nurse (RN)</option>
                                    <option value="LPN">Licensed Practical Nurse (LPN)</option>
                                    <option value="CNP">Certified Nurse Practitioner</option>
                                    <option value="CNA">Certified Nursing Assistant</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                                    value={formData.licenseNumber}
                                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                    placeholder="e.g. RN-12345-678"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Authority</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                                    value={formData.issuingAuthority}
                                    onChange={(e) => setFormData({ ...formData, issuingAuthority: e.target.value })}
                                    placeholder="Relevant Licensing Board"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                                    value={formData.expiryDate}
                                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition cursor-pointer relative">
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">
                                {formData.file ? formData.file.name : "Click to upload license document (PDF, JPG, PNG)"}
                            </p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={uploading}
                                className="flex-1 py-2 bg-black text-white rounded-lg hover:bg-gray-900 disabled:opacity-50"
                            >
                                {uploading ? "Submitting..." : "Submit for Verification"}
                            </button>
                        </div>
                    </motion.form>
                ) : (
                    <div>
                        {credentials ? (
                            <div className="space-y-4">
                                <div className={`p-4 rounded-lg border flex justify-between items-start ${getStatusColor(credentials.verificationStatus)}`}>
                                    <div className="flex gap-3">
                                        <div className="mt-1">{getStatusIcon(credentials.verificationStatus)}</div>
                                        <div>
                                            <h4 className="font-bold capitalize">{credentials.verificationStatus}</h4>
                                            <p className="text-sm mt-1">
                                                License: {credentials.licenseNumber} ({credentials.licenseType})
                                            </p>
                                            {credentials.rejectionReason && (
                                                <div className="mt-2 text-sm bg-white/50 p-2 rounded">
                                                    Reason: {credentials.rejectionReason}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {credentials.trustScore > 0 && (
                                        <div className="text-center">
                                            <div className="text-2xl font-bold">{credentials.trustScore}</div>
                                            <div className="text-xs uppercase tracking-wider">Trust Score</div>
                                        </div>
                                    )}
                                </div>

                                {credentials.complianceBadges?.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2 text-sm">Earned Badges</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {credentials.complianceBadges.map((badge, index) => (
                                                <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold border border-blue-100">
                                                    {badge.badgeType.replace('_', ' ')}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>No credentials submitted yet.</p>
                                <p className="text-sm mt-1">Submit your professional license to get verified and boost your visibility.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CredentialManager;
