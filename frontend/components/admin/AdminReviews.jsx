
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Trash2, User, Sparkles } from "lucide-react";
import api from "../../services/api";

const AdminReviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minRating: "",
    maxRating: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchReviews();
  }, [page, filters]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = { page, ...filters };
      Object.keys(params).forEach((key) => !params[key] && delete params[key]);

      const data = await api.getAdminReviews(params);
      if (data.success) {
        setReviews(data.reviews);
        setTotalPages(data.pages);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
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

  const handleDeleteReview = async (reviewId) => {
    if (!confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      const data = await api.deleteReview(reviewId);
      if (data.success) {
        alert("Review deleted successfully");
        fetchReviews();
      }
    } catch (error) {
      alert(error.message || "Failed to delete review");
    }
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
              <Sparkles className="w-8 h-8 text-black" />
            </motion.div>
            Manage Reviews
          </motion.h1>
          <p className="text-gray-600 mt-1">
            View and moderate platform reviews
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
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { name: "minRating", label: "Minimum Rating" },
              { name: "maxRating", label: "Maximum Rating" },
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
                <motion.select
                  whileFocus={{ scale: 1.02 }}
                  name={filter.name}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                  value={filters[filter.name]}
                  onChange={handleFilterChange}
                >
                  <option value="">All</option>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} Star{rating > 1 ? "s" : ""}
                    </option>
                  ))}
                </motion.select>
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
                className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full mx-auto"
              />
            </motion.div>
          ) : reviews.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-12 bg-white rounded-xl"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              </motion.div>
              <p className="text-gray-500">No reviews found</p>
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
                {reviews.map((review) => (
                  <motion.div
                    key={review._id}
                    variants={itemVariants}
                    whileHover={{
                      y: -5,
                      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
                    }}
                    className="bg-white rounded-xl shadow-lg p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: i * 0.1, type: "spring" }}
                            >
                              <Star
                                className={`w-5 h-5 ${i < review.rating
                                    ? "text-yellow-500 fill-current"
                                    : "text-gray-300"
                                  }`}
                              />
                            </motion.div>
                          ))}
                          <span className="text-lg font-bold text-gray-900 ml-2">
                            {review.rating}/5
                          </span>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600 mb-3">
                          <motion.div
                            whileHover={{ x: 5 }}
                            className="flex items-center gap-2"
                          >
                            <User className="w-4 h-4" />
                            <span>
                              Patient: {review.patientId?.email || "N/A"}
                            </span>
                          </motion.div>
                          <motion.div
                            whileHover={{ x: 5 }}
                            className="flex items-center gap-2"
                          >
                            <User className="w-4 h-4" />
                            <span>Nurse: {review.nurseId?.email || "N/A"}</span>
                          </motion.div>
                        </div>

                        <p className="text-gray-700 leading-relaxed mb-3">
                          {review.comment}
                        </p>

                        {review.categories && (
                          <div className="flex flex-wrap gap-4 text-sm">
                            {Object.entries(review.categories).map(
                              ([key, value]) =>
                                value ? (
                                  <motion.div
                                    key={key}
                                    whileHover={{ scale: 1.1 }}
                                    className="flex items-center gap-1"
                                  >
                                    <span className="text-gray-600">
                                      {key.charAt(0).toUpperCase() +
                                        key.slice(1)}
                                      :
                                    </span>
                                    <span className="font-semibold">
                                      {value}/5
                                    </span>
                                  </motion.div>
                                ) : null
                            )}
                          </div>
                        )}

                        <div className="text-xs text-gray-500 mt-3 pt-3 border-t">
                          {new Date(review.createdAt).toLocaleString()}
                          {review.isVerified && (
                            <motion.span
                              whileHover={{ scale: 1.1 }}
                              className="ml-3 px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                            >
                              Verified
                            </motion.span>
                          )}
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteReview(review._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete Review"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
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

export default AdminReviews;
