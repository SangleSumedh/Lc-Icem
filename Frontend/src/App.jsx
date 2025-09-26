import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./components/Login";
import Register from "./components/Register";
import ForgetPassword from "./components/ForgetPassword";
import AdminLogin from "./components/AdminLogin";

import StudentDashboard from "./components/User/StudentDashboard";
import LeavingCertificate from "./components/User/LeavingCertificate";

import AdminDashboard from "./components/Admin/AdminDashboard";
import AddDepartmentForm from "./components/Admin/AddDepartmentForm";
import AddUserForm from "./components/Admin/AddUserForm";
import AddSuperAdmin from "./components/Admin/AddSuperAdmin";
import DepartmentDashboard from "./components/Admin/DepartmentDashboard";

import Admin from "./Pages/Admin";
import Student from "./Pages/Student";
import NotFound from "./components/NotFound";

function App() {
  return (
    <Router>
      <Routes>
        {/* 🌍 Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* 🎓 Student Dashboard */}
        <Route path="/student" element={<Student />}>
          <Route index element={<StudentDashboard />} />
          <Route path="leaving-certificate" element={<LeavingCertificate />} />
        </Route>

        {/* 🏢 Department Admin Dashboard */}
        <Route path="/admin-dashboard" element={<Admin />}>
          <Route path=":deptKey" element={<DepartmentDashboard />} />
        </Route>

        {/* 👑 SuperAdmin Dashboard */}
        <Route path="/admin-dashboard" element={<Admin />}>
          <Route index element={<AdminDashboard />} />
          <Route path="add-department" element={<AddDepartmentForm />} />
          <Route path="add-user" element={<AddUserForm />} />
          <Route path="add-superadmin" element={<AddSuperAdmin />} />
        </Route>

        {/* ❌ 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
