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
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Initialize auth on mount
  useEffect(() => {
    if (token) {
      initializeAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const initializeAuth = async () => {
    try {
      console.log("🔄 Initializing auth...");
      api.setToken(token);

      const data = await api.getMe();

      if (data.success) {
        console.log("✅ Auth initialized:", data.user.role);
        console.log("📧 Email verified:", data.user.isVerified);
        setUser(data.user);
        setProfile(data.profile);
      } else {
        console.log("❌ Auth failed, clearing token");
        logout();
      }
    } catch (error) {
      console.error("❌ Auth initialization error:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (newToken, userData) => {
    console.log("🔐 Logging in user:", userData.role);
    console.log("📧 Email verified:", userData.isVerified);

    localStorage.setItem("token", newToken);
    setToken(newToken);
    api.setToken(newToken);
    setUser(userData);

    // Fetch profile after login
    refreshUser();
  };

  const logout = async () => {
    console.log("🚪 Logging out");

    try {
      // Call logout API to blacklist token
      await api.logout();
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      setProfile(null);
      api.clearToken();
    }
  };

  const refreshUser = async () => {
    try {
      console.log("🔄 Refreshing user profile...");
      const data = await api.getMe();

      if (data.success) {
        console.log("✅ Profile refreshed");
        console.log("📧 Email verified:", data.user.isVerified);
        setUser(data.user);
        setProfile(data.profile);
        return data;
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
