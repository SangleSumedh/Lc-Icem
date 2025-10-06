import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { UserCircleIcon, AcademicCapIcon } from "@heroicons/react/24/solid";
import { ChevronDown } from "lucide-react";

const LeavingCertificateForm = ({
  showModal,
  onClose,
  viewMode = false,
  editMode = false,
  onSubmit,
  onCancelEdit,
  initialFormData = {},
  loading = false,
  branches = [],
  branchesLoading = false,
}) => {
  const [formData, setFormData] = useState({
    studentName: "",
    studentID: "",
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
    forMigrationFlag: false, // Added migration flag
    ...initialFormData,
  });

  const [dropdownOpen, setDropdownOpen] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const toggleDropdown = (field) =>
    setDropdownOpen((prev) => ({ ...prev, [field]: !prev[field] }));

  const CustomDropdown = ({
    label,
    name,
    value,
    options,
    required,
    disabled,
  }) => (
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
          {branchesLoading
            ? "Loading..."
            : options.length === 0
            ? "No branches available"
            : value
            ? options.find((opt) => opt.value === value)?.label
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
          {options.length > 0 ? (
            options.map((opt) => (
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
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">
              No branches available
            </div>
          )}
        </div>
      )}
    </div>
  );

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">
            {viewMode
              ? "View LC Form"
              : editMode
              ? "Edit LC Form"
              : "Leaving Certificate Form"}
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleFormSubmit}
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
              {/* Student Name */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Student Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  required={!viewMode}
                  disabled={viewMode}
                  readOnly={viewMode}
                  className={`border p-2 rounded-lg w-full ${
                    viewMode ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                />
              </div>

              {[
                { label: "Student ID", name: "studentID", required: false },
                { label: "Father's Name", name: "fatherName", required: true },
                { label: "Mother's Name", name: "motherName", required: true },
                { label: "Caste", name: "caste", required: true },
                { label: "Sub-Caste", name: "subCaste", required: true },
                { label: "Nationality", name: "nationality", required: true },
                {
                  label: "Place of Birth",
                  name: "placeOfBirth",
                  required: true,
                },
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
                    {field.required && <span className="text-red-500">*</span>}
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

            {/* Migration Flag - Added this section */}
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="forMigrationFlag"
                  name="forMigrationFlag"
                  checked={formData.forMigrationFlag}
                  onChange={handleChange}
                  disabled={viewMode}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-1  focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm"
                />
                <label
                  htmlFor="forMigrationFlag"
                  className="text-sm font-medium text-gray-700"
                >
                  This is a Migration Certificate
                </label>
              </div>
              <p className="text-xs text-gray-600 mt-1 ml-7">
                Check this box if you need a Migration Certificate instead of a
                regular Leaving Certificate
              </p>
            </div>

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
                  type="number"
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
            </div>

            {/* Reason */}
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Reason for Leaving College{" "}
                  <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-gray-500 italic ml-2">
                  {formData.forMigrationFlag
                    ? "Note: This is a Migration Certificate application"
                    : "Note: Mention the type of Leaving Certificate – Migration or Leaving / Transfer"}
                </span>
              </div>
              <textarea
                name="reasonForLeaving"
                placeholder={
                  formData.forMigrationFlag
                    ? "Mention your reason for migration(Course Name and year)"
                    : "Mention your reason for leaving(Course Name and year)"
                }
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
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            ) : editMode ? (
              <>
                <button
                  type="button"
                  onClick={onCancelEdit}
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
                  onClick={onClose}
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
  );
};

export default LeavingCertificateForm;