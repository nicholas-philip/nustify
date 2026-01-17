import NurseCredential from "../models/NurseCredential.js";
import NurseProfile from "../models/NurseProfile.js";

// Submit credentials for verification
export const submitCredentials = async (req, res) => {
    try {
        if (req.user.role !== "nurse") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Nurses only.",
            });
        }

        const credentialData = {
            ...req.body,
            nurseId: req.user._id,
            verificationStatus: "pending",
        };

        // Check if credentials already exist
        let credentials = await NurseCredential.findOne({ nurseId: req.user._id });

        if (credentials) {
            // Update existing
            credentials = await NurseCredential.findOneAndUpdate(
                { nurseId: req.user._id },
                credentialData,
                { new: true, runValidators: true }
            );
        } else {
            // Create new
            credentials = await NurseCredential.create(credentialData);
        }

        // Update nurse profile status
        await NurseProfile.findOneAndUpdate(
            { userId: req.user._id },
            { verificationStatus: "pending" }
        );

        res.status(201).json({
            success: true,
            message: "Credentials submitted for verification",
            credentials,
        });
    } catch (error) {
        console.error("Error submitting credentials:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit credentials",
            error: error.message,
        });
    }
};

// Get credential status
export const getCredentialStatus = async (req, res) => {
    try {
        const nurseId = req.user.role === "nurse" ? req.user._id : req.params.nurseId;

        const credentials = await NurseCredential.findOne({ nurseId })
            .populate("verifiedBy", "email")
            .populate("licenseDocument")
            .populate("certifications.documentId")
            .populate("backgroundCheck.documentId");

        if (!credentials) {
            return res.status(404).json({
                success: false,
                message: "No credentials found",
            });
        }

        res.status(200).json({
            success: true,
            credentials,
        });
    } catch (error) {
        console.error("Error fetching credential status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch credential status",
            error: error.message,
        });
    }
};

// Verify credentials (Admin only)
export const verifyCredentials = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin only.",
            });
        }

        const { nurseId } = req.params;
        const { verificationStatus, rejectionReason, badges } = req.body;

        const credentials = await NurseCredential.findOne({ nurseId });

        if (!credentials) {
            return res.status(404).json({
                success: false,
                message: "Credentials not found",
            });
        }

        credentials.verificationStatus = verificationStatus;
        credentials.verifiedBy = req.user._id;
        credentials.verificationDate = new Date();

        if (verificationStatus === "rejected") {
            credentials.rejectionReason = rejectionReason;
        }

        // Add badges if provided
        if (badges && Array.isArray(badges)) {
            badges.forEach((badgeType) => {
                const existingBadge = credentials.complianceBadges.find(
                    (b) => b.badgeType === badgeType
                );
                if (!existingBadge) {
                    credentials.complianceBadges.push({
                        badgeType,
                        earnedDate: new Date(),
                        awardedBy: req.user._id,
                    });
                }
            });
        }

        // Calculate trust score
        await credentials.calculateTrustScore();
        await credentials.save();

        // Update nurse profile
        const nurseProfile = await NurseProfile.findOne({ userId: nurseId });
        if (nurseProfile) {
            nurseProfile.verificationStatus = verificationStatus;
            nurseProfile.trustScore = credentials.trustScore;
            nurseProfile.complianceBadges = credentials.complianceBadges.map((b) => ({
                badgeType: b.badgeType,
                earnedDate: b.earnedDate,
            }));
            await nurseProfile.save();
        }

        res.status(200).json({
            success: true,
            message: `Credentials ${verificationStatus}`,
            credentials,
        });
    } catch (error) {
        console.error("Error verifying credentials:", error);
        res.status(500).json({
            success: false,
            message: "Failed to verify credentials",
            error: error.message,
        });
    }
};

// Get all pending verifications (Admin only)
export const getPendingVerifications = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin only.",
            });
        }

        const pendingCredentials = await NurseCredential.find({
            verificationStatus: "pending",
        })
            .populate("nurseId", "email")
            .populate("licenseDocument")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            pendingCredentials,
        });
    } catch (error) {
        console.error("Error fetching pending verifications:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch pending verifications",
            error: error.message,
        });
    }
};

// Get badges
export const getBadges = async (req, res) => {
    try {
        const nurseId = req.user.role === "nurse" ? req.user._id : req.params.nurseId;

        const credentials = await NurseCredential.findOne({ nurseId }).select(
            "complianceBadges trustScore"
        );

        if (!credentials) {
            return res.status(404).json({
                success: false,
                message: "No credentials found",
                badges: [],
                trustScore: 0,
            });
        }

        res.status(200).json({
            success: true,
            badges: credentials.complianceBadges,
            trustScore: credentials.trustScore,
        });
    } catch (error) {
        console.error("Error fetching badges:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch badges",
            error: error.message,
        });
    }
};

// Update trust score (recalculate)
export const updateTrustScore = async (req, res) => {
    try {
        const nurseId = req.user.role === "nurse" ? req.user._id : req.params.nurseId;

        const credentials = await NurseCredential.findOne({ nurseId });

        if (!credentials) {
            return res.status(404).json({
                success: false,
                message: "Credentials not found",
            });
        }

        await credentials.calculateTrustScore();
        await credentials.save();

        // Update nurse profile
        await NurseProfile.findOneAndUpdate(
            { userId: nurseId },
            { trustScore: credentials.trustScore }
        );

        res.status(200).json({
            success: true,
            message: "Trust score updated",
            trustScore: credentials.trustScore,
            components: credentials.trustScoreComponents,
        });
    } catch (error) {
        console.error("Error updating trust score:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update trust score",
            error: error.message,
        });
    }
};
