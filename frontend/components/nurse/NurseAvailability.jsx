import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Save,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const NurseAvailability = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [availability, setAvailability] = useState({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  });
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const daysOfWeek = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  useEffect(() => {
    if (profile) {
      setAvailability(
        profile.availability || {
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
          saturday: [],
          sunday: [],
        }
      );
      setIsAvailable(profile.isAvailable !== false);
      setLoading(false);
    }
  }, [profile]);

  const addTimeSlot = (day) => {
    setAvailability({
      ...availability,
      [day]: [...availability[day], { start: "09:00", end: "17:00" }],
    });
  };

  const removeTimeSlot = (day, index) => {
    setAvailability({
      ...availability,
      [day]: availability[day].filter((_, i) => i !== index),
    });
  };

  const updateTimeSlot = (day, index, field, value) => {
    const updatedSlots = [...availability[day]];
    updatedSlots[index][field] = value;
    setAvailability({
      ...availability,
      [day]: updatedSlots,
    });
  };

  const copyToAllDays = (sourceDay) => {
    const slots = availability[sourceDay];
    const newAvailability = {};
    daysOfWeek.forEach((day) => {
      newAvailability[day] = JSON.parse(JSON.stringify(slots));
    });
    setAvailability(newAvailability);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const data = await api.updateAvailability({
        availability,
        isAvailable,
      });

      if (data.success) {
        setSuccess("Availability updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError(err.message || "Failed to update availability");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full"
        />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
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
              <Sparkles className="w-8 h-8 text-purple-600" />
            </motion.div>
            Manage Availability
          </motion.h1>
          <p className="text-gray-600 mt-1">
            Set your working hours for each day
          </p>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-800 text-sm">{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Availability Status
              </h3>
              <p className="text-sm text-gray-600">
                Toggle to show/hide your profile from patient searches
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
              />
              <motion.div
                whileTap={{ scale: 0.95 }}
                className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"
              ></motion.div>
              <span className="ml-3 text-sm font-medium text-gray-900">
                {isAvailable ? "Available" : "Unavailable"}
              </span>
            </label>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-lg p-6 space-y-6"
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {daysOfWeek.map((day, dayIndex) => (
              <motion.div
                key={day}
                variants={itemVariants}
                className="border-b last:border-b-0 pb-6 last:pb-0"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 capitalize">
                    {day}
                  </h3>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => addTimeSlot(day)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Slot
                    </motion.button>
                    {availability[day].length > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => copyToAllDays(day)}
                        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm"
                      >
                        Copy to All
                      </motion.button>
                    )}
                  </div>
                </div>

                {availability[day].length === 0 ? (
                  <p className="text-gray-500 text-sm italic">Not available</p>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {availability[day].map((slot, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex items-center gap-3"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <Clock className="w-5 h-5 text-gray-400" />
                            <motion.input
                              whileFocus={{ scale: 1.02 }}
                              type="time"
                              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                              value={slot.start}
                              onChange={(e) =>
                                updateTimeSlot(
                                  day,
                                  index,
                                  "start",
                                  e.target.value
                                )
                              }
                            />
                            <span className="text-gray-500">to</span>
                            <motion.input
                              whileFocus={{ scale: 1.02 }}
                              type="time"
                              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                              value={slot.end}
                              onChange={(e) =>
                                updateTimeSlot(
                                  day,
                                  index,
                                  "end",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.2, rotate: 10 }}
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            onClick={() => removeTimeSlot(day, index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-5 h-5" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>

          <div className="flex gap-4 pt-6 border-t">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => navigate("/nurse/dashboard")}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{
                scale: 1.02,
                boxShadow: "0 10px 30px rgba(139, 92, 246, 0.3)",
              }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-black text-white rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? "Saving..." : "Save Availability"}
            </motion.button>
          </div>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 bg-blue-50 rounded-xl p-6"
        >
          <h4 className="font-semibold text-blue-900 mb-3">Tips</h4>
          <ul className="space-y-2 text-sm text-blue-800">
            {[
              "Add multiple time slots per day if you work split shifts",
              'Use "Copy to All" to quickly set the same hours for all days',
              'Toggle "Available" off when you\'re on vacation or taking a break',
              "Update your availability regularly to get more bookings",
            ].map((tip, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-start gap-2"
              >
                <span className="font-bold">•</span>
                <span>{tip}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default NurseAvailability;
