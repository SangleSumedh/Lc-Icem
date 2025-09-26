import React, { useEffect, useState, useRef } from "react";
import { FiSearch, FiPlus, FiRefreshCw } from "react-icons/fi";
import { motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ChevronDown } from "lucide-react";

const AddDepartmentForm = () => {
  const token = localStorage.getItem("token");
  const BASE_URL = "http://localhost:5000/admin";

  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deleteDept, setDeleteDept] = useState(null);

  const [formData, setFormData] = useState({
    deptName: "",
    deptHead: "",
    username: "",
    email: "",
    password: "",
    college: "ICEM",
  });

  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [showEditCollegeDropdown, setShowEditCollegeDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const collegeOptions = [
    { value: "ICEM", label: "ICEM - Indira College of Engineering" },
    { value: "IGSB", label: "IGSB - Indira Global School of Business" },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowCollegeDropdown(false);
        setShowEditCollegeDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch departments
  const fetchDepartments = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${BASE_URL}/departments`);
      const data = await res.json();
      if (data.success) setDepartments(data.data);
    } catch (err) {
      console.error("Fetch departments error:", err);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // Add Department
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/add-department`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        fetchDepartments();
        setFormData({
          deptName: "",
          deptHead: "",
          username: "",
          email: "",
          password: "",
          college: "ICEM",
        });
        setShowAddModal(false);
      } else {
        alert(data.message || "❌ Failed to add department");
      }
    } catch (err) {
      console.error("Add error", err);
    }
  };

  // Update Department
  const handleUpdate = async (e) => {
    e.preventDefault();
    const payload = {
      deptId: editingDept.deptId,
      deptHead: editingDept.deptHead,
      username: editingDept.username,
      email: editingDept.email,
      college: editingDept.college || "ICEM",
    };
    if (editingDept.password?.trim()) {
      payload.password = editingDept.password;
    }

    try {
      const res = await fetch(`${BASE_URL}/update-department`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        fetchDepartments();
        setShowEditModal(false);
        setEditingDept(null);
      } else {
        alert(data.message || "❌ Update failed");
      }
    } catch (err) {
      console.error("Update error", err);
    }
  };

  // Delete Department
  const handleDeleteConfirm = async () => {
    if (!deleteDept) return;
    try {
      const res = await fetch(
        `${BASE_URL}/delete-department/${deleteDept.deptId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success) {
        fetchDepartments();
        setDeleteDept(null);
      }
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  // Filtering
  const filteredDepts = departments.filter(
    (d) =>
      (!search ||
        d.deptName.toLowerCase().includes(search.toLowerCase()) ||
        d.email.toLowerCase().includes(search.toLowerCase())) &&
      (!collegeFilter || d.college === collegeFilter)
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredDepts.length / itemsPerPage);
  const paginatedDepts = filteredDepts.slice(
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
          <h1 className="text-lg font-bold text-gray-900">Departments</h1>
          <p className="text-gray-500 mt-1 text-xs">
            Manage system departments
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 text-sm"
          >
            <FiPlus size={14} /> Add Department
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
            placeholder="Search departments..."
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
          {[...new Set(departments.map((d) => d.college))].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <button
          onClick={fetchDepartments}
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
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Head</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">College</th>
              <th className="px-4 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedDepts.map((dept) => (
              <tr key={dept.deptId} className="hover:bg-gray-50">
                <td className="px-4 py-2">{dept.deptName}</td>
                <td className="px-4 py-2">{dept.deptHead || "—"}</td>
                <td className="px-4 py-2 text-gray-500">{dept.email}</td>
                <td className="px-4 py-2">{dept.college}</td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button
                    onClick={() => {
                      setEditingDept({ ...dept, password: "" });
                      setShowEditModal(true);
                    }}
                    className="px-2 py-1 text-xs bg-yellow-400 text-white rounded hover:bg-yellow-500"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => setDeleteDept(dept)}
                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {paginatedDepts.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No departments found
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

      {/* ✅ Add Modal (with 2-column layout + custom dropdown) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">
                Add Department
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white hover:text-gray-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-6">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Name
                  </label>
                  <input
                    name="deptName"
                    value={formData.deptName}
                    onChange={handleChange}
                    placeholder="Department Name"
                    required
                    className="w-full border p-2 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Head
                  </label>
                  <input
                    name="deptHead"
                    value={formData.deptHead}
                    onChange={handleChange}
                    placeholder="Department Head"
                    className="w-full border p-2 rounded-md text-sm"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Username"
                    required
                    className="w-full border p-2 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                    className="w-full border p-2 rounded-md text-sm"
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" ref={dropdownRef}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    required
                    className="w-full border p-2 rounded-md text-sm"
                  />
                </div>

                {/* College Dropdown */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    College
                  </label>
                  <div
                    onClick={() => setShowCollegeDropdown(!showCollegeDropdown)}
                    className="flex items-center justify-between border rounded-md px-3 py-2 cursor-pointer bg-white"
                  >
                    <span
                      className={
                        formData.college
                          ? "text-gray-800 text-sm"
                          : "text-gray-400 text-sm"
                      }
                    >
                      {
                        collegeOptions.find(
                          (opt) => opt.value === formData.college
                        )?.label || "Select College"
                      }
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </div>
                  {showCollegeDropdown && (
                    <div className="absolute left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-20">
                      {collegeOptions.map((option) => (
                        <div
                          key={option.value}
                          onClick={() => {
                            setFormData({ ...formData, college: option.value });
                            setShowCollegeDropdown(false);
                          }}
                          className="px-3 py-2 cursor-pointer text-sm hover:bg-indigo-600 hover:text-white rounded-md"
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3 rounded-lg">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Edit Modal (same 2-column + dropdown) */}
      {showEditModal && editingDept && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-yellow-500 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">
                Edit Department
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-white hover:text-gray-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Head
                  </label>
                  <input
                    name="deptHead"
                    value={editingDept.deptHead || ""}
                    onChange={(e) =>
                      setEditingDept((p) => ({
                        ...p,
                        deptHead: e.target.value,
                      }))
                    }
                    placeholder="Department Head"
                    className="w-full border p-2 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    name="username"
                    value={editingDept.username || ""}
                    onChange={(e) =>
                      setEditingDept((p) => ({
                        ...p,
                        username: e.target.value,
                      }))
                    }
                    placeholder="Username"
                    className="w-full border p-2 rounded-md text-sm"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" ref={dropdownRef}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editingDept.email || ""}
                    onChange={(e) =>
                      setEditingDept((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="Email"
                    className="w-full border p-2 rounded-md text-sm"
                  />
                </div>

                {/* College Dropdown */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    College
                  </label>
                  <div
                    onClick={() =>
                      setShowEditCollegeDropdown(!showEditCollegeDropdown)
                    }
                    className="flex items-center justify-between border rounded-md px-3 py-2 cursor-pointer bg-white"
                  >
                    <span
                      className={
                        editingDept.college
                          ? "text-gray-800 text-sm"
                          : "text-gray-400 text-sm"
                      }
                    >
                      {
                        collegeOptions.find(
                          (opt) => opt.value === editingDept.college
                        )?.label || "Select College"
                      }
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </div>
                  {showEditCollegeDropdown && (
                    <div className="absolute left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-20">
                      {collegeOptions.map((option) => (
                        <div
                          key={option.value}
                          onClick={() => {
                            setEditingDept((p) => ({
                              ...p,
                              college: option.value,
                            }));
                            setShowEditCollegeDropdown(false);
                          }}
                          className="px-3 py-2 cursor-pointer text-sm hover:bg-yellow-500 hover:text-white rounded-md"
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 3 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={editingDept.password || ""}
                  onChange={(e) =>
                    setEditingDept((p) => ({
                      ...p,
                      password: e.target.value,
                    }))
                  }
                  placeholder="New Password"
                  className="w-full border p-2 rounded-md text-sm"
                />
              </div>

              <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3 rounded-lg">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Delete Modal */}
      {deleteDept && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-red-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">
                Confirm Delete
              </h2>
              <button
                onClick={() => setDeleteDept(null)}
                className="text-white hover:text-gray-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{deleteDept.deptName}</span>?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteDept(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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
};

export default AddDepartmentForm;
