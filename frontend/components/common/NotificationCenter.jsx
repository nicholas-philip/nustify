import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, X, Trash2, CheckCheck, AlertCircle } from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { connectSocket, onNotification } from "../../services/socket";

const NotificationCenter = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const mounted = useRef(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  useEffect(() => {
    if (!user) return;

    mounted.current = true;
    fetchNotifications();

    connectSocket(user._id);
    onNotification((n) => {
      if (!mounted.current) return;
      setNotifications((prev) => [n, ...prev]);
      setUnreadCount((c) => c + 1);
    });

    return () => {
      mounted.current = false;
    };
  }, [user]);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getNotifications();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error("Failed to load notifications", e);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));

    try {
      const data = await api.markNotificationAsRead(id);
      if (!data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: false } : n))
        );
        setUnreadCount((c) => c + 1);
      }
    } catch (e) {
      console.error("Mark read failed", e);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: false } : n))
      );
      setUnreadCount((c) => c + 1);
    }
  };

  const markAllRead = async () => {
    if (unreadCount === 0) return;

    const prevNotifications = notifications;
    const prevCount = unreadCount;
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      const data = await api.markAllNotificationsAsRead();
      if (!data.success) {
        setNotifications(prevNotifications);
        setUnreadCount(prevCount);
      }
    } catch (e) {
      console.error("Mark all read failed", e);
      setNotifications(prevNotifications);
      setUnreadCount(prevCount);
    }
  };

  const deleteNotification = async (id) => {
    const notification = notifications.find((n) => n._id === id);
    const wasUnread = notification && !notification.isRead;

    setNotifications((prev) => prev.filter((n) => n._id !== id));
    if (wasUnread) {
      setUnreadCount((c) => Math.max(0, c - 1));
    }

    try {
      const data = await api.deleteNotification(id);
      if (!data.success) {
        setNotifications((prev) =>
          [...prev, notification].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        );
        if (wasUnread) {
          setUnreadCount((c) => c + 1);
        }
      }
    } catch (e) {
      console.error("Delete failed", e);

      setNotifications((prev) =>
        [...prev, notification].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
      );
      if (wasUnread) {
        setUnreadCount((c) => c + 1);
      }
    }
  };

  const clearAll = async () => {
    if (notifications.length === 0) return;

    if (!window.confirm("Are you sure you want to clear all notifications?")) {
      return;
    }

    const prevNotifications = notifications;
    const prevCount = unreadCount;
    setNotifications([]);
    setUnreadCount(0);

    try {
      const data = await api.clearAllNotifications();
      if (!data.success) {
        setNotifications(prevNotifications);
        setUnreadCount(prevCount);
      }
    } catch (e) {
      console.error("Clear all failed", e);

      setNotifications(prevNotifications);
      setUnreadCount(prevCount);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        new Date(date).getFullYear() !== new Date().getFullYear()
          ? "numeric"
          : undefined,
    });
  };

  const getNotificationTypeColor = (type) => {
    const colors = {
      info: "bg-blue-100 text-blue-800",
      success: "bg-green-100 text-green-800",
      warning: "bg-yellow-100 text-yellow-800",
      error: "bg-red-100 text-red-800",
    };
    return colors[type] || colors.info;
  };

  return (
    <>
      <button
        className="relative p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        onClick={() => setOpen(!open)}
        aria-label={`Notifications${
          unreadCount > 0 ? `, ${unreadCount} unread` : ""
        }`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell
          className={`w-6 h-6 ${
            unreadCount > 0 ? "text-blue-600" : "text-gray-700"
          } transition-colors`}
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full px-1 shadow-lg animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
            />

            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-2xl bg-white shadow-2xl rounded-2xl border border-gray-200 z-[9999] overflow-hidden max-h-[85vh] flex flex-col"
            >
              {}
              <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-900 text-base">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="px-2.5 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors group relative"
                      title="Mark all as read"
                      aria-label="Mark all as read"
                    >
                      <CheckCheck className="w-4 h-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors group"
                      title="Clear all notifications"
                      aria-label="Clear all notifications"
                    >
                      <Trash2 className="w-4 h-4 text-gray-600 group-hover:text-red-600 transition-colors" />
                    </button>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors ml-1"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
                    <p className="text-sm text-gray-500">
                      Loading notifications...
                    </p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                      <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      {error}
                    </p>
                    <button
                      onClick={fetchNotifications}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Try again
                    </button>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center mb-4 shadow-inner">
                      <Bell className="w-10 h-10 text-blue-400" />
                    </div>
                    <p className="text-base font-semibold text-gray-900 mb-1">
                      All caught up!
                    </p>
                    <p className="text-sm text-gray-500 max-w-xs">
                      You have no notifications right now. We'll let you know
                      when something arrives.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((n, idx) => (
                      <div
                        key={n._id}
                        className={`relative px-4 py-3.5 hover:bg-gray-50 transition-all duration-150 group ${
                          !n.isRead ? "bg-blue-50/40" : ""
                        } ${
                          idx === 0
                            ? "animate-in slide-in-from-top-2 fade-in duration-300"
                            : ""
                        }`}
                      >
                        <div className="flex gap-3">
                          {/* Unread indicator */}
                          <div className="flex-shrink-0 pt-2">
                            {!n.isRead ? (
                              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full shadow-sm animate-pulse" />
                            ) : (
                              <div className="w-2.5 h-2.5" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2 mb-1">
                              <h4 className="text-sm font-semibold text-gray-900 line-clamp-1 flex-1">
                                {n.title}
                              </h4>
                              {n.type && (
                                <span
                                  className={`px-1.5 py-0.5 text-xs font-medium rounded ${getNotificationTypeColor(
                                    n.type
                                  )}`}
                                >
                                  {n.type}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2 leading-relaxed">
                              {n.message}
                            </p>
                            <p className="text-xs text-gray-500 font-medium">
                              {getTimeAgo(n.createdAt)}
                            </p>
                          </div>

                          {/* Action buttons */}
                          <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                            {!n.isRead && (
                              <button
                                onClick={() => markRead(n._id)}
                                className="p-1.5 hover:bg-white rounded-lg shadow-sm border border-gray-200 transition-all hover:border-blue-300 hover:shadow"
                                title="Mark as read"
                                aria-label="Mark as read"
                              >
                                <Check className="w-3.5 h-3.5 text-blue-600" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(n._id)}
                              className="p-1.5 hover:bg-white rounded-lg shadow-sm border border-gray-200 transition-all hover:border-red-300 hover:shadow"
                              title="Delete notification"
                              aria-label="Delete notification"
                            >
                              <X className="w-3.5 h-3.5 text-gray-600 hover:text-red-600 transition-colors" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {notifications.length > 0 && !loading && !error && (
                <div className="px-4 py-3 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white mt-auto">
                  <button
                    onClick={() => {
                      setOpen(false);
                    }}
                    className="w-full text-sm text-blue-600 hover:text-blue-700 font-semibold py-1.5 hover:underline transition-all"
                  >
                    View all notifications →
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default NotificationCenter;
