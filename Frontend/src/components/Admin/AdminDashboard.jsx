import React, { useEffect, useState } from "react";
import {
  FiHome,
  FiUsers,
  FiShield,
  FiChevronRight,
  FiRefreshCw,
  FiLogIn,
} from "react-icons/fi";
import { FaBuilding } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import AddDepartmentForm from "./AddDepartmentForm";
import AddSuperAdmin from "./AddSuperAdmin";
import AddUserForm from "./AddUserForm";


const AdminDashboard = () => {
  const [stats, setStats] = useState({
    students: 0,
    departments: 0,
    superadmins: 0,
    loginLogs: 0,
  });

  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [loginLogs, setLoginLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  const token = localStorage.getItem("token");

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [studentsRes, departmentsRes, superadminsRes] = await Promise.all([
        fetch("http://localhost:5000/admin/students", {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
        fetch("http://localhost:5000/admin/departments").then((r) => r.json()),
        fetch("http://localhost:5000/admin/get-superAdmins", {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
      ]);

      setStats({
        students: studentsRes?.data?.length || 0,
        departments: departmentsRes?.data?.length || 0,
        superadmins: superadminsRes?.data?.length || 0,
        loginLogs: loginLogs.length,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
    setLoading(false);
  };

  const fetchLoginLogs = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/admin/staff-login-logs",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();

      if (data.success) {
        setLoginLogs(data.data || []);
        setStats((prev) => ({ ...prev, loginLogs: data.data?.length || 0 }));
      }
    } catch (err) {
      console.error("Error fetching login logs:", err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchLoginLogs();
  }, []);

  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: FiHome,
      color: "blue",
      description: "Overview and analytics",
    },
    {
      id: "departments",
      label: "Departments",
      icon: FaBuilding,
      color: "green",
      description: "Manage departments",
    },
    {
      id: "users",
      label: "Students",
      icon: FiUsers,
      color: "purple",
      description: "Manage system users",
    },
    {
      id: "superadmins",
      label: "Super Admins",
      icon: FiShield,
      color: "orange",
      description: "Manage administrators",
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: "bg-sky-50",
        border: "border-sky-200",
        text: "text-sky-600",
        dark: "bg-sky-500",
      },
      green: {
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        text: "text-emerald-600",
        dark: "bg-emerald-500",
      },
      purple: {
        bg: "bg-violet-50",
        border: "border-violet-200",
        text: "text-violet-600",
        dark: "bg-violet-500",
      },
      orange: {
        bg: "bg-rose-50",
        border: "border-rose-200",
        text: "text-rose-600",
        dark: "bg-rose-500",
      },
      red: {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-600",
        dark: "bg-red-500",
      },
    };
    return colors[color] || colors.blue;
  };

  const StatCard = ({ title, value, color = "blue", icon: Icon, loading }) => {
    const colorClass = getColorClasses(color);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-2xl border-2 ${colorClass.border} ${colorClass.bg} backdrop-blur-sm`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 rounded-lg animate-pulse"></div>
            ) : (
              <p className={`text-3xl font-bold ${colorClass.text}`}>{value}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${colorClass.bg}`}>
            <Icon className={`h-6 w-6 ${colorClass.text}`} />
          </div>
        </div>
      </motion.div>
    );
  };

  // Pagination for login logs
  const paginatedLogs = loginLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderContent = () => {
    const components = {
      departments: AddDepartmentForm,
      users: AddUserForm,
      superadmins: AddSuperAdmin,
    };

    const ActiveComponent = components[activeTab];

    return (
      <div className="space-y-8">
        {activeTab === "dashboard" && (
          <>
            {/* Stats Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <StatCard
                title="Total Students"
                value={stats.students}
                color="blue"
                icon={FiUsers}
                loading={loading}
              />
              <StatCard
                title="Departments"
                value={stats.departments}
                color="green"
                icon={FaBuilding}
                loading={loading}
              />
              <StatCard
                title="Super Admins"
                value={stats.superadmins}
                color="orange"
                icon={FiShield}
                loading={loading}
              />
            </motion.section>

            {/* Staff Login Logs Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center ">
                <div>
                  <h2 className="text-2xl font-bold text-[#00539C] mt-5">
                    Staff Login Logs
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Recent staff login activities
                  </p>
                </div>
                <button
                  onClick={fetchLoginLogs}
                  disabled={loading}
                  className="flex items-center gap-2  text-black px-4 py-2.5 rounded-lg disabled:opacity-50 transition-colors duration-200 border border-gray-300"
                >
                  <FiRefreshCw
                    size={16}
                    className={loading ? "animate-spin" : ""}
                  />
                </button>
              </div>

              {/* Login Logs Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-300 relative">
                <table className="w-full text-left font-semibold">
                  <thead className="bg-[#00539C] text-white">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-sm rounded-tl-xl">
                        Staff ID
                      </th>
                      <th className="px-6 py-4 font-semibold text-sm">
                        Staff Name
                      </th>
                      <th className="px-6 py-4 font-semibold text-sm">
                        Login Time
                      </th>
                      <th className="px-6 py-4 font-semibold text-sm">
                        IP Address
                      </th>
                      <th className="px-6 py-4 font-semibold text-sm rounded-tr-xl">
                        User Agent
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="transition-colors duration-150 hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 text-gray-700">
                          {log.staffId}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {log.staffName}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {formatDate(log.loginAt)}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {log.ipAddress === "::1"
                            ? "N/A"
                            : log.ipAddress || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-gray-700 rounded-r-lg">
                          <div
                            className="max-w-xs truncate"
                            title={log.userAgent}
                          >
                            {log.userAgent || "N/A"}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {paginatedLogs.length === 0 && (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          <div className="flex flex-col items-center justify-center">
                            <FiLogIn className="h-12 w-12 text-gray-300 mb-2" />
                            <p className="text-sm">No login logs found</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination - Simplified with Ellipsis */}
              {loginLogs.length > itemsPerPage && (
                <div className="flex justify-center items-center gap-1 mt-6">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Previous
                  </button>

                  {/* Always show first page */}
                  <button
                    onClick={() => setCurrentPage(1)}
                    className={`w-9 h-9 flex items-center justify-center border rounded-lg text-sm transition-colors duration-200 ${
                      currentPage === 1
                        ? "bg-[#00539C] text-white border-[#00539C]"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    1
                  </button>

                  {/* Show ellipsis if current page is far from start */}
                  {currentPage > 3 && (
                    <span className="px-2 text-gray-500">...</span>
                  )}

                  {/* Show pages around current page */}
                  {[currentPage - 1, currentPage, currentPage + 1]
                    .filter(
                      (page) =>
                        page > 1 &&
                        page < Math.ceil(loginLogs.length / itemsPerPage)
                    )
                    .map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-9 h-9 flex items-center justify-center border rounded-lg text-sm transition-colors duration-200 ${
                          currentPage === page
                            ? "bg-[#00539C] text-white border-[#00539C]"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                  {/* Show ellipsis if current page is far from end */}
                  {currentPage <
                    Math.ceil(loginLogs.length / itemsPerPage) - 2 && (
                    <span className="px-2 text-gray-500">...</span>
                  )}

                  {/* Always show last page */}
                  {Math.ceil(loginLogs.length / itemsPerPage) > 1 && (
                    <button
                      onClick={() =>
                        setCurrentPage(
                          Math.ceil(loginLogs.length / itemsPerPage)
                        )
                      }
                      className={`w-9 h-9 flex items-center justify-center border rounded-lg text-sm transition-colors duration-200 ${
                        currentPage ===
                        Math.ceil(loginLogs.length / itemsPerPage)
                          ? "bg-[#00539C] text-white border-[#00539C]"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {Math.ceil(loginLogs.length / itemsPerPage)}
                    </button>
                  )}

                  <button
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(
                          Math.ceil(loginLogs.length / itemsPerPage),
                          p + 1
                        )
                      )
                    }
                    disabled={
                      currentPage === Math.ceil(loginLogs.length / itemsPerPage)
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Next
                  </button>
                </div>
              )}
            </motion.section>
          </>
        )}

        {/* Component Section */}
        {activeTab !== "dashboard" && activeTab !== "login-logs" && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl"
          >
            <div className="">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {ActiveComponent && <ActiveComponent />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.section>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-10">
        {/* Navigation Tabs */}
        <div className="px-6">
          <div className="flex space-x-1 bg-gray-100/50 rounded-xl p-1 backdrop-blur-sm">
            {tabs.map((tab) => {
              const colorClass = getColorClasses(tab.color);
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex-1 justify-center border border-gray-200 ${
                    activeTab === tab.id
                      ? `${colorClass.bg} ${colorClass.text} shadow-sm`
                      : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-8xl mx-auto">{renderContent()}</div>
    </main>
  );
};

export default AdminDashboard;
