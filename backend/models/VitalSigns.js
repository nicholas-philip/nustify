import mongoose from "mongoose";

const vitalSignsSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        // Blood Pressure
        bloodPressure: {
            systolic: {
                type: Number,
                min: 0,
                max: 300,
            },
            diastolic: {
                type: Number,
                min: 0,
                max: 200,
            },
            unit: {
                type: String,
                default: "mmHg",
            },
        },
        // Heart Rate
        heartRate: {
            value: {
                type: Number,
                min: 0,
                max: 300,
            },
            unit: {
                type: String,
                default: "bpm",
            },
        },
        // Temperature
        temperature: {
            value: {
                type: Number,
                min: 0,
                max: 50,
            },
            unit: {
                type: String,
                enum: ["celsius", "fahrenheit"],
                default: "celsius",
            },
        },
        // Respiratory Rate
        respiratoryRate: {
            value: {
                type: Number,
                min: 0,
                max: 100,
            },
            unit: {
                type: String,
                default: "breaths/min",
            },
        },
        // Oxygen Saturation
        oxygenSaturation: {
            value: {
                type: Number,
                min: 0,
                max: 100,
            },
            unit: {
                type: String,
                default: "%",
            },
        },
        // Weight
        weight: {
            value: {
                type: Number,
                min: 0,
            },
            unit: {
                type: String,
                enum: ["kg", "lbs"],
                default: "kg",
            },
        },
        // Height
        height: {
            value: {
                type: Number,
                min: 0,
            },
            unit: {
                type: String,
                enum: ["cm", "inches"],
                default: "cm",
            },
        },
        // BMI (calculated)
        bmi: {
            value: {
                type: Number,
                min: 0,
            },
            category: {
                type: String,
                enum: ["underweight", "normal", "overweight", "obese"],
            },
        },
        // Blood Sugar
        bloodSugar: {
            value: {
                type: Number,
                min: 0,
            },
            unit: {
                type: String,
                enum: ["mg/dL", "mmol/L"],
                default: "mg/dL",
            },
            testType: {
                type: String,
                enum: ["fasting", "random", "postprandial", "hba1c"],
            },
        },
        // Pain Level
        painLevel: {
            type: Number,
            min: 0,
            max: 10,
        },
        // Additional notes
        notes: {
            type: String,
            maxlength: 500,
        },
        // Linking
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
        },
        recordedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Nurse or patient
            required: true,
        },
        recordedByRole: {
            type: String,
            enum: ["patient", "nurse", "admin"],
            required: true,
        },
        // Measurement date/time
        measurementDate: {
            type: Date,
            default: Date.now,
            required: true,
        },
        // Location where measured
        location: {
            type: String,
            enum: ["home", "clinic", "hospital", "other"],
            default: "home",
        },
        // Flags
        isAbnormal: {
            type: Boolean,
            default: false,
        },
        abnormalFlags: [
            {
                type: String, // e.g., "high_blood_pressure", "low_oxygen"
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Indexes
vitalSignsSchema.index({ patientId: 1, measurementDate: -1 });
vitalSignsSchema.index({ patientId: 1, createdAt: -1 });
vitalSignsSchema.index({ appointmentId: 1 });
vitalSignsSchema.index({ isAbnormal: 1 });

// Pre-save hook to calculate BMI
vitalSignsSchema.pre("save", function (next) {
    if (this.weight?.value && this.height?.value) {
        let weightKg = this.weight.value;
        let heightM = this.height.value;

        // Convert to metric if needed
        if (this.weight.unit === "lbs") {
            weightKg = this.weight.value * 0.453592;
        }
        if (this.height.unit === "inches") {
            heightM = this.height.value * 0.0254;
        } else {
            heightM = this.height.value / 100; // cm to m
        }

        const bmiValue = weightKg / (heightM * heightM);
        this.bmi = { value: Math.round(bmiValue * 10) / 10 };

        // Categorize BMI
        if (bmiValue < 18.5) {
            this.bmi.category = "underweight";
        } else if (bmiValue < 25) {
            this.bmi.category = "normal";
        } else if (bmiValue < 30) {
            this.bmi.category = "overweight";
        } else {
            this.bmi.category = "obese";
        }
    }

    // Check for abnormal values
    const abnormalFlags = [];

    if (this.bloodPressure?.systolic > 140 || this.bloodPressure?.diastolic > 90) {
        abnormalFlags.push("high_blood_pressure");
    }
    if (this.bloodPressure?.systolic < 90 || this.bloodPressure?.diastolic < 60) {
        abnormalFlags.push("low_blood_pressure");
    }
    if (this.heartRate?.value > 100) {
        abnormalFlags.push("high_heart_rate");
    }
    if (this.heartRate?.value < 60) {
        abnormalFlags.push("low_heart_rate");
    }
    if (this.temperature?.value > 38 && this.temperature.unit === "celsius") {
        abnormalFlags.push("fever");
    }
    if (this.temperature?.value > 100.4 && this.temperature.unit === "fahrenheit") {
        abnormalFlags.push("fever");
    }
    if (this.oxygenSaturation?.value < 95) {
        abnormalFlags.push("low_oxygen");
    }

    if (abnormalFlags.length > 0) {
        this.isAbnormal = true;
        this.abnormalFlags = abnormalFlags;
    }

    next();
});

const VitalSigns = mongoose.model("VitalSigns", vitalSignsSchema);

export default VitalSigns;
