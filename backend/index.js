
import dotenv from "dotenv";
dotenv.config();


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


if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.error("\n❌ ERROR: SMTP credentials are missing!");
  console.error("Make sure your .env file has:");
  console.error("SMTP_USER=890bb6001@smtp-brevo.com");
  console.error("SMTP_PASS=mcXtKMj2qvF5f3aW");
  console.error("SENDER_EMAIL=philipnicholas386@gmail.com\n");
}


import express from "express";
import cors from "cors";
import http from "http";
import { Server as IOServer } from "socket.io";
import { connectDB } from "./libs/db.js";
import jwt from "jsonwebtoken";
import authRoutes from "./routes/authRoutes.js";
import nurseRoutes from "./routes/nurseRoute.js";
import patientRoutes from "./routes/patientRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import healthRecordRoutes from "./routes/healthRecordRoutes.js";
import medicalDocumentRoutes from "./routes/medicalDocumentRoutes.js";
import vitalSignsRoutes from "./routes/vitalSignsRoutes.js";
import credentialRoutes from "./routes/credentialRoutes.js";
import maternalHealthRoutes from "./routes/maternalHealthRoutes.js";
import childHealthRoutes from "./routes/childHealthRoutes.js";


const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url} from ${req.ip}`);
  next();
});


const corsOptions = {
  origin: true, // Allow any origin
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));


connectDB();


app.use("/api/auth", authRoutes);
app.use("/api/nurse", nurseRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/health-records", healthRecordRoutes);
app.use("/api/medical-documents", medicalDocumentRoutes);
app.use("/api/vital-signs", vitalSignsRoutes);
app.use("/api/credentials", credentialRoutes);
app.use("/api/maternal-health", maternalHealthRoutes);
app.use("/api/child-health", childHealthRoutes);


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
      "Real-time Chat",
      "Video Consultation",
      "Admin Dashboard & Analytics",
      "Patient Health Passport",
      "Medical Document Management",
      "Vital Signs Tracking",
      "Provider Verification System",
      "Maternal & Child Health",
    ],
  });
});


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
      chat: "/api/chat - Chat messages",
      healthRecords: "/api/health-records - Patient health records",
      medicalDocuments: "/api/medical-documents - Medical document uploads",
      vitalSigns: "/api/vital-signs - Vital signs tracking",
      credentials: "/api/credentials - Nurse credential verification",
      maternalHealth: "/api/maternal-health - Pregnancy tracking",
      childHealth: "/api/child-health - Child health records",
    },
  });
});


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    requestedUrl: req.originalUrl,
    method: req.method,
  });
});


app.use((err, req, res, next) => {
  console.error("Error:", err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});


const PORT = process.env.PORT || 5000;
const server = http.createServer(app);


const io = new IOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});


import { setIO } from "./libs/socket.js";
setIO(io);


import { startReminderWorker } from "./libs/reminder.js";
startReminderWorker();

import { startSelfPing } from "./libs/cron.js";
startSelfPing();

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);


  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      console.log(
        "🔒 No token provided on socket connection, leaving unauthenticated"
      );
      return;
    }
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.warn("🔒 Invalid socket token:", err.message);
      return;
    }
    const userId = decoded.id;
    if (userId) {
      socket.join(String(userId));
      console.log(`🔔 Socket ${socket.id} joined room ${userId}`);
    }
  } catch (err) {
    console.warn("Socket auth error:", err.message);
  }

  socket.on("disconnect", () => {
    console.log("🔌 Socket disconnected:", socket.id);
  });

  // --- WebRTC Signaling ---
  socket.on("join-room", ({ roomId, userId }) => {
    socket.join(roomId);
    console.log(`🎥 Socket ${socket.id} joined room ${roomId}`);
    socket.to(roomId).emit("user-connected", { userId });
  });

  socket.on("offer", ({ offer, roomId, to }) => {
    socket.to(roomId).emit("offer", { offer, from: socket.id });
  });

  socket.on("answer", ({ answer, roomId, to }) => {
    socket.to(roomId).emit("answer", { answer });
  });

  socket.on("ice-candidate", ({ candidate, roomId }) => {
    socket.to(roomId).emit("ice-candidate", { candidate });
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV || "development"
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
  console.log(`   - Notifications: http://localhost:${PORT}/api/notifications\n`);
});
