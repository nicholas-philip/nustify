const getApiUrl = () => {
  // 1. If we are running in a browser
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;

    // A. Local Machine (Laptop)
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:4500";
    }

    // B. Local Area Network (Phone testing on same Wi-Fi)
    // This matches the IP address from your 'ipconfig' (172.20.10.3)
    if (hostname === "172.20.10.3") {
      return "http://172.20.10.3:4500";
    }

    // C. Production (Render Deployment)
    // If you are on the render website, use the render backend
    if (hostname.includes("onrender.com") || hostname.includes("vercel.app")) {
      return "https://nustify-backend.onrender.com";
    }
  }

  // Fallback to environment variable or localhost
  return import.meta.env.VITE_API_URL || "http://localhost:4500";
};

const API_URL = getApiUrl();

class ApiService {
  constructor() {
    this.token =
      sessionStorage.getItem("token") || localStorage.getItem("token");
    console.log("✅ ApiService initialized with URL:", API_URL);
    console.log(
      "🔑 Initial token from localStorage:",
      this.token ? "EXISTS" : "NONE"
    );
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem("token", token);
    try {
      sessionStorage.removeItem("token");
    } catch (e) { }
    console.log("🔑 Token set in ApiService and localStorage");
  }

  setSessionToken(token) {
    this.token = token;
    sessionStorage.setItem("token", token);
    console.log("🔑 Session token set for this tab only");
  }

  getToken() {
    if (!this.token) {
      this.token =
        sessionStorage.getItem("token") || localStorage.getItem("token");
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    try {
      localStorage.removeItem("token");
    } catch (e) { }
    try {
      sessionStorage.removeItem("token");
    } catch (e) { }
    console.log(
      "🗑️ Token cleared from ApiService, localStorage and sessionStorage"
    );
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async request(endpoint, options = {}) {
    const fullUrl = `${API_URL}${endpoint}`;
    console.log("📡 Making request to:", fullUrl);

    const headers = {};

    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const currentToken = this.getToken();
    if (currentToken) {
      headers["Authorization"] = `Bearer ${currentToken}`;
      console.log("🔑 Authorization header added");
    } else {
      console.warn("⚠️ No token available for request");
    }

    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    const config = {
      ...options,
      headers,
    };

    console.log("📋 Request headers:", headers);

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);

      console.log("📊 Response status:", response.status);
      console.log("📊 Response ok:", response.ok);

      let data;
      try {
        data = await response.json();
        console.log("📥 Response data:", data);
      } catch (parseError) {
        console.error("❌ Failed to parse JSON:", parseError);
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        const errorMessage =
          data.message || `Request failed with status ${response.status}`;
        console.error("❌ Request failed:", errorMessage);
        console.error("❌ Server Response Data:", data); // Log full data to see requestedUrl
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error("❌ API Error:", error);
      console.error("❌ Error details:", {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  registerNurse = (data) => {
    console.log("🏥 Registering nurse...");
    return this.request("/api/auth/register/nurse", {
      method: "POST",
      body: JSON.stringify(data),
    });
  };

  registerPatient = (data) => {
    console.log("👤 Registering patient...");
    return this.request("/api/auth/register/patient", {
      method: "POST",
      body: JSON.stringify(data),
    });
  };

  async login(data) {
    console.log("🔐 Logging in...");
    const result = await this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return result;
  }

  verifyEmail = (token) => {
    console.log("✉️ Verifying email...");
    return this.request(`/api/auth/verify-email/${token}`);
  };

  verifyEmailByCode = (data) => {
    console.log("✉️ Verifying email by code...");
    return this.request(`/api/auth/verify-email-code`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  };

  resendVerification = (data) => {
    console.log("📧 Resending verification email...");
    return this.request("/api/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify(data),
    });
  };

  getMe = () => {
    return this.request("/api/auth/me");
  };

  logout = async () => {
    try {
      if (this.token) {
        const result = await this.request("/api/auth/logout", {
          method: "POST",
        });
        console.log("✅ Logout API successful");
        this.clearToken();
        return result;
      } else {
        console.log("⚠️ No token to logout, clearing locally");
        this.clearToken();
        return { success: true };
      }
    } catch (error) {
      console.warn(
        "⚠️ Logout API failed, clearing token locally:",
        error.message
      );
      this.clearToken();
      return { success: true };
    }
  };

  logoutAll = async () => {
    console.log("🔐 Logging out from all devices...");
    try {
      const result = await this.request("/api/auth/logout-all", {
        method: "POST",
      });
      console.log("✅ Logout all devices successful");
      this.clearToken();
      return result;
    } catch (error) {
      console.error("❌ Logout all failed:", error.message);
      this.clearToken();
      throw error;
    }
  };

  verify2FA = (data) => {
    console.log("🔐 Verifying 2FA code...");
    return this.request("/api/auth/verify-2fa", {
      method: "POST",
      body: JSON.stringify(data),
    });
  };

  toggle2FA = () => {
    console.log("🔐 Toggling 2FA...");
    return this.request("/api/auth/toggle-2fa", {
      method: "PUT",
    });
  };

  changePassword = (data) => {
    return this.request("/api/auth/change-password", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  };

  forgotPassword = (data) => {
    return this.request("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  };

  resetPassword = (token, data) => {
    return this.request(`/api/auth/reset-password/${token}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  };

  getPatientDashboard() {
    return this.request("/api/patient/dashboard");
  }

  searchNurses(params) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/patient/nurses/search?${queryString}`);
  }

  getNurseDetails(id) {
    return this.request(`/api/patient/nurses/${id}`);
  }

  bookAppointment(data) {
    return this.request("/api/patient/appointments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  getPatientAppointments(status) {
    const params = status ? `?status=${status}` : "";
    return this.request(`/api/patient/appointments${params}`);
  }

  cancelAppointment(id, data) {
    return this.request(`/api/patient/appointments/${id}/cancel`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  updatePatientProfile(data) {
    return this.request("/api/patient/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  submitReview(data) {
    return this.request("/api/patient/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  getNurseDashboard() {
    return this.request("/api/nurse/dashboard");
  }

  getNurseAppointments(status) {
    const params = status ? `?status=${status}` : "";
    return this.request(`/api/nurse/appointments${params}`);
  }

  respondToAppointment(id, data) {
    return this.request(`/api/nurse/appointments/${id}/respond`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  completeAppointment(id, data) {
    console.log("✅ Completing appointment:", id);
    return this.request(`/api/nurse/appointments/${id}/complete`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  updateNurseProfile(data) {
    return this.request("/api/nurse/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  updateAvailability(data) {
    return this.request("/api/nurse/availability", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  addCertification(data) {
    return this.request("/api/nurse/certifications", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  getNurseReviews() {
    return this.request("/api/nurse/reviews");
  }

  async uploadNurseProfileImage(file) {
    console.log("📤 Uploading nurse profile image...");
    console.log("📁 File details:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      const result = await this.request("/api/nurse/profile/upload-image", {
        method: "POST",
        body: formData,
      });
      console.log("✅ Upload successful:", result);
      return result;
    } catch (error) {
      console.error("❌ Upload failed:", error);
      throw error;
    }
  }

  deleteNurseProfileImage() {
    console.log("🗑️ Deleting nurse profile image...");
    return this.request("/api/nurse/profile/delete-image", {
      method: "DELETE",
    });
  }

  getAdminDashboard() {
    return this.request("/api/admin/dashboard");
  }

  getUsers(params) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/users?${queryString}`);
  }

  getUserById(id) {
    return this.request(`/api/admin/users/${id}`);
  }

  updateUserStatus(id, data) {
    return this.request(`/api/admin/users/${id}/status`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  deleteUser(id) {
    return this.request(`/api/admin/users/${id}`, {
      method: "DELETE",
    });
  }

  getAdminAppointments(params) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/appointments?${queryString}`);
  }

  getAdminReviews(params) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/reviews?${queryString}`);
  }

  deleteReview(id) {
    return this.request(`/api/admin/reviews/${id}`, {
      method: "DELETE",
    });
  }

  getAnalytics(params) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/analytics?${queryString}`);
  }

  // Admin Credential Verification
  getPendingCredentials() {
    return this.request("/api/credentials/pending");
  }

  verifyCredentials(nurseId, data) {
    return this.request(`/api/credentials/verify/${nurseId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Admin Document Verification
  verifyMedicalDocument(id, data) {
    return this.request(`/api/medical-documents/${id}/verify`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  getNotifications(params) {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return this.request(`/api/notifications?${queryString}`);
  }

  markNotificationAsRead(id) {
    return this.request(`/api/notifications/${id}/read`, {
      method: "PUT",
    });
  }

  markAllNotificationsAsRead() {
    return this.request("/api/notifications/read-all", {
      method: "PUT",
    });
  }

  deleteNotification(id) {
    return this.request(`/api/notifications/${id}`, {
      method: "DELETE",
    });
  }

  clearAllNotifications() {
    return this.request("/api/notifications", {
      method: "DELETE",
    });
  }

  // Health Records
  getHealthRecords(params) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/health-records?${queryString}`);
  }

  getHealthTimeline(params) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/health-records/timeline?${queryString}`);
  }

  getHealthSummary(params) {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return this.request(`/api/health-records/summary?${queryString}`);
  }

  createHealthRecord(data) {
    return this.request("/api/health-records", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  updateHealthRecord(id, data) {
    return this.request(`/api/health-records/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  deleteHealthRecord(id) {
    return this.request(`/api/health-records/${id}`, {
      method: "DELETE",
    });
  }

  // Vital Signs
  recordVitalSigns(data) {
    return this.request("/api/vital-signs", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  getVitalSigns(params) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/vital-signs?${queryString}`);
  }

  getVitalSignsTrends(metric, days = 30) {
    return this.request(`/api/vital-signs/trends?metric=${metric}&days=${days}`);
  }

  getLatestVitalSigns() {
    return this.request("/api/vital-signs/latest");
  }

  getAbnormalVitalSigns() {
    return this.request("/api/vital-signs/abnormal");
  }

  updateVitalSigns(id, data) {
    return this.request(`/api/vital-signs/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  deleteVitalSigns(id) {
    return this.request(`/api/vital-signs/${id}`, {
      method: "DELETE",
    });
  }

  // Medical Documents
  uploadMedicalDocument(file, data) {
    console.log("📤 Uploading medical document...");
    const formData = new FormData();
    formData.append("document", file);

    // Append other data fields
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });

    return this.request("/api/medical-documents/upload", {
      method: "POST",
      body: formData,
    });
  }

  getMedicalDocuments(params) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/medical-documents?${queryString}`);
  }

  getMedicalDocument(id) {
    return this.request(`/api/medical-documents/${id}`);
  }

  deleteMedicalDocument(id) {
    return this.request(`/api/medical-documents/${id}`, {
      method: "DELETE",
    });
  }

  shareMedicalDocument(id, data) {
    return this.request(`/api/medical-documents/${id}/share`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Messaging Methods
  getConversations() {
    return this.request("/api/chat/conversations");
  }

  getChatMessages(userId) {
    return this.request(`/api/chat/${userId}`);
  }

  sendChatMessage(data) {
    return this.request("/api/chat/send", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  getChatUserInfo(userId) {
    return this.request(`/api/chat/user/${userId}`);
  }

  // Maternal Health
  createPregnancyRecord(data) {
    return this.request("/api/maternal-health", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  getPregnancyRecords() {
    return this.request("/api/maternal-health");
  }

  updatePregnancyRecord(id, data) {
    return this.request(`/api/maternal-health/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  getPregnancyTimeline(id) {
    return this.request(`/api/maternal-health/${id}/timeline`);
  }
  // Child Health
  createChildHealthRecord(data) {
    return this.request("/api/child-health", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  getChildHealthRecords() {
    return this.request("/api/child-health");
  }

  updateChildHealthRecord(id, data) {
    return this.request(`/api/child-health/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  getVaccinationSchedule(id) {
    return this.request(`/api/child-health/${id}/vaccinations`);
  }

  recordMilestone(id, data) {
    return this.request(`/api/child-health/${id}/milestone`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Credential Methods
  getCredentialStatus() {
    return this.request("/api/credentials/status");
  }

  submitCredentials(data) {
    const formData = new FormData();
    if (data.file) {
      formData.append("licenseDocument", data.file);
    }
    formData.append("licenseNumber", data.licenseNumber);
    formData.append("licenseType", data.licenseType);
    formData.append("issuingAuthority", data.issuingAuthority);
    formData.append("expiryDate", data.expiryDate);

    return this.request("/api/credentials/submit", {
      method: "POST",
      body: formData,
    });
  }

  getBadges(nurseId) {
    const endpoint = nurseId ? `/api/credentials/badges/${nurseId}` : "/api/credentials/badges";
    return this.request(endpoint);
  }

  updateTrustScore(nurseId, score) {
    const endpoint = nurseId ? `/api/credentials/trust-score/${nurseId}` : "/api/credentials/trust-score";
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify({ trustScore: score }),
    });
  }
}

const apiInstance = new ApiService();

if (typeof window !== "undefined") {
  try {
    window.apiService = apiInstance;
  } catch (e) {
    console.warn("Could not attach apiService to window:", e);
  }
}

export { ApiService };
export default apiInstance;
