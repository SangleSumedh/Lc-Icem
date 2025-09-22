import React from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "../components/Admin/AdminNavbar";
import AdminSidebar from "../components/Admin/AdminSidebar";

function Student() {
  return (
    <div className="min-h-screen flex-1 w-full bg-gradient-to-r from-gray-50 to-gray-100">
      {/* Navbar */}
      <AdminNavbar />

      <div className="flex w-full">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content (dynamic based on route) */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Student;
