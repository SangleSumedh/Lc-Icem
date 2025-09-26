import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "../components/Admin/AdminNavbar";
import AdminSidebar from "../components/Admin/AdminSidebar";

function Student() {
  const [collapsed, setCollapsed] = useState(false); // 🔹 state here

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-r from-gray-50 to-gray-100">
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 right-0 h-20 z-50">
        <AdminNavbar />
      </div>

      <div className="flex flex-1 pt-20">
        {/* Sidebar */}
        <div className="fixed top-20 left-0 h-[calc(100vh-80px)] z-40">
          <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} /> {/* ✅ pass props */}
        </div>

        {/* Main Content */}
        <main
          className={`${collapsed ? "ml-20" : "ml-64"} mt-2 flex-1 overflow-y-auto p-6 transition-all duration-300`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Student;
