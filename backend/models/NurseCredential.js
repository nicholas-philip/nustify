import mongoose from "mongoose";

const nurseCredentialSchema = new mongoose.Schema(
    {
        nurseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },
        // Verification Status
        verificationStatus: {
            type: String,
            enum: ["unverified", "pending", "verified", "rejected", "expired"],
            default: "unverified",
        },
        verificationDate: {
            type: Date,
        },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Admin who verified
        },
        rejectionReason: {
            type: String,
        },
        // License Information
        licenseNumber: {
            type: String,
            required: [true, "License number is required"],
        },
        licenseType: {
            type: String,
            required: true,
        },
        licenseState: {
            type: String,
        },
        licenseCountry: {
            type: String,
            default: "Ghana",
        },
        licenseIssueDate: {
            type: Date,
        },
        licenseExpiryDate: {
            type: Date,
            required: true,
        },
        licenseDocument: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MedicalDocument",
        },
        // Professional Certifications
        certifications: [
            {
                name: {
                    type: String,
                    required: true,
                },
                issuingOrganization: {
                    type: String,
                    required: true,
                },
                certificationNumber: {
                    type: String,
                },
                issueDate: {
                    type: Date,
                },
                expiryDate: {
                    type: Date,
                },
                documentId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "MedicalDocument",
                },
                isVerified: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
        // Background Check
        backgroundCheck: {
            status: {
                type: String,
                enum: ["not_started", "pending", "completed", "failed"],
                default: "not_started",
            },
            completedDate: {
                type: Date,
            },
            expiryDate: {
                type: Date,
            },
            provider: {
                type: String,
            },
            documentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "MedicalDocument",
            },
        },
        // Education
        education: [
            {
                degree: {
                    type: String,
                    required: true,
                },
                institution: {
                    type: String,
                    required: true,
                },
                graduationYear: {
                    type: Number,
                },
                documentId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "MedicalDocument",
                },
                isVerified: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
        // Specializations
        specializations: [
            {
                name: {
                    type: String,
                    required: true,
                },
                certificationDate: {
                    type: Date,
                },
                documentId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "MedicalDocument",
                },
                isVerified: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
        // Compliance Badges
        complianceBadges: [
            {
                badgeType: {
                    type: String,
                    enum: [
                        "verified_license",
                        "background_checked",
                        "top_rated",
                        "specialist",
                        "experienced",
                        "highly_responsive",
                        "excellent_care",
                        "trusted_provider",
                    ],
                },
                earnedDate: {
                    type: Date,
                    default: Date.now,
                },
                expiryDate: {
                    type: Date,
                },
                awardedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User", // Admin
                },
            },
        ],
        // Trust Score (0-100)
        trustScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        trustScoreComponents: {
            licenseVerified: { type: Number, default: 0 },
            backgroundCheck: { type: Number, default: 0 },
            certifications: { type: Number, default: 0 },
            reviewRating: { type: Number, default: 0 },
            completionRate: { type: Number, default: 0 },
            responseTime: { type: Number, default: 0 },
        },
        // Insurance
        professionalInsurance: {
            provider: {
                type: String,
            },
            policyNumber: {
                type: String,
            },
            coverageAmount: {
                type: Number,
            },
            expiryDate: {
                type: Date,
            },
            documentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "MedicalDocument",
            },
            isVerified: {
                type: Boolean,
                default: false,
            },
        },
        // Renewal Reminders
        remindersSent: [
            {
                reminderType: {
                    type: String,
                },
                sentDate: {
                    type: Date,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Indexes
nurseCredentialSchema.index({ verificationStatus: 1 });
nurseCredentialSchema.index({ licenseExpiryDate: 1 });
nurseCredentialSchema.index({ trustScore: -1 });

// Method to calculate trust score
nurseCredentialSchema.methods.calculateTrustScore = async function () {
    let score = 0;
    const components = {
        licenseVerified: 0,
        backgroundCheck: 0,
        certifications: 0,
        reviewRating: 0,
        completionRate: 0,
        responseTime: 0,
    };

    // License verified (25 points)
    if (this.verificationStatus === "verified") {
        components.licenseVerified = 25;
        score += 25;
    }

    // Background check (20 points)
    if (this.backgroundCheck?.status === "completed") {
        components.backgroundCheck = 20;
        score += 20;
    }

    // Certifications (15 points)
    const verifiedCerts = this.certifications.filter((c) => c.isVerified).length;
    components.certifications = Math.min(verifiedCerts * 5, 15);
    score += components.certifications;

    // Review rating (20 points) - will be calculated from NurseProfile
    const NurseProfile = mongoose.model("NurseProfile");
    const profile = await NurseProfile.findOne({ userId: this.nurseId });
    if (profile && profile.rating) {
        components.reviewRating = (profile.rating / 5) * 20;
        score += components.reviewRating;
    }

    // Completion rate (10 points) - will be calculated from appointments
    const Appointment = mongoose.model("Appointment");
    const totalAppointments = await Appointment.countDocuments({
        nurseId: this.nurseId,
        status: { $in: ["completed", "cancelled"] },
    });
    const completedAppointments = await Appointment.countDocuments({
        nurseId: this.nurseId,
        status: "completed",
    });
    if (totalAppointments > 0) {
        const completionRate = completedAppointments / totalAppointments;
        components.completionRate = completionRate * 10;
        score += components.completionRate;
    }

    // Response time (10 points) - placeholder for now
    components.responseTime = 5; // Default moderate score
    score += components.responseTime;

    this.trustScore = Math.round(score);
    this.trustScoreComponents = components;

    return this.trustScore;
};

const NurseCredential = mongoose.model(
    "NurseCredential",
    nurseCredentialSchema
);

export default NurseCredential;
