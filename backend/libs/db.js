import mongoose from "mongoose";

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

export const connectDB = async (options = { retries: 5, delayMs: 2000 }) => {
  const { retries, delayMs } = options;
  if (!process.env.MONGODB_URI) {
    console.error("❌ MONGODB_URI is not defined in environment variables");
    throw new Error("MONGODB_URI is not defined");
  }

  let attempt = 0;
  while (attempt < retries) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

      mongoose.connection.on("error", (err) => {
        console.error("❌ MongoDB connection error:", err);
      });

      mongoose.connection.on("disconnected", () => {
        console.log("⚠️ MongoDB disconnected");
      });

      return conn;
    } catch (error) {
      attempt += 1;
      console.error(
        `❌ MongoDB connection attempt ${attempt} failed: ${error.message}`
      );
      if (attempt >= retries) break;
      console.log(`⏳ Retrying MongoDB connection in ${delayMs}ms...`);
      
      
      await sleep(delayMs);
    }
  }

  console.error(
    "❌ MongoDB connection failed after multiple attempts. Make sure MongoDB is running locally or update MONGODB_URI to a reachable database."
  );
  throw new Error("MongoDB connection failed");
};
