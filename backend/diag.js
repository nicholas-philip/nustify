import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import NurseProfile from "./models/NurseProfile.js";

const run = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    const nurses = await NurseProfile.find({}).limit(10);
    console.log("Nurses Found:", nurses.length);
    nurses.forEach(n => {
        console.log(`- ${n.fullName} (_id: ${n._id}, userId: ${n.userId})`);
    });
    process.exit(0);
};

run();
