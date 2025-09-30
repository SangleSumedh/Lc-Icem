import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./components/Login";
import Register from "./components/Register";
import ForgetPassword from "./components/ForgetPassword";
import AdminLogin from "./components/AdminLogin";

import StudentDashboard from "./components/User/StudentDashboard";
import LeavingCertificate from "./components/User/LeavingCertificate";
import RaiseTicket from "./components/User/RasieTicket";

import AdminDashboard from "./components/Admin/AdminDashboard";
import AddDepartmentForm from "./components/Admin/AddDepartmentForm";
import AddUserForm from "./components/Admin/AddUserForm";
import AddSuperAdmin from "./components/Admin/AddSuperAdmin";
import DepartmentDashboard from "./components/Admin/DepartmentDashboard";
import RequestedInfoApprovals from "./components/Admin/RequestedInfoApprovals";
import RaisedTicket from "./components/Admin/RaisedTicket";

import Admin from "./Pages/Admin";
import Student from "./Pages/Student";
import NotFound from "./components/NotFound";

import ProtectedRoutes from "./components/ProtectedRoutes"; // ✅ Import wrapper

function App() {
  return (
    <Router>
      <Routes>
        {/* 🌍 Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* 🎓 Student Protected Routes */}
        <Route
          element={
            <ProtectedRoutes
              allowedRoles={["student"]}
              redirectTo="/"
            />
          }
        >
          <Route path="/student" element={<Student />}>
            <Route index element={<StudentDashboard />} />
            <Route path="leaving-certificate" element={<LeavingCertificate />} />
            <Route path="raise-tickets" element={<RaiseTicket />} />
          </Route>
        </Route>

        {/* 🏢 Admin / Department Protected Routes */}
        <Route
          element={
            <ProtectedRoutes
              allowedRoles={["superadmin", "department"]}
              redirectTo="/admin-login"
            />
          }
        >
          <Route path="/admin-dashboard" element={<Admin />}>
            {/* Department views */}
            <Route path=":deptKey" element={<DepartmentDashboard />} />
            <Route path=":deptKey/requested-info" element={<RequestedInfoApprovals />} />
            <Route path=":deptKey/raised-tickets" element={<RaisedTicket />} />

            {/* 👑 SuperAdmin views */}
            <Route index element={<AdminDashboard />} />
            <Route path="add-department" element={<AddDepartmentForm />} />
            <Route path="add-user" element={<AddUserForm />} />
            <Route path="add-superadmin" element={<AddSuperAdmin />} />
          </Route>
        </Route>

        {/* ❌ 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
