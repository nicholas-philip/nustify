import mongoose from "mongoose";

const medicalDocumentSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        documentType: {
            type: String,
            enum: [
                "lab_result",
                "prescription",
                "medical_report",
                "report",
                "xray",
                "scan",
                "insurance",
                "discharge_summary",
                "referral",
                "other",
            ],
            required: true,
        },
        title: {
            type: String,
            required: [true, "Document title is required"],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 500,
        },
        // Cloudinary file information
        fileUrl: {
            type: String,
            required: [true, "File URL is required"],
        },
        publicId: {
            type: String,
            required: true, // Cloudinary public ID for deletion
        },
        fileType: {
            type: String, // pdf, jpg, png, etc.
            required: true,
        },
        fileSize: {
            type: Number, // in bytes
            required: true,
        },
        // Document metadata
        documentDate: {
            type: Date, // Date of the actual document (e.g., lab test date)
            default: Date.now,
        },
        issuedBy: {
            type: String, // Hospital, lab, clinic name
        },
        // Linking
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
        },
        healthRecordId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "HealthRecord",
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // Access control
        sharedWith: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                sharedAt: {
                    type: Date,
                    default: Date.now,
                },
                expiresAt: {
                    type: Date,
                },
            },
        ],
        isPrivate: {
            type: Boolean,
            default: false,
        },
        // Tags for organization
        tags: [
            {
                type: String,
                trim: true,
            },
        ],
        // Verification status (for official documents)
        isVerified: {
            type: Boolean,
            default: false,
        },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Admin who verified
        },
        verifiedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
medicalDocumentSchema.index({ patientId: 1, documentType: 1 });
medicalDocumentSchema.index({ patientId: 1, createdAt: -1 });
medicalDocumentSchema.index({ appointmentId: 1 });
medicalDocumentSchema.index({ tags: 1 });

const MedicalDocument = mongoose.model(
    "MedicalDocument",
    medicalDocumentSchema
);

export default MedicalDocument;
