
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  Sparkles,
} from "lucide-react";
import api from "../../services/api";

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: "",
    isVerified: "",
    isActive: "",
    search: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [page, filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, ...filters };
      Object.keys(params).forEach((key) => !params[key] && delete params[key]);

      const data = await api.getUsers(params);
      if (data.success) {
        setUsers(data.users);
        setTotalPages(data.pages);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
    setPage(1);
  };

  const handleToggleStatus = async (userId, field, currentValue) => {
    if (
      !confirm(
        `Are you sure you want to ${currentValue ? "deactivate" : "activate"
        } this user?`
      )
    ) {
      return;
    }

    try {
      const data = await api.updateUserStatus(userId, {
        [field]: !currentValue,
      });
      if (data.success) {
        fetchUsers();
      }
    } catch (error) {
      alert(error.message || "Failed to update user status");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const data = await api.deleteUser(userId);
      if (data.success) {
        alert("User deleted successfully");
        fetchUsers();
      }
    } catch (error) {
      alert(error.message || "Failed to delete user");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
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
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/admin/dashboard")}
            className="text-black hover:text-purple-700 mb-4"
          >
            ← Back to Dashboard
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
            Manage Users
          </motion.h1>
          <p className="text-gray-600 mt-1">
            View and manage all platform users
          </p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="grid md:grid-cols-4 gap-4">
            {[
              {
                name: "search",
                label: "Search",
                placeholder: "Search by email...",
                type: "text",
              },
              {
                name: "role",
                label: "Role",
                options: ["All Roles", "Patient", "Nurse", "Admin"],
              },
              {
                name: "isVerified",
                label: "Verified",
                options: ["All", "Verified", "Not Verified"],
              },
              {
                name: "isActive",
                label: "Status",
                options: ["All", "Active", "Inactive"],
              },
            ].map((filter, index) => (
              <motion.div
                key={filter.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {filter.label}
                </label>
                {filter.type === "text" ? (
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="text"
                    name={filter.name}
                    placeholder={filter.placeholder}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                    value={filters[filter.name]}
                    onChange={handleFilterChange}
                  />
                ) : (
                  <motion.select
                    whileFocus={{ scale: 1.02 }}
                    name={filter.name}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                    value={filters[filter.name]}
                    onChange={handleFilterChange}
                  >
                    {filter.options.map((opt, i) => (
                      <option
                        key={i}
                        value={
                          i === 0
                            ? ""
                            : opt === "Not Verified" || opt === "Inactive"
                              ? "false"
                              : opt === "Verified" || opt === "Active"
                                ? "true"
                                : opt.toLowerCase()
                        }
                      >
                        {opt}
                      </option>
                    ))}
                  </motion.select>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full mx-auto"
              />
            </motion.div>
          ) : users.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-12 bg-white rounded-xl"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              </motion.div>
              <p className="text-gray-500">No users found</p>
            </motion.div>
          ) : (
            <>
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {[
                          "Email",
                          "Role",
                          "Name",
                          "Status",
                          "Verified",
                          "Actions",
                        ].map((header, i) => (
                          <motion.th
                            key={header}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                          >
                            {header}
                          </motion.th>
                        ))}
                      </tr>
                    </thead>
                    <motion.tbody
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="divide-y divide-gray-200"
                    >
                      {users.map((user) => (
                        <motion.tr
                          key={user._id}
                          variants={itemVariants}
                          whileHover={{ backgroundColor: "#f9fafb" }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {user.email}
                          </td>
                          <td className="px-6 py-4">
                            <motion.span
                              whileHover={{ scale: 1.1 }}
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === "admin"
                                  ? "bg-purple-100 text-purple-800"
                                  : user.role === "nurse"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                            >
                              {user.role}
                            </motion.span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {user.profile?.fullName || "N/A"}
                          </td>
                          <td className="px-6 py-4">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() =>
                                handleToggleStatus(
                                  user._id,
                                  "isActive",
                                  user.isActive
                                )
                              }
                              className={`px-3 py-1 text-xs font-semibold rounded-full ${user.isActive
                                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                                  : "bg-red-100 text-red-800 hover:bg-red-200"
                                }`}
                            >
                              {user.isActive ? "Active" : "Inactive"}
                            </motion.button>
                          </td>
                          <td className="px-6 py-4">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() =>
                                handleToggleStatus(
                                  user._id,
                                  "isVerified",
                                  user.isVerified
                                )
                              }
                              className={`px-3 py-1 text-xs font-semibold rounded-full ${user.isVerified
                                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                                  : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                }`}
                            >
                              {user.isVerified ? "Verified" : "Not Verified"}
                            </motion.button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <motion.button
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() =>
                                  navigate(`/admin/users/${user._id}`)
                                }
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.2, rotate: 10 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDeleteUser(user._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </table>
                </div>
              </motion.div>

              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex justify-center gap-2 mt-6"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </motion.button>
                  <span className="px-4 py-2">
                    Page {page} of {totalPages}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </motion.button>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminUsers;
