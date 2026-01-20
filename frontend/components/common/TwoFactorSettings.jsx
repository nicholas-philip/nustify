import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import api from "../../services/api";

const TwoFactorSettings = () => {
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleToggle2FA = async () => {
        try {
            setLoading(true);
            setError("");
            setSuccess("");

            const result = await api.toggle2FA();

            setEnabled(result.twoFactorEnabled);
            setSuccess(
                result.twoFactorEnabled
                    ? "Two-factor authentication enabled successfully"
                    : "Two-factor authentication disabled successfully"
            );
        } catch (error) {
            setError("Failed to toggle 2FA. Please try again.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
        >
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-black" />
                Two-Factor Authentication
            </h3>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-800">{success}</p>
                </div>
            )}

            <div className="space-y-4">
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">
                                {enabled ? "Enabled" : "Disabled"}
                            </h4>
                            {enabled ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                                <XCircle className="w-4 h-4 text-gray-400" />
                            )}
                        </div>
                        <p className="text-sm text-gray-600">
                            {enabled
                                ? "Your account is protected with 2FA. You'll need to enter a verification code when logging in."
                                : "Add an extra layer of security to your account by enabling two-factor authentication."}
                        </p>
                    </div>
                    <motion.button
                        onClick={handleToggle2FA}
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${enabled
                                ? "bg-red-600 text-white hover:bg-red-700"
                                : "bg-green-600 text-white hover:bg-green-700"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {loading ? "Processing..." : enabled ? "Disable" : "Enable"}
                    </motion.button>
                </div>

                {enabled && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Note:</strong> When 2FA is enabled, you'll receive a
                            verification code via email each time you log in. Make sure you
                            have access to your registered email address.
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default TwoFactorSettings;
