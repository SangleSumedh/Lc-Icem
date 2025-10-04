import React, { useState } from "react";
import {
  AcademicCapIcon,
  UserCircleIcon,
  ExclamationCircleIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

const RaiseTickets = () => {
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    category: "",
    priority: "medium",
    department: "",
    contactEmail: "",
    contactPhone: "",
    relatedTo: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      ...formData,
      date: new Date().toISOString(),
      status: "open",
      ticketId: `TKT-${Date.now()}`,
    };

    try {
      const response = await fetch("http://localhost:5000/student/raise-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert("🎉 Ticket raised successfully!");
        // Reset form
        setFormData({
          subject: "",
          description: "",
          category: "",
          priority: "medium",
          department: "",
          contactEmail: "",
          contactPhone: "",
          relatedTo: "",
        });
      } else {
        throw new Error(data.message || "Failed to raise ticket");
      }
    } catch (err) {
      console.error("Error raising ticket:", err);
      alert("❌ Something went wrong! Please try again.");
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

  const departments = [
    "Registrar Office",
    "IT Department",
    "Accounts Department",
    "Examination Cell",
    "Library",
    "Other",
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <AcademicCapIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Raise a Support Ticket
          </h1>
          <p className="text-gray-600 text-lg">
            We're here to help! Please provide detailed information about your issue.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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

            {/* Department & Priority Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                className="w-full border border-gray-300 rounded-lg px-4 py-3  transition-all duration-200 resize-none"
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
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
          <p>We typically respond within 24-48 hours. For urgent matters, please visit the office directly.</p>
        </div>
      </div>
    </div>
  );
};

export default RaiseTickets;