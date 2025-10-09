import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import AdminNavbar from "../components/Admin/AdminNavbar";
import {
  User,
  Shield,
  Building,
  Key,
  Save,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import ENV from "../env";

const PasswordInput = ({
  value,
  onChange,
  placeholder,
  showPassword,
  setShowPassword,
}) => (
  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring focus:gray-[#00539C]  transition-all duration-200"
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
    >
      {showPassword ? (
        <EyeOff className="w-5 h-5" />
      ) : (
        <Eye className="w-5 h-5" />
      )}
    </button>
  </div>
);

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (!token) return navigate("/");

    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
    } catch {
      navigate("/");
    }
  }, [token, navigate]);

  const handleGoBack = () => {
    navigate(-1);
  };

const handleChangePassword = async () => {
  if (!oldPassword) {
    return toast.error("Please enter your current password");
  }

  if (!newPassword) {
    return toast.error("Please enter a new password");
  }

  if (newPassword.length < 6) {
    return toast.error("Password must be at least 6 characters long");
  }

  if (newPassword !== confirmPassword) {
    return toast.error("Passwords do not match");
  }

  let url = "";
  let payload = { oldPassword, newPassword };

  if (role === "student") {
    url = "/auth/student/change-password";
  } else if (role === "department") {
    url = "/auth/department/change-password";
  } else if (role === "superadmin") {
    url = "/auth/admin/change-password";
  } else {
    return toast.error("Invalid user role");
  }

  const toastId = toast.loading("Changing password...");
  setIsLoading(true);

  try {
    const response = await axios.post(`${ENV.BASE_URL}${url}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const { success, message } = response.data;

    if (success) {
      toast.success(message || "Password changed successfully!", {
        id: toastId,
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error(message || "Failed to change password", { id: toastId });
    }
  } catch (err) {
    console.error("Password change error:", err);

    let errorMessage = "Failed to change password";
    if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err.response?.data?.error) {
      errorMessage = err.response.data.error;
    } else if (err.response?.status === 401) {
      errorMessage = "Current password is incorrect";
    } else if (err.response?.status === 404) {
      errorMessage = "User not found";
    } else if (err.request) {
      errorMessage = "Network error - please check your connection";
    }

    toast.error(errorMessage, { id: toastId });
  } finally {
    setIsLoading(false);
  }
};

  const getRoleIcon = () => {
    switch (user.role) {
      case "superadmin":
        return <Shield className="w-6 h-6" />;
      case "department":
        return <Building className="w-6 h-6" />;
      case "student":
        return <User className="w-6 h-6" />;
      default:
        return <User className="w-6 h-6" />;
    }
  };

  const getRoleColor = () => {
    switch (user.role) {
      case "superadmin":
        return "bg-rose-100 text-red-800";
      case "department":
        return "bg-sky-100 text-blue-800";
      case "student":
        return "bg-emerald-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <AdminNavbar />

      <div className="max-w-4xl mx-auto p-6 pt-12">
        {/* Go Back Button */}
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-[#00539C] hover:text-[#004085] transition-colors mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Go Back
        </button>

        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            User Profile
          </h1>
          <p className="text-gray-600">
            Manage your account settings and password
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </h2>

              <div className="space-y-4">
                <div className="flex items-center">
                  <label className="text-sm font-medium text-gray-600 pr-2">
                    Role:
                  </label>
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mt-1 ${getRoleColor()}`}
                  >
                    {getRoleIcon()}
                    <span className="capitalize">
                      {user.role?.replace("superadmin", "Super Admin")}
                    </span>
                  </div>
                </div>

                {user.deptName && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Department
                    </label>
                    <p className="text-gray-800 font-medium mt-1 flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      {user.deptName}
                    </p>
                  </div>
                )}

                {user.email && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Email
                    </label>
                    <p className="text-gray-800 font-medium mt-1">
                      {user.email}
                    </p>
                  </div>
                )}

                {user.name && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Name
                    </label>
                    <p className="text-gray-800 font-medium mt-1">
                      {user.name}
                    </p>
                  </div>
                )}

                {/* Debug info - you can remove this in production */}
                <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
                  <p className="text-gray-600">
                    User ID: {user.id || user.staffId || user.prn}
                  </p>
                  <p className="text-gray-600">Role: {user.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <Key className="w-5 h-5" />
                Change Password
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <PasswordInput
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter your current password"
                    showPassword={showOldPassword}
                    setShowPassword={setShowOldPassword}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <PasswordInput
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    showPassword={showNewPassword}
                    setShowPassword={setShowNewPassword}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Password must be at least 6 characters long
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <PasswordInput
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    showPassword={showConfirmPassword}
                    setShowPassword={setShowConfirmPassword}
                  />
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={
                    isLoading ||
                    !oldPassword ||
                    !newPassword ||
                    !confirmPassword ||
                    newPassword !== confirmPassword
                  }
                  className="w-full bg-gradient-to-r from-[#00539C] to-[#0077CC] text-white py-3 px-4 rounded-lg font-medium hover:from-[#004085] hover:to-[#00539C] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Changing Password...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Change Password
                    </>
                  )}
                </button>

                {/* Password Requirements */}
                <div className="bg-sky-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">
                    Password Requirements
                  </h3>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li className="flex items-center gap-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          oldPassword ? "bg-emerald-500" : "bg-sky-500"
                        }`}
                      />
                      Current password is required
                    </li>
                    <li className="flex items-center gap-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          newPassword.length >= 6
                            ? "bg-emerald-500"
                            : "bg-sky-500"
                        }`}
                      />
                      At least 6 characters long
                    </li>
                    <li className="flex items-center gap-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          newPassword &&
                          confirmPassword &&
                          newPassword === confirmPassword
                            ? "bg-emerald-500"
                            : "bg-sky-500"
                        }`}
                      />
                      Passwords must match
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
