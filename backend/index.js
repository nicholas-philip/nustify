// ⚠️ CRITICAL: Load environment variables FIRST before any other imports
import dotenv from "dotenv";
dotenv.config();

// Verify critical environment variables
console.log("\n🔍 Environment Variables Check:");
console.log("NODE_ENV:", process.env.NODE_ENV || "development");
console.log("PORT:", process.env.PORT || "5000");
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "✓ Set" : "✗ MISSING");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✓ Set" : "✗ MISSING");
console.log("SMTP_USER:", process.env.SMTP_USER || "✗ MISSING");
console.log("SMTP_PASS:", process.env.SMTP_PASS ? "✓ Set" : "✗ MISSING");
console.log("SENDER_EMAIL:", process.env.SENDER_EMAIL || "✗ MISSING");
console.log("FRONTEND_URL:", process.env.FRONTEND_URL || "✗ MISSING");
console.log("");

// Check if SMTP credentials are actually loaded
if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.error("\n❌ ERROR: SMTP credentials are missing!");
  console.error("Make sure your .env file has:");
  console.error("SMTP_USER=890bb6001@smtp-brevo.com");
  console.error("SMTP_PASS=mcXtKMj2qvF5f3aW");
  console.error("SENDER_EMAIL=philipnicholas386@gmail.com\n");
}

// Now import everything else AFTER environment variables are loaded
import express from "express";
import cors from "cors";
import { connectDB } from "./libs/db.js";
import authRoutes from "./routes/authRoutes.js";
import nurseRoutes from "./routes/nurseRoute.js";
import patientRoutes from "./routes/patientRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Connect to MongoDB
connectDB();

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/nurse", nurseRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Nurse-Patient Booking Platform API is running",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    features: [
      "Authentication & Authorization",
      "Nurse & Patient Profiles",
      "Appointment Management",
      "Reviews & Ratings",
      "Messaging System",
      "Notifications",
      "Payment Processing",
      "Admin Dashboard & Analytics",
    ],
  });
});

// API documentation endpoint
app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API Documentation",
    endpoints: {
      auth: "/api/auth - Authentication endpoints",
      nurse: "/api/nurse - Nurse-specific endpoints",
      patient: "/api/patient - Patient-specific endpoints",
      admin: "/api/admin - Admin dashboard and management",
      notifications: "/api/notifications - Notification management",
      payments: "/api/payments - Payment processing",
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    requestedUrl: req.originalUrl,
    method: req.method,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  );
  console.log(`📍 API endpoint: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/`);
  console.log(`📖 API docs: http://localhost:${PORT}/api`);
  console.log(`\n✨ Available Routes:`);
  console.log(`   - Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   - Nurse: http://localhost:${PORT}/api/nurse`);
  console.log(`   - Patient: http://localhost:${PORT}/api/patient`);
  console.log(`   - Admin: http://localhost:${PORT}/api/admin`);
  console.log(`   - Notifications: http://localhost:${PORT}/api/notifications`);
  console.log(`   - Payments: http://localhost:${PORT}/api/payments\n`);
});
