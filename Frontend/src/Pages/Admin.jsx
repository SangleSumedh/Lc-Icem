import React from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "../components/Admin/AdminNavbar";
import AdminSidebar from "../components/Admin/AdminSidebar";

function Admin() {
  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-r from-gray-100 to-gray-200">
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 right-0 h-20 z-50">
        <AdminNavbar />
      </div>

      <div className="flex flex-1 pt-20">
        {/* Fixed Sidebar */}
        <div className="fixed top-20 left-0 h-[calc(100vh-80px)] z-40">
          {/* <AdminSidebar /> */}
        </div>

        {/* Main Content (scrollable) */}
        <main className="ml-64 flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Admin;
