// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./components/Login";
import ForgetPassword from "./components/ForgetPassword";
import AdminLogin from "./components/AdminLogin";

import StudentDashboard from "./components/User/StudentDashboard";
import LeavingCertificate from "./components/User/LeavingCertificate";
import MyDetails from "./components/User/MyDetails";

import AdminDashboard from "./components/Admin/AdminDashboard";
import AddDepartmentForm from "./components/Admin/AddDepartmentForm";
import AddUserForm from "./components/Admin/AddUserForm";
import DepartmentDashboard from "./components/Admin/DepartmentDashboard";

import Admin from "./Pages/Admin";
import Student from "./Pages/Student";
import NotFound from "./components/NotFound";
import Register from "./components/Register"; // ✅ Missing import added

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} /> {/* ✅ Register fixed */}
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Student Dashboard */}
        <Route path="/student" element={<Student />}>
          <Route index element={<StudentDashboard />} />
          <Route path="my-details" element={<MyDetails />} />
          <Route path="leaving-certificate" element={<LeavingCertificate />} />
        </Route>

        {/* Admin Dashboard */}
        <Route path="/admin-dashboard" element={<Admin />}>
          <Route index element={<AdminDashboard />} />
          <Route path="add-department" element={<AddDepartmentForm />} />
          <Route path="add-user" element={<AddUserForm />} />

          {/* ✅ Dynamic Department Dashboard */}
          <Route path=":deptKey" element={<DepartmentDashboard />} />
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
