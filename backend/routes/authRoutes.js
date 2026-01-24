import express from "express";
import { body } from "express-validator";
import {
  registerNurse,
  registerPatient,
  verifyEmail,
  verifyEmailByCode,
  resendVerification,
  login,
  verify2FA,
  forgotPassword,
  resetPassword,
  changePassword,
  toggle2FA,
  logout,
  logoutAll,
  getMe,
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

const nurseRegistrationValidation = [
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("fullName").notEmpty().withMessage("Full name is required"),
  body("phone").notEmpty().withMessage("Phone number is required"),
  body("specialization").notEmpty().withMessage("Specialization is required"),
  body("licenseNumber").notEmpty().withMessage("License number is required"),
  body("hourlyRate")
    .optional()
    .isNumeric()
    .withMessage("Hourly rate must be a number"),
];

const patientRegistrationValidation = [
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("fullName").notEmpty().withMessage("Full name is required"),
  body("phone").notEmpty().withMessage("Phone number is required"),
  body("emergencyContactName")
    .notEmpty()
    .withMessage("Emergency contact name is required"),
  body("emergencyContactPhone")
    .notEmpty()
    .withMessage("Emergency contact phone is required"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

const forgotPasswordValidation = [
  body("email").isEmail().withMessage("Please provide a valid email"),
];

const resetPasswordValidation = [
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
];

const verify2FAValidation = [
  body("userId").notEmpty().withMessage("User ID is required"),
  body("code")
    .isLength({ min: 6, max: 6 })
    .withMessage("Code must be 6 digits"),
];

router.post("/register/nurse", nurseRegistrationValidation, registerNurse);
router.post(
  "/register/patient",
  patientRegistrationValidation,
  registerPatient
);
router.post("/login", loginValidation, login);
router.get("/verify-email/:token", verifyEmail);
router.post("/verify-email-code", verifyEmailByCode);
router.post("/resend-verification", resendVerification);
router.post("/verify-2fa", verify2FAValidation, verify2FA);
router.post("/forgot-password", forgotPasswordValidation, forgotPassword);
router.post("/reset-password", resetPasswordValidation, resetPassword);

router.use(protect);
router.get("/me", getMe);
router.post("/logout", logout);
router.post("/logout-all", logoutAll);
router.put("/change-password", changePasswordValidation, changePassword);
router.put("/toggle-2fa", toggle2FA);

export default router;
