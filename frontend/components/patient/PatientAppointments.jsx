
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  User,
  X,
  AlertCircle,
} from "lucide-react";

import api from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";

const PatientAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [cancelModal, setCancelModal] = useState({
    show: false,
    appointmentId: null,
  });
  const [paymentModal, setPaymentModal] = useState({
    show: false,
    appointment: null,
  });
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const status = filter !== "all" ? filter : undefined;
      const data = await api.getPatientAppointments(status);
      if (data.success) {
        setAppointments(data.appointments);
        // Check for any payments related to appointments to update status if needed
        // For simplicity, relying on appointment status updates from backend webhooks/logic
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    alert("Payment Completed Successfully!");
    setPaymentModal({ show: false, appointment: null });
    fetchAppointments();
  };

  const handleCancelAppointment = async () => {
    if (!cancelReason.trim()) {
      alert("Please provide a cancellation reason");
      return;
    }

    setCancelling(true);
    try {
      const data = await api.cancelAppointment(cancelModal.appointmentId, {
        cancellationReason: cancelReason,
      });

      if (data.success) {
        alert("Appointment cancelled successfully");
        setCancelModal({ show: false, appointmentId: null });
        setCancelReason("");
        fetchAppointments();
      }
    } catch (error) {
      alert(error.message || "Failed to cancel appointment");
    } finally {
      setCancelling(false);
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

  const canCancelAppointment = (appointment) => {
    return ["pending", "confirmed"].includes(appointment.status);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <motion.button
            whileHover={{ x: -5 }}
            onClick={() => navigate("/patient/dashboard")}
            className="text-black hover:text-gray-900 mb-4"
          >
            ← Back to Dashboard
          </motion.button>
          <h1 className="text-4xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-600 mt-1">View and manage your bookings</p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-2 mb-6 flex flex-wrap gap-2"
        >
          {["all", "pending", "confirmed", "completed", "cancelled"].map(
            (status, index) => (
              <motion.button
                key={status}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(status)}
                className={`px-6 py-2 rounded-lg font-medium transition ${filter === status
                  ? "bg-black text-white"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </motion.button>
            )
          )}
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
                className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full mx-auto"
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
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/patient/search")}
                className="mt-4 px-6 py-3 bg-black text-white rounded-lg"
              >
                Book an Appointment
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="appointments"
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
                    scale: 1.01,
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
                  }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {appointment.serviceType}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <User className="w-4 h-4" />
                        <span>
                          Nurse: {appointment.nurseId?.email || "N/A"}
                        </span>
                      </div>
                    </div>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
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
                      <span>${appointment.totalCost}</span>
                    </motion.div>
                  </div>

                  {appointment.status === 'confirmed' && !appointment.paymentStatus && !appointment.completedAt && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={true}
                      className="w-full mb-3 px-4 py-2 bg-gray-200 text-gray-500 rounded-lg font-medium cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <DollarSign className="w-4 h-4" />
                      Pay with Cash (${appointment.totalCost}) - Online Payment Not Active
                    </motion.button>
                  )}

                  {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/consultation/${appointment._id}`)}
                      className="w-full mb-3 px-4 py-2 bg-black text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                    >
                      Join Consultation Room
                    </motion.button>
                  )}

                  {canCancelAppointment(appointment) && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        setCancelModal({
                          show: true,
                          appointmentId: appointment._id,
                        })
                      }
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                    >
                      Cancel Appointment
                    </motion.button>
                  )}

                  {appointment.status === "completed" && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        navigate(`/patient/review/${appointment._id}`)
                      }
                      className="mt-4 px-4 py-2 bg-black text-white rounded-lg"
                    >
                      Leave a Review
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>


      <AnimatePresence>
        {cancelModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Cancel Appointment
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() =>
                    setCancelModal({ show: false, appointmentId: null })
                  }
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="mb-4 p-3 bg-yellow-50 rounded-lg flex gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  Please note that cancellation policies may apply.
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for cancellation
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                  rows="4"
                  placeholder="Please provide a reason..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    setCancelModal({ show: false, appointmentId: null })
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Keep Appointment
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCancelAppointment}
                  disabled={cancelling}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {cancelling ? "Cancelling..." : "Cancel Appointment"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {paymentModal.show && paymentModal.appointment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl text-center"
            >
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h3 className="text-2xl font-bold text-gray-900">Payment Information</h3>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setPaymentModal({ show: false, appointment: null })}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
              <div className="py-8">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-10 h-10 text-black" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Cash Only</h4>
                <p className="text-gray-600">
                  Online payments are currently disabled. Please pay ${paymentModal.appointment.totalCost} in cash directly to your nurse.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPaymentModal({ show: false, appointment: null })}
                className="w-full px-6 py-3 bg-black text-white rounded-xl font-semibold"
              >
                Understood
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientAppointments;
