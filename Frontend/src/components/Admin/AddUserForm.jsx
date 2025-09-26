import React, { useEffect, useState } from "react";
import { FiSearch, FiPlus, FiRefreshCw } from "react-icons/fi";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";

function AddUserForm() {
  const token = localStorage.getItem("token");
  const BASE_URL = "http://localhost:5000/admin";

  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    prn: "",
    studentName: "",
    email: "",
    phoneNo: "",
    college: "ICEM",
    password: "",
  });

  const [editing, setEditing] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [search, setSearch] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const navigate = useNavigate();

  // Fetch Students
  const fetchStudents = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${BASE_URL}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setStudents(data.data);
      }
    } catch (err) {
      console.error("Fetch students error:", err);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (editing) {
      setEditing((p) => ({ ...p, [name]: value }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  // Add Student
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/add-student`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        fetchStudents();
        setFormData({
          prn: "",
          studentName: "",
          email: "",
          phoneNo: "",
          college: "ICEM",
          password: "",
        });
        setShowAddModal(false);
      } else {
        alert(data.message || "❌ Failed to add student");
      }
    } catch (err) {
      console.error("Add student error:", err);
    }
  };

  // Update Student
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/update-student/${editing.prn}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editing),
      });

      const data = await res.json();
      if (data.success) {
        fetchStudents();
        setEditing(null);
      } else {
        alert(data.message || "❌ Update failed");
      }
    } catch (err) {
      console.error("Update error", err);
    }
  };

  // Delete Student
  const handleDeleteConfirm = async () => {
    if (!deleteUser) return;
    try {
      const res = await fetch(`${BASE_URL}/delete-student/${deleteUser.prn}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchStudents();
        setDeleteUser(null);
      }
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  // Filtering
  const filteredStudents = students.filter(
    (s) =>
      (!search ||
        s.studentName.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())) &&
      (!collegeFilter || s.college === collegeFilter)
  );

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <main className="p-6 space-y-6 text-sm">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-lg font-bold text-gray-900">Students</h1>
          <p className="text-gray-500 mt-1 text-xs">Manage system students</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="px-3 py-1.5 border rounded-md text-xs"
          >
            Go Back
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 text-xs"
          >
            <FiPlus size={14} /> Add Student
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
            placeholder="Search students..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-4 py-1.5 text-xs border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <select
          value={collegeFilter}
          onChange={(e) => {
            setCollegeFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-1.5 text-xs border rounded-md focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Colleges</option>
          {[...new Set(students.map((s) => s.college))].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <button
          onClick={fetchStudents}
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
              <th className="px-4 py-2 font-medium">PRN</th>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Phone</th>
              <th className="px-4 py-2 font-medium">College</th>
              <th className="px-4 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedStudents.map((s) => (
              <tr key={s.prn} className="hover:bg-gray-50">
                <td className="px-4 py-2">{s.prn}</td>
                <td className="px-4 py-2">{s.studentName}</td>
                <td className="px-4 py-2 text-gray-500">{s.email}</td>
                <td className="px-4 py-2">{s.phoneNo || "—"}</td>
                <td className="px-4 py-2">{s.college}</td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button
                    onClick={() => setEditing({ ...s, password: "" })}
                    className="px-2 py-1 text-xs bg-yellow-400 text-white rounded hover:bg-yellow-500"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => setDeleteUser(s)}
                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {paginatedStudents.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No students found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4 text-xs">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 border rounded ${
                currentPage === page
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Add Student</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white hover:text-gray-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="prn"
                  value={formData.prn}
                  onChange={handleChange}
                  placeholder="PRN"
                  required
                  className="w-full border p-2 rounded text-sm"
                />
                <input
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required
                  className="w-full border p-2 rounded text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                  className="w-full border p-2 rounded text-sm"
                />
                <input
                  name="phoneNo"
                  value={formData.phoneNo}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className="w-full border p-2 rounded text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  className="w-full border p-2 rounded text-sm"
                >
                  <option value="ICEM">ICEM</option>
                  <option value="IGSB">IGSB</option>
                </select>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  className="w-full border p-2 rounded text-sm"
                />
              </div>

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
                  className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
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
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-yellow-500 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Update Student</h2>
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
                  value={editing.studentName}
                  name="studentName"
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="w-full border p-2 rounded text-sm"
                />
                <input
                  value={editing.email}
                  name="email"
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full border p-2 rounded text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  value={editing.phoneNo || ""}
                  name="phoneNo"
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className="w-full border p-2 rounded text-sm"
                />
                <select
                  value={editing.college}
                  name="college"
                  onChange={handleChange}
                  className="w-full border p-2 rounded text-sm"
                >
                  <option value="ICEM">ICEM</option>
                  <option value="IGSB">IGSB</option>
                </select>
              </div>

              <input
                type="password"
                name="password"
                value={editing.password || ""}
                onChange={handleChange}
                placeholder="New Password"
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
      {deleteUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-red-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Confirm Delete</h2>
              <button
                onClick={() => setDeleteUser(null)}
                className="text-white hover:text-gray-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{deleteUser.studentName}</span>?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteUser(null)}
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
    </main>
  );
}

export default AddUserForm;
