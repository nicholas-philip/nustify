import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

// Load environment variables
dotenv.config();

// Import User model AFTER dotenv.config()
import User from "./models/User.js";

const createAdminUser = async () => {
  try {
    // Check if MONGODB_URI exists (not MONGO_URI!)
    if (!process.env.MONGODB_URI) {
      console.error("\n❌ ERROR: MONGODB_URI is not defined in .env file\n");
      console.log("Please add this to your .env file:");
      console.log("MONGODB_URI=mongodb://localhost:27017/nursify\n");
      process.exit(1);
    }

    console.log("🔌 Connecting to MongoDB...");

    // Connect to MongoDB using MONGODB_URI (matching your server)
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected!\n");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@nursify.com" });

    if (existingAdmin) {
      console.log("⚠️  Admin user already exists!");
      console.log("Email: admin@nursify.com");
      console.log("\nIf you need to reset the password:");
      console.log("1. Delete this user from MongoDB");
      console.log("2. Run this script again\n");
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log("🔐 Creating admin user...");

    // Create admin user - password will be hashed by the pre-save hook
    const adminUser = new User({
      email: "admin@nursify.com",
      password: "Admin@123456", // Will be hashed by schema pre-save hook
      role: "admin",
      isVerified: true,
      isActive: true,
    });

    await adminUser.save();

    console.log("\n╔════════════════════════════════════════════╗");
    console.log("║   ✨ Admin User Created Successfully!     ║");
    console.log("╚════════════════════════════════════════════╝\n");
    console.log("📧 Email:    admin@nursify.com");
    console.log("🔑 Password: Admin@123456");
    console.log("🆔 User ID:  " + adminUser._id);
    console.log("👤 Role:     " + adminUser.role);
    console.log("\n⚠️  IMPORTANT: Change password after first login!\n");

    await mongoose.connection.close();
    console.log("✅ Database connection closed\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error creating admin user:");
    console.error("Message:", error.message);

    if (error.code === 11000) {
      console.error("\n⚠️  Duplicate key error - Admin already exists!");
    }

    try {
      await mongoose.connection.close();
    } catch (closeError) {
      // Ignore
    }
    process.exit(1);
  }
};

console.log("\n🚀 Starting Admin User Creation Script...\n");
createAdminUser();
