
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
  UserCircle,
  Activity,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

const PatientProfile = () => {
  const navigate = useNavigate();
  const { profile, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");
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
        setSuccess("Profile updated successfully! ✨");
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full"
        />
      </div>
    );
  }

  const tabs = [
    { id: "personal", label: "Personal Information", icon: User },
    { id: "medical", label: "Medical History", icon: Activity },
    { id: "emergency", label: "Emergency & Safety", icon: ShieldAlert },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Premium Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b sticky top-0 z-40"
      >
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-gray-200"
            >
              {formData.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || <UserCircle />}
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{formData.fullName || "My Profile"}</h1>
              <p className="text-gray-500 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-black" />
                Individual Patient Account
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/patient/dashboard")}
              className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2 bg-black text-white rounded-xl font-bold shadow-lg shadow-gray-200 hover:bg-gray-900 disabled:opacity-50 flex items-center gap-2 transition-all"
            >
              {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? "Saving..." : "Save Profile"}
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-4 mt-8">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 font-medium"
            >
              <AlertCircle className="w-5 h-5" />
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 text-green-700 font-medium"
            >
              <CheckCircle className="w-5 h-5" />
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 sticky top-28">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id
                      ? "bg-black text-white shadow-md shadow-gray-100"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                  >
                    <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "text-white" : "text-gray-400"}`} />
                    {tab.label}
                  </button>
                ))}
              </nav>
              <div className="mt-6 pt-6 border-t border-gray-100 px-2">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Heart className="w-5 h-5 text-black" />
                  <div>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Health Score</div>
                    <div className="text-sm font-bold text-gray-900">Good Standing</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
            >
              <form onSubmit={handleSubmit} className="space-y-8">
                {activeTab === "personal" && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Details</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Full Legal Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="fullName"
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black outline-none transition-all font-medium"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            name="phone"
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black outline-none transition-all font-medium"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Date of Birth</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="date"
                            name="dateOfBirth"
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black outline-none transition-all font-medium"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Gender</label>
                        <select
                          name="gender"
                          className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black outline-none transition-all font-medium appearance-none cursor-pointer"
                          value={formData.gender}
                          onChange={handleChange}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Blood Group</label>
                        <div className="relative">
                          <Droplet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <select
                            name="bloodGroup"
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black outline-none transition-all font-medium appearance-none cursor-pointer"
                            value={formData.bloodGroup}
                            onChange={handleChange}
                          >
                            <option value="">Select Group</option>
                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                              <option key={bg} value={bg}>{bg}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100">
                      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-black" />
                        Residential Address
                      </h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Street Address</label>
                          <input
                            type="text"
                            name="address.street"
                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black outline-none transition-all font-medium"
                            placeholder="House number and street name"
                            value={formData.address.street}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            name="address.city"
                            placeholder="City"
                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black outline-none transition-all font-medium"
                            value={formData.address.city}
                            onChange={handleChange}
                          />
                          <input
                            type="text"
                            name="address.state"
                            placeholder="State / Province"
                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black outline-none transition-all font-medium"
                            value={formData.address.state}
                            onChange={handleChange}
                          />
                          <input
                            type="text"
                            name="address.postalCode"
                            placeholder="Postal Code"
                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black outline-none transition-all font-medium"
                            value={formData.address.postalCode}
                            onChange={handleChange}
                          />
                          <input
                            type="text"
                            name="address.country"
                            placeholder="Country"
                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black outline-none transition-all font-medium"
                            value={formData.address.country}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "medical" && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-black" />
                      Health Profile
                    </h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Medical History</label>
                        <textarea
                          name="medicalHistory"
                          rows="4"
                          placeholder="List any past surgeries, chronic conditions, or long-term treatments..."
                          className="w-full px-4 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black outline-none transition-all font-medium resize-none"
                          value={formData.medicalHistory}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Known Allergies</label>
                        <textarea
                          name="allergies"
                          rows="3"
                          placeholder="Food, medicine, or environmental allergies..."
                          className="w-full px-4 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black outline-none transition-all font-medium resize-none"
                          value={formData.allergies}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Current Medications</label>
                        <textarea
                          name="currentMedications"
                          rows="3"
                          placeholder="Any medicine you are currently taking with dosages..."
                          className="w-full px-4 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black outline-none transition-all font-medium resize-none"
                          value={formData.currentMedications}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "emergency" && (
                  <div className="space-y-6">
                    <div className="p-6 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-4 mb-8">
                      <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="text-red-900 font-bold">Important Information</h4>
                        <p className="text-red-700 text-sm mt-1">
                          Please ensure your emergency contact details are accurate. This information is critical for our specialists in case of unforeseen circumstances during appointments.
                        </p>
                      </div>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-6">Contact Person</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          name="emergencyContact.name"
                          className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black outline-none transition-all font-medium"
                          value={formData.emergencyContact.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          name="emergencyContact.phone"
                          className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black outline-none transition-all font-medium"
                          value={formData.emergencyContact.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Relationship</label>
                        <input
                          type="text"
                          name="emergencyContact.relationship"
                          placeholder="e.g. Spouse, Brother, Friend"
                          className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black outline-none transition-all font-medium"
                          value={formData.emergencyContact.relationship}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
