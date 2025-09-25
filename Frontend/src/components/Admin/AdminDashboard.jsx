import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

const AdminDashboard = () => {
  const [departments, setDepartments] = useState([]); // always array
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    deptName: "",
    username: "",
    email: "",
    password: "",
    branchId: null,
  });
  const [saving, setSaving] = useState(false);

  const BASE_URL = "http://localhost:5000/admin";
  const token = localStorage.getItem("token");

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${BASE_URL}/departments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        alert("❌ Unauthorized. Please login again.");
        return;
      }

      const data = await res.json();
      console.log("📦 API /departments response:", data);

      if (data.success) {
        setDepartments(Array.isArray(data.data) ? data.data : []);
      } else {
        alert(data.error || "Failed to load departments");
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
      alert("Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "branchId"
          ? value === ""
            ? null
            : parseInt(value, 10)
          : value,
    });
  };

  // Add Department
  const handleAddDepartment = async (e) => {
    e.preventDefault();

    if (!formData.deptName || !formData.username || !formData.email || !formData.password) {
      alert("❌ Department Name, Username, Email, and Password are required");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`${BASE_URL}/add-department`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.status === 401) {
        alert("❌ Unauthorized. Please login again.");
        return;
      }

      const data = await res.json();
      if (res.ok && data.success) {
        alert("✅ Department created successfully!");
        setDepartments((prev) => [...prev, data.department]);
        setFormData({
          deptName: "",
          username: "",
          email: "",
          password: "",
          branchId: null,
        });
      } else {
        alert(data.error || "❌ Failed to create department");
      }
    } catch (err) {
      console.error("Error creating department:", err);
      alert("Server error, please try again later.");
    } finally {
      setSaving(false);
    }
  };

  // Delete Department
  const handleDelete = async (deptId) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;

    try {
      const res = await fetch(`${BASE_URL}/delete-department/${deptId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ deptId }),
      });

      if (res.status === 401) {
        alert("❌ Unauthorized. Please login again.");
        return;
      }

      const data = await res.json();
      if (data.success) {
        setDepartments((prev) => prev.filter((d) => d.deptId !== deptId));
        alert("✅ Department deleted successfully");
      } else {
        alert(data.error || "Failed to delete department");
      }
    } catch (err) {
      console.error("Error deleting department:", err);
      alert("Server error while deleting department");
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin Dashboard</h2>

        {/* Add Department Form */}
        <form onSubmit={handleAddDepartment} className="space-y-3 mb-6">
          <input
            type="text"
            name="deptName"
            value={formData.deptName}
            onChange={handleChange}
            placeholder="Department Name"
            className="w-full border px-3 py-2 rounded-lg"
          />
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            className="w-full border px-3 py-2 rounded-lg"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full border px-3 py-2 rounded-lg"
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full border px-3 py-2 rounded-lg"
          />
          <input
            type="number"
            name="branchId"
            value={formData.branchId ?? ""}
            onChange={handleChange}
            placeholder="Branch ID (Optional)"
            className="w-full border px-3 py-2 rounded-lg"
          />

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-emerald-500 text-white py-2 rounded-lg hover:bg-emerald-600 transition"
          >
            {saving ? "Saving..." : "Add Department"}
          </button>
        </form>

        {/* Departments List */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
          {loading ? (
            <p className="p-4 text-center">Loading departments...</p>
          ) : departments.length === 0 ? (
            <p className="p-4 text-center">No departments found</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100/80">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Department Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Dept Head
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Branch
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {departments.map((dept) => (
                  <tr key={dept.deptId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-900 font-medium">{dept.deptName}</td>
                    <td className="px-4 py-3 text-gray-500">{dept.deptHead ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{dept.email ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{dept.branchId ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(dept.deptId)}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-200 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
