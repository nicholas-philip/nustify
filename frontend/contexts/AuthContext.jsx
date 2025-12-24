import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionToken = sessionStorage.getItem("token");
    const localToken = localStorage.getItem("token");
    console.log(
      "🔄 AuthProvider mounted, sessionToken exists:",
      !!sessionToken,
      "localToken exists:",
      !!localToken
    );
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    const sessionToken = sessionStorage.getItem("token");
    const localToken = localStorage.getItem("token");
    const token = sessionToken || localToken;
    console.log("🔍 Checking for token: ", token ? "EXISTS" : "NONE");

    if (!token) {
      console.log("❌ No token found, user not authenticated");
      setLoading(false);
      return;
    }

    try {
      console.log("🔄 Initializing auth with token...");

      if (sessionToken) {
        api.setSessionToken(sessionToken);
        console.log("✅ Session token set in API service");
      } else {
        api.setToken(localToken);
        console.log("✅ Local token set in API service");
      }

      const data = await api.getMe();
      console.log("📥 getMe response:", data);

      if (data.success) {
        console.log("✅ Auth initialized successfully");
        console.log("👤 User:", data.user.role);
        console.log("📧 Email verified:", data.user.isVerified);
        setUser(data.user);
        setProfile(data.profile);
      } else {
        console.log("❌ Auth failed, clearing token");
        await logout();
      }
    } catch (error) {
      console.error("❌ Auth initialization error:", error);
      console.error("Error details:", error.message);
      await logout();
    } finally {
      setLoading(false);
      console.log("✅ Auth initialization complete");
    }
  };

  const login = async (newToken, userData = {}) => {
    console.log("🔐 Login called");
    console.log("Token:", newToken ? "EXISTS" : "NONE");
    console.log("User data:", userData);

    const sessionPreference = userData?.session || false;

    if (sessionPreference) {
      try {
        sessionStorage.setItem("token", newToken);
      } catch (e) {
        console.error("Error saving token to sessionStorage:", e);
      }
      api.setSessionToken(newToken);
      console.log("✅ Session token saved for this tab");
    } else {
      try {
        localStorage.setItem("token", newToken);
      } catch (e) {}
      api.setToken(newToken);
      console.log("✅ Token saved to localStorage");
    }

    const safeUser = { ...userData };
    delete safeUser.session;
    setUser(safeUser);
    console.log("✅ User state updated");

    try {
      await refreshUser();
    } catch (error) {
      console.error("Warning: Could not fetch full profile:", error);
    }
  };

  const logout = async () => {
    console.log("🚪 Logout called");

    setUser(null);
    setProfile(null);
    console.log("✅ User state cleared immediately");

    try {
      await api.logout();
      console.log("✅ Logout API call successful");
    } catch (error) {
      console.error("⚠️ Logout API error (ignoring):", error.message);
    }

    try {
      localStorage.removeItem("token");
    } catch (e) {
      console.error("Error clearing token from localStorage:", e);
    }
    try {
      sessionStorage.removeItem("token");
    } catch (e) {
      console.error("Error clearing token from sessionStorage:", e);
    }
    api.clearToken();
    console.log("✅ Token cleared from storage (local + session)");
  };

  const refreshUser = async () => {
    console.log("🔄 Refreshing user profile...");

    try {
      const data = await api.getMe();
      console.log("📥 Refresh response:", data);

      if (data.success) {
        console.log("✅ Profile refreshed successfully");
        setUser(data.user);
        setProfile(data.profile);
        return data;
      } else {
        throw new Error("Failed to refresh user");
      }
    } catch (error) {
      console.error("❌ Error refreshing user:", error);
      throw error;
    }
  };

  const value = {
    user,
    profile,
    loading,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    isVerified: user?.isVerified || false,
  };

  console.log("📊 Auth state:", {
    user: user?.email || "none",
    role: user?.role || "none",
    loading,
    isAuthenticated: !!user,
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
