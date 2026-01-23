
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  AlertCircle,
  User,
  Sparkles,
} from "lucide-react";
import api from "../../services/api";

const specializedServicesMap = {
  "Maternal Health": ["Prenatal Checkup", "Postpartum Care", "Lactation Consult", "Birth Planning"],
  "Pediatrics": ["Well-Child Visit", "Vaccination", "Sick Child Visit", "Newborn Care"],
  "Geriatrics": ["Elderly Care Assessment", "Medication Management", "Mobility Assistance"],
  "Critical Care": ["Post-ICU Monitoring", "Ventilator Care"],
  "Mental Health": ["Counseling Session", "Mental Health Assessment"],
  "Rehabilitation": ["Physical Therapy", "Post-Stroke Rehab"],
};

const BookAppointment = () => {
  const navigate = useNavigate();
  const { nurseId } = useParams();
  const [nurse, setNurse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    appointmentDate: "",
    startTime: "",
    endTime: "",
    serviceType: "",
    location: "home",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      instructions: "",
    },
    symptoms: "",
    notes: "",
    duration: 1,
  });

  useEffect(() => {
    fetchNurseDetails();
  }, [nurseId]);

  const fetchNurseDetails = async () => {
    try {
      const data = await api.getNurseDetails(nurseId);
      if (data.success) {
        setNurse(data.nurse);
      }
    } catch (error) {
      console.error("Error fetching nurse:", error);
      setError("Failed to load nurse details");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const bookingData = {
        nurseId: nurseId,
        ...formData,
      };

      const data = await api.bookAppointment(bookingData);

      if (data.success) {
        alert("Appointment request sent successfully!");
        navigate("/patient/appointments");
      }
    } catch (err) {
      setError(err.message || "Failed to book appointment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full"
        />
      </div>
    );
  }

  if (!nurse) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <p className="text-gray-500 mb-4">Specialist not found</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/patient/search")}
            className="px-6 py-2 bg-black text-white rounded-full shadow-lg"
          >
            Back to Search
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const totalCost = nurse.hourlyRate * formData.duration;

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
            onClick={() => navigate("/patient/search")}
            className="text-black hover:text-gray-900 mb-4 flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white hover:shadow-sm transition-all"
          >
            ← Back to Search
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
              <Sparkles className="w-8 h-8 text-black" />
            </motion.div>
            Book Appointment
          </motion.h1>
          <p className="text-gray-600 mt-1">Schedule your healthcare service</p>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)" }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center"
            >
              <User className="w-8 h-8 text-black" />
            </motion.div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">
                {nurse.fullName}
              </h3>
              <p className="text-gray-600">{nurse.specialization}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />${nurse.hourlyRate}/hour
                </span>
              </div>
            </div>
          </div>
        </motion.div>

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
        </AnimatePresence>

        <motion.form
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-lg p-6 space-y-6"
        >
          <motion.div
            variants={itemVariants}
            className="grid md:grid-cols-2 gap-6"
          >
            {[
              {
                name: "appointmentDate",
                label: "Appointment Date *",
                type: "date",
              },
              { name: "duration", label: "Duration (hours) *", type: "number" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type={field.type}
                  name={field.name}
                  className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-black outline-none bg-white transition-all shadow-sm"
                  value={formData[field.name]}
                  onChange={handleChange}
                  min={
                    field.type === "date"
                      ? new Date().toISOString().split("T")[0]
                      : field.type === "number"
                        ? "1"
                        : undefined
                  }
                  max={field.type === "number" ? "12" : undefined}
                  required
                />
              </div>
            ))}

            {[
              { name: "startTime", label: "Start Time *", type: "time" },
              { name: "endTime", label: "End Time *", type: "time" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type={field.type}
                  name={field.name}
                  className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-black outline-none bg-white transition-all shadow-sm"
                  value={formData[field.name]}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Type *
            </label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              name="serviceType"
              list="service-types"
              placeholder="e.g., Home Care, Post-Surgery Care"
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-black outline-none bg-white transition-all shadow-sm"
              value={formData.serviceType}
              onChange={handleChange}
              required
            />
            <datalist id="service-types">
              {(nurse?.specializations?.flatMap(spec => specializedServicesMap[spec] || []) || [])
                .concat(["Home Care", "Wound Care", "General Consultation"])
                .filter((v, i, a) => a.indexOf(v) === i)
                .map(service => (
                  <option key={service} value={service} />
                ))
              }
            </datalist>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <motion.select
              whileFocus={{ scale: 1.02 }}
              name="location"
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-black outline-none bg-white transition-all shadow-sm"
              value={formData.location}
              onChange={handleChange}
              required
            >
              {["home", "clinic", "hospital", "online"].map((loc) => (
                <option key={loc} value={loc}>
                  {loc.charAt(0).toUpperCase() +
                    loc.slice(1) +
                    (loc === "home"
                      ? " Visit"
                      : loc === "online"
                        ? " Consultation"
                        : "")}
                </option>
              ))}
            </motion.select>
          </motion.div>

          {formData.location !== "online" && (
            <motion.div variants={itemVariants} className="space-y-4">
              <h3 className="font-semibold text-gray-900">Address Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="text"
                    name="address.street"
                    placeholder="123 Main St"
                    className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-black outline-none bg-white transition-all shadow-sm"
                    value={formData.address.street}
                    onChange={handleChange}
                    required
                  />
                </div>
                {[
                  { name: "city", label: "City *", placeholder: "City" },
                  { name: "state", label: "State", placeholder: "State" },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.02 }}
                      type="text"
                      name={`address.${field.name}`}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-black outline-none bg-white transition-all shadow-sm"
                      value={formData.address[field.name]}
                      onChange={handleChange}
                      required={field.label.includes("*")}
                    />
                  </div>
                ))}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions
                  </label>
                  <motion.textarea
                    whileFocus={{ scale: 1.02 }}
                    name="address.instructions"
                    placeholder="Gate code, parking instructions, etc."
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-black outline-none bg-white transition-all shadow-sm"
                    rows="2"
                    value={formData.address.instructions}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </motion.div>
          )}

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Symptoms / Reason for Visit
            </label>
            <motion.textarea
              whileFocus={{ scale: 1.02 }}
              name="symptoms"
              placeholder="Describe your symptoms or reason for the appointment"
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-black outline-none bg-white transition-all shadow-sm"
              rows="3"
              value={formData.symptoms}
              onChange={handleChange}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <motion.textarea
              whileFocus={{ scale: 1.02 }}
              name="notes"
              placeholder="Any additional information for the professional"
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-black outline-none bg-white transition-all shadow-sm"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
            />
          </motion.div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3">Cost Summary (Cash Payment)</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Hourly Rate:</span>
                <span>${nurse.hourlyRate}/hour</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Duration:</span>
                <span>{formData.duration} hour(s)</span>
              </div>
              <div className="flex justify-between text-xl font-black text-black pt-3 border-t">
                <span>Total Cost:</span>
                <motion.span
                  key={totalCost}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                >
                  ${totalCost.toFixed(2)}
                </motion.span>
              </div>
              <p className="text-xs text-gray-500 mt-2 italic">
                * Please note: Payment must be made in cash directly to the professional at the time of service.
              </p>
            </div>
          </div>

          <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => navigate("/patient/search")}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 shadow-sm transition-all font-bold"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
              }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={submitting}
              className="px-12 py-3 bg-black text-white rounded-full font-bold disabled:opacity-50 shadow-lg hover:shadow-xl transition-all"
            >
              {submitting ? "Booking..." : "Confirm & Book (Cash)"}
            </motion.button>
          </motion.div>
        </motion.form>
      </div>
    </div >
  );
};

export default BookAppointment;
