// src/components/admin/AdminAppointments.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  DollarSign,
  MapPin,
  Sparkles,
} from "lucide-react";
import api from "../../services/api";

const AdminAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAppointments();
  }, [page, filters]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = { page, ...filters };
      Object.keys(params).forEach((key) => !params[key] && delete params[key]);

      const data = await api.getAdminAppointments(params);
      if (data.success) {
        setAppointments(data.appointments);
        setTotalPages(data.pages);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
    setPage(1);
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
            onClick={() => navigate("/admin/dashboard")}
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
            All Appointments
          </motion.h1>
          <p className="text-gray-600 mt-1">
            View and monitor all platform appointments
          </p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                name: "status",
                label: "Status",
                options: [
                  "All Status",
                  "Pending",
                  "Confirmed",
                  "Completed",
                  "Cancelled",
                  "Rejected",
                ],
              },
              { name: "startDate", label: "Start Date", type: "date" },
              { name: "endDate", label: "End Date", type: "date" },
            ].map((filter, index) => (
              <motion.div
                key={filter.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {filter.label}
                </label>
                {filter.type === "date" ? (
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="date"
                    name={filter.name}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                    value={filters[filter.name]}
                    onChange={handleFilterChange}
                  />
                ) : (
                  <motion.select
                    whileFocus={{ scale: 1.02 }}
                    name={filter.name}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                    value={filters[filter.name]}
                    onChange={handleFilterChange}
                  >
                    {filter.options.map((opt, i) => (
                      <option key={i} value={i === 0 ? "" : opt.toLowerCase()}>
                        {opt}
                      </option>
                    ))}
                  </motion.select>
                )}
              </motion.div>
            ))}
          </div>
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
              <p className="text-gray-500">No appointments found</p>
            </motion.div>
          ) : (
            <>
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
                        <div className="space-y-1">
                          <motion.div
                            whileHover={{ x: 5 }}
                            className="flex items-center gap-2 text-gray-600 text-sm"
                          >
                            <User className="w-4 h-4" />
                            <span>
                              Patient: {appointment.patientId?.email || "N/A"}
                            </span>
                          </motion.div>
                          <motion.div
                            whileHover={{ x: 5 }}
                            className="flex items-center gap-2 text-gray-600 text-sm"
                          >
                            <User className="w-4 h-4" />
                            <span>
                              Nurse: {appointment.nurseId?.email || "N/A"}
                            </span>
                          </motion.div>
                        </div>
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
                        className="mb-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <p className="text-sm text-gray-600">
                          <strong>Address:</strong> {appointment.address.street}
                          , {appointment.address.city}
                        </p>
                      </motion.div>
                    )}

                    {appointment.symptoms && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-3 p-3 bg-yellow-50 rounded-lg"
                      >
                        <p className="text-sm text-gray-700">
                          <strong>Symptoms:</strong> {appointment.symptoms}
                        </p>
                      </motion.div>
                    )}

                    {appointment.notes && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-3"
                      >
                        <p className="text-sm text-gray-600">
                          <strong>Notes:</strong> {appointment.notes}
                        </p>
                      </motion.div>
                    )}

                    {appointment.nurseNotes && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-3 p-3 bg-blue-50 rounded-lg"
                      >
                        <p className="text-sm text-blue-900">
                          <strong>Nurse Notes:</strong> {appointment.nurseNotes}
                        </p>
                      </motion.div>
                    )}

                    <div className="text-xs text-gray-500 pt-3 border-t">
                      Created:{" "}
                      {new Date(appointment.createdAt).toLocaleString()}
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex justify-center gap-2 mt-6"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </motion.button>
                  <span className="px-4 py-2">
                    Page {page} of {totalPages}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </motion.button>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminAppointments;
