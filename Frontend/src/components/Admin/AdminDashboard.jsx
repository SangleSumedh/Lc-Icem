import React from "react";
import { useNavigate } from "react-router-dom";

// Components
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";

// Icons
import { Plus, Edit, Trash2 } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  const handleAddDepartmentBtn = () => {
    navigate("/admin-dashboard/add-department");
  };

  const handleAddUserBtn = () => {
    navigate("/admin-dashboard/add-user");
  };

  const users = [
    { user: "Sumedh Sangle", department: "IT", role: "Intern" },
    { user: "Aarav Mehta", department: "Finance", role: "Manager" },
    { user: "Priya Sharma", department: "HR", role: "Staff" },
    { user: "Rohan Gupta", department: "Marketing", role: "Admin" },
  ];

  const stats = [
    {
      title: "Total Students Onboard",
      value: "1,250",
      change: "+12%",
      color: "text-emerald-600",
    },
    {
      title: "Faculty Members",
      value: "5",
      change: "+25%",
      color: "text-emerald-600",
    },
    { title: "Departments", value: "8", change: "0%", color: "text-gray-500" },
    {
      title: "Documents Online",
      value: "92%",
      change: "+8%",
      color: "text-emerald-600",
    },
  ];

  return (
    <div className="w-full">
      {/* Main Content */}
      <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-10 py-4">
        <div className="bg-white/80  min-h-[90vh]   backdrop-blur-lg rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
          {/* Dashboard Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 ">
              Admin Dashboard
            </h2>
            <button
              className="flex items-center justify-center gap-2 text-sm sm:text-base font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg sm:rounded-xl py-2 px-3 sm:px-4 transition"
              onClick={handleAddDepartmentBtn}
            >
              <Plus size={18} />
              Add Department
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pb-8 sm:pb-12">
            {stats.map((item, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-white to-gray-50 shadow-md rounded-lg sm:rounded-xl p-4 sm:p-6 hover:shadow-lg transition"
              >
                <p className="text-xs sm:text-sm font-medium text-gray-500">
                  {item.title}
                </p>
                <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900">
                  {item.value}
                </p>
                <p
                  className={`mt-1 sm:mt-2 text-xs sm:text-sm font-semibold ${item.color}`}
                >
                  {item.change} since last year
                </p>
              </div>
            ))}
          </div>

          {/* User Management Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              User Management
            </h2>
            <button
              className="flex items-center justify-center gap-2 text-sm sm:text-base font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg sm:rounded-xl py-2 px-3 sm:px-4 transition"
              onClick={handleAddUserBtn}
            >
              <Plus size={18} />
              Add User
            </button>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg sm:rounded-xl shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100/80">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {users.map((u, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-gray-900 font-medium">
                      {u.user}
                    </td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-gray-500">
                      {u.department}
                    </td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-gray-500">
                      {u.role}
                    </td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-right space-x-2 sm:space-x-3">
                      <button className="p-1.5 sm:p-2 rounded-lg text-blue-600 hover:bg-blue-200 transition">
                        <Edit size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </button>
                      <button className="p-1.5 sm:p-2 rounded-lg text-red-600 hover:bg-red-200 transition">
                        <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
