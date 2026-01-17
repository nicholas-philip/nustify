import mongoose from "mongoose";

const healthRecordSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        recordType: {
            type: String,
            enum: [
                "diagnosis",
                "medication",
                "allergy",
                "immunization",
                "procedure",
                "condition",
                "family_history",
                "other",
            ],
            required: true,
        },
        title: {
            type: String,
            required: [true, "Record title is required"],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 2000,
        },
        // For diagnoses and conditions
        diagnosisCode: {
            type: String, // ICD-10 code if available
        },
        severity: {
            type: String,
            enum: ["mild", "moderate", "severe", "critical"],
        },
        status: {
            type: String,
            enum: ["active", "resolved", "chronic", "inactive"],
            default: "active",
        },
        // For medications
        medicationName: {
            type: String,
        },
        dosage: {
            type: String,
        },
        frequency: {
            type: String,
        },
        startDate: {
            type: Date,
        },
        endDate: {
            type: Date,
        },
        prescribedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Nurse who prescribed
        },
        // For allergies
        allergen: {
            type: String,
        },
        reaction: {
            type: String,
        },
        // For immunizations
        vaccineName: {
            type: String,
        },
        vaccineDate: {
            type: Date,
        },
        nextDueDate: {
            type: Date,
        },
        administeredBy: {
            type: String,
        },
        // For procedures
        procedureName: {
            type: String,
        },
        procedureDate: {
            type: Date,
        },
        performedBy: {
            type: String,
        },
        outcome: {
            type: String,
        },
        // Linking to appointments
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
        },
        // Linking to nurse who created/updated record
        recordedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        // Additional notes
        notes: {
            type: String,
            maxlength: 1000,
        },
        // Attachments
        attachments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "MedicalDocument",
            },
        ],
        // Privacy
        isPrivate: {
            type: Boolean,
            default: false, // If true, only patient can see
        },
        // Date of the actual event/diagnosis
        eventDate: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient querying
healthRecordSchema.index({ patientId: 1, recordType: 1 });
healthRecordSchema.index({ patientId: 1, eventDate: -1 });
healthRecordSchema.index({ patientId: 1, status: 1 });
healthRecordSchema.index({ appointmentId: 1 });

const HealthRecord = mongoose.model("HealthRecord", healthRecordSchema);

export default HealthRecord;
