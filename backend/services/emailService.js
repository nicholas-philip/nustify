import nodemailer from "nodemailer";

let transporter = null;

// Create transporter lazily (only when first used)
const getTransporter = () => {
  if (!transporter) {
    console.log("Creating SMTP transporter with credentials:");
    console.log("SMTP_USER:", process.env.SMTP_USER || "MISSING!");
    console.log("SMTP_PASS:", process.env.SMTP_PASS ? "SET" : "MISSING!");
    console.log("SENDER_EMAIL:", process.env.SENDER_EMAIL || "MISSING!");

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error("SMTP credentials not found in environment variables");
    }

    if (!process.env.SENDER_EMAIL) {
      throw new Error("SENDER_EMAIL not found in environment variables");
    }

    transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify connection
    transporter.verify((error, success) => {
      if (error) {
        console.error("❌ SMTP Connection Error:", error.message);
      } else {
        console.log("✅ SMTP Server is ready to send emails");
      }
    });
  }
  return transporter;
};

export default getTransporter;
