import React, { useEffect, useState } from "react";
import { Trash2, Edit } from "lucide-react";

function AddDepartmentForm() {
  const token = localStorage.getItem("token");
  const BASE_URL = "http://localhost:5000/admin";

  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    deptName: "",
    deptHead: "",
    username: "",
    email: "",
    password: "",
    college: "ICEM",
  });
  const [editingDept, setEditingDept] = useState(null);

  // 🔹 Fetch departments
  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${BASE_URL}/departments`);
      const data = await res.json();
      if (data.success) setDepartments(data.data);
    } catch (err) {
      console.error("Fetch departments error:", err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // ➕ Add Department
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
        alert("✅ Department created");
        fetchDepartments();
        setFormData({
          deptName: "",
          deptHead: "",
          username: "",
          email: "",
          password: "",
          college: "ICEM",
        });
      } else {
        alert(data.message || "❌ Failed to add department");
      }
    } catch (err) {
      console.error("Add error", err);
    }
  };

  // ❌ Delete Department
  const handleDelete = async (deptId) => {
    if (!window.confirm("Delete this department?")) return;
    try {
      const res = await fetch(`${BASE_URL}/delete-department/${deptId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchDepartments();
      }
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  // ✏️ Update Department
  const handleUpdate = async (e) => {
    e.preventDefault();

    // ✅ Always send valid enum value for college
    const payload = {
      deptId: Number(editingDept.deptId),
      deptHead: editingDept.deptHead,
      username: editingDept.username,
      email: editingDept.email,
      college: editingDept.college || "ICEM", // fallback to ICEM
    };

    if (editingDept.password && editingDept.password.trim() !== "") {
      payload.password = editingDept.password;
    }

    console.log("Update Payload:", payload);

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
      console.log("Update response:", data);

      if (data.success) {
        alert("✅ Department updated");
        setEditingDept(null);
        fetchDepartments();
      } else {
        alert(data.message || "❌ Update failed");
      }
    } catch (err) {
      console.error("Update error", err);
    }
  };

  return (
    <main className="p-6 space-y-6">
      {/* Add Form */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="text-xl font-bold">Add Department</h2>
        <form onSubmit={handleAdd} className="grid gap-4">
          <input
            name="deptName"
            value={formData.deptName}
            onChange={handleChange}
            placeholder="Department Name"
            required
            className="border p-2 rounded"
          />
          <input
            name="deptHead"
            value={formData.deptHead}
            onChange={handleChange}
            placeholder="Department Head"
            className="border p-2 rounded"
          />
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            required
            className="border p-2 rounded"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="border p-2 rounded"
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
            className="border p-2 rounded"
          />
          <select
            name="college"
            value={formData.college}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="ICEM">ICEM</option>
            <option value="IGSB">IGSB</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Add Department
          </button>
        </form>
      </div>

      {/* Departments List */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">Departments</h2>
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Head</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">College</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept.deptId} className="border-t">
                <td className="p-2">{dept.deptName}</td>
                <td className="p-2">{dept.deptHead || "—"}</td>
                <td className="p-2">{dept.email}</td>
                <td className="p-2">{dept.college || "—"}</td>
                <td className="p-2 text-right space-x-2">
                  <button
                    className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                    onClick={() =>
                      setEditingDept({
                        ...dept,
                        password: "", // keep empty for update
                      })
                    }
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                    onClick={() => handleDelete(dept.deptId)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Inline Update Form */}
        {editingDept && (
          <form
            onSubmit={handleUpdate}
            className="mt-6 p-4 border rounded space-y-3 bg-gray-50"
          >
            <h3 className="font-semibold">Update Department</h3>
            <input
              name="deptName"
              value={editingDept.deptName}
              disabled
              className="border p-2 rounded bg-gray-100"
            />
            <input
              name="deptHead"
              value={editingDept.deptHead || ""}
              onChange={(e) =>
                setEditingDept({ ...editingDept, deptHead: e.target.value })
              }
              className="border p-2 rounded"
            />
            <input
              name="username"
              value={editingDept.username || ""}
              onChange={(e) =>
                setEditingDept({ ...editingDept, username: e.target.value })
              }
              className="border p-2 rounded"
            />
            <input
              type="email"
              name="email"
              value={editingDept.email || ""}
              onChange={(e) =>
                setEditingDept({ ...editingDept, email: e.target.value })
              }
              className="border p-2 rounded"
            />
            <input
              type="password"
              name="password"
              placeholder="New Password"
              value={editingDept.password || ""}
              onChange={(e) =>
                setEditingDept({ ...editingDept, password: e.target.value })
              }
              className="border p-2 rounded"
            />
            <select
              name="college"
              value={editingDept.college || "ICEM"}
              onChange={(e) =>
                setEditingDept({ ...editingDept, college: e.target.value })
              }
              className="border p-2 rounded"
            >
              <option value="ICEM">ICEM</option>
              <option value="IGSB">IGSB</option>
            </select>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setEditingDept(null)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded">
                Update
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}

export default AddDepartmentForm;
