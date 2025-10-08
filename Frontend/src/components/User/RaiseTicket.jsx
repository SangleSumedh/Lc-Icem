import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  AcademicCapIcon,
  UserCircleIcon,
  ExclamationCircleIcon,
  CalendarIcon,
  CheckCircleIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { jwtDecode } from "jwt-decode";
import ENV from "../../env";
import StudentTickets from "./StudentTickets";
import { toast } from "react-hot-toast";

function RaiseTickets() {
  const [activeTab, setActiveTab] = useState("raise");
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
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const deptModalRef = useRef(null);
  const categoryModalRef = useRef(null);

  // Fixed useEffect for click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showDeptModal &&
        deptModalRef.current &&
        !deptModalRef.current.contains(event.target)
      ) {
        setShowDeptModal(false);
      }
      if (
        showCategoryModal &&
        categoryModalRef.current &&
        !categoryModalRef.current.contains(event.target)
      ) {
        setShowCategoryModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup function - properly returned
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDeptModal, showCategoryModal]);

  // Fixed useEffect for fetching departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setIsLoadingDepartments(true);
        setDepartmentError("");

        const response = await axios.get(
          `${ENV.BASE_URL}/lc-form/get-departments`
        );

        const { success, data, message } = response.data;

        if (success && data?.Departments) {
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

        const fallbackDepartments = [
          "Registrar Office",
          "IT Department",
          "Accounts Department",
          "Examination Cell",
          "Library",
          "Other",
        ].map((dept, index) => ({ id: index + 1, name: dept, college: "ALL" }));

        setDepartments(fallbackDepartments);
      } finally {
        setIsLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.department) {
      toast.error("Please select a department");
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      const token = localStorage.getItem("token");
      const decoded = token ? jwtDecode(token) : {};
      const studentPrn = decoded?.prn || decoded?.sub || null;

      const ticketData = { ...formData, studentPrn };
      const response = await axios.post(`${ENV.BASE_URL}/tickets/`, ticketData);

      const { success } = response.data;
      if (success) {
        setSubmitSuccess(true);
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
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        throw new Error("Failed to raise ticket");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong! Please try again.");
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

  const tabs = [
    { id: "raise", name: "Raise Ticket", icon: CalendarIcon },
    { id: "active", name: "My Tickets", icon: EyeIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      {/* Top Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200 mt-2">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center sm:justify-start space-x-2 sm:space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
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

      <div className="flex-1 overflow-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === "raise" ? (
          <div className="mx-auto w-full">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <AcademicCapIcon className="w-8 h-8 text-[#00539C]" />
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#00539C] mb-2">
                Raise a Support Ticket
              </h1>
              <p className="text-gray-600 text-sm sm:text-lg">
                We're here to help! Please provide detailed information about
                your issue.
              </p>
            </div>

            {/* Success Message */}
            {submitSuccess && (
              <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 animate-fade-in">
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
                </div>
              </div>
            )}

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-[#00539C] px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <UserCircleIcon className="w-5 h-5" />
                  Ticket Information
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Brief summary of your issue"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-3 focus:ring-1 focus:ring-gray-400 focus:border-gray-400 focus:outline-none transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Category *
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      placeholder="Select category"
                      readOnly
                      onClick={() => setShowCategoryModal(true)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-3 cursor-pointer focus:ring-1 focus:ring-gray-400 focus:border-gray-400 focus:outline-none transition-all duration-200"
                      required
                    />
                  </div>

                  {showCategoryModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                      <div
                        ref={categoryModalRef}
                        className="bg-white rounded-xl w-11/12 max-w-md max-h-[50vh] overflow-auto p-4"
                      >
                        <h2 className="text-lg font-semibold mb-3">
                          Select Category
                        </h2>
                        <ul className="space-y-2">
                          {categories.map((c) => (
                            <li key={c}>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    category: c,
                                  }));
                                  setShowCategoryModal(false);
                                }}
                                className="w-full text-left px-3 py-2 rounded hover:bg-blue-100 transition"
                              >
                                {c}
                              </button>
                            </li>
                          ))}
                        </ul>
                        <button
                          type="button"
                          onClick={() => setShowCategoryModal(false)}
                          className="mt-4 w-full bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Department *
                    </label>
                    <div>
                      <input
                        type="text"
                        value={formData.department}
                        placeholder="Select department"
                        readOnly
                        onClick={() => setShowDeptModal(true)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-3 cursor-pointer focus:ring-1 focus:ring-gray-400 focus:border-gray-400 focus:outline-none transition-all duration-200"
                        required
                      />
                    </div>

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

                  {showDeptModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                      <div
                        ref={deptModalRef}
                        className="bg-white rounded-xl w-11/12 max-w-md max-h-[70vh] overflow-auto p-4"
                      >
                        <h2 className="text-lg font-semibold mb-3">
                          Select Department
                        </h2>
                        <ul className="space-y-2">
                          {departments.map((dept) => (
                            <li key={dept.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    department: dept.name,
                                  }));
                                  setShowDeptModal(false);
                                }}
                                className="w-full text-left px-3 py-2 rounded hover:bg-blue-100 transition"
                              >
                                {dept.name}{" "}
                                {dept.college &&
                                  dept.college !== "ALL" &&
                                  `(${dept.college})`}
                              </button>
                            </li>
                          ))}
                        </ul>
                        <button
                          type="button"
                          onClick={() => setShowDeptModal(false)}
                          className="mt-4 w-full bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Related To (Optional)
                    </label>
                    <input
                      type="text"
                      name="relatedTo"
                      value={formData.relatedTo}
                      onChange={handleChange}
                      placeholder="e.g., LC Application, Exam Form, etc."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-3 focus:ring-1 focus:ring-gray-400 focus:border-gray-400 focus:outline-none transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-3 focus:ring-1 focus:ring-gray-400 focus:border-gray-400 focus:outline-none transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      maxLength={10}
                      placeholder="+91 9876543210"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-3 focus:ring-1 focus:ring-gray-400 focus:border-gray-400 focus:outline-none transition-all duration-200"
                    />
                    {formData.contactPhone.length === 10 && 
                      <span className="text-emerald-500 text-[12px]">* Contact Phone should be 10 digits only</span>
                    }
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Detailed Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Provide detailed info about your issue..."
                    rows={6}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-3 focus:ring-1 focus:ring-gray-400 focus:border-gray-400 focus:outline-none transition-all duration-200 resize-none"
                    required
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || isLoadingDepartments}
                    className="bg-[#00539C] text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
          </div>
        ) : (
          <StudentTickets />
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
      `}</style>
    </div>
  );
}

export default RaiseTickets;
