import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./components/Login";
import ForgetPassword from "./components/ForgetPassword";
import AdminLogin from "./components/AdminLogin";

import StudentDashboard from "./components/User/StudentDashboard";
import LeavingCertificate from "./components/User/LeavingCertificate";
import MyDetails from "./components/User/MyDetails";

import AdminDashboard from "./components/Admin/AdminDashboard";
import LibraryDashboard from "./components/Admin/LibraryDashboard";
import HODDashboard from "./components/Admin/HODDashboard";
import AccountsDashboard from "./components/Admin/AccountDashboard";
import HostelDashboard from "./components/Admin/HostelDashboard";

// ✅ Newly Added Pages
import AlumniDashboard from "./components/Admin/AdminDashboard";

import Register from "./components/Register";
import AddDepartmentForm from "./components/Admin/AddDepartmentForm";
import AddUserForm from "./components/Admin/AddUserForm";

import Admin from "./Pages/Admin";
import Student from "./Pages/Student";
import NotFound from "./components/NotFound";
import ExamSection from "./components/Admin/ExamSection";
import Bus from "./components/Admin/Bus";
import CentralPlacementDepartment from "./components/Admin/CentralPlacementDepartment";
import Scholarship from "./components/Admin/Scholarship";
import DepartmentPlacementCoordinator from "./components/Admin/DepartmentPlacementCoordinator";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Student Dashboard */}
        <Route path="/student" element={<Student />}>
          <Route index element={<StudentDashboard />} /> {/* Default page */}
          <Route path="my-details" element={<MyDetails />} />
          <Route path="leaving-certificate" element={<LeavingCertificate />} />
        </Route>

        {/* Admin Dashboard */}
        <Route path="/admin-dashboard" element={<Admin />}>
          <Route index element={<AdminDashboard />} />
          <Route path="add-department" element={<AddDepartmentForm />} />
          <Route path="add-user" element={<AddUserForm />} />
          <Route path="library" element={<LibraryDashboard />} />
          <Route path="account" element={<AccountsDashboard />} />
          <Route path="hostel" element={<HostelDashboard />} />

          {/* ✅ HOD Dynamic Route */}
          <Route path="hod-computer-science" element={<HODDashboard />} />

          {/* ✅ New Sections */}
          <Route path="alumni" element={<AlumniDashboard />} />
          <Route path="placement" element={<CentralPlacementDepartment />} />
          <Route
            path="department-placement"
            element={<DepartmentPlacementCoordinator />}
          />
          <Route path="scholarship" element={<Scholarship />} />
          <Route path="exam" element={<ExamSection />} />
          <Route path="bus" element={<Bus />} />
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
