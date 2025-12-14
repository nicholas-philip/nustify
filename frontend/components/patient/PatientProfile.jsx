// src/components/patient/PatientProfile.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Phone,
  Heart,
  AlertTriangle,
  MapPin,
  Save,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Calendar,
  Droplet,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

const PatientProfile = () => {
  const navigate = useNavigate();
  const { profile, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    medicalHistory: "",
    allergies: "",
    currentMedications: "",
    emergencyContact: {
      name: "",
      phone: "",
      relationship: "",
    },
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        phone: profile.phone || "",
        dateOfBirth: profile.dateOfBirth
          ? new Date(profile.dateOfBirth).toISOString().split("T")[0]
          : "",
        gender: profile.gender || "",
        bloodGroup: profile.bloodGroup || "",
        medicalHistory: profile.medicalHistory || "",
        allergies: profile.allergies || "",
        currentMedications: profile.currentMedications || "",
        emergencyContact: {
          name: profile.emergencyContact?.name || "",
          phone: profile.emergencyContact?.phone || "",
          relationship: profile.emergencyContact?.relationship || "",
        },
        address: {
          street: profile.address?.street || "",
          city: profile.address?.city || "",
          state: profile.address?.state || "",
          country: profile.address?.country || "",
          postalCode: profile.address?.postalCode || "",
        },
      });
      setLoading(false);
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("emergencyContact.")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        emergencyContact: {
          ...formData.emergencyContact,
          [field]: value,
        },
      });
    } else if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [field]: value,
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
    setSuccess("");
    setSaving(true);

    try {
      const data = await api.updatePatientProfile(formData);

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
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b"
      >
        <div className="max-w-5xl mx-auto px-4 py-6">
          <motion.button
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/patient/dashboard")}
            className="text-purple-600 hover:text-purple-700 mb-3 text-sm font-medium"
          >
            ← Back to Dashboard
          </motion.button>
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-7 h-7 text-purple-600" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              <p className="text-sm text-gray-600">
                Manage your personal and medical information
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3 shadow-sm"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg flex items-start gap-3 shadow-sm"
            >
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-800 text-sm font-medium">{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.form
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit}
        >
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
                  <div className="flex items-center gap-2 text-white">
                    <User className="w-5 h-5" />
                    <h2 className="text-lg font-semibold">Basic Information</h2>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      {
                        name: "fullName",
                        label: "Full Name",
                        icon: User,
                        required: true,
                      },
                      {
                        name: "phone",
                        label: "Phone Number",
                        icon: Phone,
                        type: "tel",
                        required: true,
                      },
                      {
                        name: "dateOfBirth",
                        label: "Date of Birth",
                        icon: Calendar,
                        type: "date",
                      },
                      {
                        name: "gender",
                        label: "Gender",
                        type: "select",
                        options: [
                          "",
                          "male",
                          "female",
                          "other",
                          "prefer-not-to-say",
                        ],
                      },
                      {
                        name: "bloodGroup",
                        label: "Blood Group",
                        icon: Droplet,
                        type: "select",
                        options: [
                          "",
                          "A+",
                          "A-",
                          "B+",
                          "B-",
                          "AB+",
                          "AB-",
                          "O+",
                          "O-",
                        ],
                      },
                    ].map((field) => (
                      <div
                        key={field.name}
                        className={
                          field.name === "fullName" || field.name === "phone"
                            ? ""
                            : "md:col-span-1"
                        }
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {field.label}{" "}
                          {field.required && (
                            <span className="text-red-500">*</span>
                          )}
                        </label>
                        {field.type === "select" ? (
                          <motion.select
                            whileFocus={{ scale: 1.01 }}
                            name={field.name}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                            value={formData[field.name]}
                            onChange={handleChange}
                          >
                            {field.options.map((opt, i) => (
                              <option key={i} value={opt}>
                                {opt
                                  ? opt.charAt(0).toUpperCase() +
                                    opt.slice(1).replace(/-/g, " ")
                                  : `Select ${field.label}`}
                              </option>
                            ))}
                          </motion.select>
                        ) : (
                          <div className="relative">
                            {field.icon && (
                              <field.icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            )}
                            <motion.input
                              whileFocus={{ scale: 1.01 }}
                              type={field.type || "text"}
                              name={field.name}
                              className={`w-full ${
                                field.icon ? "pl-10" : "pl-4"
                              } pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all`}
                              value={formData[field.name]}
                              onChange={handleChange}
                              required={field.required}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
                  <div className="flex items-center gap-2 text-white">
                    <Heart className="w-5 h-5" />
                    <h2 className="text-lg font-semibold">
                      Medical Information
                    </h2>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    {
                      name: "medicalHistory",
                      label: "Medical History",
                      placeholder:
                        "List any past or current medical conditions...",
                      rows: 3,
                    },
                    {
                      name: "allergies",
                      label: "Allergies",
                      placeholder:
                        "List any allergies (medications, food, etc.)...",
                      rows: 2,
                    },
                    {
                      name: "currentMedications",
                      label: "Current Medications",
                      placeholder: "List current medications and dosages...",
                      rows: 2,
                    },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                      </label>
                      <motion.textarea
                        whileFocus={{ scale: 1.01 }}
                        name={field.name}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
                        rows={field.rows}
                        value={formData[field.name]}
                        onChange={handleChange}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
                  <div className="flex items-center gap-2 text-white">
                    <MapPin className="w-5 h-5" />
                    <h2 className="text-lg font-semibold">Address</h2>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="text"
                      name="address.street"
                      placeholder="123 Main St"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                      value={formData.address.street}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { name: "city", label: "City", placeholder: "City" },
                      { name: "state", label: "State", placeholder: "State" },
                      {
                        name: "country",
                        label: "Country",
                        placeholder: "Country",
                      },
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
                          whileFocus={{ scale: 1.01 }}
                          type="text"
                          name={`address.${field.name}`}
                          placeholder={field.placeholder}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                          value={formData.address[field.name]}
                          onChange={handleChange}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Sticky */}
            <div className="lg:col-span-1">
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6"
              >
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
                  <div className="flex items-center gap-2 text-white">
                    <AlertTriangle className="w-5 h-5" />
                    <h2 className="text-lg font-semibold">Emergency Contact</h2>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { name: "name", label: "Contact Name", required: true },
                    {
                      name: "phone",
                      label: "Contact Phone",
                      type: "tel",
                      required: true,
                    },
                    {
                      name: "relationship",
                      label: "Relationship",
                      placeholder: "e.g., Spouse, Parent",
                    },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}{" "}
                        {field.required && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        type={field.type || "text"}
                        name={`emergencyContact.${field.name}`}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        value={formData.emergencyContact[field.name]}
                        onChange={handleChange}
                        required={field.required}
                      />
                    </div>
                  ))}
                </div>

                <div className="px-6 pb-6 space-y-3">
                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 10px 30px rgba(139, 92, 246, 0.3)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={saving}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {saving ? "Saving..." : "Save Changes"}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => navigate("/patient/dashboard")}
                    className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default PatientProfile;
