import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { FaWpforms } from "react-icons/fa";
import { FaFileWaveform } from "react-icons/fa6";
import {
  UserCircleIcon,
  AcademicCapIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/solid";
import { ChevronDown } from "lucide-react";

const LeavingCertificate = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    studentId: "",
    fatherName: "",
    motherName: "",
    caste: "",
    subCaste: "",
    nationality: "",
    placeOfBirth: "",
    dateOfBirth: "",
    dobWords: "",
    lastCollege: "",
    lcType: "",
    yearOfAdmission: "",
    branch: "",
    admissionMode: "",
    reasonForLeaving: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // dropdown open states
  const [dropdownOpen, setDropdownOpen] = useState({});

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // 🔍 Check approval status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/lc-form/approval-status", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.approvals && data.approvals.length > 0) {
            setSubmitted(true);
          }
        }
      } catch (err) {
        console.error("❌ Error checking form status:", err);
      } finally {
        setCheckingStatus(false);
      }
    };
    checkStatus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/lc-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
        setShowModal(false);
      } else {
        alert(data.error || "❌ Failed to submit form");
      }
    } catch (err) {
      alert("Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = (field) =>
    setDropdownOpen((prev) => ({ ...prev, [field]: !prev[field] }));

  const CustomDropdown = ({ label, name, value, options, required, disabled }) => (
    <div className="relative w-full">
      <label className="block text-sm font-medium text-gray-700 mb-0.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        onClick={() => !disabled && toggleDropdown(name)}
        className={`flex items-center justify-between border rounded-md px-3 py-2 cursor-pointer transition bg-white ${
          disabled ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
      >
        <span
          className={value ? "text-gray-800 text-sm" : "text-gray-400 text-sm"}
        >
          {value
            ? options.find((opt) => opt.value === value)?.label
            : "Select option"}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${
            dropdownOpen[name] ? "rotate-180" : ""
          }`}
        />
      </div>
      {dropdownOpen[name] && !disabled && (
        <div className="absolute left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-20">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                setFormData({ ...formData, [name]: opt.value });
                setDropdownOpen({ ...dropdownOpen, [name]: false });
              }}
              className="px-3 py-2 cursor-pointer text-sm hover:bg-[#00539C] hover:text-white rounded-md"
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (checkingStatus) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full p-6 space-y-6 overflow-y-auto">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-gray-800">
        Leaving Certificate Dashboard
      </h1>

      {/* Status Section */}
      {submitted ? (
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-blue-800 flex items-center gap-2">
            <ClipboardDocumentIcon className="h-6 w-6 text-blue-600" />
            Form Submitted
          </h2>
          <p className="mt-2 text-gray-700">
            Your form has been submitted. Please wait for verification.
          </p>
        </div>
      ) : (
        <>
          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-300 p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-yellow-800 flex items-center gap-2">
              <FaWpforms className="text-yellow-600" /> Instructions
            </h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-2 mt-2">
              <li>Ensure all details are accurate before submission.</li>
              <li>
                Mandatory fields are marked with{" "}
                <span className="text-red-500">*</span>.
              </li>
              <li>The application will be processed within 7 working days.</li>
              <li>Contact the admin office in case of discrepancies.</li>
            </ul>
          </div>

          {/* CTA Button with Icon */}
          <button
            onClick={handleOpenModal}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow hover:bg-blue-700 transition"
          >
            <FaFileWaveform className="text-lg" />
            Fill Form
          </button>
        </>
      )}

      {/* Modal Form */}
      {showModal && !submitted && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">
                Leaving Certificate Form
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-white hover:text-gray-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="p-8 max-h-[80vh] overflow-y-auto space-y-8"
            >
              {/* Section 1: Personal Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                  <UserCircleIcon className="h-5 w-5 text-blue-600" /> Personal
                  Details
                </h3>
                <hr className="border-gray-300 my-2" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: "Student ID", name: "studentId", required: false },
                    { label: "Father's Name", name: "fatherName", required: true },
                    { label: "Mother's Name", name: "motherName", required: true },
                    { label: "Caste", name: "caste", required: true },
                    { label: "Sub-Caste", name: "subCaste", required: true },
                    { label: "Nationality", name: "nationality", required: true },
                    { label: "Place of Birth", name: "placeOfBirth", required: true },
                    {
                      label: "Date of Birth",
                      name: "dateOfBirth",
                      type: "date",
                      required: true,
                    },
                    { label: "DOB (in words)", name: "dobWords", required: true },
                  ].map((field, idx) => (
                    <div key={idx} className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {field.label}{" "}
                        {field.required && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      <input
                        type={field.type || "text"}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        required={field.required}
                        className="border p-2 rounded-lg w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2: College Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                  <AcademicCapIcon className="h-5 w-5 text-blue-600" /> College
                  Details
                </h3>
                <hr className="border-gray-300 my-2" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <CustomDropdown
                    label="Branch"
                    name="branch"
                    required
                    value={formData.branch}
                    options={[
                      { value: "COMPUTERSCIENCE", label: "Computer Science" },
                      { value: "MECHANICAL", label: "Mechanical" },
                      { value: "CIVIL", label: "Civil" },
                      { value: "ENTC", label: "ENTC" },
                      { value: "IT", label: "IT" },
                      { value: "MBA", label: "MBA" },
                    ]}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Year of Admission <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="yearOfAdmission"
                      value={formData.yearOfAdmission}
                      onChange={handleChange}
                      required
                      className="border p-2 rounded-lg w-full"
                    />
                  </div>

                  <CustomDropdown
                    label="Admission Mode"
                    name="admissionMode"
                    required
                    value={formData.admissionMode}
                    options={[
                      { value: "FIRSTYEAR", label: "First Year" },
                      { value: "DIRECTSECONDYEAR", label: "Direct Second Year" },
                      { value: "MBA", label: "MBA" },
                      { value: "MCA", label: "MCA" },
                    ]}
                  />
                </div>

                {/* Last College + Certificate Type */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last College Attended <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastCollege"
                      placeholder="Enter last college"
                      value={formData.lastCollege}
                      onChange={handleChange}
                      required
                      className="border p-2 rounded-lg w-full"
                    />
                  </div>

                  <CustomDropdown
                    label="Leaving Certificate Type"
                    name="lcType"
                    value={formData.lcType}
                    disabled
                    options={[
                      {
                        value: "LEAVING",
                        label: "Leaving / Transfer Certificate",
                      },
                      {
                        value: "MIGRATION",
                        label: "Migration (Change University)",
                      },
                    ]}
                  />
                </div>

                {/* Reason */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Reason for Leaving College <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="reasonForLeaving"
                    placeholder="Explain your reason for leaving"
                    rows={3}
                    value={formData.reasonForLeaving}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded-lg w-full"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3 rounded-lg">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeavingCertificate;
