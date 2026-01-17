import { CheckCircle, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const VerificationBadge = ({ size = "md", showText = true, className = "" }) => {
    const sizeConfig = {
        sm: { icon: "w-4 h-4", text: "text-xs" },
        md: { icon: "w-5 h-5", text: "text-sm" },
        lg: { icon: "w-6 h-6", text: "text-base" },
    };

    const config = sizeConfig[size] || sizeConfig.md;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 ${className}`}
            title="Verified Provider"
        >
            <ShieldCheck className={`${config.icon} flex-shrink-0 fill-blue-100`} />
            {showText && (
                <span className={`font-semibold ${config.text}`}>Verified</span>
            )}
        </motion.div>
    );
};

export default VerificationBadge;
