
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Phone,
  MapPin,
  DollarSign,
  Briefcase,
  Save,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Camera,
  Upload,
  X,
  Loader,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

const NurseProfile = () => {
  const navigate = useNavigate();
  const { profile, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    specialization: "",
    yearsOfExperience: "",
    bio: "",
    hourlyRate: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
    services: "",
    languages: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState(profile?.profileImage || "");

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        phone: profile.phone || "",
        specialization: profile.specialization || "",
        yearsOfExperience: profile.yearsOfExperience || "",
        bio: profile.bio || "",
        hourlyRate: profile.hourlyRate || "",
        address: {
          street: profile.address?.street || "",
          city: profile.address?.city || "",
          state: profile.address?.state || "",
          country: profile.address?.country || "",
          postalCode: profile.address?.postalCode || "",
        },
        services: profile.services?.join(", ") || "",
        languages: profile.languages?.join(", ") || "",
      });
      setPreviewImage(profile.profileImage || "");
      setLoading(false);
    }
  }, [profile]);

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

  
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("📁 Selected file:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPG, PNG, WEBP)");
      return;
    }

    
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    try {
      setUploadingImage(true);
      setError("");

      console.log("🚀 Starting upload...");
      const data = await api.uploadNurseProfileImage(file);
      console.log("✅ Upload response:", data);

      if (data.success) {
        setPreviewImage(data.imageUrl);
        setSuccess("Profile picture updated successfully! ✨");
        await refreshUser();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        throw new Error(data.message || "Upload failed");
      }
    } catch (err) {
      console.error("❌ Upload error:", err);
      const errorMsg =
        err.message || err.toString() || "Failed to upload image";
      setError(`Upload failed: ${errorMsg}`);

      
      console.error("Full error details:", {
        message: err.message,
        stack: err.stack,
        error: err,
      });
    } finally {
      setUploadingImage(false);
    }
  };

  
  const handleDeleteImage = async () => {
    if (
      !window.confirm("Are you sure you want to remove your profile picture?")
    ) {
      return;
    }

    try {
      setUploadingImage(true);
      setError("");

      const data = await api.deleteNurseProfileImage();

      if (data.success) {
        setPreviewImage("");
        setSuccess("Profile picture removed successfully!");
        await refreshUser();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      const errorMsg =
        err.message || err.toString() || "Failed to delete image";
      setError(`Delete failed: ${errorMsg}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const updateData = {
        ...formData,
        services: formData.services
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        languages: formData.languages
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean),
      };

      const data = await api.updateNurseProfile(updateData);

      if (data.success) {
        setSuccess("Profile updated successfully!");
        await refreshUser();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError(err.message || "Failed to update profile");
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
          className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full"
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
            My Profile
          </motion.h1>
          <p className="text-gray-600 mt-1">
            Manage your professional information
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
              <div className="flex-1">
                <p className="text-red-800 text-sm font-medium">Upload Error</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                <p className="text-red-600 text-xs mt-2">
                  Check browser console (F12) for more details
                </p>
              </div>
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

        <motion.form
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          
          <motion.div
            variants={itemVariants}
            whileHover={{ boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)" }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-purple-600" />
              Profile Picture
            </h2>

            <div className="flex flex-col md:flex-row items-center gap-6">
              
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100 border-4 border-purple-200 shadow-lg"
                >
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error("❌ Image failed to load:", previewImage);
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <User className="w-16 h-16" />
                    </div>
                  )}
                </motion.div>

                {uploadingImage && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center"
                  >
                    <Loader className="w-8 h-8 text-white animate-spin" />
                  </motion.div>
                )}
              </div>

              
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-3">
                  Upload a professional photo to help patients recognize you.
                  Accepted formats: JPG, PNG, WEBP. Maximum size: 5MB.
                </p>

                <div className="flex flex-wrap gap-3">
                  <motion.label
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 5px 15px rgba(139, 92, 246, 0.3)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-4 py-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 flex items-center gap-2 ${
                      uploadingImage ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    {previewImage ? "Change Photo" : "Upload Photo"}
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageChange}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </motion.label>

                  {previewImage && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDeleteImage}
                      disabled={uploadingImage}
                      type="button"
                      className={`px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2 ${
                        uploadingImage ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <X className="w-4 h-4" />
                      Remove
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          
          <motion.div
            variants={itemVariants}
            whileHover={{ boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)" }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-600" />
              Basic Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  name="fullName"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="tel"
                  name="phone"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </motion.div>

          
          <motion.div
            variants={itemVariants}
            whileHover={{ boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)" }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-600" />
              Professional Information
            </h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialization *
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="text"
                    name="specialization"
                    placeholder="e.g., Pediatric Nurse"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                    value={formData.specialization}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="number"
                    name="yearsOfExperience"
                    placeholder="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hourly Rate ($) *
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="number"
                  name="hourlyRate"
                  placeholder="50"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <motion.textarea
                  whileFocus={{ scale: 1.02 }}
                  name="bio"
                  placeholder="Tell patients about yourself, your experience, and what makes you unique..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                  rows="4"
                  value={formData.bio}
                  onChange={handleChange}
                  maxLength="1000"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.bio.length}/1000 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Services Offered
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  name="services"
                  placeholder="e.g., Wound Care, IV Therapy, Post-Op Care (comma separated)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                  value={formData.services}
                  onChange={handleChange}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Separate multiple services with commas
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages Spoken
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  name="languages"
                  placeholder="e.g., English, Spanish, French (comma separated)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                  value={formData.languages}
                  onChange={handleChange}
                />
              </div>
            </div>
          </motion.div>

          
          <motion.div
            variants={itemVariants}
            whileHover={{ boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)" }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-600" />
              Address
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  name="address.street"
                  placeholder="123 Main St"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                  value={formData.address.street}
                  onChange={handleChange}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { name: "city", label: "City", placeholder: "City" },
                  { name: "state", label: "State", placeholder: "State" },
                  { name: "country", label: "Country", placeholder: "Country" },
                  {
                    name: "postalCode",
                    label: "Postal Code",
                    placeholder: "12345",
                  },
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                      value={formData.address[field.name]}
                      onChange={handleChange}
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          
          <motion.div variants={itemVariants} className="flex gap-4">
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? "Saving..." : "Save Changes"}
            </motion.button>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
};

export default NurseProfile;
