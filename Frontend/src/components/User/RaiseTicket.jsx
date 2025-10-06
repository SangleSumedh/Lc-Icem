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


// StudentTickets Component (moved inside the same file)
const StudentTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Get student PRN from localStorage (assuming it's stored during login)
  

  const getStudentPrn = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);
      return decoded.prn || decoded.sub || null; // adjust according to your JWT payload
    } catch (err) {
      console.error("Error decoding JWT:", err);
      return null;
    }
  };

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // Fetch student's tickets
  const fetchStudentTickets = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const prn = getStudentPrn();
      console.log(prn);

      if (!prn) {
        setError("Student PRN not found. Please log in again.");
        return;
      }

      const response = await axios.get(
        `${ENV.BASE_URL}/tickets/student/${prn}` ||
          `http://localhost:5000/tickets/student/${prn}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setTickets(response.data.tickets || []);
      } else {
        throw new Error(response.data.error || "Failed to fetch tickets");
      }
    } catch (err) {
      console.error("Error fetching student tickets:", err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "IN_PROGRESS":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "RESOLVED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "CLOSED":
        return "bg-slate-100 text-slate-800 border-slate-200";
      default:
        return "bg-sky-100 text-sky-800 border-sky-200";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "OPEN":
        return <ClockIcon className="w-4 h-4" />;
      case "IN_PROGRESS":
        return <ArrowPathIcon className="w-4 h-4" />;
      case "RESOLVED":
        return <CheckCircleIcon className="w-4 h-4" />;
      case "CLOSED":
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    fetchStudentTickets();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[90vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircleIcon className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Tickets
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchStudentTickets}
            className="bg-[#00539C] text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-[60vh] bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl px-6 py-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-[#00539C] mb-2">
                My Support Tickets
              </h1>
              <p className="text-gray-600">
                View and track all your support ticket requests
              </p>
            </div>
            <button
              onClick={fetchStudentTickets}
              className="text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 hover:bg-gray-50"
            >
              <ArrowPathIcon className="w-5 h-5" />
              Refresh
            </button>
          </div>
        </div>

        {/* Tickets Grid */}
        {tickets.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ClockIcon className="w-12 h-12 text-[#00539C]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Tickets Found
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              You haven't raised any support tickets yet.
              <br />
              Create your first ticket to get help with any issues.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {ticket.subject}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          ticket.status
                        )}`}
                      >
                        {getStatusIcon(ticket.status)}
                        {ticket.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">Category:</span>{" "}
                        {ticket.category}
                      </div>
                      <div>
                        <span className="font-medium">Ticket ID:</span>{" "}
                        {ticket.ticketId}
                      </div>
                      <div>
                        <span className="font-medium">Department:</span>{" "}
                        {ticket.department}
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-2">
                      {ticket.description}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Created:{" "}
                    {new Date(ticket.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {ticket.closedAt && (
                      <span className="ml-4">
                        • Closed:{" "}
                        {new Date(ticket.closedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="flex items-center gap-2 bg-[#00539C] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <EyeIcon className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/30 shadow-2xl backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-[#00539C]">
                  Ticket Details
                </h2>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <p className="text-gray-900">{selectedTicket.subject}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Status
                    </label>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                        selectedTicket.status
                      )}`}
                    >
                      {getStatusIcon(selectedTicket.status)}
                      {selectedTicket.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {selectedTicket.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <p className="text-gray-900">{selectedTicket.category}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <p className="text-gray-900">{selectedTicket.department}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ticket ID
                    </label>
                    <p className="text-gray-900 font-mono">
                      {selectedTicket.ticketId}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Email
                    </label>
                    <p className="text-gray-900">
                      {selectedTicket.contactEmail}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone
                    </label>
                    <p className="text-gray-900">
                      {selectedTicket.contactPhone || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Created Date
                    </label>
                    <p className="text-gray-900">
                      {new Date(selectedTicket.createdAt).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                  {selectedTicket.updatedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Updated
                      </label>
                      <p className="text-gray-900">
                        {new Date(selectedTicket.updatedAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {selectedTicket.relatedTo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Related To
                    </label>
                    <p className="text-gray-900">{selectedTicket.relatedTo}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main RaiseTickets Component with Navigation
const RaiseTickets = () => {
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

        if (response.data.success && response.data.Departments) {
          // Transform the API data to match our expected format
          const transformedDepartments = response.data.Departments.map(
            (dept) => ({
              id: dept.deptId,
              name: dept.deptName,
              college: dept.college,
            })
          );
          setDepartments(transformedDepartments);
        } else {
          throw new Error("Invalid data format from server");
        }
      } catch (err) {
        console.error("Error fetching departments:", err);
        setDepartmentError("Failed to load departments. Please try again.");

        // Fallback to default departments if API fails
        setDepartments([
          "Registrar Office",
          "IT Department",
          "Accounts Department",
          "Examination Cell",
          "Library",
          "Other",
        ]);
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
      alert("Please select a department");
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
        `${ENV.BASE_URL}/tickets/` ||
          "http://localhost:5000/tickets/",
        ticketData
      );

      if (response.data.success) {
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

        // Hide success message after 5 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 5000);
      } else {
        throw new Error(response.data.error || "Failed to raise ticket");
      }
    } catch (err) {
      console.error("Error raising ticket:", err);
      alert(
        `❌ ${
          err.response?.data?.error || "Something went wrong! Please try again."
        }`
      );
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
              <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-green-800 font-semibold">
                    Ticket Raised Successfully!
                  </h3>
                  <p className="text-green-600 text-sm">
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
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-1  focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      required
                    >
                      <option value="">Select department</option>
                      {departments.map((dept) => (
                        <option
                          key={typeof dept === "object" ? dept.id : dept}
                          value={typeof dept === "object" ? dept.name : dept}
                        >
                          {typeof dept === "object" ? dept.name : dept}
                          {typeof dept === "object" &&
                            dept.college &&
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
                      <div className="text-sm text-red-500 mt-1 flex items-center gap-1">
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
};

export default RaiseTickets;
