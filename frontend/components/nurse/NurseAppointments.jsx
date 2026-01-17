
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
  CheckCircle2,
  Sparkles,
  Activity,
  Thermometer,
  Droplets,
  Scale,
  Stethoscope,
  FileEdit,
  ClipboardList,
  FileText
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
  const [completeModal, setCompleteModal] = useState({
    show: false,
    appointment: null,
  });
  const [nurseNotes, setNurseNotes] = useState("");
  const [completionNotes, setCompletionNotes] = useState("");
  const [responding, setResponding] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [activeTab, setActiveTab] = useState("notes"); // 'notes', 'vitals', 'assessment'
  const [healthData, setHealthData] = useState({
    vitals: {
      bloodPressure: { systolic: "", diastolic: "" },
      heartRate: "",
      temperature: "",
      oxygenSaturation: "",
      respiratoryRate: "",
      weight: "",
    },
    assessment: {
      title: "",
      description: "",
      diagnosisCode: "",
      severity: "mild",
      treatmentPlan: "",
    }
  });

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

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const data = await api.completeAppointment(
        completeModal.appointment._id,
        {
          completionNotes,
          healthData
        }
      );

      if (data.success) {
        alert("Appointment marked as completed successfully!");
        setCompleteModal({ show: false, appointment: null });
        setCompletionNotes("");
        setHealthData({
          vitals: {
            bloodPressure: { systolic: "", diastolic: "" },
            heartRate: "",
            temperature: "",
            oxygenSaturation: "",
            respiratoryRate: "",
            weight: "",
          },
          assessment: {
            title: "",
            description: "",
            diagnosisCode: "",
            severity: "mild",
            treatmentPlan: "",
          }
        });
        fetchAppointments();
      }
    } catch (error) {
      alert(error.message || "Failed to complete appointment");
    } finally {
      setCompleting(false);
    }
  };

  const handleVitalsChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setHealthData(prev => ({
        ...prev,
        vitals: {
          ...prev.vitals,
          [parent]: {
            ...prev.vitals[parent],
            [child]: value
          }
        }
      }));
    } else {
      setHealthData(prev => ({
        ...prev,
        vitals: {
          ...prev.vitals,
          [field]: value
        }
      }));
    }
  };

  const handleAssessmentChange = (field, value) => {
    setHealthData(prev => ({
      ...prev,
      assessment: {
        ...prev.assessment,
        [field]: value
      }
    }));
  };

  const canCompleteAppointment = (appointment) => {
    if (appointment.status !== "confirmed") return false;

    const appointmentDate = new Date(appointment.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);


    return appointmentDate <= today;
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
            className="text-teal-600 mb-4"
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
              <Sparkles className="w-8 h-8 text-teal-600" />
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
              className={`px-6 py-2 rounded-lg font-medium transition ${filter === status
                ? "bg-black text-white"
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
                className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full mx-auto"
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

                  {appointment.completedAt && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mb-4 p-3 bg-green-50 rounded-lg"
                    >
                      <p className="text-sm text-green-900">
                        <strong>Completed:</strong>{" "}
                        {new Date(appointment.completedAt).toLocaleString()}
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
                        className="flex-1 px-4 py-3 bg-black text-white rounded-lg flex items-center justify-center gap-2"
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
                        className="flex-1 px-4 py-3 bg-black text-white rounded-lg flex items-center justify-center gap-2"
                      >
                        <X className="w-5 h-5" />
                        Decline
                      </motion.button>
                    </motion.div>
                  )}

                  {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
                    <motion.div className="mt-4 pt-4 border-t">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/consultation/${appointment._id}`)}
                        className="w-full px-4 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        Open Consultation Room
                      </motion.button>
                    </motion.div>
                  )}

                  {(appointment.status === 'confirmed' || appointment.status === 'completed') && appointment.patientId?._id && (
                    <motion.div className="mt-4 pt-4 border-t">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/nurse/patient-record/${appointment.patientId._id}`)}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <FileText className="w-5 h-5" />
                        View Health Record
                      </motion.button>
                    </motion.div>
                  )}

                  {appointment.status === "confirmed" &&
                    canCompleteAppointment(appointment) &&
                    !appointment.completedAt && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 pt-4 border-t"
                      >
                        <motion.button
                          whileHover={{
                            scale: 1.02,
                            boxShadow: "0 5px 15px rgba(59, 130, 246, 0.3)",
                          }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            setCompleteModal({ show: true, appointment })
                          }
                          className="w-full px-4 py-3 bg-black text-white rounded-lg flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          Mark as Completed
                        </motion.button>
                      </motion.div>
                    )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      { }
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
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50"
                >
                  {responding ? "Accepting..." : "Accept Appointment"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Complete Appointment Modal */}
      <AnimatePresence>
        {completeModal.show && (
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
              className="bg-white rounded-xl p-6 max-w-2xl w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Complete Appointment
                </h3>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() =>
                    setCompleteModal({ show: false, appointment: null })
                  }
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="flex border-b mb-6 overflow-x-auto">
                {[
                  { id: "notes", label: "General Notes", icon: FileEdit },
                  { id: "vitals", label: "Vital Signs", icon: Activity },
                  { id: "assessment", label: "Assessment", icon: ClipboardList },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                      ? "border-black text-black"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="mb-6 max-h-[400px] overflow-y-auto px-1 custom-scrollbar">
                {activeTab === "notes" && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <p className="text-gray-600 mb-4 text-sm">
                      Mark this appointment as completed. Add final notes about the service provided.
                    </p>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Completion Notes (Optional)
                    </label>
                    <textarea
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                      rows="4"
                      placeholder="Add notes about the service provided..."
                      value={completionNotes}
                      onChange={(e) => setCompletionNotes(e.target.value)}
                    />
                  </motion.div>
                )}

                {activeTab === "vitals" && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Blood Pressure (mmHg)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Systolic"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none"
                          value={healthData.vitals.bloodPressure.systolic}
                          onChange={(e) => handleVitalsChange('bloodPressure.systolic', e.target.value)}
                        />
                        <span className="text-gray-400 font-bold">/</span>
                        <input
                          type="number"
                          placeholder="Diastolic"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none"
                          value={healthData.vitals.bloodPressure.diastolic}
                          onChange={(e) => handleVitalsChange('bloodPressure.diastolic', e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Heart Rate (bpm)</label>
                      <input
                        type="number"
                        placeholder="72"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none"
                        value={healthData.vitals.heartRate}
                        onChange={(e) => handleVitalsChange('heartRate', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Temp (°C)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="36.5"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none"
                        value={healthData.vitals.temperature}
                        onChange={(e) => handleVitalsChange('temperature', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">SpO2 (%)</label>
                      <input
                        type="number"
                        placeholder="98"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none"
                        value={healthData.vitals.oxygenSaturation}
                        onChange={(e) => handleVitalsChange('oxygenSaturation', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Resp. Rate</label>
                      <input
                        type="number"
                        placeholder="16"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none"
                        value={healthData.vitals.respiratoryRate}
                        onChange={(e) => handleVitalsChange('respiratoryRate', e.target.value)}
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Weight (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="70.5"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none"
                        value={healthData.vitals.weight}
                        onChange={(e) => handleVitalsChange('weight', e.target.value)}
                      />
                    </div>
                  </motion.div>
                )}

                {activeTab === "assessment" && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Diagnosis/Visit Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Hypertension, General Consultation"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none"
                        value={healthData.assessment.title}
                        onChange={(e) => handleAssessmentChange('title', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Clinical Observations</label>
                      <textarea
                        rows="3"
                        placeholder="Describe patient condition..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none"
                        value={healthData.assessment.description}
                        onChange={(e) => handleAssessmentChange('description', e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">ICD-10 Code</label>
                        <input
                          type="text"
                          placeholder="e.g. I10"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none"
                          value={healthData.assessment.diagnosisCode}
                          onChange={(e) => handleAssessmentChange('diagnosisCode', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Severity</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none bg-white"
                          value={healthData.assessment.severity}
                          onChange={(e) => handleAssessmentChange('severity', e.target.value)}
                        >
                          <option value="mild">Mild</option>
                          <option value="moderate">Moderate</option>
                          <option value="severe">Severe</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Treatment Plan & Prescriptions</label>
                      <textarea
                        rows="3"
                        placeholder="Medications, follow-up advice..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none"
                        value={healthData.assessment.treatmentPlan}
                        onChange={(e) => handleAssessmentChange('treatmentPlan', e.target.value)}
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setCompleteModal({ show: false, appointment: null })
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 5px 15px rgba(59, 130, 246, 0.3)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleComplete}
                  disabled={completing}
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  {completing ? "Completing..." : "Mark as Complete"}
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
