import mongoose from "mongoose";

const childHealthSchema = new mongoose.Schema(
    {
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        // Child Information
        childName: {
            type: String,
            required: [true, "Child name is required"],
            trim: true,
        },
        dateOfBirth: {
            type: Date,
            required: true,
        },
        gender: {
            type: String,
            enum: ["male", "female", "other"],
            required: true,
        },
        bloodType: {
            type: String,
            enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        },
        // Birth Information
        birthDetails: {
            weight: {
                value: Number,
                unit: {
                    type: String,
                    default: "kg",
                },
            },
            height: {
                value: Number,
                unit: {
                    type: String,
                    default: "cm",
                },
            },
            headCircumference: {
                value: Number,
                unit: {
                    type: String,
                    default: "cm",
                },
            },
            birthLocation: String,
            deliveryMethod: {
                type: String,
                enum: ["vaginal", "cesarean", "assisted"],
            },
            gestationalAge: Number, // in weeks
            complications: String,
            apgarScore: {
                oneMinute: Number,
                fiveMinutes: Number,
            },
        },
        // Growth Tracking
        growthRecords: [
            {
                date: {
                    type: Date,
                    required: true,
                },
                ageInMonths: Number,
                weight: {
                    value: Number,
                    unit: String,
                    percentile: Number,
                },
                height: {
                    value: Number,
                    unit: String,
                    percentile: Number,
                },
                headCircumference: {
                    value: Number,
                    unit: String,
                    percentile: Number,
                },
                bmi: Number,
                recordedBy: String,
                notes: String,
            },
        ],
        // Vaccination Schedule
        vaccinations: [
            {
                vaccineName: {
                    type: String,
                    required: true,
                },
                doseNumber: Number,
                scheduledDate: Date,
                administeredDate: Date,
                ageAtAdministration: String, // e.g., "2 months"
                administeredBy: String,
                location: String,
                batchNumber: String,
                nextDoseDate: Date,
                status: {
                    type: String,
                    enum: ["scheduled", "completed", "overdue", "skipped"],
                    default: "scheduled",
                },
                reactions: String,
                documentId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "MedicalDocument",
                },
            },
        ],
        // Developmental Milestones
        milestones: [
            {
                category: {
                    type: String,
                    enum: ["motor", "cognitive", "language", "social", "emotional"],
                    required: true,
                },
                milestone: {
                    type: String,
                    required: true,
                },
                expectedAge: String, // e.g., "6 months"
                achievedDate: Date,
                ageAchieved: String,
                status: {
                    type: String,
                    enum: ["achieved", "delayed", "not_yet"],
                    default: "not_yet",
                },
                notes: String,
            },
        ],
        // Medical History
        allergies: [
            {
                allergen: String,
                reaction: String,
                severity: {
                    type: String,
                    enum: ["mild", "moderate", "severe"],
                },
                diagnosedDate: Date,
            },
        ],
        conditions: [
            {
                condition: String,
                diagnosedDate: Date,
                status: {
                    type: String,
                    enum: ["active", "resolved", "chronic"],
                },
                notes: String,
            },
        ],
        medications: [
            {
                name: String,
                dosage: String,
                frequency: String,
                startDate: Date,
                endDate: Date,
                prescribedBy: String,
                reason: String,
            },
        ],
        // Pediatric Appointments
        appointments: [
            {
                appointmentId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Appointment",
                },
                date: Date,
                ageAtVisit: String,
                type: {
                    type: String,
                    enum: ["well_child", "sick_visit", "follow_up", "vaccination"],
                },
                provider: String,
                notes: String,
                vitalSignsId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "VitalSigns",
                },
            },
        ],
        // Feeding Information
        feeding: {
            type: {
                type: String,
                enum: ["breastfeeding", "formula", "mixed", "solid_foods"],
            },
            startDate: Date,
            notes: String,
            solidFoodsIntroduced: Date,
        },
        // Emergency Contact
        emergencyContact: {
            name: String,
            relationship: String,
            phone: String,
        },
        // Pediatrician
        pediatrician: {
            name: String,
            clinic: String,
            phone: String,
            email: String,
        },
        // Insurance
        insurance: {
            provider: String,
            policyNumber: String,
            expiryDate: Date,
        },
        // Profile Image
        profileImage: {
            type: String,
        },
        // Notes
        notes: {
            type: String,
            maxlength: 2000,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
childHealthSchema.index({ dateOfBirth: 1 });

// Virtual for current age
childHealthSchema.virtual("currentAge").get(function () {
    const now = new Date();
    const dob = new Date(this.dateOfBirth);
    const diffTime = Math.abs(now - dob);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
        return `${diffDays} days`;
    } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} month${months > 1 ? "s" : ""}`;
    } else {
        const years = Math.floor(diffDays / 365);
        const months = Math.floor((diffDays % 365) / 30);
        return `${years} year${years > 1 ? "s" : ""}${months > 0 ? ` ${months} month${months > 1 ? "s" : ""}` : ""}`;
    }
});

const ChildHealth = mongoose.model("ChildHealth", childHealthSchema);

export default ChildHealth;
