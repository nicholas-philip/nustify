// src/contexts/AuthContext.jsx
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

  // Initialize auth on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("🔄 AuthProvider mounted, token exists:", !!token);
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    const token = localStorage.getItem("token");
    console.log("🔍 Checking for token:", token ? "EXISTS" : "NONE");
    console.log(
      "Token value:",
      token ? token.substring(0, 20) + "..." : "null"
    );

    if (!token) {
      console.log("❌ No token found, user not authenticated");
      setLoading(false);
      return;
    }

    try {
      console.log("🔄 Initializing auth with token...");

      // CRITICAL: Set token in API service BEFORE making request
      api.setToken(token);
      console.log("✅ Token set in API service");

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

  const login = async (newToken, userData) => {
    console.log("🔐 Login called");
    console.log("Token:", newToken ? "EXISTS" : "NONE");
    console.log("User data:", userData);

    // Store token in localStorage
    localStorage.setItem("token", newToken);
    console.log("✅ Token saved to localStorage");

    // Set token in API service
    api.setToken(newToken);
    console.log("✅ Token set in API service");

    // Set user immediately
    setUser(userData);
    console.log("✅ User state updated");

    // Fetch full profile
    try {
      await refreshUser();
    } catch (error) {
      console.error("Warning: Could not fetch full profile:", error);
      // Don't fail login if profile fetch fails
    }
  };

  const logout = async () => {
    console.log("🚪 Logout called");

    // FIRST: Clear user state immediately to prevent any API calls
    setUser(null);
    setProfile(null);
    console.log("✅ User state cleared immediately");

    try {
      // THEN: Try to call logout API (this might fail if token is already invalid)
      await api.logout();
      console.log("✅ Logout API call successful");
    } catch (error) {
      console.error("⚠️ Logout API error (ignoring):", error.message);
      // Ignore errors - we're logging out anyway
    }

    // FINALLY: Clear everything
    localStorage.removeItem("token");
    api.clearToken();
    console.log("✅ Token cleared from storage");
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
