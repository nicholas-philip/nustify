import nodemailer from "nodemailer";

let transporter = null;


const getTransporter = () => {
  if (!transporter) {
    const smtpHost = process.env.SMTP_HOST || "smtp-relay.brevo.com";
    // Attempt port 2525, as 587 and 465 are blocked on Render
    const smtpPort = parseInt(process.env.SMTP_PORT || "2525");
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
      // Port 465 is implicit SSL/TLS. Ports 587 and 2525 are usually explicit STARTTLS (secure: false)
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      // Keep timeouts high
      connectionTimeout: 20000,
      greetingTimeout: 20000,
      socketTimeout: 20000,
      debug: true,
      logger: true
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
