import React from "react";
import { useNavigate } from "react-router-dom";
import PublicNavbar from "./PublicNavbar";

const AuthLayout = ({ title, description, points, children, currentPage }) => {
  const navigate = useNavigate();

  const links = {
    login: [{ label: "Admin Login", path: "/admin-login" }],
    register: [
      { label: "Student Login", path: "/" },
      { label: "Admin Login", path: "/admin-login" },
    ],
    admin: [{ label: "Student Login", path: "/" }],
  };

  const footerLinks = links[currentPage] || [];

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-100">
      {/* Navbar */}
      <PublicNavbar />

      {/* Centered Container */}
      <div className="flex flex-1 items-center justify-center py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex w-full max-w-6xl h-auto min-h-[500px] sm:h-[580px] lg:h-[620px] shadow-xl sm:shadow-2xl rounded-xl overflow-hidden bg-white">
          {/* 🔹 Left Info Section - Hidden on mobile, visible on tablet and up */}
          <div className="hidden md:flex md:w-1/2 p-6 lg:p-8 xl:p-12 bg-gradient-to-b from-[#00539C] to-[#003C84] text-white flex-col justify-center">
            <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold mb-4">{title}</h1>
            <p className="mb-6 text-sm lg:text-base">{description}</p>
            <ul className="space-y-2 lg:space-y-3 text-xs lg:text-sm">
              {points.map((point, idx) => (
                <li key={idx}>✔ {point}</li>
              ))}
            </ul>
          </div>

          {/* Right Form Section - Full width on mobile, half on tablet and up */}
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-10 xl:p-12 bg-gray-50">
            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md">{children}</div>

            {/* Footer Links */}
            {footerLinks.length > 0 && (
              <div className="mt-6 flex justify-center space-x-4 sm:space-x-6 lg:space-x-8">
                {footerLinks.map((link, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigate(link.path)}
                    className="relative text-[#00539C] font-medium text-xs sm:text-sm
                               after:content-[''] after:absolute after:w-0 after:h-[2px] after:left-0 after:-bottom-0.5
                               after:bg-[#00539C] after:transition-all after:duration-300
                               hover:after:w-full hover:text-[#003C84]"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;