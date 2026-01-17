import ChildHealth from "../models/ChildHealth.js";

// Create child health record
export const createChildHealthRecord = async (req, res) => {
    try {
        const recordData = {
            ...req.body,
            parentId: req.user._id,
        };

        const record = await ChildHealth.create(recordData);

        res.status(201).json({
            success: true,
            message: "Child health record created successfully",
            record,
        });
    } catch (error) {
        console.error("Error creating child health record:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create child health record",
            error: error.message,
        });
    }
};

// Get child health records
export const getChildHealthRecords = async (req, res) => {
    try {
        const parentId = req.user._id;

        const records = await ChildHealth.find({ parentId })
            .populate("appointments.appointmentId")
            .sort({ dateOfBirth: -1 });

        res.status(200).json({
            success: true,
            records,
        });
    } catch (error) {
        console.error("Error fetching child health records:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch child health records",
            error: error.message,
        });
    }
};

// Update child health record
export const updateChildHealthRecord = async (req, res) => {
    try {
        const { id } = req.params;

        const record = await ChildHealth.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!record) {
            return res.status(404).json({
                success: false,
                message: "Child health record not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Child health record updated successfully",
            record,
        });
    } catch (error) {
        console.error("Error updating child health record:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update child health record",
            error: error.message,
        });
    }
};

// Get vaccination schedule
export const getVaccinationSchedule = async (req, res) => {
    try {
        const { id } = req.params;

        const record = await ChildHealth.findById(id).select("childName dateOfBirth vaccinations");

        if (!record) {
            return res.status(404).json({
                success: false,
                message: "Child health record not found",
            });
        }

        // Separate completed and upcoming
        const completed = record.vaccinations.filter((v) => v.status === "completed");
        const upcoming = record.vaccinations.filter((v) => v.status === "scheduled");
        const overdue = record.vaccinations.filter((v) => v.status === "overdue");

        res.status(200).json({
            success: true,
            childName: record.childName,
            vaccinations: {
                completed,
                upcoming,
                overdue,
            },
        });
    } catch (error) {
        console.error("Error fetching vaccination schedule:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch vaccination schedule",
            error: error.message,
        });
    }
};

// Record milestone
export const recordMilestone = async (req, res) => {
    try {
        const { id } = req.params;
        const milestoneData = req.body;

        const record = await ChildHealth.findById(id);

        if (!record) {
            return res.status(404).json({
                success: false,
                message: "Child health record not found",
            });
        }

        record.milestones.push(milestoneData);
        await record.save();

        res.status(201).json({
            success: true,
            message: "Milestone recorded successfully",
            record,
        });
    } catch (error) {
        console.error("Error recording milestone:", error);
        res.status(500).json({
            success: false,
            message: "Failed to record milestone",
            error: error.message,
        });
    }
};
