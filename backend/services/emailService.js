import nodemailer from "nodemailer";

let transporter = null;


const getTransporter = () => {
  if (!transporter) {
    const smtpHost = process.env.SMTP_HOST || "smtp-relay.brevo.com";
    // Default to port 465 (Secure) if not specified, as 587 seems to be timing out
    const smtpPort = parseInt(process.env.SMTP_PORT || "465");
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
      // Increase timeouts further
      connectionTimeout: 20000, // 20 seconds
      greetingTimeout: 20000,
      socketTimeout: 20000,
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
