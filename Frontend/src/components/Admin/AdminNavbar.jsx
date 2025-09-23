import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react"; // icons
import Logo from "/Logo.png";

function AdminNavbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = localStorage.getItem("username");

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <header className="bg-[#00539C] text-white shadow-lg z-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Left - Logo */}
          <div className="flex items-center">
            <img src={Logo} alt="" className="h-20 " />
          </div>

          {/* Right - Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#00539C] font-bold shadow">
                <User className="w-6 h-6" />
              </div>
              <span className="hidden sm:inline text-white font-medium">
                {user || "Admin"}
              </span>
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-2 z-50">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminNavbar;
