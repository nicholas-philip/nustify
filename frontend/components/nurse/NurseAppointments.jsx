// src/components/nurse/NurseAppointments.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  User,
  Check,
  X,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import api from "../../services/api";

const NurseAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [respondModal, setRespondModal] = useState({
    show: false,
    appointment: null,
  });
  const [nurseNotes, setNurseNotes] = useState("");
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const status = filter !== "all" ? filter : undefined;
      const data = await api.getNurseAppointments(status);
      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (appointmentId, status) => {
    setResponding(true);
    try {
      const data = await api.respondToAppointment(appointmentId, {
        status,
        nurseNotes,
      });

      if (data.success) {
        alert(`Appointment ${status} successfully`);
        setRespondModal({ show: false, appointment: null });
        setNurseNotes("");
        fetchAppointments();
      }
    } catch (error) {
      alert(error.message || "Failed to respond to appointment");
    } finally {
      setResponding(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-green-100 text-green-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
      rejected: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <motion.button
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/nurse/dashboard")}
            className="text-purple-600 hover:text-purple-700 mb-4"
          >
            ← Back to Dashboard
          </motion.button>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-gray-900 flex items-center gap-2"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-8 h-8 text-purple-600" />
            </motion.div>
            My Appointments
          </motion.h1>
          <p className="text-gray-600 mt-1">
            Manage your appointment requests and bookings
          </p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-2 mb-6 flex flex-wrap gap-2"
        >
          {[
            "all",
            "pending",
            "confirmed",
            "completed",
            "cancelled",
            "rejected",
          ].map((status, index) => (
            <motion.button
              key={status}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(status)}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                filter === status
                  ? "bg-purple-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </motion.button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto"
              />
            </motion.div>
          ) : appointments.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-12 bg-white rounded-xl"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              </motion.div>
              <p className="text-gray-500 text-lg">No appointments found</p>
              <p className="text-gray-400 text-sm mt-2">
                {filter === "pending"
                  ? "No pending requests at the moment"
                  : "Try adjusting your filters"}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {appointments.map((appointment) => (
                <motion.div
                  key={appointment._id}
                  variants={itemVariants}
                  whileHover={{
                    y: -5,
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
                  }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <motion.h3
                        whileHover={{ x: 5 }}
                        className="text-xl font-bold text-gray-900 mb-2"
                      >
                        {appointment.serviceType}
                      </motion.h3>
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="flex items-center gap-2 text-gray-600 mb-1"
                      >
                        <User className="w-4 h-4" />
                        <span>
                          Patient: {appointment.patientId?.email || "N/A"}
                        </span>
                      </motion.div>
                    </div>
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {appointment.status}
                    </motion.span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-2 text-gray-600"
                    >
                      <Calendar className="w-5 h-5" />
                      <span>
                        {new Date(
                          appointment.appointmentDate
                        ).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </motion.div>
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-2 text-gray-600"
                    >
                      <Clock className="w-5 h-5" />
                      <span>
                        {appointment.startTime} - {appointment.endTime}
                      </span>
                    </motion.div>
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-2 text-gray-600"
                    >
                      <MapPin className="w-5 h-5" />
                      <span>{appointment.location}</span>
                    </motion.div>
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-2 text-gray-600"
                    >
                      <DollarSign className="w-5 h-5" />
                      <span className="font-semibold text-green-600">
                        ${appointment.totalCost}
                      </span>
                    </motion.div>
                  </div>

                  {appointment.address && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mb-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <p className="text-sm text-gray-600">
                        <strong>Address:</strong> {appointment.address.street},{" "}
                        {appointment.address.city}
                        {appointment.address.instructions && (
                          <span className="block mt-1 text-gray-500">
                            Instructions: {appointment.address.instructions}
                          </span>
                        )}
                      </p>
                    </motion.div>
                  )}

                  {appointment.symptoms && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mb-4 p-3 bg-yellow-50 rounded-lg"
                    >
                      <p className="text-sm text-gray-700">
                        <strong>Patient Symptoms:</strong>{" "}
                        {appointment.symptoms}
                      </p>
                    </motion.div>
                  )}

                  {appointment.notes && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mb-4"
                    >
                      <p className="text-sm text-gray-600">
                        <strong>Patient Notes:</strong> {appointment.notes}
                      </p>
                    </motion.div>
                  )}

                  {appointment.nurseNotes && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mb-4 p-3 bg-blue-50 rounded-lg"
                    >
                      <p className="text-sm text-blue-900">
                        <strong>Your Notes:</strong> {appointment.nurseNotes}
                      </p>
                    </motion.div>
                  )}

                  {appointment.status === "pending" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3 mt-4 pt-4 border-t"
                    >
                      <motion.button
                        whileHover={{
                          scale: 1.05,
                          boxShadow: "0 5px 15px rgba(34, 197, 94, 0.3)",
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          setRespondModal({ show: true, appointment })
                        }
                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                      >
                        <Check className="w-5 h-5" />
                        Accept
                      </motion.button>
                      <motion.button
                        whileHover={{
                          scale: 1.05,
                          boxShadow: "0 5px 15px rgba(239, 68, 68, 0.3)",
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          handleRespond(appointment._id, "rejected")
                        }
                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                      >
                        <X className="w-5 h-5" />
                        Decline
                      </motion.button>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {respondModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Accept Appointment
                </h3>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() =>
                    setRespondModal({ show: false, appointment: null })
                  }
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="mb-4">
                <p className="text-gray-600 mb-4">
                  You're about to accept this appointment. Would you like to add
                  any notes?
                </p>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <motion.textarea
                  whileFocus={{ scale: 1.02 }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                  rows="4"
                  placeholder="Add any notes or instructions for the patient..."
                  value={nurseNotes}
                  onChange={(e) => setNurseNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setRespondModal({ show: false, appointment: null })
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 5px 15px rgba(34, 197, 94, 0.3)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    handleRespond(respondModal.appointment._id, "confirmed")
                  }
                  disabled={responding}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {responding ? "Accepting..." : "Accept Appointment"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NurseAppointments;
