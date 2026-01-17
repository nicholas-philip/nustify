import { motion } from "framer-motion";
import { Shield, TrendingUp, Award } from "lucide-react";

const TrustScore = ({ score = 0, size = "md", showLabel = true }) => {
    // Color calculation based on score
    const getColor = (value) => {
        if (value >= 90) return "text-emerald-500 stroke-emerald-500";
        if (value >= 70) return "text-blue-500 stroke-blue-500";
        if (value >= 50) return "text-yellow-500 stroke-yellow-500";
        return "text-red-500 stroke-red-500";
    };

    const getLabel = (value) => {
        if (value >= 90) return "Excellent";
        if (value >= 70) return "Gold";
        if (value >= 50) return "Silver";
        return "Bronze";
    };

    const ringRadius = 18;
    const ringCircumference = 2 * Math.PI * ringRadius;
    const strokeDashoffset = ringCircumference - (score / 100) * ringCircumference;

    const sizeClasses = {
        sm: "w-16 h-16",
        md: "w-24 h-24",
        lg: "w-32 h-32",
    };

    return (
        <div className="flex flex-col items-center">
            <div className={`relative ${sizeClasses[size] || sizeClasses.md} flex items-center justify-center`}>
                {/* Background Ring */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="50%"
                        cy="50%"
                        r={ringRadius}
                        className="stroke-gray-100"
                        strokeWidth="4"
                        fill="transparent"
                        style={{ transformOrigin: "center", transform: "scale(2.2)" }}
                    />
                    {/* Progress Ring */}
                    <motion.circle
                        initial={{ strokeDashoffset: ringCircumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        cx="50%"
                        cy="50%"
                        r={ringRadius}
                        className={`${getColor(score)} transition-colors duration-500`}
                        strokeWidth="4"
                        strokeLinecap="round"
                        fill="transparent"
                        strokeDasharray={ringCircumference}
                        style={{ transformOrigin: "center", transform: "scale(2.2)" }}
                    />
                </svg>

                {/* Score Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center justify-center"
                    >
                        <Shield className={`w-6 h-6 mb-1 ${getColor(score).split(' ')[0]}`} />
                    </motion.div>
                    <span className={`text-2xl font-bold ${getColor(score).split(' ')[0]}`}>
                        {score}
                    </span>
                </div>
            </div>

            {showLabel && (
                <div className="text-center mt-2">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Trust Score</p>
                    <p className={`text-sm font-bold ${getColor(score).split(' ')[0]}`}>
                        {getLabel(score)} Tier
                    </p>
                </div>
            )}
        </div>
    );
};

export default TrustScore;
