// src/services/api.js

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4500";

class ApiService {
  constructor() {
    this.token = null;
    console.log("✅ ApiService initialized with URL:", API_URL);
  }

  setToken(token) {
    this.token = token;
    console.log("🔑 Token set in ApiService");
  }

  getToken() {
    return this.token;
  }

  clearToken() {
    this.token = null;
    console.log("🗑️ Token cleared from ApiService");
  }

  async request(endpoint, options = {}) {
    console.log("📡 Making request to:", `${API_URL}${endpoint}`);

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);
      const data = await response.json();

      console.log("📥 Response:", {
        success: data.success,
        status: response.status,
      });

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      return data;
    } catch (error) {
      console.error("❌ API Error:", error);
      throw error;
    }
  }

  // ==================== AUTH ====================
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

    if (result.success && result.token) {
      this.setToken(result.token);
    }

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
    const result = await this.request("/api/auth/logout", { method: "POST" });
    this.clearToken();
    return result;
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

  // ==================== PATIENT ====================
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

  // ==================== NURSE ====================
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

  // ==================== ADMIN ====================
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

  // ==================== NOTIFICATIONS ====================
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

  // ==================== PAYMENTS ====================
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

// Create and export a single instance
const apiInstance = new ApiService();

// Also export the class for testing if needed
export { ApiService };

// Default export
export default apiInstance;
