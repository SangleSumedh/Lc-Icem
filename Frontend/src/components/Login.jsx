import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import Logo from "/Logo.png";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({
    username: false,
    password: false,
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: false,
      });
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    // Check for errors
    const errors = {
      username: !formData.username,
      password: !formData.password,
    };

    setFormErrors(errors);

    // If no errors, proceed with login
    if (!errors.username && !errors.password && agreeToTerms) {
      // Dummy login logic - just navigate to student dashboard
      navigate("/student");
    }
  };

  const handleRegisterBtn = (e) => {
    e.preventDefault();
    navigate("/register");
  };

  const handleAdminLogin = () => {
    navigate("/admin-login");
  };

  const handleForgetPassword = () => {
    navigate("/forget-password");
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

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 flex items-center justify-center bg-gray-100">
          <img
            src="image.png"
            alt="Students collaborating"
            className="w-full object-contain h-auto"
          />
        </div>

        {/* Right side - Login Form */}
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">ICEM CRM</h1>
              <p className="text-white/80">
                Enter your credentials to continue
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
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
                  className={`w-full px-4 py-3 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 backdrop-blur-sm ${
                    formErrors.username ? "bg-red-500/20" : "bg-white/20"
                  }`}
                  placeholder="Enter your username"
                />
                {formErrors.username && (
                  <p className="mt-1 text-xs text-red-300">
                    Username is required
                  </p>
                )}
              </div>

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
                  className={`w-full px-4 py-3 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 backdrop-blur-sm ${
                    formErrors.password ? "bg-red-500/20" : "bg-white/20"
                  }`}
                  placeholder="Enter your password"
                />
                {formErrors.password && (
                  <p className="mt-1 text-xs text-red-300">
                    Password is required
                  </p>
                )}
              </div>

              <div className="flex items-start">
                <input
                  id="terms-checkbox"
                  name="terms-checkbox"
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={() => setAgreeToTerms(!agreeToTerms)}
                  className="h-4 w-4 mt-1 text-white border-white/50 rounded focus:ring-white/50"
                />
                <label
                  htmlFor="terms-checkbox"
                  className="ml-2 block text-sm text-white/90"
                >
                  I have read and agree with the ICEM CRM Agreement, Terms of
                  service and have read the Privacy Policy.
                </label>
              </div>

              {formSubmitted && !agreeToTerms && (
                <p className="text-red-300 text-xs">
                  You must agree to the terms and conditions
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-white text-[#003C84] font-semibold py-3 px-6 rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg backdrop-blur-sm border border-white/30 flex items-center justify-center space-x-3"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                <span>Login</span>
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
                onClick={handleRegisterBtn}
                className="text-white/80 hover:text-white underline transition-colors duration-200"
              >
                Register
              </button>
              <button
                onClick={handleAdminLogin}
                className="text-white/80 hover:text-white underline transition-colors duration-200"
              >
                Admin Login
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-white/60 text-sm">
                Secure access to your student dashboard
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
