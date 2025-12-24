
import express from "express";
import {
  getDashboard,
  updateProfile,
  updateAvailability,
  addCertification,
  getAppointments,
  respondToAppointment,
  completeAppointment,
  getReviews,
  uploadProfileImage,
  deleteProfileImage,
} from "../controllers/nurseController.js";

import { protect, authorize } from "../middlewares/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();


router.use(protect);
router.use(authorize("nurse"));


router.get("/dashboard", getDashboard);


router.put("/profile", updateProfile);


router.post(
  "/profile/upload-image",
  (req, res, next) => {
    console.log("🎯 Upload route hit");
    console.log("📋 Headers:", req.headers);

    upload.single("profileImage")(req, res, (err) => {
      if (err) {
        console.error("❌ Multer error:", err);
        return res.status(400).json({
          success: false,
          message: err.message || "File upload failed",
          error: err.toString(),
        });
      }

      console.log("✅ Multer processing complete");
      console.log("📁 req.file:", req.file);

      next();
    });
  },
  uploadProfileImage
);

router.delete("/profile/delete-image", deleteProfileImage);


router.put("/availability", updateAvailability);


router.post("/certifications", addCertification);


router.get("/appointments", getAppointments);
router.put("/appointments/:id/respond", respondToAppointment);
router.put("/appointments/:id/complete", completeAppointment); 


router.get("/reviews", getReviews);

export default router;
