import HealthRecord from "../models/HealthRecord.js";
import Appointment from "../models/Appointments.js";

// Get all health records for a patient
export const getHealthRecords = async (req, res) => {
    try {
        const { recordType, status } = req.query;
        const patientId = req.user.role === "patient" ? req.user._id : req.query.patientId;

        if (!patientId) {
            return res.status(400).json({
                success: false,
                message: "Patient ID is required",
            });
        }

        // Build query
        const query = { patientId };
        if (recordType) query.recordType = recordType;
        if (status) query.status = status;

        // If nurse is requesting, check if they have appointments with this patient
        if (req.user.role === "nurse") {
            const hasAppointment = await Appointment.findOne({
                nurseId: req.user._id,
                patientId,
                status: { $in: ["confirmed", "completed", "in-progress"] },
            });

            if (!hasAppointment) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. No active appointments with this patient.",
                });
            }

            // Nurses can't see private records
            query.isPrivate = false;
        }

        const records = await HealthRecord.find(query)
            .populate("prescribedBy", "email")
            .populate("recordedBy", "email")
            .populate("appointmentId")
            .sort({ eventDate: -1 });

        res.status(200).json({
            success: true,
            records,
        });
    } catch (error) {
        console.error("Error fetching health records:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch health records",
            error: error.message,
        });
    }
};

// Get health timeline (chronological view)
export const getHealthTimeline = async (req, res) => {
    try {
        const patientId = req.user.role === "patient" ? req.user._id : req.query.patientId;

        if (!patientId) {
            return res.status(400).json({
                success: false,
                message: "Patient ID is required",
            });
        }

        const query = { patientId };

        // Nurses can't see private records
        if (req.user.role === "nurse") {
            query.isPrivate = false;
        }

        const timeline = await HealthRecord.find(query)
            .populate("prescribedBy", "email")
            .populate("recordedBy", "email")
            .populate("appointmentId", "appointmentDate serviceType")
            .sort({ eventDate: -1 })
            .limit(100);

        // Group by month/year
        const groupedTimeline = timeline.reduce((acc, record) => {
            const date = new Date(record.eventDate);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

            if (!acc[key]) {
                acc[key] = {
                    period: date.toLocaleDateString("en-US", { year: "numeric", month: "long" }),
                    records: [],
                };
            }

            acc[key].records.push(record);
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            timeline: Object.values(groupedTimeline),
        });
    } catch (error) {
        console.error("Error fetching health timeline:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch health timeline",
            error: error.message,
        });
    }
};

// Create health record
export const createHealthRecord = async (req, res) => {
    try {
        const recordData = {
            ...req.body,
            recordedBy: req.user._id,
        };

        // If patient is creating, set patientId to their own ID
        if (req.user.role === "patient") {
            recordData.patientId = req.user._id;
        }

        // Validate required fields
        if (!recordData.patientId || !recordData.recordType || !recordData.title) {
            return res.status(400).json({
                success: false,
                message: "Patient ID, record type, and title are required",
            });
        }

        const record = await HealthRecord.create(recordData);

        // If linked to appointment, update appointment
        if (recordData.appointmentId) {
            await Appointment.findByIdAndUpdate(recordData.appointmentId, {
                $push: { healthRecordsCreated: record._id },
            });
        }

        res.status(201).json({
            success: true,
            message: "Health record created successfully",
            record,
        });
    } catch (error) {
        console.error("Error creating health record:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create health record",
            error: error.message,
        });
    }
};

// Update health record
export const updateHealthRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await HealthRecord.findById(id);

        if (!record) {
            return res.status(404).json({
                success: false,
                message: "Health record not found",
            });
        }

        // Check permissions
        if (req.user.role === "patient" && record.patientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        const updatedRecord = await HealthRecord.findByIdAndUpdate(
            id,
            { ...req.body, recordedBy: req.user._id },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Health record updated successfully",
            record: updatedRecord,
        });
    } catch (error) {
        console.error("Error updating health record:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update health record",
            error: error.message,
        });
    }
};

// Delete health record
export const deleteHealthRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await HealthRecord.findById(id);

        if (!record) {
            return res.status(404).json({
                success: false,
                message: "Health record not found",
            });
        }

        // Only patient or admin can delete
        if (
            req.user.role !== "admin" &&
            (req.user.role !== "patient" || record.patientId.toString() !== req.user._id.toString())
        ) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        await HealthRecord.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Health record deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting health record:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete health record",
            error: error.message,
        });
    }
};

// Get health summary (statistics)
export const getHealthSummary = async (req, res) => {
    try {
        const patientId = req.user.role === "patient" ? req.user._id : req.query.patientId;

        if (!patientId) {
            return res.status(400).json({
                success: false,
                message: "Patient ID is required",
            });
        }

        const query = { patientId };
        if (req.user.role === "nurse") {
            query.isPrivate = false;
        }

        // Get counts by type
        const summary = await HealthRecord.aggregate([
            { $match: query },
            {
                $group: {
                    _id: "$recordType",
                    count: { $sum: 1 },
                },
            },
        ]);

        // Get active conditions
        const activeConditions = await HealthRecord.find({
            ...query,
            recordType: { $in: ["diagnosis", "condition"] },
            status: "active",
        }).select("title severity");

        // Get current medications
        const currentMedications = await HealthRecord.find({
            ...query,
            recordType: "medication",
            $or: [{ endDate: { $exists: false } }, { endDate: { $gte: new Date() } }],
        }).select("medicationName dosage frequency");

        // Get allergies
        const allergies = await HealthRecord.find({
            ...query,
            recordType: "allergy",
        }).select("allergen reaction severity");

        res.status(200).json({
            success: true,
            summary: {
                recordCounts: summary,
                activeConditions,
                currentMedications,
                allergies,
            },
        });
    } catch (error) {
        console.error("Error fetching health summary:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch health summary",
            error: error.message,
        });
    }
};
