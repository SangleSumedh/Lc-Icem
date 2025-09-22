import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "/Logo.png";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    department: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: false,
      });
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();

    const errors = {
      username: !formData.username,
      department: !formData.department,
      password: !formData.password,
    };

    setFormErrors(errors);

    if (!errors.username && !errors.department && !errors.password) {
      // Dummy login logic
      navigate("/admin-dashboard");
    }
  };

  const handleForgetPassword = () => {
    navigate("/forget-password");
  };

  const handleStudentLogin = () => {
    navigate("/");
  };

  return (
    <div className="h-screen w-full flex flex-col bg-white">
      {/* Navbar */}
      <header className="bg-[#00539C] text-white shadow-lg">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Left - Logo */}
            <div className="flex items-center">
              <img src={Logo} alt="Logo" className="h-16" />
            </div>

            {/* Right - Navigation Links */}
            <div className="flex space-x-4">
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                Student Login
              </button>
              <button
                onClick={() => navigate("/admin-login")}
                className="px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                Admin Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-4 py-2 rounded-lg bg-white text-[#00539C] hover:bg-gray-100 transition-colors"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left - Image */}
        <div className="w-1/2 flex items-center justify-center bg-gray-100">
          <img
            src="image.png"
            alt="Admin illustration"
            className="w-full object-contain h-auto"
          />
        </div>

        {/* Right - Admin Login Form */}
        <div className="w-1/2 bg-[#003C84] p-5 flex items-start justify-center">
          <div className="max-w-md w-full text-white">
            <div className="text-center mb-8">
              <div className="mx-auto mb-4 w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 
                    1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 
                    0 001.065 2.572c1.756.426 1.756 2.924 0 
                    3.35a1.724 1.724 0 00-1.066 2.573c.94 
                    1.543-.826 3.31-2.37 2.37a1.724 1.724 
                    0 00-2.572 1.065c-.426 1.756-2.924 
                    1.756-3.35 0a1.724 1.724 0 
                    00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 
                    1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 
                    0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 
                    2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Admin Login
              </h1>
              <p className="text-white/80">Enter your admin credentials</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-white/90 text-sm font-medium mb-2"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border border-white/30 rounded-xl text-white placeholder-white/60 
                  focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 backdrop-blur-sm ${
                    formErrors.username ? "bg-red-500/20" : "bg-white/20"
                  }`}
                  placeholder="Enter admin username"
                />
                {formErrors.username && (
                  <p className="mt-1 text-xs text-red-300">
                    Username is required
                  </p>
                )}
              </div>

              {/* Department */}
              <div>
                <label
                  htmlFor="department"
                  className="block text-white/90 text-sm font-medium mb-2"
                >
                  Department
                </label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border border-white/30 rounded-xl text-white placeholder-white/60 
                  focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 backdrop-blur-sm ${
                    formErrors.department ? "bg-red-500/20" : "bg-white/20"
                  }`}
                >
                  <option value="" className="text-gray-800">
                    Select Department
                  </option>
                  <option value="IT" className="text-gray-800">
                    IT
                  </option>
                  <option value="HR" className="text-gray-800">
                    HR
                  </option>
                  <option value="Finance" className="text-gray-800">
                    Finance
                  </option>
                  <option value="Operations" className="text-gray-800">
                    Operations
                  </option>
                </select>
                {formErrors.department && (
                  <p className="mt-1 text-xs text-red-300">
                    Department is required
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-white/90 text-sm font-medium mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border border-white/30 rounded-xl text-white placeholder-white/60 
                  focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 backdrop-blur-sm ${
                    formErrors.password ? "bg-red-500/20" : "bg-white/20"
                  }`}
                  placeholder="Enter admin password"
                />
                {formErrors.password && (
                  <p className="mt-1 text-xs text-red-300">
                    Password is required
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-white text-[#003C84] font-semibold py-3 px-6 rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg backdrop-blur-sm border border-white/30 flex items-center justify-center space-x-3"
              >
                <span>Admin Login</span>
              </button>
            </form>

            <div className="mt-6 flex justify-between text-sm">
              <button
                onClick={handleForgetPassword}
                className="text-white/80 hover:text-white underline transition-colors duration-200"
              >
                Forget Password?
              </button>
              <button
                onClick={handleStudentLogin}
                className="text-white/80 hover:text-white underline transition-colors duration-200"
              >
                Student Login
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-white/60 text-sm">
                Administrative access only
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
