import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddUserForm({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    department: "",
    year: "",
    role: "User", // new field
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
    setFormData({
      name: "",
      rollNumber: "",
      department: "",
      year: "",
      role: "User",
      status: "Active",
    });
  };

  return (
    <main className="flex-1 w-auto mx-auto px-6 lg:px-10 py-4 ">
      <div className="bg-white rounded-xl w-full shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 w-auto mx-auto px-4 lg:px-8 py-8">
          Add User
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 w-auto mx-auto px-6 lg:px-10 py-8"
        >
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter name"
              required
            />
          </div>

          {/* Department Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none"
            >
              <option value="">Select department</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">
                Information Technology
              </option>
              <option value="Electronics">Electronics</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
              <option value="Electrical">Electrical</option>
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none"
            >
              <option value="">Select year</option>
              <option>First Year</option>
              <option>Second Year</option>
              <option>Third Year</option>
              <option>Final Year</option>
            </select>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none"
            >
              <option>User</option>
              <option>Student</option>
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
              Add User
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default AddUserForm;
