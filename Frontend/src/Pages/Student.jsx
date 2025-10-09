import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "../components/Admin/AdminNavbar";
import AdminSidebar from "../components/Admin/AdminSidebar";

function Student() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="w-full flex flex-col min-h-screen">
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 right-0 h-20 z-50">
        <AdminNavbar />
      </div>

      <div className="flex flex-1 pt-20">
        {/* Desktop Sidebar only */}
        <div className="fixed top-20 left-0 h-[calc(100vh-80px)] z-40">
          <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>

        {/* Main Content */}
        <main
          className={`flex-1 overflow-y-auto p-6 transition-all duration-300
            ${collapsed ? "md:ml-20" : "md:ml-64"}
          `}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Student;
