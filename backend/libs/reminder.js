import Appointment from "../models/Appointments.js";
import { createNotification } from "../controllers/notificationController.js";


export const startReminderWorker = (intervalMs = 1000 * 60 * 60) => {
  console.log(
    "🔁 Starting reminder worker, running every",
    intervalMs / 1000 / 60,
    "minutes"
  );

  const checkAndSend = async () => {
    try {
      const now = new Date();
      const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      
      const appointments = await Appointment.find({
        status: "confirmed",
        reminderSent: false,
        appointmentDate: { $gte: now, $lte: in24h },
      });

      for (const apt of appointments) {
        try {
          
          await createNotification(
            apt.patientId,
            "appointment_reminder",
            "Appointment Reminder",
            `Reminder: You have an appointment on ${new Date(
              apt.appointmentDate
            ).toLocaleString()}`,
            {
              relatedId: apt._id,
              relatedModel: "Appointment",
              priority: "high",
            }
          );

          
          await createNotification(
            apt.nurseId,
            "appointment_reminder",
            "Upcoming Appointment",
            `You have an upcoming appointment on ${new Date(
              apt.appointmentDate
            ).toLocaleString()}`,
            {
              relatedId: apt._id,
              relatedModel: "Appointment",
              priority: "medium",
            }
          );

          apt.reminderSent = true;
          await apt.save();
        } catch (err) {
          console.warn(
            "Failed to send reminder for appointment",
            apt._id,
            err.message
          );
        }
      }
    } catch (err) {
      console.error("Reminder worker error:", err.message);
    }
  };

  
  checkAndSend();
  return setInterval(checkAndSend, intervalMs);
};
