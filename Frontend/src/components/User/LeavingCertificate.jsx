import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { FaWpforms, FaEye, FaEdit } from "react-icons/fa";
import { FaFileWaveform } from "react-icons/fa6";
import {
  UserCircleIcon,
  AcademicCapIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/solid";
import { ChevronDown } from "lucide-react";

const LeavingCertificate = () => {
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false); // NEW: For view-only mode
  const [editMode, setEditMode] = useState(false); // NEW: For edit mode
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
  const [originalFormData, setOriginalFormData] = useState({}); // NEW: Store original data
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [lcFormData, setLcFormData] = useState(null); // NEW: Store fetched LC form data
  const [isFormEditable, setIsFormEditable] = useState(false); // NEW: Editable flag from backend

  // Branches state
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(true);

  const [dropdownOpen, setDropdownOpen] = useState({});

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setViewMode(false);
    setEditMode(false);
  };
  
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // 🔍 Check approval status and fetch LC form data
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Check approval status
        const statusRes = await fetch("http://localhost:5000/lc-form/approval-status", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // NEW: Fetch LC form data
        const formRes = await fetch("http://localhost:5000/lc-form/form", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (statusData.approvals && statusData.approvals.length > 0) {
            setSubmitted(true);
          }
        }
        
        if (formRes.ok) {
          const formData = await formRes.json();
          if (formData.success && formData.lcForm) {
            setLcFormData(formData.lcForm);
            setIsFormEditable(formData.lcForm.profile?.isFormEditable || false);
            
            // Prepopulate form data if exists
            if (formData.lcForm.profile) {
              const profile = formData.lcForm.profile;
              const newFormData = {
                studentId: profile.studentID || "",
                fatherName: profile.fatherName || "",
                motherName: profile.motherName || "",
                caste: profile.caste || "",
                subCaste: profile.subCaste || "",
                nationality: profile.nationality || "",
                placeOfBirth: profile.placeOfBirth || "",
                dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : "",
                dobWords: profile.dobWords || "",
                lastCollege: profile.lastCollege || "",
                lcType: "LEAVING", // Default value
                yearOfAdmission: profile.yearOfAdmission ? profile.yearOfAdmission.split('T')[0] : "",
                branch: profile.branch || "",
                admissionMode: profile.admissionMode || "",
                reasonForLeaving: profile.reasonForLeaving || "",
              };
              setFormData(newFormData);
              setOriginalFormData(newFormData);
            }
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

  // 🔍 Fetch branches once
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/lc-form/hod-branches", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          const branchOptions = data.branches.map((b) => ({
            value: b.branch,
            label: b.branch,
          }));
          setBranches(branchOptions);
        }
      } catch (err) {
        console.error("❌ Error fetching branches:", err);
      } finally {
        setBranchesLoading(false);
      }
    };
    fetchBranches();
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
        setEditMode(false);
        // Refresh form data
        const formRes = await fetch("http://localhost:5000/lc-form/form", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (formRes.ok) {
          const formData = await formRes.json();
          if (formData.success && formData.lcForm) {
            setLcFormData(formData.lcForm);
            setIsFormEditable(formData.lcForm.profile?.isFormEditable || false);
          }
        }
      } else {
        alert(data.error || "❌ Failed to submit form");
      }
    } catch (err) {
      alert("Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  // NEW: Handle edit button click
  const handleEditClick = () => {
    setEditMode(true);
    setViewMode(false);
  };

  // NEW: Handle view button click
  const handleViewClick = () => {
    setViewMode(true);
    setEditMode(false);
    setShowModal(true);
  };

  // NEW: Cancel editing
  const handleCancelEdit = () => {
    setEditMode(false);
    setFormData(originalFormData);
  };

  const toggleDropdown = (field) =>
    setDropdownOpen((prev) => ({ ...prev, [field]: !prev[field] }));

  const CustomDropdown = ({ label, name, value, options, required, disabled }) => (
    <div className="relative w-full">
      <label className="block text-sm font-medium text-gray-700 mb-0.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        onClick={() => !disabled && !viewMode && toggleDropdown(name)}
        className={`flex items-center justify-between border rounded-md px-3 py-2 cursor-pointer transition bg-white ${
          disabled || viewMode ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
      >
        <span
          className={value ? "text-gray-800 text-sm" : "text-gray-400 text-sm"}
        >
          {value
            ? options.find((opt) => opt.value === value)?.label
            : branchesLoading
            ? "Loading..."
            : "Select option"}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${
            dropdownOpen[name] ? "rotate-180" : ""
          }`}
        />
      </div>
      {dropdownOpen[name] && !disabled && !branchesLoading && !viewMode && (
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
          
          {/* NEW: View and Edit Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleViewClick}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <FaEye className="text-sm" />
              View Form
            </button>
            
            {isFormEditable && (
              <button
                onClick={handleEditClick}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
              >
                <FaEdit className="text-sm" />
                Edit Form
              </button>
            )}
          </div>
          
          {/* NEW: Editable Status Message */}
          {!isFormEditable && (
            <p className="mt-2 text-sm text-gray-600">
              Form editing is currently disabled
            </p>
          )}
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

          {/* CTA Button */}
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
      {(showModal || viewMode || editMode) && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">
                {viewMode ? "View LC Form" : editMode ? "Edit LC Form" : "Leaving Certificate Form"}
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
              {/* Personal Details */}
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
                        required={field.required && !viewMode}
                        disabled={viewMode}
                        readOnly={viewMode}
                        className={`border p-2 rounded-lg w-full ${
                          viewMode ? "bg-gray-100 cursor-not-allowed" : ""
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* College Details */}
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
                    options={branches}
                    disabled={viewMode}
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
                      required={!viewMode}
                      disabled={viewMode}
                      readOnly={viewMode}
                      className={`border p-2 rounded-lg w-full ${
                        viewMode ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
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
                    disabled={viewMode}
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
                      required={!viewMode}
                      disabled={viewMode}
                      readOnly={viewMode}
                      className={`border p-2 rounded-lg w-full ${
                        viewMode ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                    />
                  </div>

                  <CustomDropdown
                    label="Leaving Certificate Type"
                    name="lcType"
                    value={formData.lcType}
                    disabled={true} // Always disabled as per original
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
                    required={!viewMode}
                    disabled={viewMode}
                    readOnly={viewMode}
                    className={`border p-2 rounded-lg w-full ${
                      viewMode ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3 rounded-lg">
                {viewMode ? (
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Close
                  </button>
                ) : editMode ? (
                  <>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? "Updating..." : "Update"}
                    </button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeavingCertificate;