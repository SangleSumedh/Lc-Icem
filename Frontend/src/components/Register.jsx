import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import Logo from "/Logo.png";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    prn: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({
    fullName: false,
    prn: false,
    email: false,
    phoneNumber: false,
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

  const handleRegister = (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    // Check for errors
    const errors = {
      fullName: !formData.fullName,
      prn: !formData.prn,
      email: !formData.email,
      phoneNumber: !formData.phoneNumber,
      password: !formData.password,
    };

    setFormErrors(errors);

    // If no errors, proceed with registration
    if (
      !errors.fullName &&
      !errors.prn &&
      !errors.email &&
      !errors.phoneNumber &&
      !errors.password &&
      agreeToTerms
    ) {
      // Dummy registration logic - just navigate to login
      navigate("/");
    }
  };

  const handleLoginBtn = (e) => {
    e.preventDefault();
    navigate("/");
  };

  const handleAdminLogin = () => {
    navigate("/admin-login");
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
        {/* Left side - Image */}
        <div className="w-1/2 flex items-center justify-center bg-gray-100">
          <img
            src="image.png"
            alt="Students collaborating"
            className="w-full object-contain h-auto"
          />
        </div>

        {/* Right side - Register Form */}
        <div className="w-1/2 bg-[#003C84] p-5 flex items-start justify-center overflow-y-auto">
          <div className="max-w-md w-full text-white py-4">
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">ICEM CRM</h1>
              <p className="text-white/80 text-sm">
                Create your account to get started
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-white/90 text-sm font-medium mb-1"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 backdrop-blur-sm ${
                    formErrors.fullName ? "bg-red-500/20" : "bg-white/20"
                  }`}
                  placeholder="Enter your full name"
                />
                {formErrors.fullName && (
                  <p className="mt-1 text-xs text-red-300">
                    Full Name is required
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="prn"
                  className="block text-white/90 text-sm font-medium mb-1"
                >
                  PRN
                </label>
                <input
                  type="text"
                  id="prn"
                  name="prn"
                  value={formData.prn}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 backdrop-blur-sm ${
                    formErrors.prn ? "bg-red-500/20" : "bg-white/20"
                  }`}
                  placeholder="Enter your PRN"
                />
                {formErrors.prn && (
                  <p className="mt-1 text-xs text-red-300">PRN is required</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-white/90 text-sm font-medium mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 backdrop-blur-sm ${
                    formErrors.email ? "bg-red-500/20" : "bg-white/20"
                  }`}
                  placeholder="Enter your email"
                />
                {formErrors.email && (
                  <p className="mt-1 text-xs text-red-300">Email is required</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-white/90 text-sm font-medium mb-1"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 backdrop-blur-sm ${
                    formErrors.phoneNumber ? "bg-red-500/20" : "bg-white/20"
                  }`}
                  placeholder="Enter your phone number"
                />
                {formErrors.phoneNumber && (
                  <p className="mt-1 text-xs text-red-300">
                    Phone Number is required
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-white/90 text-sm font-medium mb-1"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 backdrop-blur-sm ${
                    formErrors.password ? "bg-red-500/20" : "bg-white/20"
                  }`}
                  placeholder="Create a password"
                />
                {formErrors.password && (
                  <p className="mt-1 text-xs text-red-300">
                    Password is required
                  </p>
                )}
              </div>

              <div className="flex items-start pt-2">
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
                  className="ml-2 block text-xs text-white/90"
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
                className="w-full bg-white text-[#003C84] font-semibold py-2 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg backdrop-blur-sm border border-white/30 flex items-center justify-center space-x-2 mt-4"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                <span className="text-sm">Register</span>
              </button>
            </form>

            <div className="mt-4 flex justify-between text-xs">
              <button
                onClick={handleLoginBtn}
                className="text-white/80 hover:text-white underline transition-colors duration-200"
              >
                Already have an account? Login
              </button>
              <button
                onClick={handleAdminLogin}
                className="text-white/80 hover:text-white underline transition-colors duration-200"
              >
                Admin Login
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-white/60 text-xs">
                Secure access to your student dashboard
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
