
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  DollarSign,
  MapPin,
  Briefcase,
  Award,
  Calendar,
  User,
  Sparkles,
} from "lucide-react";
import api from "../../services/api";

const NurseDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [nurse, setNurse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNurseDetails();
  }, [id]);

  const fetchNurseDetails = async () => {
    try {
      const data = await api.getNurseDetails(id);
      if (data.success) {
        setNurse(data.nurse);
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error("Error fetching nurse details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full"
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
          <p className="text-gray-500 mb-4">Nurse not found</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/patient/search")}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg"
          >
            Back to Search
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
            onClick={() => navigate("/patient/search")}
            className="text-purple-600 hover:text-purple-700 mb-4"
          >
            ← Back to Search
          </motion.button>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            <motion.div
              whileHover={{ boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)" }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="text-center mb-6">
                
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                  className="mx-auto mb-4"
                >
                  {nurse.profileImage ? (
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-200 shadow-lg mx-auto">
                      <img
                        src={nurse.profileImage}
                        alt={nurse.fullName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <div
                        className="w-32 h-32 bg-purple-100 rounded-full flex items-center justify-center"
                        style={{ display: "none" }}
                      >
                        <User className="w-16 h-16 text-purple-600" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-purple-100 rounded-full flex items-center justify-center mx-auto border-4 border-purple-200 shadow-lg">
                      <User className="w-16 h-16 text-purple-600" />
                    </div>
                  )}
                </motion.div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {nurse.fullName}
                </h2>
                <p className="text-gray-600 mb-4">{nurse.specialization}</p>

                <div className="flex items-center justify-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          i < Math.round(nurse.rating || 0)
                            ? "text-yellow-500 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    </motion.div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-bold">
                    {nurse.rating || 0}
                  </span>
                  <span className="text-gray-500">
                    ({nurse.totalReviews || 0} reviews)
                  </span>
                </div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center justify-center gap-2 text-lg font-semibold text-green-600 my-6"
                >
                  <DollarSign className="w-5 h-5" />
                  <span>${nurse.hourlyRate}/hour</span>
                </motion.div>

                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 10px 30px rgba(139, 92, 246, 0.3)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/patient/book/${id}`)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
                >
                  Book Appointment
                </motion.button>
              </div>

              <div className="border-t pt-6 space-y-3">
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3 text-gray-600"
                >
                  <MapPin className="w-5 h-5 flex-shrink-0" />
                  <span>
                    {nurse.address?.city
                      ? `${nurse.address.city}, ${nurse.address.state || ""}`
                      : "Location not specified"}
                  </span>
                </motion.div>
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3 text-gray-600"
                >
                  <Briefcase className="w-5 h-5 flex-shrink-0" />
                  <span>{nurse.yearsOfExperience || 0} years experience</span>
                </motion.div>
              </div>
            </motion.div>

            {nurse.services && nurse.services.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)" }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Services Offered
                </h3>
                <div className="space-y-2">
                  {nurse.services.map((service, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-2"
                    >
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      <span className="text-gray-700">{service}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {nurse.languages && nurse.languages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)" }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Languages
                </h3>
                <div className="flex flex-wrap gap-2">
                  {nurse.languages.map((language, index) => (
                    <motion.span
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      whileHover={{ scale: 1.1 }}
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                    >
                      {language}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-6"
          >
            <motion.div
              whileHover={{ boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)" }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </motion.div>
                About
              </h3>
              {nurse.bio ? (
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {nurse.bio}
                </p>
              ) : (
                <p className="text-gray-500 italic">No bio provided</p>
              )}
            </motion.div>

            {nurse.certifications && nurse.certifications.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)" }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-6 h-6 text-purple-600" />
                  Certifications
                </h3>
                <div className="space-y-4">
                  {nurse.certifications.map((cert, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ x: 5 }}
                      className="border-l-4 border-purple-600 pl-4"
                    >
                      <h4 className="font-semibold text-gray-900">
                        {cert.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {cert.issuingOrganization}
                      </p>
                      {cert.issueDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          Issued:{" "}
                          {new Date(cert.issueDate).toLocaleDateString()}
                          {cert.expiryDate &&
                            ` | Expires: ${new Date(
                              cert.expiryDate
                            ).toLocaleDateString()}`}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{ boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)" }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Patient Reviews
              </h3>

              {reviews.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-500 text-center py-8"
                >
                  No reviews yet
                </motion.p>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-6"
                >
                  {reviews.map((review) => (
                    <motion.div
                      key={review._id}
                      variants={itemVariants}
                      whileHover={{ x: 5 }}
                      className="border-b last:border-b-0 pb-6 last:pb-0"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-5 h-5 ${
                                  i < review.rating
                                    ? "text-yellow-500 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {review.comment}
                      </p>

                      {review.categories && (
                        <div className="flex flex-wrap gap-4 mt-4 text-sm">
                          {Object.entries(review.categories).map(
                            ([key, value]) =>
                              value ? (
                                <motion.div
                                  key={key}
                                  whileHover={{ scale: 1.1 }}
                                  className="flex items-center gap-1"
                                >
                                  <span className="text-gray-600">
                                    {key.charAt(0).toUpperCase() + key.slice(1)}
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
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default NurseDetails;
