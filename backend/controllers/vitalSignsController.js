import VitalSigns from "../models/VitalSigns.js";
import Appointment from "../models/Appointments.js";

// Record vital signs
export const recordVitalSigns = async (req, res) => {
    try {
        const vitalSignsData = {
            ...req.body,
            recordedBy: req.user._id,
            recordedByRole: req.user.role,
        };

        // If patient is recording, set patientId to their own ID
        if (req.user.role === "patient") {
            vitalSignsData.patientId = req.user._id;
        }

        if (!vitalSignsData.patientId) {
            return res.status(400).json({
                success: false,
                message: "Patient ID is required",
            });
        }

        const vitalSigns = await VitalSigns.create(vitalSignsData);

        // If linked to appointment, update appointment
        if (vitalSignsData.appointmentId) {
            await Appointment.findByIdAndUpdate(vitalSignsData.appointmentId, {
                vitalSignsRecorded: vitalSigns._id,
            });
        }

        res.status(201).json({
            success: true,
            message: "Vital signs recorded successfully",
            vitalSigns,
        });
    } catch (error) {
        console.error("Error recording vital signs:", error);
        res.status(500).json({
            success: false,
            message: "Failed to record vital signs",
            error: error.message,
        });
    }
};

// Get vital signs history
export const getVitalSigns = async (req, res) => {
    try {
        const { startDate, endDate, limit = 50 } = req.query;
        const patientId = req.user.role === "patient" ? req.user._id : req.query.patientId;

        if (!patientId) {
            return res.status(400).json({
                success: false,
                message: "Patient ID is required",
            });
        }

        // Build query
        const query = { patientId };

        if (startDate || endDate) {
            query.measurementDate = {};
            if (startDate) query.measurementDate.$gte = new Date(startDate);
            if (endDate) query.measurementDate.$lte = new Date(endDate);
        }

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
        }

        const vitalSigns = await VitalSigns.find(query)
            .populate("recordedBy", "email")
            .populate("appointmentId", "appointmentDate serviceType")
            .sort({ measurementDate: -1 })
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            vitalSigns,
        });
    } catch (error) {
        console.error("Error fetching vital signs:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch vital signs",
            error: error.message,
        });
    }
};

// Get vital signs trends (for charts)
export const getVitalSignsTrends = async (req, res) => {
    try {
        const { metric, days = 30 } = req.query;
        const patientId = req.user.role === "patient" ? req.user._id : req.query.patientId;

        if (!patientId) {
            return res.status(400).json({
                success: false,
                message: "Patient ID is required",
            });
        }

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const vitalSigns = await VitalSigns.find({
            patientId,
            measurementDate: { $gte: startDate },
        })
            .sort({ measurementDate: 1 })
            .select(`measurementDate ${metric || "bloodPressure heartRate temperature weight"}`);

        // Format data for charts
        const trends = {
            labels: [],
            datasets: {},
        };

        vitalSigns.forEach((vs) => {
            const date = new Date(vs.measurementDate).toLocaleDateString();
            trends.labels.push(date);

            // Blood Pressure
            if (vs.bloodPressure?.systolic) {
                if (!trends.datasets.bloodPressureSystolic) {
                    trends.datasets.bloodPressureSystolic = [];
                }
                trends.datasets.bloodPressureSystolic.push(vs.bloodPressure.systolic);
            }
            if (vs.bloodPressure?.diastolic) {
                if (!trends.datasets.bloodPressureDiastolic) {
                    trends.datasets.bloodPressureDiastolic = [];
                }
                trends.datasets.bloodPressureDiastolic.push(vs.bloodPressure.diastolic);
            }

            // Heart Rate
            if (vs.heartRate?.value) {
                if (!trends.datasets.heartRate) {
                    trends.datasets.heartRate = [];
                }
                trends.datasets.heartRate.push(vs.heartRate.value);
            }

            // Temperature
            if (vs.temperature?.value) {
                if (!trends.datasets.temperature) {
                    trends.datasets.temperature = [];
                }
                trends.datasets.temperature.push(vs.temperature.value);
            }

            // Weight
            if (vs.weight?.value) {
                if (!trends.datasets.weight) {
                    trends.datasets.weight = [];
                }
                trends.datasets.weight.push(vs.weight.value);
            }

            // BMI
            if (vs.bmi?.value) {
                if (!trends.datasets.bmi) {
                    trends.datasets.bmi = [];
                }
                trends.datasets.bmi.push(vs.bmi.value);
            }

            // Oxygen Saturation
            if (vs.oxygenSaturation?.value) {
                if (!trends.datasets.oxygenSaturation) {
                    trends.datasets.oxygenSaturation = [];
                }
                trends.datasets.oxygenSaturation.push(vs.oxygenSaturation.value);
            }

            // Blood Sugar
            if (vs.bloodSugar?.value) {
                if (!trends.datasets.bloodSugar) {
                    trends.datasets.bloodSugar = [];
                }
                trends.datasets.bloodSugar.push(vs.bloodSugar.value);
            }
        });

        res.status(200).json({
            success: true,
            trends,
        });
    } catch (error) {
        console.error("Error fetching vital signs trends:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch vital signs trends",
            error: error.message,
        });
    }
};

// Update vital signs
export const updateVitalSigns = async (req, res) => {
    try {
        const { id } = req.params;
        const vitalSigns = await VitalSigns.findById(id);

        if (!vitalSigns) {
            return res.status(404).json({
                success: false,
                message: "Vital signs record not found",
            });
        }

        // Check permissions
        if (
            req.user.role === "patient" &&
            vitalSigns.patientId.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        const updatedVitalSigns = await VitalSigns.findByIdAndUpdate(
            id,
            { ...req.body, recordedBy: req.user._id },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Vital signs updated successfully",
            vitalSigns: updatedVitalSigns,
        });
    } catch (error) {
        console.error("Error updating vital signs:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update vital signs",
            error: error.message,
        });
    }
};

// Delete vital signs
export const deleteVitalSigns = async (req, res) => {
    try {
        const { id } = req.params;
        const vitalSigns = await VitalSigns.findById(id);

        if (!vitalSigns) {
            return res.status(404).json({
                success: false,
                message: "Vital signs record not found",
            });
        }

        // Only patient or admin can delete
        if (
            req.user.role !== "admin" &&
            (req.user.role !== "patient" || vitalSigns.patientId.toString() !== req.user._id.toString())
        ) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        await VitalSigns.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Vital signs deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting vital signs:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete vital signs",
            error: error.message,
        });
    }
};

// Get latest vital signs
export const getLatestVitalSigns = async (req, res) => {
    try {
        const patientId = req.user.role === "patient" ? req.user._id : req.query.patientId;

        if (!patientId) {
            return res.status(400).json({
                success: false,
                message: "Patient ID is required",
            });
        }

        const latestVitalSigns = await VitalSigns.findOne({ patientId })
            .sort({ measurementDate: -1 })
            .populate("recordedBy", "email")
            .populate("appointmentId", "appointmentDate serviceType");

        res.status(200).json({
            success: true,
            vitalSigns: latestVitalSigns,
        });
    } catch (error) {
        console.error("Error fetching latest vital signs:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch latest vital signs",
            error: error.message,
        });
    }
};

// Get abnormal vital signs
export const getAbnormalVitalSigns = async (req, res) => {
    try {
        const patientId = req.user.role === "patient" ? req.user._id : req.query.patientId;

        if (!patientId) {
            return res.status(400).json({
                success: false,
                message: "Patient ID is required",
            });
        }

        const abnormalVitalSigns = await VitalSigns.find({
            patientId,
            isAbnormal: true,
        })
            .sort({ measurementDate: -1 })
            .limit(20)
            .populate("recordedBy", "email")
            .populate("appointmentId", "appointmentDate serviceType");

        res.status(200).json({
            success: true,
            abnormalVitalSigns,
        });
    } catch (error) {
        console.error("Error fetching abnormal vital signs:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch abnormal vital signs",
            error: error.message,
        });
    }
};
