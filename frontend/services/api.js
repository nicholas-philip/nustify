const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4500";

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
    } catch (e) {}
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
    } catch (e) {}
    try {
      sessionStorage.removeItem("token");
    } catch (e) {}
    console.log(
      "🗑️ Token cleared from ApiService, localStorage and sessionStorage"
    );
  }

  async request(endpoint, options = {}) {
    console.log("📡 Making request to:", `${API_URL}${endpoint}`);

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

  createPayment(data) {
    return this.request("/api/payments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  getPayments(params) {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return this.request(`/api/payments?${queryString}`);
  }

  getPaymentById(id) {
    return this.request(`/api/payments/${id}`);
  }

  requestRefund(id, data) {
    return this.request(`/api/payments/${id}/refund`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  getPaymentStatistics() {
    return this.request("/api/payments/statistics");
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
