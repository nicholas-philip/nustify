
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, AlertCircle, CheckCircle, Sparkles } from "lucide-react";
import api from "../../services/api";

const SubmitReview = () => {
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    rating: 0,
    comment: "",
    categories: {
      professionalism: 0,
      punctuality: 0,
      communication: 0,
      care: 0,
      hygiene: 0,
      protocol: 0
    },
  });

  useEffect(() => {
    fetchAppointment();
  }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      const data = await api.getPatientAppointments();
      if (data.success) {
        const apt = data.appointments.find((a) => a._id === appointmentId);
        if (apt && apt.status === "completed") {
          setAppointment(apt);
        } else {
          setError("Appointment not found or not completed");
        }
      }
    } catch (error) {
      console.error("Error fetching appointment:", error);
      setError("Failed to load appointment");
    } finally {
      setLoading(false);
    }
  };

  const handleRatingClick = (rating) => {
    setFormData({ ...formData, rating });
  };

  const handleCategoryRating = (category, rating) => {
    setFormData({
      ...formData,
      categories: {
        ...formData.categories,
        [category]: rating,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.rating === 0) {
      setError("Please select an overall rating");
      return;
    }


    const categoriesRated = Object.values(formData.categories).some(
      (cat) => cat > 0
    );
    if (!categoriesRated) {
      setError("Please rate at least one category");
      return;
    }

    setError("");
    setSubmitting(true);

    try {

      const filteredCategories = {};
      Object.entries(formData.categories).forEach(([key, value]) => {
        if (value >= 1) {
          filteredCategories[key] = value;
        }
      });

      const reviewData = {
        nurseId: appointment.nurseId._id || appointment.nurseId,
        appointmentId: appointmentId,
        rating: formData.rating,
        comment: formData.comment,
        categories: filteredCategories,
      };

      const data = await api.submitReview(reviewData);

      if (data.success) {
        alert("Review submitted successfully!");
        navigate("/patient/appointments");
      }
    } catch (err) {
      setError(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const RatingStars = ({ value, onChange, label }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className="focus:outline-none transition"
          >
            <motion.div
              animate={value >= star ? { rotate: [0, 360] } : {}}
              transition={{ duration: 0.5 }}
            >
              <Star
                className={`w-8 h-8 ${star <= value
                  ? "text-yellow-500 fill-current"
                  : "text-gray-300"
                  } hover:text-yellow-400`}
              />
            </motion.div>
          </motion.button>
        ))}
      </div>
    </div>
  );

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

  if (!appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <p className="text-gray-500 mb-4">
            {error || "Appointment not found"}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/patient/appointments")}
            className="px-6 py-2 bg-black text-white rounded-full shadow-lg"
          >
            Back to Appointments
          </motion.button>
        </motion.div>
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
            onClick={() => navigate("/patient/appointments")}
            className="text-black hover:text-gray-900 mb-4"
          >
            ← Back to Appointments
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
            Leave a Review
          </motion.h1>
          <p className="text-gray-600 mt-1">
            Share your experience with this specialist
          </p>
        </div>
      </motion.div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)" }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <h3 className="font-semibold text-gray-900 mb-2">
            Appointment Details
          </h3>
          <p className="text-gray-600">{appointment.serviceType}</p>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(appointment.appointmentDate).toLocaleDateString()} at{" "}
            {appointment.startTime}
          </p>
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
          <motion.div variants={itemVariants}>
            <RatingStars
              value={formData.rating}
              onChange={handleRatingClick}
              label="Overall Rating *"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-gray-500 mt-2"
            >
              {formData.rating === 0 && "Please select a rating"}
              {formData.rating === 1 && "Poor"}
              {formData.rating === 2 && "Fair"}
              {formData.rating === 3 && "Good"}
              {formData.rating === 4 && "Very Good"}
              {formData.rating === 5 && "Excellent"}
            </motion.p>
          </motion.div>

          <motion.div variants={itemVariants} className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Rate by Category
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { key: "professionalism", label: "Professionalism" },
                { key: "punctuality", label: "Punctuality" },
                { key: "communication", label: "Communication" },
                { key: "care", label: "Quality of Care" },
                { key: "hygiene", label: "Hygiene & Safety" },
                { key: "protocol", label: "Protocol Adherence" },
              ].map((category, index) => (
                <motion.div
                  key={category.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <RatingStars
                    value={formData.categories[category.key]}
                    onChange={(rating) =>
                      handleCategoryRating(category.key, rating)
                    }
                    label={category.label}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="border-t pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review *
            </label>
            <motion.textarea
              whileFocus={{ scale: 1.02 }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
              rows="6"
              placeholder="Share your experience... What did you like? What could be improved?"
              value={formData.comment}
              onChange={(e) =>
                setFormData({ ...formData, comment: e.target.value })
              }
              required
              maxLength="1000"
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.comment.length}/1000 characters
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex gap-4 pt-6 border-t"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => navigate("/patient/appointments")}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition shadow-sm"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{
                scale: 1.02,
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
              }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting || formData.rating === 0}
              className="flex-1 px-6 py-3 bg-black text-white rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </motion.button>
          </motion.div>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-6 bg-blue-50 rounded-xl p-6"
        >
          <h4 className="font-semibold text-blue-900 mb-3">
            Review Guidelines
          </h4>
          <ul className="space-y-2 text-sm text-blue-800">
            {[
              "Be honest and constructive in your feedback",
              "Focus on your personal experience with the service",
              "Avoid sharing personal medical information",
              "Be respectful and professional",
            ].map((guideline, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="flex items-start gap-2"
              >
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{guideline}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default SubmitReview;
