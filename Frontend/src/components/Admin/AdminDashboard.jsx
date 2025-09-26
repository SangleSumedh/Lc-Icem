import React, { useEffect, useState } from "react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    students: 0,
    departments: 0,
    superadmins: 0,
  });

  const token = localStorage.getItem("token");

  const fetchStats = async () => {
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
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <main className="p-6">
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold text-gray-600">Students</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.students}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold text-gray-600">Departments</h3>
          <p className="text-3xl font-bold text-green-600">{stats.departments}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold text-gray-600">SuperAdmins</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.superadmins}</p>
        </div>
      </div>
    </main>
  );
};

export default AdminDashboard;
