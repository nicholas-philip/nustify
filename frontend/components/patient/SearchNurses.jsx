
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  DollarSign,
  Star,
  User,
  Calendar,
  Sparkles,
} from "lucide-react";
import api from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import headerBg from "../../src/doctors/pexels-kooldark-14438789.jpg";
import cardBg from "../../src/doctors/pexels-cristian-rojas-8460373.jpg";

const SearchNurses = () => {
  const navigate = useNavigate();
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    specialization: "",
    city: "",
    minRating: "",
    maxRate: "",
    sortBy: "rating",
  });

  useEffect(() => {
    searchNurses();
  }, []);

  const searchNurses = async () => {
    setLoading(true);
    try {
      const params = {};
      Object.keys(filters).forEach((key) => {
        if (filters[key]) params[key] = filters[key];
      });

      const data = await api.searchNurses(params);
      if (data.success) {
        setNurses(data.nurses);
      }
    } catch (error) {
      console.error("Error searching nurses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchNurses();
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <img
            src={headerBg}
            alt="Healthcare"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-4 relative z-10">
          <motion.button
            whileHover={{ x: -5 }}
            onClick={() => navigate("/patient/dashboard")}
            className="text-black mb-4"
          >
            ← Back to Dashboard
          </motion.button>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-gray-900 flex items-center gap-2"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-8 h-8 text-black" />
            </motion.div>
            Find a Nurse
          </motion.h1>
          <p className="text-gray-600 mt-1">
            Search qualified healthcare professionals
          </p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSearch}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            {[
              {
                name: "specialization",
                placeholder: "e.g., Pediatric",
                icon: User,
              },
              { name: "city", placeholder: "Enter city", icon: MapPin },
              {
                name: "maxRate",
                placeholder: "Max rate",
                icon: DollarSign,
                type: "number",
              },
              { name: "sortBy", type: "select" },
            ].map((field, index) => (
              <motion.div
                key={field.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.name === "sortBy"
                    ? "Sort By"
                    : field.placeholder.split(",")[0]}
                </label>
                {field.type === "select" ? (
                  <select
                    name={field.name}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                    value={filters[field.name]}
                    onChange={handleFilterChange}
                  >
                    <option value="rating">Highest Rated</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="experience">Most Experienced</option>
                  </select>
                ) : (
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type={field.type || "text"}
                    name={field.name}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                    value={filters[field.name]}
                    onChange={handleFilterChange}
                  />
                )}
              </motion.div>
            ))}
          </div>

          <motion.button
            whileHover={{
              scale: 1.02,
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
            }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full md:w-auto px-8 py-3 bg-black text-white rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            Search Nurses
          </motion.button>
        </motion.form>


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
          ) : nurses.length === 0 ? (
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
                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              </motion.div>
              <p className="text-gray-500 text-lg">No nurses found</p>
              <p className="text-gray-400 text-sm mt-2">
                Try adjusting your search filters
              </p>
            </motion.div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 text-gray-600"
              >
                Found {nurses.length} nurse{nurses.length !== 1 ? "s" : ""}
              </motion.div>
              <motion.div
                key="results"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {nurses.map((nurse, index) => (
                  <motion.div
                    key={nurse._id}
                    variants={itemVariants}
                    whileHover={{
                      y: -10,
                      scale: 1.02,
                      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
                    }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer"
                  >

                    <div className="relative h-32 bg-gray-200">
                      <div className="absolute inset-0 opacity-20">
                        <img
                          src={cardBg}
                          alt="Healthcare"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-12 left-6">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.3 }}
                        >
                          {nurse.profileImage ? (
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl">
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
                                className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border-4 border-white"
                                style={{ display: "none" }}
                              >
                                <User className="w-12 h-12 text-black" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                              <User className="w-12 h-12 text-black" />
                            </div>
                          )}
                        </motion.div>
                      </div>
                    </div>

                    <div className="p-6 pt-14">
                      <div className="mb-4">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">
                          {nurse.fullName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {nurse.specialization}
                        </p>
                      </div>

                      <div className="space-y-2 mb-4">
                        <motion.div
                          whileHover={{ x: 5 }}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-semibold">
                            {nurse.rating || 0}
                          </span>
                          <span className="text-gray-500">
                            ({nurse.totalReviews || 0} reviews)
                          </span>
                        </motion.div>
                        <motion.div
                          whileHover={{ x: 5 }}
                          className="flex items-center gap-2 text-sm text-gray-600"
                        >
                          <DollarSign className="w-4 h-4" />
                          <span>${nurse.hourlyRate}/hour</span>
                        </motion.div>
                        {nurse.address?.city && (
                          <motion.div
                            whileHover={{ x: 5 }}
                            className="flex items-center gap-2 text-sm text-gray-600"
                          >
                            <MapPin className="w-4 h-4" />
                            <span>{nurse.address.city}</span>
                          </motion.div>
                        )}
                      </div>

                      {nurse.bio && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {nurse.bio}
                        </p>
                      )}

                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            navigate(`/patient/nurse/${nurse._id}`)
                          }
                          className="flex-1 px-4 py-2 bg-black text-white rounded-lg"
                        >
                          View Profile
                        </motion.button>
                        <motion.button
                          whileHover={{
                            scale: 1.05,
                            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)",
                          }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navigate(`/patient/book/${nurse._id}`)}
                          className="flex-1 px-4 py-2 bg-black text-white rounded-lg"
                        >
                          Book Now
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SearchNurses;
