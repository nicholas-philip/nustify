import mongoose from "mongoose";

const maternalHealthSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        // Pregnancy Information
        pregnancyStatus: {
            type: String,
            enum: ["pregnant", "postpartum", "completed"],
            default: "pregnant",
        },
        pregnancyNumber: {
            type: Number, // 1st pregnancy, 2nd, etc.
            default: 1,
        },
        lastMenstrualPeriod: {
            type: Date,
            required: true,
        },
        estimatedDueDate: {
            type: Date,
            required: true,
        },
        actualDeliveryDate: {
            type: Date,
        },
        currentWeek: {
            type: Number,
            min: 0,
            max: 42,
        },
        currentTrimester: {
            type: Number,
            enum: [1, 2, 3],
        },
        // Medical History
        previousPregnancies: {
            type: Number,
            default: 0,
        },
        previousLiveBirths: {
            type: Number,
            default: 0,
        },
        previousMiscarriages: {
            type: Number,
            default: 0,
        },
        previousCesareans: {
            type: Number,
            default: 0,
        },
        // Current Pregnancy Details
        multiplePregnancy: {
            type: Boolean,
            default: false,
        },
        numberOfBabies: {
            type: Number,
            default: 1,
        },
        bloodType: {
            type: String,
            enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        },
        rhFactor: {
            type: String,
            enum: ["positive", "negative"],
        },
        // Prenatal Appointments
        prenatalAppointments: [
            {
                appointmentId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Appointment",
                },
                week: Number,
                date: Date,
                provider: String,
                notes: String,
                vitalSignsId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "VitalSigns",
                },
            },
        ],
        // Ultrasound Records
        ultrasounds: [
            {
                date: Date,
                week: Number,
                type: {
                    type: String,
                    enum: ["dating", "anatomy", "growth", "other"],
                },
                findings: String,
                images: [
                    {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "MedicalDocument",
                    },
                ],
                performedBy: String,
            },
        ],
        // Lab Tests
        labTests: [
            {
                testName: String,
                date: Date,
                result: String,
                normalRange: String,
                documentId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "MedicalDocument",
                },
            },
        ],
        // Complications & Risk Factors
        complications: [
            {
                complication: String,
                diagnosedDate: Date,
                status: {
                    type: String,
                    enum: ["active", "resolved", "monitoring"],
                },
                notes: String,
            },
        ],
        riskFactors: [
            {
                type: String,
            },
        ],
        highRiskPregnancy: {
            type: Boolean,
            default: false,
        },
        // Medications & Supplements
        medications: [
            {
                name: String,
                dosage: String,
                frequency: String,
                startDate: Date,
                endDate: Date,
                prescribedBy: String,
            },
        ],
        // Symptoms Tracking
        symptoms: [
            {
                symptom: String,
                severity: {
                    type: String,
                    enum: ["mild", "moderate", "severe"],
                },
                date: Date,
                notes: String,
            },
        ],
        // Birth Plan
        birthPlan: {
            preferredBirthLocation: {
                type: String,
                enum: ["hospital", "birthing_center", "home", "undecided"],
            },
            preferredDeliveryMethod: {
                type: String,
                enum: ["vaginal", "cesarean", "vbac", "undecided"],
            },
            painManagement: {
                type: String,
                enum: ["epidural", "natural", "other", "undecided"],
            },
            birthPartner: String,
            specialRequests: String,
        },
        // Delivery Information
        delivery: {
            date: Date,
            location: String,
            deliveryMethod: {
                type: String,
                enum: ["vaginal", "cesarean", "assisted"],
            },
            duration: String,
            complications: String,
            attendedBy: String,
            notes: String,
        },
        // Postpartum Care
        postpartumCheckups: [
            {
                date: Date,
                week: Number,
                provider: String,
                notes: String,
                appointmentId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Appointment",
                },
            },
        ],
        breastfeeding: {
            status: {
                type: String,
                enum: ["exclusive", "partial", "formula", "not_started"],
            },
            startDate: Date,
            challenges: String,
        },
        // Care Providers
        primaryProvider: {
            name: String,
            type: {
                type: String,
                enum: ["obstetrician", "midwife", "nurse", "other"],
            },
            contact: String,
        },
        hospital: {
            name: String,
            address: String,
            contact: String,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
maternalHealthSchema.index({ patientId: 1, pregnancyStatus: 1 });
maternalHealthSchema.index({ estimatedDueDate: 1 });

// Pre-save hook to calculate current week and trimester
maternalHealthSchema.pre("save", function (next) {
    if (this.lastMenstrualPeriod && this.pregnancyStatus === "pregnant") {
        const now = new Date();
        const lmp = new Date(this.lastMenstrualPeriod);
        const diffTime = Math.abs(now - lmp);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        this.currentWeek = Math.floor(diffDays / 7);

        if (this.currentWeek <= 13) {
            this.currentTrimester = 1;
        } else if (this.currentWeek <= 27) {
            this.currentTrimester = 2;
        } else {
            this.currentTrimester = 3;
        }
    }
    next();
});

const MaternalHealth = mongoose.model("MaternalHealth", maternalHealthSchema);

export default MaternalHealth;
