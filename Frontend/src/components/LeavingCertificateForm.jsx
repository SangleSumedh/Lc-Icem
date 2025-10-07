import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { UserCircleIcon, AcademicCapIcon } from "@heroicons/react/24/solid";
import { ChevronDown } from "lucide-react";

// Import JSON data
import religionsData from "../assets/religions.json";
import castesData from "../assets/castes.json";
import nationsData from "../assets/nations.json";

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
    caste: "", // Will store religion
    subCaste: "", // Will store caste
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
    forMigrationFlag: false,
    customReligion: "",
    customCaste: "",
    ...initialFormData,
  });

  const [dropdownOpen, setDropdownOpen] = useState({});
  const [filteredCastes, setFilteredCastes] = useState([]);

  // Function to convert date to words
  const convertDateToWords = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    // Add ordinal suffix to day
    const getOrdinalSuffix = (day) => {
      if (day > 3 && day < 21) return "th";
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
  };

  // Auto-update DOB words when date changes
  useEffect(() => {
    if (formData.dateOfBirth && !viewMode && !editMode) {
      const dobWords = convertDateToWords(formData.dateOfBirth);
      setFormData((prev) => ({ ...prev, dobWords }));
    }
  }, [formData.dateOfBirth, viewMode, editMode]);

  // Filter castes based on selected religion
  useEffect(() => {
    if (formData.caste && formData.caste !== "Other") {
      const religion = religionsData.religions.find(
        (r) => r.religion === formData.caste
      );
      setFilteredCastes(religion?.castes || []);
    } else {
      setFilteredCastes([]);
    }
  }, [formData.caste]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "caste") {
      // Reset caste when religion changes
      setFormData({
        ...formData,
        [name]: value,
        subCaste: "",
        customReligion: "",
        customCaste: "",
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const toggleDropdown = (field) =>
    setDropdownOpen((prev) => ({ ...prev, [field]: !prev[field] }));

  const CustomDropdown = ({
    label,
    name,
    value,
    options,
    required = false,
    disabled,
  }) => (
    <div className="relative w-full">
      <label className="block text-sm font-medium text-gray-700 mb-0.5 text-nowrap">
        {label} {required && <span className="text-rose-500">*</span>}
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
          {options.length === 0
            ? "No options available"
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
      {dropdownOpen[name] && !disabled && !viewMode && (
        <div className="absolute left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
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
              No options available
            </div>
          )}
        </div>
      )}
    </div>
  );

  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Prepare data for backend - use custom values if "Other" is selected
    const submitData = {
      ...formData,
      caste:
        formData.caste === "Other" ? formData.customReligion : formData.caste,
      subCaste:
        formData.subCaste === "Other"
          ? formData.customCaste
          : formData.subCaste,
    };

    onSubmit(submitData);
  };

  // Prepare dropdown options from JSON data
  const religionOptions = [
    ...religionsData.religions.map((religion) => ({
      value: religion.religion,
      label: religion.religion,
    })),
    { value: "Other", label: "Other" },
  ];

  const casteOptions = [
    ...filteredCastes.map((caste) => ({
      value: caste,
      label: caste,
    })),
    { value: "Other", label: "Other" },
  ];

  const nationalityOptions = nationsData.nations.map((nation) => ({
    value: nation,
    label: nation,
  }));

  const admissionModeOptions = [
    { value: "FIRSTYEAR", label: "First Year" },
    { value: "DIRECTSECONDYEAR", label: "Direct Second Year" },
    { value: "MBA", label: "MBA" },
    { value: "MCA", label: "MCA" },
  ];

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#00539C] px-6 py-4 flex justify-between items-center">
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
              <UserCircleIcon className="h-5 w-5 text-[#00539C]" /> Personal
              Details
            </h3>
            <hr className="border-gray-300 my-2" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Student Name */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Student Full Name <span className="text-rose-500">*</span>
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
              ].map((field, idx) => (
                <div key={idx} className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}{" "}
                    {field.required && <span className="text-rose-500">*</span>}
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

              {/* DOB in Words (Auto-generated) */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  DOB (in words) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="dobWords"
                  value={formData.dobWords}
                  onChange={handleChange}
                  required={!viewMode}
                  disabled={viewMode}
                  readOnly={viewMode}
                  placeholder="Auto-generated from date of birth"
                  className={`border p-2 rounded-lg w-full ${
                    viewMode ? "bg-gray-100 cursor-not-allowed" : "bg-gray-50"
                  }`}
                />
                {!viewMode && formData.dateOfBirth && (
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-generated from selected date
                  </p>
                )}
              </div>

              {/* Religion Dropdown (stored in caste field) */}
              <div className="space-y-1">
                <CustomDropdown
                  label="Religion"
                  name="caste"
                  value={formData.caste}
                  options={religionOptions}
                  required={true}
                  disabled={viewMode}
                />
                {/* Custom Religion Input */}
                {formData.caste === "Other" && !viewMode && (
                  <div className="mt-2">
                    <input
                      type="text"
                      name="customReligion"
                      placeholder="Specify your religion"
                      value={formData.customReligion}
                      onChange={handleChange}
                      className="border p-2 rounded-lg w-full"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Caste Dropdown (stored in subCaste field) */}
              <div className="space-y-1">
                <CustomDropdown
                  label="Caste"
                  name="subCaste"
                  value={formData.subCaste}
                  options={casteOptions}
                  required={true}
                  disabled={viewMode || !formData.caste}
                />
                {/* Custom Caste Input */}
                {formData.subCaste === "Other" && !viewMode && (
                  <div className="mt-2">
                    <input
                      type="text"
                      name="customCaste"
                      placeholder="Specify your caste"
                      value={formData.customCaste}
                      onChange={handleChange}
                      className="border p-2 rounded-lg w-full"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Nationality Dropdown */}
              <div className="space-y-1">
                <CustomDropdown
                  label="Nationality"
                  name="nationality"
                  value={formData.nationality}
                  options={nationalityOptions}
                  required={true}
                  disabled={viewMode}
                />
              </div>
            </div>
          </div>

          {/* College Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <AcademicCapIcon className="h-5 w-5 text-[#00539C]" /> College
              Details
            </h3>
            <hr className="border-gray-300 my-2" />

            {/* Certificate Type - Radio Buttons */}
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certificate Type
              </label>
              <div className="flex items-center space-x-6">
                {/* Transfer Certificate */}
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="certificateType"
                    value="transfer"
                    checked={!formData.forMigrationFlag}
                    onChange={() =>
                      !viewMode &&
                      setFormData({ ...formData, forMigrationFlag: false })
                    }
                    disabled={viewMode}
                    className="h-4 w-4 text-[#00539C] focus:ring-1 focus:ring-gray-400 focus:outline-none"
                  />
                  <span className="text-sm text-gray-700">
                    Transfer Certificate
                  </span>
                </label>

                {/* Migration Certificate */}
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="certificateType"
                    value="migration"
                    checked={formData.forMigrationFlag}
                    onChange={() =>
                      !viewMode &&
                      setFormData({ ...formData, forMigrationFlag: true })
                    }
                    disabled={viewMode}
                    className="h-4 w-4 text-[#00539C] focus:ring-1 focus:ring-gray-400 focus:outline-none"
                  />
                  <span className="text-sm text-gray-700">
                    Migration Certificate
                  </span>
                </label>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Selecting "Migration Certificate" will request a migration
                certificate instead of a regular leaving certificate.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Branch Dropdown */}
              <CustomDropdown
                label="Branch"
                name="branch"
                value={formData.branch}
                options={branches}
                required={true}
                disabled={viewMode || branchesLoading}
              />

              {/* Year of Admission */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Year of Admission <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  name="yearOfAdmission"
                  value={formData.yearOfAdmission}
                  onChange={handleChange}
                  required={!viewMode}
                  disabled={viewMode}
                  readOnly={viewMode}
                  min="2000"
                  max="2030"
                  className={`border p-2 rounded-lg w-full ${
                    viewMode ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                />
              </div>

              {/* Admission Mode Dropdown */}
              <CustomDropdown
                label="Admission Mode"
                name="admissionMode"
                value={formData.admissionMode}
                options={admissionModeOptions}
                required={true}
                disabled={viewMode}
              />
            </div>

            {/* Last College */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Last College Attended <span className="text-rose-500">*</span>
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

            {/* Reason for Leaving */}
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Reason for Leaving College{" "}
                  <span className="text-rose-500">*</span>
                </label>
              </div>
              <textarea
                name="reasonForLeaving"
                placeholder={
                  formData.forMigrationFlag
                    ? "Mention your reason for migration (Course Name and year)"
                    : "Mention your reason for leaving (Course Name and year)"
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
                className="px-4 py-2 bg-[#00539C] text-white rounded-lg hover:bg-blue-700"
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
                  className="px-4 py-2 bg-[#00539C] text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
                  className="px-4 py-2 bg-[#00539C] text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
