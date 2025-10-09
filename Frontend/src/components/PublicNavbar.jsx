import React from "react";
import { useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import Logo from "/Logo.png";

function PublicNavbar() {
  const navigate = useNavigate();

  return (
    <header className="bg-[#00539C] text-white shadow-lg z-50">
      <div className="max-w-8xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center py-3 md:py-4">
          {/* Left - Logo */}
          <div className="flex items-center">
            <img
              src={Logo}
              alt="Logo"
              className="h-12 sm:h-16 md:h-20 transition-all duration-200"
            />
          </div>

          {/* Right - Register + Home */}
          <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-6">
            {/* Register Button */}
            <button
              onClick={() => navigate("/register")}
              className="bg-white text-[#00539C] px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg font-medium shadow hover:bg-gray-100 transition-all duration-200 text-sm sm:text-base whitespace-nowrap"
            >
              Register
            </button>

            {/* Home Icon */}
            <button className="text-white hover:text-gray-200 transition p-1 sm:p-1.5 rounded-lg hover:bg-white/10">
              <a
                href="https://indiraicem.ac.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center"
              >
                <FaHome className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 transition-all duration-200" />
              </a>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default PublicNavbar;
