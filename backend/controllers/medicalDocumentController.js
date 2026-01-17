import MedicalDocument from "../models/MedicalDocument.js";
import { v2 as cloudinary } from "cloudinary";
import Appointment from "../models/Appointments.js";

// Upload medical document
export const uploadDocument = async (req, res) => {
    try {
        if (!req.file && !req.body.fileUrl) {
            return res.status(400).json({
                success: false,
                message: "No file provided",
            });
        }

        const {
            documentType,
            title,
            description,
            documentDate,
            issuedBy,
            appointmentId,
            healthRecordId,
            tags,
            isPrivate,
        } = req.body;

        const patientId = req.user.role === "patient" ? req.user._id : req.body.patientId;

        if (!patientId) {
            return res.status(400).json({
                success: false,
                message: "Patient ID is required",
            });
        }

        // Multer with CloudinaryStorage already uploaded to Cloudinary
        let uploadResult;
        if (req.file) {
            // File from multer-storage-cloudinary
            uploadResult = {
                secure_url: req.file.path,
                public_id: req.file.filename,
                format: req.file.mimetype.split("/")[1],
                bytes: req.file.size,
            };
        } else if (req.body.fileUrl) {
            // Already uploaded URL (from frontend direct upload)
            uploadResult = {
                secure_url: req.body.fileUrl,
                public_id: req.body.publicId,
                format: req.body.fileType,
                bytes: req.body.fileSize,
            };
        }

        const document = await MedicalDocument.create({
            patientId,
            documentType,
            title,
            description,
            fileUrl: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            fileType: uploadResult.format || req.body.fileType,
            fileSize: uploadResult.bytes || req.body.fileSize,
            documentDate: documentDate || new Date(),
            issuedBy,
            appointmentId,
            healthRecordId,
            uploadedBy: req.user._id,
            tags: tags ? JSON.parse(tags) : [],
            isPrivate: isPrivate === "true" || isPrivate === true,
        });

        res.status(201).json({
            success: true,
            message: "Document uploaded successfully",
            document,
        });
    } catch (error) {
        console.error("Error uploading document:", error);
        res.status(500).json({
            success: false,
            message: "Failed to upload document",
            error: error.message,
        });
    }
};

// Get all documents for a patient
export const getDocuments = async (req, res) => {
    try {
        const { documentType, tags } = req.query;
        const patientId = req.user.role === "patient" ? req.user._id : req.query.patientId;

        if (!patientId) {
            return res.status(400).json({
                success: false,
                message: "Patient ID is required",
            });
        }

        // Build query
        const query = { patientId };
        if (documentType) query.documentType = documentType;
        if (tags) query.tags = { $in: tags.split(",") };

        // If nurse is requesting, check permissions
        if (req.user.role === "nurse") {
            const hasAppointment = await Appointment.findOne({
                nurseId: req.user._id,
                patientId,
                status: { $in: ["confirmed", "completed", "in-progress"] },
            });

            if (!hasAppointment) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied",
                });
            }

            query.isPrivate = false;
        }

        const documents = await MedicalDocument.find(query)
            .populate("uploadedBy", "email")
            .populate("appointmentId", "appointmentDate serviceType")
            .populate("healthRecordId", "title recordType")
            .sort({ documentDate: -1 });

        res.status(200).json({
            success: true,
            documents,
        });
    } catch (error) {
        console.error("Error fetching documents:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch documents",
            error: error.message,
        });
    }
};

// Get single document
export const getDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const document = await MedicalDocument.findById(id)
            .populate("uploadedBy", "email")
            .populate("appointmentId")
            .populate("healthRecordId");

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found",
            });
        }

        // Check permissions
        if (
            req.user.role === "patient" &&
            document.patientId.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        if (req.user.role === "nurse") {
            const hasAppointment = await Appointment.findOne({
                nurseId: req.user._id,
                patientId: document.patientId,
                status: { $in: ["confirmed", "completed", "in-progress"] },
            });

            if (!hasAppointment || document.isPrivate) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied",
                });
            }
        }

        res.status(200).json({
            success: true,
            document,
        });
    } catch (error) {
        console.error("Error fetching document:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch document",
            error: error.message,
        });
    }
};

// Delete document
export const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const document = await MedicalDocument.findById(id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found",
            });
        }

        // Check permissions
        if (
            req.user.role !== "admin" &&
            (req.user.role !== "patient" || document.patientId.toString() !== req.user._id.toString())
        ) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        // Delete from Cloudinary
        try {
            await cloudinary.uploader.destroy(document.publicId);
        } catch (cloudinaryError) {
            console.error("Error deleting from Cloudinary:", cloudinaryError);
            // Continue with database deletion even if Cloudinary fails
        }

        await MedicalDocument.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Document deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting document:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete document",
            error: error.message,
        });
    }
};

// Share document with a user
export const shareDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, expiresAt } = req.body;

        const document = await MedicalDocument.findById(id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found",
            });
        }

        // Only patient can share their documents
        if (
            req.user.role !== "patient" ||
            document.patientId.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        // Check if already shared with this user
        const alreadyShared = document.sharedWith.some(
            (share) => share.userId.toString() === userId
        );

        if (alreadyShared) {
            return res.status(400).json({
                success: false,
                message: "Document already shared with this user",
            });
        }

        document.sharedWith.push({
            userId,
            sharedAt: new Date(),
            expiresAt: expiresAt ? new Date(expiresAt) : null,
        });

        await document.save();

        res.status(200).json({
            success: true,
            message: "Document shared successfully",
            document,
        });
    } catch (error) {
        console.error("Error sharing document:", error);
        res.status(500).json({
            success: false,
            message: "Failed to share document",
            error: error.message,
        });
    }
};

// Verify document (admin only)
export const verifyDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { isVerified } = req.body;

        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin only.",
            });
        }

        const document = await MedicalDocument.findByIdAndUpdate(
            id,
            {
                isVerified,
                verifiedBy: isVerified ? req.user._id : null,
                verifiedAt: isVerified ? new Date() : null,
            },
            { new: true }
        );

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found",
            });
        }

        res.status(200).json({
            success: true,
            message: `Document ${isVerified ? "verified" : "unverified"} successfully`,
            document,
        });
    } catch (error) {
        console.error("Error verifying document:", error);
        res.status(500).json({
            success: false,
            message: "Failed to verify document",
            error: error.message,
        });
    }
};
