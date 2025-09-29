import React, { useEffect, useState } from "react";
import { FiSearch, FiPlus, FiRefreshCw } from "react-icons/fi";
import { motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";

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
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffDept, setStaffDept] = useState(null);
  const [staffList, setStaffList] = useState([]);

  // Form states
  const [formData, setFormData] = useState({
    deptName: "",
    branchId: "",
    college: "ICEM",
  });
  const [staffData, setStaffData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const collegeOptions = [
    { value: "ICEM", label: "ICEM - Indira College of Engineering" },
    { value: "IGSB", label: "IGSB - Indira Global School of Business" },
  ];

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

  // Handle field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleStaffChange = (e) => {
    const { name, value } = e.target;
    setStaffData((p) => ({ ...p, [name]: value }));
  };

  // Add Department + Staff
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      // 1. Add department
      const deptRes = await fetch(`${BASE_URL}/add-department`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const deptData = await deptRes.json();

      if (!deptData.success) {
        alert(deptData.message || "❌ Failed to add department");
        return;
      }

      const deptId = deptData.data.deptId;

      // 2. Add staff if provided
      if (staffData.name && staffData.email && staffData.password) {
        await fetch(`${BASE_URL}/add-staff`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...staffData, deptId }),
        });
      }

      fetchDepartments();
      setFormData({ deptName: "", branchId: "", college: "ICEM" });
      setStaffData({ name: "", email: "", password: "" });
      setShowAddModal(false);
    } catch (err) {
      console.error("Add error", err);
    }
  };

  // Update Department + Staff
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      // 1. Update department
      const deptPayload = {
        deptId: editingDept.deptId,
        college: editingDept.college,
      };

      await fetch(`${BASE_URL}/update-department`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(deptPayload),
      });

      // 2. Update staff if provided
      if (editingDept.staff && editingDept.staff.staffId) {
        const staffPayload = {
          name: editingDept.staff.name,
          email: editingDept.staff.email,
          deptId: editingDept.deptId,
        };

        if (editingDept.staff.password && editingDept.staff.password.trim() !== "") {
          staffPayload.password = editingDept.staff.password;
        }

        await fetch(`${BASE_URL}/update-staff/${editingDept.staff.staffId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(staffPayload),
        });
      }

      fetchDepartments();
      setShowEditModal(false);
      setEditingDept(null);
    } catch (err) {
      console.error("Update error", err);
    }
  };

  // Delete Department (delete staff first)
  const handleDeleteConfirm = async () => {
    if (!deleteDept) return;
    try {
      // Delete staff first
      const staffRes = await fetch(`${BASE_URL}/staff`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const staffData = await staffRes.json();

      if (staffData.success) {
        const deptStaff = staffData.data.filter((s) => s.deptId === deleteDept.deptId);
        for (const s of deptStaff) {
          await fetch(`${BASE_URL}/delete-staff/${s.staffId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      }

      // Delete department
      await fetch(`${BASE_URL}/delete-department/${deleteDept.deptId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchDepartments();
      setDeleteDept(null);
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  // View staff of department
  const handleViewStaff = async (dept) => {
    try {
      const res = await fetch(`${BASE_URL}/staff`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setStaffList(data.data.filter((s) => s.deptId === dept.deptId));
      }
      setStaffDept(dept);
      setShowStaffModal(true);
    } catch (err) {
      console.error("Fetch staff error:", err);
    }
  };

  // Filtering
  const filteredDepts = departments.filter(
    (d) =>
      (!search ||
        d.deptName.toLowerCase().includes(search.toLowerCase()) ||
        d.deptId.toString().includes(search)) &&
      (!collegeFilter || d.college === collegeFilter)
  );

  // Pagination
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
          <p className="text-gray-500 mt-1 text-xs">Manage system departments</p>
        </div>
        <div>
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
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search by ID or Name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-4 py-1.5 border rounded-md text-xs focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={collegeFilter}
          onChange={(e) => {
            setCollegeFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-1.5 border rounded-md text-xs"
        >
          <option value="">All Colleges</option>
          {[...new Set(departments.map((d) => d.college))].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button
          onClick={fetchDepartments}
          disabled={refreshing}
          className="p-1.5 border rounded-md hover:bg-gray-50"
        >
          <FiRefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto text-xs">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-2">Dept ID</th>
              <th className="px-4 py-2">Dept Name</th>
              <th className="px-4 py-2">Branch ID</th>
              <th className="px-4 py-2">College</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedDepts.map((dept) => (
              <tr key={dept.deptId} className="hover:bg-gray-50">
                <td className="px-4 py-2">{dept.deptId}</td>
                <td className="px-4 py-2">{dept.deptName}</td>
                <td className="px-4 py-2">{dept.branchId || 0}</td>
                <td className="px-4 py-2">{dept.college}</td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button
                    onClick={() => handleViewStaff(dept)}
                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                  >
                    View Staff
                  </button>
                  <button
                    onClick={() => {
                      setEditingDept({ ...dept, staff: { name: "", email: "", password: "" } });
                      setShowEditModal(true);
                    }}
                    className="px-2 py-1 bg-yellow-400 text-white rounded text-xs hover:bg-yellow-500"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => setDeleteDept(dept)}
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
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
                currentPage === page ? "bg-indigo-600 text-white" : "hover:bg-gray-50"
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
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-y-auto max-h-[85vh]">
            <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Add Department & Staff</h2>
              <button onClick={() => setShowAddModal(false)} className="text-white">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-6">
              {/* Dept Section */}
              <h3 className="font-semibold text-gray-700">Department Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Department Name</label>
                  <input
                    name="deptName"
                    value={formData.deptName}
                    onChange={handleChange}
                    required
                    className="w-full border p-2 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Branch ID</label>
                  <input
                    name="branchId"
                    value={formData.branchId}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">College</label>
                  <select
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-md text-sm"
                  >
                    {collegeOptions.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Staff Section */}
              <h3 className="font-semibold text-gray-700">Staff Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Staff Name</label>
                  <input
                    name="name"
                    value={staffData.name}
                    onChange={handleStaffChange}
                    className="w-full border p-2 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={staffData.email}
                    onChange={handleStaffChange}
                    className="w-full border p-2 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={staffData.password}
                    onChange={handleStaffChange}
                    className="w-full border p-2 rounded-md text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded-md">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {showEditModal && editingDept && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-y-auto max-h-[85vh]">
            <div className="bg-yellow-500 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Edit Department & Staff</h2>
              <button onClick={() => setShowEditModal(false)} className="text-white">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              {/* Department Section */}
              <h3 className="font-semibold text-gray-700">Department Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Department ID</label>
                  <input value={editingDept.deptId} disabled className="w-full border p-2 rounded-md text-sm bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Department Name</label>
                  <input value={editingDept.deptName} disabled className="w-full border p-2 rounded-md text-sm bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Branch ID</label>
                  <input value={editingDept.branchId || 0} disabled className="w-full border p-2 rounded-md text-sm bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">College</label>
                  <select
                    name="college"
                    value={editingDept.college}
                    onChange={(e) => setEditingDept((p) => ({ ...p, college: e.target.value }))}
                    className="w-full border p-2 rounded-md text-sm"
                  >
                    {collegeOptions.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Staff Section */}
              <h3 className="font-semibold text-gray-700">Staff Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    name="name"
                    value={editingDept.staff?.name || ""}
                    onChange={(e) => setEditingDept((p) => ({ ...p, staff: { ...p.staff, name: e.target.value } }))}
                    className="w-full border p-2 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editingDept.staff?.email || ""}
                    onChange={(e) => setEditingDept((p) => ({ ...p, staff: { ...p.staff, email: e.target.value } }))}
                    className="w-full border p-2 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password (optional)</label>
                  <input
                    type="password"
                    name="password"
                    value={editingDept.staff?.password || ""}
                    onChange={(e) => setEditingDept((p) => ({ ...p, staff: { ...p.staff, password: e.target.value } }))}
                    className="w-full border p-2 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Dept ID</label>
                  <input value={editingDept.deptId} disabled className="w-full border p-2 rounded-md text-sm bg-gray-100" />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border rounded-md">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Modal */}
      {showStaffModal && staffDept && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-y-auto max-h-[80vh]">
            <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Staff of {staffDept.deptName}</h2>
              <button onClick={() => setShowStaffModal(false)} className="text-white">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {staffList.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {staffList.map((s) => (
                    <li key={s.staffId} className="p-3 border rounded-md bg-gray-50">
                      <p><strong>Name:</strong> {s.name}</p>
                      <p><strong>Email:</strong> {s.email}</p>
                      <p><strong>Staff ID:</strong> {s.staffId}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No staff found for this department</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteDept && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl">
            <div className="bg-red-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Confirm Delete</h2>
              <button onClick={() => setDeleteDept(null)} className="text-white">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p>Are you sure you want to delete <span className="font-semibold">{deleteDept.deptName}</span>?</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeleteDept(null)} className="px-4 py-2 border rounded-md">Cancel</button>
                <button onClick={handleDeleteConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddDepartmentForm;
