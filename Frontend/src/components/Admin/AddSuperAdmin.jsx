import React, { useEffect, useState } from "react";
import { FiSearch, FiPlus, FiRefreshCw } from "react-icons/fi";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";

function AddSuperAdmin() {
  const token = localStorage.getItem("token");
  const BASE_URL = "http://localhost:5000/admin";
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [superAdmins, setSuperAdmins] = useState([]);
  const [editing, setEditing] = useState(null);
  const [deleteAdmin, setDeleteAdmin] = useState(null);

  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch SuperAdmins
  const fetchSuperAdmins = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${BASE_URL}/get-superAdmins`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSuperAdmins(
          data.data.map(({ id, username, email }) => ({ id, username, email }))
        );
      }
    } catch (err) {
      console.error("Fetch superadmins error:", err);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    fetchSuperAdmins();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (editing) {
      setEditing((p) => ({ ...p, [name]: value }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  // Add SuperAdmin
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/add-superadmin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        fetchSuperAdmins();
        setFormData({ username: "", email: "", password: "" });
        setShowAddModal(false);
      } else {
        alert(data.message || "❌ Failed to add superadmin");
      }
    } catch (err) {
      console.error("Error adding superadmin:", err);
    }
  };

  // Update SuperAdmin
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/update-superadmin/${editing.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editing),
      });
      const data = await res.json();
      if (data.success) {
        fetchSuperAdmins();
        setEditing(null);
      } else {
        alert(data.message || "❌ Update failed");
      }
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  // Delete SuperAdmin
  const handleDeleteConfirm = async () => {
    if (!deleteAdmin) return;
    try {
      const res = await fetch(
        `${BASE_URL}/delete-superadmin/${deleteAdmin.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success) {
        fetchSuperAdmins();
        setDeleteAdmin(null);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Filtering + Pagination
  const filteredAdmins = superAdmins.filter(
    (s) =>
      !search ||
      s.username.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);
  const paginatedAdmins = filteredAdmins.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 text-sm">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-lg font-bold text-gray-900">SuperAdmins</h1>
          <p className="text-gray-500 mt-1 text-xs">
            Manage system superadmins
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="px-3 py-1.5 border rounded-md text-sm"
          >
            Go Back
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
          >
            <FiPlus size={14} /> Add SuperAdmin
          </button>
        </div>
      </motion.header>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 text-xs">
        <div className="relative flex-1">
          <FiSearch
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={14}
          />
          <input
            type="text"
            placeholder="Search superadmins..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-4 py-1.5 text-xs border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <button
          onClick={fetchSuperAdmins}
          disabled={refreshing}
          className="p-1.5 border rounded-md hover:bg-gray-50"
        >
          <FiRefreshCw
            size={14}
            className={`${refreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto text-xs">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-2 font-medium">ID</th>
              <th className="px-4 py-2 font-medium">Username</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedAdmins.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">{s.id}</td>
                <td className="px-4 py-2">{s.username}</td>
                <td className="px-4 py-2">{s.email}</td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button
                    onClick={() => setEditing({ ...s, password: "" })}
                    className="px-2 py-1 text-xs bg-yellow-400 text-white rounded hover:bg-yellow-500"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => setDeleteAdmin(s)}
                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {paginatedAdmins.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No superadmins found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6 text-sm">
          {/* Prev button */}
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 h-10 flex items-center justify-center border rounded-full disabled:opacity-50 hover:bg-gray-100"
          >
            Prev
          </button>

          {/* Page number buttons */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 flex items-center justify-center border rounded-full ${
                currentPage === page
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ))}

          {/* Next button */}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 h-10 flex items-center justify-center border rounded-full disabled:opacity-50 hover:bg-gray-100"
          >
            Next
          </button>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-purple-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">
                Add SuperAdmin
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white hover:text-gray-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username"
                  required
                  className="w-full border p-2 rounded text-sm"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                  className="w-full border p-2 rounded text-sm"
                />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                className="w-full border p-2 rounded text-sm"
              />

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded text-sm hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-yellow-500 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">
                Update SuperAdmin
              </h2>
              <button
                onClick={() => setEditing(null)}
                className="text-white hover:text-gray-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="username"
                  value={editing.username}
                  onChange={handleChange}
                  placeholder="Username"
                  className="w-full border p-2 rounded text-sm"
                />
                <input
                  type="email"
                  name="email"
                  value={editing.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full border p-2 rounded text-sm"
                />
              </div>
              <input
                type="password"
                name="password"
                placeholder="New Password"
                value={editing.password || ""}
                onChange={handleChange}
                className="w-full border p-2 rounded text-sm"
              />

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 border rounded text-sm hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteAdmin && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-red-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">
                Confirm Delete
              </h2>
              <button
                onClick={() => setDeleteAdmin(null)}
                className="text-white hover:text-gray-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{deleteAdmin.username}</span>?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteAdmin(null)}
                  className="px-4 py-2 border rounded text-sm hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddSuperAdmin;
