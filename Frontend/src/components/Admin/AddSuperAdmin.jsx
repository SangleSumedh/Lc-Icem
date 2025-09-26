import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Edit } from "lucide-react";

function AddSuperAdmin() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [superAdmins, setSuperAdmins] = useState([]);
  const [editing, setEditing] = useState(null);

  const token = localStorage.getItem("token");
  const BASE_URL = "http://localhost:5000/admin";
  const navigate = useNavigate();

  // 🔹 Fetch SuperAdmins
  const fetchSuperAdmins = async () => {
    try {
      const res = await fetch(`${BASE_URL}/superadmins`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setSuperAdmins(data.data);
    } catch (err) {
      console.error("Fetch superadmins error:", err);
    }
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

  // ➕ Add
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
        alert("✅ SuperAdmin added");
        fetchSuperAdmins();
        setFormData({ username: "", email: "", password: "" });
      } else {
        alert(data.message || "❌ Failed to add superadmin");
      }
    } catch (err) {
      console.error("Error adding superadmin:", err);
    }
  };

  // ❌ Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this SuperAdmin?")) return;
    try {
      const res = await fetch(`${BASE_URL}/delete-superadmin/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) fetchSuperAdmins();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // ✏️ Update
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
        alert("✅ SuperAdmin updated");
        fetchSuperAdmins();
        setEditing(null);
      } else {
        alert(data.message || "❌ Update failed");
      }
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  return (
    <main className="p-6 space-y-6">
      {/* Add Form */}
      <div className="bg-white rounded-xl shadow p-6 max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-6">Add SuperAdmin</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            required
            className="border p-2 rounded w-full"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="border p-2 rounded w-full"
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
            className="border p-2 rounded w-full"
          />
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate("/admin-dashboard")}
              className="px-4 py-2 border rounded"
            >
              Go Back
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded">
              Add SuperAdmin
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-semibold mb-4">SuperAdmins</h3>
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Username</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {superAdmins.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-2">{s.id}</td>
                <td className="p-2">{s.username}</td>
                <td className="p-2">{s.email}</td>
                <td className="p-2 text-right space-x-2">
                  <button
                    className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                    onClick={() => setEditing({ ...s, password: "" })}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                    onClick={() => handleDelete(s.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Inline Update */}
        {editing && (
          <form
            onSubmit={handleUpdate}
            className="mt-6 p-4 border rounded space-y-3 bg-gray-50"
          >
            <h4 className="font-semibold">Edit SuperAdmin</h4>
            <input
              name="username"
              value={editing.username}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
            <input
              name="email"
              value={editing.email}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
            <input
              name="password"
              type="password"
              placeholder="New Password"
              value={editing.password}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded">
                Save
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}

export default AddSuperAdmin;
