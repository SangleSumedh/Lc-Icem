import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddDepartmentForm({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    head: "",
    status: "Active",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBackBtn = () => {
    navigate("/admin-dashboard");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(formData);
    setFormData({ name: "", head: "", status: "Active" }); // reset after submit
  };

  return (
    <main className="flex-1 w-auto mx-auto px-6 lg:px-10 py-4 ">
      <div className="bg-white rounded-xl shadow-xl w-full ">
        <h2 className="text-2xl font-bold text-gray-800 w-auto mx-auto px-4 lg:px-8 py-8">
          Add Department
        </h2>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 w-auto mx-auto px-6 lg:px-10 py-8"
        >
          {/* Department Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter department name"
              required
            />
          </div>

          {/* Department Head */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department Head
            </label>
            <input
              type="text"
              name="head"
              value={formData.head}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter head name"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none"
            >
              <option value="">Select Role</option>
              <option>Admin</option>
              <option>Head Of Department</option>
              <option>Head Librarian</option>
              <option>Head of Canteen Management</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleBackBtn}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
            >
              Go Back
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#00539C] text-white hover:bg-[#004080]"
            >
              Add Department
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default AddDepartmentForm;
