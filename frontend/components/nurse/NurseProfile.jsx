
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
  Plus
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import CredentialManager from "./CredentialManager";
import VerificationBadge from "../common/VerificationBadge";
import TrustScore from "../common/TrustScore";

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
    verificationStatus: "unverified",
    trustScore: 0,
    specializations: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);


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
        verificationStatus: profile.verificationStatus || "unverified",
        trustScore: profile.trustScore || 0,
        specializations: profile.specializations || [],
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
      const data = await api.uploadNurseProfileImage(file);

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
      setError(`Upload failed: ${err.message || "Failed to upload image"}`);
    } finally {
      setUploadingImage(false);
    }
  };


  const handleDeleteImage = async () => {
    if (!window.confirm("Are you sure you want to remove your profile picture?")) {
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
      setError(`Delete failed: ${err.message || "Failed to delete image"}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSpecializationKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = e.target.value.trim();
      if (value && !formData.specializations.includes(value)) {
        setFormData({
          ...formData,
          specializations: [...formData.specializations, value],
          specialization: value,
        });
        e.target.value = "";
      }
    }
  };

  const removeSpecialization = (tag) => {
    setFormData({
      ...formData,
      specializations: formData.specializations.filter((t) => t !== tag),
      specialization: formData.specializations.filter((t) => t !== tag)[0] || "",
    });
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
        specializations: formData.specializations
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
          className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full"
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
            onClick={() => navigate("/nurse/dashboard")}
            className="text-black mb-4 text-sm font-medium flex items-center gap-2"
          >
            <span>←</span> Back to Dashboard
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
            My Profile
            {formData.verificationStatus === 'verified' && (
              <VerificationBadge className="ml-2" />
            )}
          </motion.h1>
          <p className="text-gray-600 mt-1">
            Manage your professional information
          </p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-8">
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

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.form
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-black" />
                  Profile Picture
                </h2>

                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="relative">
                    <motion.div
                      className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-gray-200 shadow-lg"
                    >
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
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
                      <label
                        className={`px-4 py-2 bg-black text-white rounded-lg cursor-pointer flex items-center gap-2 ${uploadingImage ? "opacity-50 cursor-not-allowed" : ""
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
                      </label>

                      {previewImage && (
                        <button
                          onClick={handleDeleteImage}
                          disabled={uploadingImage}
                          type="button"
                          className={`px-4 py-2 bg-black text-white rounded-lg flex items-center gap-2 ${uploadingImage ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        >
                          <X className="w-4 h-4" />
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-black" />
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
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
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
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-black" />
                  Professional Information
                </h2>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specializations *
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2 p-2 border-2 border-gray-100 rounded-xl bg-white focus-within:ring-2 focus-within:ring-black focus-within:border-transparent transition-all">
                        {formData.specializations && formData.specializations.map(tag => (
                          <span key={tag} className="bg-black text-white px-2 py-1 rounded-lg text-sm flex items-center gap-1">
                            {tag}
                            <button type="button" onClick={() => removeSpecialization(tag)} className="hover:text-red-300"><X className="w-3 h-3" /></button>
                          </span>
                        ))}
                        <input
                          type="text"
                          placeholder={formData.specializations?.length > 0 ? "" : "Type & Enter (e.g. ICU)"}
                          onKeyDown={handleSpecializationKeyDown}
                          className="flex-1 min-w-[100px] outline-none bg-transparent py-1"
                        />
                      </div>
                      <input type="hidden" name="specialization" value={formData.specialization} required />
                      <p className="text-xs text-gray-500">Press Enter or Comma to add tags</p>
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
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
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
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
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
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
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
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                      value={formData.services}
                      onChange={handleChange}
                    />
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
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                      value={formData.languages}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-black" />
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
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
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
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                          value={formData.address[field.name]}
                          onChange={handleChange}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex gap-4">
                {!isEditing ? (
                  <motion.button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-6 py-2.5 bg-black text-white rounded-2xl font-semibold flex items-center justify-center gap-2"
                  >
                    <User className="w-5 h-5" />
                    Edit Profile
                  </motion.button>
                ) : (
                  <>
                    <motion.button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        // Reset form data to original profile values
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
                            verificationStatus: profile.verificationStatus || "unverified",
                            trustScore: profile.trustScore || 0,
                            specializations: profile.specializations || [],
                          });
                        }
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-6 py-2.5 bg-gray-200 text-gray-800 rounded-2xl font-semibold"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={saving}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-6 py-2.5 bg-black text-white rounded-2xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      {saving ? "Saving..." : "Save Changes"}
                    </motion.button>
                  </>
                )}
              </motion.div>
            </motion.form>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Trust Score</h3>
              <TrustScore score={formData.trustScore} />
              <div className="mt-4 text-sm text-gray-500 text-center">
                Complete your profile, verify your license, and get positive reviews to increase your score.
              </div>
            </motion.div>

            <CredentialManager />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseProfile;
