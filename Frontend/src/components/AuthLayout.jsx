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
    <div className="h-screen w-full flex flex-col bg-gray-100">
      {/* Navbar */}
      <PublicNavbar />

      {/* Centered Container */}
      <div className="flex flex-1 items-center justify-center">
        <div className="flex w-full max-w-6xl h-[620px] shadow-2xl rounded-xl overflow-hidden bg-white">
          {/* 🔹 Left Info Section (back to original) */}
          <div className="w-1/2 p-12 bg-gradient-to-b from-[#00539C] to-[#003C84] text-white flex flex-col justify-center">
            <h1 className="text-4xl font-bold mb-4">{title}</h1>
            <p className="mb-6 text-base">{description}</p>
            <ul className="space-y-3 text-sm">
              {points.map((point, idx) => (
                <li key={idx}>✔ {point}</li>
              ))}
            </ul>
          </div>

          {/* Right Form Section */}
          <div className="w-1/2 flex flex-col items-center justify-center p-10 bg-gray-50">
            <div className="w-full max-w-md">{children}</div>

            {/* Footer Links */}
            {footerLinks.length > 0 && (
              <div className="mt-6 flex justify-center space-x-8">
                {footerLinks.map((link, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigate(link.path)}
                    className="relative text-[#00539C] font-medium text-sm
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
