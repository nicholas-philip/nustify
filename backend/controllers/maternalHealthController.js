import MaternalHealth from "../models/MaternalHealth.js";

// Create pregnancy record
export const createPregnancyRecord = async (req, res) => {
    try {
        const recordData = {
            ...req.body,
            patientId: req.user._id,
        };

        const record = await MaternalHealth.create(recordData);

        res.status(201).json({
            success: true,
            message: "Pregnancy record created successfully",
            record,
        });
    } catch (error) {
        console.error("Error creating pregnancy record:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create pregnancy record",
            error: error.message,
        });
    }
};

// Get pregnancy records
export const getPregnancyRecords = async (req, res) => {
    try {
        const patientId = req.user.role === "patient" ? req.user._id : req.query.patientId;

        const records = await MaternalHealth.find({ patientId })
            .populate("prenatalAppointments.appointmentId")
            .populate("ultrasounds.images")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            records,
        });
    } catch (error) {
        console.error("Error fetching pregnancy records:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch pregnancy records",
            error: error.message,
        });
    }
};

// Update pregnancy record
export const updatePregnancyRecord = async (req, res) => {
    try {
        const { id } = req.params;

        const record = await MaternalHealth.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!record) {
            return res.status(404).json({
                success: false,
                message: "Pregnancy record not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Pregnancy record updated successfully",
            record,
        });
    } catch (error) {
        console.error("Error updating pregnancy record:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update pregnancy record",
            error: error.message,
        });
    }
};

// Get pregnancy timeline
export const getPregnancyTimeline = async (req, res) => {
    try {
        const { id } = req.params;

        const record = await MaternalHealth.findById(id)
            .populate("prenatalAppointments.appointmentId")
            .populate("ultrasounds.images")
            .populate("labTests.documentId");

        if (!record) {
            return res.status(404).json({
                success: false,
                message: "Pregnancy record not found",
            });
        }

        // Build timeline
        const timeline = [];

        // Add prenatal appointments
        record.prenatalAppointments.forEach((apt) => {
            timeline.push({
                type: "appointment",
                date: apt.date,
                week: apt.week,
                data: apt,
            });
        });

        // Add ultrasounds
        record.ultrasounds.forEach((us) => {
            timeline.push({
                type: "ultrasound",
                date: us.date,
                week: us.week,
                data: us,
            });
        });

        // Add lab tests
        record.labTests.forEach((lab) => {
            timeline.push({
                type: "lab_test",
                date: lab.date,
                data: lab,
            });
        });

        // Sort by date
        timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json({
            success: true,
            timeline,
            pregnancyInfo: {
                currentWeek: record.currentWeek,
                currentTrimester: record.currentTrimester,
                estimatedDueDate: record.estimatedDueDate,
            },
        });
    } catch (error) {
        console.error("Error fetching pregnancy timeline:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch pregnancy timeline",
            error: error.message,
        });
    }
};
