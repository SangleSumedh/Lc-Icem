import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  AcademicCapIcon,
  UserCircleIcon,
  ExclamationCircleIcon,
  CalendarIcon,
  CheckCircleIcon,
  EyeIcon,
  ClockIcon,
  XCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { jwtDecode } from "jwt-decode";
import ENV from "../../env";
import StudentTickets from "./StudentTickets";

// Main RaiseTickets Component with Navigation
function RaiseTickets() {
  const [activeTab, setActiveTab] = useState("raise"); // 'raise' or 'active'
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    category: "",
    department: "",
    contactEmail: "",
    contactPhone: "",
    relatedTo: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [departmentError, setDepartmentError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);


  // Fetch departments from API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setIsLoadingDepartments(true);
        setDepartmentError("");

        const response = await axios.get(
          `${ENV.BASE_URL}/lc-form/get-departments` ||
            "http://localhost:5000/lc-form/get-departments"
        );

        // Use the standardized response format
        const { success, data, message } = response.data;

        if (success && data?.Departments) {
          // Transform the API data to match our expected format
          const transformedDepartments = data.Departments.map((dept) => ({
            id: dept.deptId,
            name: dept.deptName,
            college: dept.college,
          }));
          setDepartments(transformedDepartments);
        } else {
          throw new Error(message || "Invalid data format from server");
        }
      } catch (err) {
        console.error("Error fetching departments:", err);
        setDepartmentError("Failed to load departments. Please try again.");

        // Fallback to default departments if API fails - ensure consistent format
        const fallbackDepartments = [
          "Registrar Office",
          "IT Department",
          "Accounts Department",
          "Examination Cell",
          "Library",
          "Other",
        ].map((dept, index) => ({
          id: index + 1,
          name: dept,
          college: "ALL",
        }));

        setDepartments(fallbackDepartments);
      } finally {
        setIsLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate department selection
    if (!formData.department) {
      toast.error("Please select a department");
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      // Get student PRN from JWT token
      const getStudentPrn = () => {
        const token = localStorage.getItem("token");
        if (!token) return null;

        try {
          const decoded = jwtDecode(token);
          return decoded.prn || decoded.sub || null;
        } catch (err) {
          console.error("Error decoding JWT:", err);
          return null;
        }
      };

      const studentPrn = getStudentPrn();

      const ticketData = {
        ...formData,
        studentPrn: studentPrn, // Add student PRN to the request
      };

      const response = await axios.post(
        `${ENV.BASE_URL}/tickets/` || "http://localhost:5000/tickets/",
        ticketData
      );

      // Use standardized response format
      const { success, message, data } = response.data;

      if (success) {
        setSubmitSuccess(true);
        // Reset form
        setFormData({
          subject: "",
          description: "",
          category: "",
          department: "",
          contactEmail: "",
          contactPhone: "",
          relatedTo: "",
        });

        toast.success("Ticket raised successfully!");

        // Hide success message after 5 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 5000);
      } else {
        throw new Error(message || "Failed to raise ticket");
      }
    } catch (err) {
      console.error("Error raising ticket:", err);

      // Enhanced error handling with toast
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else if (err.response?.data?.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error("Something went wrong! Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    "Technical Support",
    "Administrative",
    "Certificate Issues",
    "LC Generation",
    "Other",
  ];

  // Navigation Tabs
  const tabs = [
    {
      id: "raise",
      name: "Raise Ticket",
      icon: CalendarIcon,
    },
    {
      id: "active",
      name: "My Tickets",
      icon: EyeIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Top Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-[#00539C] text-[#00539C]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        {activeTab === "raise" ? (
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <AcademicCapIcon className="w-8 h-8 text-[#00539C]" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-[#00539C] mb-2">
                Raise a Support Ticket
              </h1>
              <p className="text-gray-600 text-lg">
                We're here to help! Please provide detailed information about
                your issue.
              </p>
            </div>

            {/* Success Message */}
            {submitSuccess && (
              <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-emerald-800 font-semibold">
                    Ticket Raised Successfully!
                  </h3>
                  <p className="text-emerald-600 text-sm">
                    Your ticket has been submitted. We'll get back to you within
                    24-48 hours.
                  </p>
                  <button
                    onClick={() => setActiveTab("active")}
                    className="mt-2 text-sm text-[#00539C] hover:text-blue-800 font-medium flex items-center gap-1"
                  >
                    View My Tickets
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-[#00539C] px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <UserCircleIcon className="w-5 h-5" />
                  Ticket Information
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Subject & Category Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Brief summary of your issue"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-1  focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-1  focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm transition-all duration-200"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Department */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department *
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      disabled={isLoadingDepartments}
                      className="w-full max-h-[30vh] border border-gray-300 rounded-lg px-4 py-3 focus:ring-1 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      required
                    >
                      <option value="">Select department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.name}>
                          {dept.name}
                          {dept.college &&
                            dept.college !== "ALL" &&
                            ` (${dept.college})`}
                        </option>
                      ))}
                    </select>

                    {/* Loading and error states */}
                    {isLoadingDepartments && (
                      <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                        <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        Loading departments...
                      </div>
                    )}

                    {departmentError && (
                      <div className="text-sm text-rose-500 mt-1 flex items-center gap-1">
                        <ExclamationCircleIcon className="w-4 h-4" />
                        {departmentError}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Related To (Optional)
                    </label>
                    <input
                      type="text"
                      name="relatedTo"
                      value={formData.relatedTo}
                      onChange={handleChange}
                      placeholder="e.g., LC Application, Exam Form, etc."
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-1  focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Contact Information Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-1  focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      placeholder="+91 9876543210"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-1  focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Please provide detailed information about your issue, including any error messages, steps to reproduce, and what you've already tried..."
                    rows={6}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-1  focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm transition-all duration-200 resize-none"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    The more details you provide, the better we can help you.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || isLoadingDepartments}
                    className="bg-[#00539C] text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-500/25"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CalendarIcon className="w-5 h-5" />
                        Submit Ticket
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Help Text */}
            <div className="text-center mt-6 text-gray-500 text-sm">
              <p>
                We typically respond within 24-48 hours. For urgent matters,
                please visit the office directly.
              </p>
            </div>
          </div>
        ) : (
          <StudentTickets />
        )}
      </div>

      {/* Custom CSS for fade-in animation */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

export default RaiseTickets;
