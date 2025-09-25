import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import Logo from "/Logo.png";

function AdminNavbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);

        if (decoded.role === "student") {
          setDisplayName("Student");
        } else if (decoded.role === "superadmin") {
          setDisplayName("Super Admin");
        } else if (decoded.role === "department") {
          setDisplayName(decoded.deptName || "Department");
        } else {
          setDisplayName("User");
        }
      } catch (err) {
        console.error("Invalid token:", err);
        setDisplayName("User");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <header className="bg-[#00539C] text-white shadow-lg z-50 h-20 flex items-center">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <img src={Logo} alt="Logo" className="h-16" />
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#00539C] font-bold shadow">
                <User className="w-6 h-6" />
              </div>
              <span className="hidden sm:inline text-white font-medium">
                {displayName}
              </span>
            </button>

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
