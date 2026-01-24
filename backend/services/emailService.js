import nodemailer from "nodemailer";

let transporter = null;


const getTransporter = () => {
  if (!transporter) {
    const smtpHost = process.env.SMTP_HOST || "smtp-relay.brevo.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || "587");
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    console.log("Creating SMTP transporter with credentials:");
    console.log("Host:", smtpHost);
    console.log("Port:", smtpPort);
    console.log("User:", smtpUser || "MISSING!");
    console.log("Pass:", smtpPass ? "SET" : "MISSING!!");

    if (!smtpUser || !smtpPass) {
      throw new Error("SMTP credentials not found in environment variables");
    }

    const config = {
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      // Increase timeouts
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000,
      debug: true, // Enable debug output
      logger: true // Enable logger
    };

    transporter = nodemailer.createTransport(config);

    transporter.verify((error, success) => {
      if (error) {
        console.error("❌ SMTP Connection Error:", error);
      } else {
        console.log("✅ SMTP Server is ready to send emails");
      }
    });
  }
  return transporter;
};

export default getTransporter;
