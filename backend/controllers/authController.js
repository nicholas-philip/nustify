import jwt from "jsonwebtoken";
import crypto from "crypto";
import { validationResult } from "express-validator";
import User from "../models/User.js";
import NurseProfile from "../models/NurseProfile.js";
import PatientProfile from "../models/PatientProfile.js";
import TokenBlacklist from "../models/TokenBlacklist.js";
import getTransporter from "../services/emailService.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const registerNurse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      email,
      password,
      fullName,
      phone,
      specialization,
      licenseNumber,
      hourlyRate,
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    if (licenseNumber) {
      const licenseExists = await NurseProfile.findOne({ licenseNumber });
      if (licenseExists) {
        return res.status(400).json({
          success: false,
          message: "License number already registered",
        });
      }
    }

    const user = await User.create({
      email,
      password,
      role: "nurse",
    });

    console.log("✅ User created with ID:", user._id);

    try {
      const nurseProfile = await NurseProfile.create({
        userId: user._id,
        fullName: fullName || "Not provided",
        phone: phone || "",
        specialization: specialization || "General Nursing",
        licenseNumber: licenseNumber || "",
        hourlyRate: hourlyRate || 50,
        isAvailable: true,
        availability: {
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
          saturday: [],
          sunday: [],
        },
      });

      console.log("✅ Nurse profile created with ID:", nurseProfile._id);
      console.log("✅ Profile linked to userId:", nurseProfile.userId);

      const verifyProfile = await NurseProfile.findOne({ userId: user._id });
      if (!verifyProfile) {
        console.error("❌ Profile verification failed!");
        throw new Error("Failed to verify profile creation");
      }
      console.log("✅ Profile verification successful");
    } catch (profileError) {
      console.error("❌ Error creating nurse profile:", profileError);

      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        success: false,
        message: "Failed to create nurse profile",
        error: profileError.message,
      });
    }

    const verificationToken = user.createEmailVerificationToken();
    const verificationCode = user.createEmailVerificationCode();
    await user.save({ validateBeforeSave: false });

    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

      await getTransporter().sendMail({
        from: `"Nursify Platform" <${process.env.SENDER_EMAIL}>`,
        to: email,
        subject: "Verify Your Email - Nursify",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to Nursify! 🏥</h1>
              </div>
              <div class="content">
                <h2>Verify Your Email Address</h2>
                <p>Thank you for registering with Nursify. To complete your registration, please verify your email address by clicking the button below:</p>
                <div style="text-align: center;">
                  <a href="${verificationUrl}" class="button">Verify Email Address</a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
                <h3>Your verification code</h3>
                <p style="font-size: 20px; font-weight: 700; color: #333;">${verificationCode}</p>
                <p><strong>This link will expire in 24 hours.</strong></p>
                <p>If you didn't create an account with Nursify, please ignore this email.</p>
              </div>
              <div class="footer">
                <p>&copy; 2024 Nursify Platform. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      console.log("✅ Verification email sent to:", email);
    } catch (error) {
      console.error("❌ Error sending verification email:", error);
    }

    const token = generateToken(user._id);

    const nurseProfile = await NurseProfile.findOne({ userId: user._id });

    res.status(201).json({
      success: true,
      message:
        "Nurse registered successfully. Please check your email to verify your account.",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      profile: nurseProfile,
    });
  } catch (error) {
    console.error("❌ Register nurse error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const registerPatient = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      email,
      password,
      fullName,
      phone,
      gender,
      emergencyContactName,
      emergencyContactPhone,
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({
      email,
      password,
      role: "patient",
      gender: gender || "prefer-not-to-say",
    });

    const patientProfile = await PatientProfile.create({
      userId: user._id,
      fullName,
      phone,
      gender: gender || "prefer-not-to-say",
      emergencyContact: {
        name: emergencyContactName,
        phone: emergencyContactPhone,
      },
    });

    const verificationToken = user.createEmailVerificationToken();
    const verificationCode = user.createEmailVerificationCode();
    await user.save({ validateBeforeSave: false });

    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

      await getTransporter().sendMail({
        from: `"Nursify Platform" <${process.env.SENDER_EMAIL}>`,
        to: email,
        subject: "Verify Your Email - Nursify",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to Nursify! 🏥</h1>
              </div>
              <div class="content">
                <h2>Verify Your Email Address</h2>
                <p>Thank you for registering with Nursify. To complete your registration, please verify your email address by clicking the button below:</p>
                <div style="text-align: center;">
                  <a href="${verificationUrl}" class="button">Verify Email Address</a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
                <h3>Your verification code</h3>
                <p style="font-size: 20px; font-weight: 700; color: #333;">${verificationCode}</p>
                <p><strong>This link will expire in 24 hours.</strong></p>
                <p>If you didn't create an account with Nursify, please ignore this email.</p>
              </div>
              <div class="footer">
                <p>&copy; 2024 Nursify Platform. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      console.log("✅ Verification email sent to:", email);
    } catch (error) {
      console.error("Error sending verification email:", error);
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message:
        "Patient registered successfully. Please check your email to verify your account.",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      profile: patientProfile,
    });
  } catch (error) {
    console.error("Register patient error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const verifyEmailByCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res
        .status(400)
        .json({ success: false, message: "Email and code are required" });
    }

    const user = await User.findOne({ email }).select(
      "+emailVerificationCode +emailVerificationCodeExpires"
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email already verified" });
    }

    if (!user.emailVerificationCode || !user.emailVerificationCodeExpires) {
      return res
        .status(400)
        .json({
          success: false,
          message: "No verification code found. Please request a new one.",
        });
    }

    if (user.emailVerificationCodeExpires < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "Verification code expired" });
    }

    const hashed = crypto.createHash("sha256").update(code).digest("hex");

    if (hashed !== user.emailVerificationCode) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid verification code" });
    }

    let profile;
    if (user.role === "nurse")
      profile = await NurseProfile.findOne({ userId: user._id });
    else if (user.role === "patient")
      profile = await PatientProfile.findOne({ userId: user._id });

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    user.emailVerificationCode = undefined;
    user.emailVerificationCodeExpires = undefined;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify email by code error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    let profile;
    if (user.role === "nurse") {
      profile = await NurseProfile.findOne({ userId: user._id });
    } else if (user.role === "patient") {
      profile = await PatientProfile.findOne({ userId: user._id });
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    try {
      const dashboardUrl =
        user.role === "nurse"
          ? `${process.env.FRONTEND_URL}/nurse/dashboard`
          : `${process.env.FRONTEND_URL}/patient/dashboard`;

      await getTransporter().sendMail({
        from: `"Nursify Platform" <${process.env.SENDER_EMAIL}>`,
        to: user.email,
        subject: "Welcome to Nursify! 🎉",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .feature-box { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to Nursify! 🎉</h1>
              </div>
              <div class="content">
                <h2>Hi ${profile?.fullName || "User"}!</h2>
                <p>Your email has been verified successfully. Welcome to the Nursify community!</p>
                
                ${user.role === "nurse"
            ? `
                <h3>As a Nurse, you can:</h3>
                <div class="feature-box">✅ Create and manage your professional profile</div>
                <div class="feature-box">📅 Set your availability and schedule</div>
                <div class="feature-box">💼 Accept appointment requests from patients</div>
                <div class="feature-box">💰 Track your earnings and payments</div>
                <div class="feature-box">⭐ Build your reputation with reviews</div>
                `
            : `
                <h3>As a Patient, you can:</h3>
                <div class="feature-box">🔍 Search and find qualified nurses</div>
                <div class="feature-box">📅 Book appointments at your convenience</div>
                <div class="feature-box">💬 Communicate directly with nurses</div>
                <div class="feature-box">⭐ Leave reviews after appointments</div>
                <div class="feature-box">💳 Secure payment processing</div>
                `
          }
                
                <div style="text-align: center;">
                  <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
                </div>
                
                <p>If you have any questions, feel free to reach out to our support team.</p>
              </div>
              <div class="footer">
                <p>&copy; 2024 Nursify Platform. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      console.log("✅ Welcome email sent to:", user.email);
    } catch (error) {
      console.error("Error sending welcome email:", error);
    }

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Verify email error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email already verified" });
    }

    const verificationToken = user.createEmailVerificationToken();
    const verificationCode = user.createEmailVerificationCode();
    await user.save({ validateBeforeSave: false });

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    await getTransporter().sendMail({
      from: `"Nursify Platform" <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: "Verify Your Email - Nursify",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Nursify! 🏥</h1>
            </div>
            <div class="content">
              <h2>Verify Your Email Address</h2>
              <p>Thank you for registering with Nursify. To complete your registration, please verify your email address by clicking the button below:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
              <h3>Your verification code</h3>
              <p style="font-size: 20px; font-weight: 700; color: #333;">${verificationCode}</p>
              <p><strong>This link will expire in 24 hours.</strong></p>
              <p>If you didn't create an account with Nursify, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Nursify Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    if (user.isLocked) {
      return res.status(401).json({
        success: false,
        message: "Account is locked due to too many failed login attempts",
      });
    }

    if (!user.isActive) {
      return res
        .status(401)
        .json({ success: false, message: "Account has been deactivated" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.incLoginAttempts();
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    if (user.twoFactorEnabled) {
      const code = user.create2FACode();
      await user.save({ validateBeforeSave: false });

      try {
        await getTransporter().sendMail({
          from: `"Nursify Platform" <${process.env.SENDER_EMAIL}>`,
          to: email,
          subject: "Your 2FA Code - Nursify",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .code-box { background: white; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; margin: 20px 0; border-radius: 5px; border: 2px dashed #667eea; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Two-Factor Authentication 🔐</h1>
                </div>
                <div class="content">
                  <h2>Your Verification Code</h2>
                  <p>Use this code to complete your login:</p>
                  <div class="code-box">${code}</div>
                  <p style="text-align: center;"><strong>This code will expire in 10 minutes.</strong></p>
                  <p>If you didn't request this code, please ignore this email and ensure your account is secure.</p>
                </div>
                <div class="footer">
                  <p>&copy; 2024 Nursify Platform. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
          `,
        });
      } catch (error) {
        console.error("Error sending 2FA code:", error);
      }

      return res.status(200).json({
        success: true,
        message: "2FA code sent to your email",
        requires2FA: true,
        userId: user._id,
      });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const verify2FA = async (req, res) => {
  try {
    const { userId, code } = req.body;

    const hashedCode = crypto.createHash("sha256").update(code).digest("hex");

    const user = await User.findOne({
      _id: userId,
      twoFactorCode: hashedCode,
      twoFactorExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired 2FA code",
      });
    }

    user.twoFactorCode = undefined;
    user.twoFactorExpires = undefined;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "2FA verification successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Verify 2FA error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account exists, a password reset email has been sent",
      });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

      await getTransporter().sendMail({
        from: `"Nursify Platform" <${process.env.SENDER_EMAIL}>`,
        to: email,
        subject: "Password Reset Request - Nursify",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Reset Request 🔐</h1>
              </div>
              <div class="content">
                <h2>Reset Your Password</h2>
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="button">Reset Password</a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
                <div class="warning">
                  <strong>⚠️ Important:</strong>
                  <ul>
                    <li>This link will expire in 1 hour</li>
                    <li>If you didn't request this reset, please ignore this email</li>
                    <li>Your password will remain unchanged until you create a new one</li>
                  </ul>
                </div>
              </div>
              <div class="footer">
                <p>&copy; 2024 Nursify Platform. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      res.status(200).json({
        success: true,
        message: "Password reset email sent successfully",
      });
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: "Error sending email. Please try again later.",
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    let profile;
    if (user.role === "nurse") {
      profile = await NurseProfile.findOne({ userId: user._id });
    } else if (user.role === "patient") {
      profile = await PatientProfile.findOne({ userId: user._id });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = Date.now();
    await user.save();

    try {
      await getTransporter().sendMail({
        from: `"Nursify Platform" <${process.env.SENDER_EMAIL}>`,
        to: user.email,
        subject: "Password Changed Successfully - Nursify",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Changed ✓</h1>
              </div>
              <div class="content">
                <h2>Hi ${profile?.fullName || "User"}!</h2>
                <div class="success">
                  <strong>✓ Success:</strong> Your password has been changed successfully.
                </div>
                <p>This is a confirmation that your password was recently changed.</p>
                <div class="warning">
                  <strong>⚠️ Didn't make this change?</strong><br>
                  If you did not change your password, please contact our support team immediately at support@nursify.com
                </div>
                <p>For security reasons, you may need to log in again on all your devices.</p>
              </div>
              <div class="footer">
                <p>&copy; 2024 Nursify Platform. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
    } catch (error) {
      console.error("Error sending password changed email:", error);
    }

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Current password is incorrect" });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    let profile;
    if (user.role === "nurse") {
      profile = await NurseProfile.findOne({ userId: user._id });
    } else if (user.role === "patient") {
      profile = await PatientProfile.findOne({ userId: user._id });
    }

    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    await user.save();

    try {
      await getTransporter().sendMail({
        from: `"Nursify Platform" <${process.env.SENDER_EMAIL}>`,
        to: user.email,
        subject: "Password Changed Successfully - Nursify",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Changed ✓</h1>
              </div>
              <div class="content">
                <h2>Hi ${profile?.fullName || "User"}!</h2>
                <div class="success">
                  <strong>✓ Success:</strong> Your password has been changed successfully.
                </div>
                <p>This is a confirmation that your password was recently changed.</p>
                <div class="warning">
                  <strong>⚠️ Didn't make this change?</strong><br>
                  If you did not change your password, please contact our support team immediately at support@nursify.com
                </div>
                <p>For security reasons, you may need to log in again on all your devices.</p>
              </div>
              <div class="footer">
                <p>&copy; 2024 Nursify Platform. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
    } catch (error) {
      console.error("Error sending password changed email:", error);
    }

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const toggle2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.twoFactorEnabled = !user.twoFactorEnabled;
    await user.save();

    res.status(200).json({
      success: true,
      message: `2FA ${user.twoFactorEnabled ? "enabled" : "disabled"
        } successfully`,
      twoFactorEnabled: user.twoFactorEnabled,
    });
  } catch (error) {
    console.error("Toggle 2FA error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.token;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const expiresAt = new Date(decoded.exp * 1000);

    await TokenBlacklist.create({
      token,
      userId: req.user._id,
      expiresAt,
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const logoutAll = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.passwordChangedAt = Date.now();
    await user.save({ validateBeforeSave: false });

    const token = req.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const expiresAt = new Date(decoded.exp * 1000);

    await TokenBlacklist.create({
      token,
      userId: req.user._id,
      expiresAt,
    });

    res.status(200).json({
      success: true,
      message: "Logged out from all devices successfully",
    });
  } catch (error) {
    console.error("Logout all error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = req.user;

    let profile;
    if (user.role === "nurse") {
      profile = await NurseProfile.findOne({ userId: user._id });
    } else if (user.role === "patient") {
      profile = await PatientProfile.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        createdAt: user.createdAt,
      },
      profile,
    });
  } catch (error) {
    console.error("Get me error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export {
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
};
