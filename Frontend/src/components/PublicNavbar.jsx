import React from "react";
import { useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa"; // ✅ Using the new Home icon
import Logo from "/Logo.png";

function PublicNavbar() {
  const navigate = useNavigate();

  return (
    <header className="bg-[#00539C] text-white shadow-lg z-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Left - Logo */}
          <div className="flex items-center">
            <img src={Logo} alt="Logo" className="h-20" />
          </div>

          {/* Right - Register + Home */}
          <div className="flex items-center space-x-6">
            {/* Register Button */}
            <button
              onClick={() => navigate("/register")}
              className="bg-white text-[#00539C] px-6 py-3 rounded-lg font-medium shadow hover:bg-gray-100 transition"
            >
              Register
            </button>

            {/* Home Icon */}
            <button className="text-white hover:text-gray-200 transition">
              <a href="https://indiraicem.ac.in" target="_blank">
                <FaHome className="w-7 h-7" /> {/* Bigger, pure white icon */}
              </a>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default PublicNavbar;
