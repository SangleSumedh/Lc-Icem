import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import AdminNavbar from "./Admin/AdminNavbar";

function NotFound() {
  const navigate = useNavigate();
  const canGoBack = window.history.length > 1;

  return (
    <>
      <AdminNavbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#00539C]/10 via-white to-[#00539C]/5 px-6">
        {/* 404 Text */}
        <h1 className="text-[8rem] font-extrabold text-[#00539C] tracking-tight drop-shadow-sm select-none">
          404
        </h1>

        {/* Message */}
        <p className="text-2xl md:text-3xl font-semibold text-gray-800 mt-2">
          Oops! Page not found.
        </p>
        <p className="text-gray-500 text-center max-w-md mt-3">
          The page you’re looking for doesn’t exist, was moved, or might have
          been deleted.
        </p>

        {/* Action Button */}
        <button
          onClick={() => (canGoBack ? navigate(-1) : navigate("/"))}
          className="mt-8 inline-flex items-center gap-2 bg-[#00539C] text-white text-sm md:text-base font-medium px-5 py-2.5 rounded-lg shadow-md hover:bg-[#00407d] hover:shadow-lg active:scale-[0.98] transition-all duration-200"
        >
          {canGoBack ? (
            <>
              <ArrowLeft size={18} />
              Go Back
            </>
          ) : (
            <>
              <Home size={18} />
              Go Home
            </>
          )}
        </button>

        {/* Decorative Line */}
        <div className="mt-10 w-32 h-1 rounded-full bg-[#00539C]/60"></div>

        {/* Footer Message */}
        <p className="text-xs text-gray-400 mt-6 tracking-wide">
          © {new Date().getFullYear()} — Admin Portal
        </p>
      </div>
    </>
  );
}

export default NotFound;
