import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const LeavingCertificate = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fatherName: "",
    motherName: "",
    caste: "",
    subCaste: "",
    nationality: "",
    placeOfBirth: "",
    dateOfBirth: "",
    dobWords: "",
    lastCollege: "",
    yearOfAdmission: "",
    branch: "",
    admissionMode: "",
    reasonForLeaving: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔍 Check approval status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/lc-form/status", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          console.log("📥 Status response:", data);

          if (data.approvals && data.approvals.length > 0) {
            setSubmitted(true); // form already submitted
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
      console.log("📤 Sending LC Form Data:", formData);

      const res = await fetch("http://localhost:5000/lc-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      console.log("📥 Response status:", res.status);
      const data = await res.json();
      console.log("📥 Response data:", data);

      if (res.ok) {
        setSubmitted(true);
        setShowModal(false);
      } else {
        alert(data.error || "❌ Failed to submit form");
      }
    } catch (err) {
      console.error("❌ Error submitting form:", err);
      alert("Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-start items-start w-full max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Leaving Certificate Dashboard
      </h1>

      {submitted ? (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg shadow w-full">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">
            Form Submitted
          </h2>
          <p className="text-gray-700">
            The form has already been submitted. Please wait for verification by
            the admin.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow w-full">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">
              Instructions
            </h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Ensure all details are accurate before submission.</li>
              <li>
                Mandatory fields are marked with{" "}
                <span className="text-red-500">*</span>.
              </li>
              <li>The application will be processed within 7 working days.</li>
              <li>Contact the admin office in case of discrepancies.</li>
            </ul>
          </div>

          <button
            onClick={handleOpenModal}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
          >
            Fill Form
          </button>
        </>
      )}

      {showModal && !submitted && (
        <div className="fixed inset-0 z-50 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3 flex justify-between items-center">
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

            <form
              onSubmit={handleSubmit}
              className="p-6 max-h-[80vh] overflow-y-auto space-y-6"
            >
              {/* Personal Details */}
              <h3 className="text-lg font-semibold text-gray-700">
                Personal Details
              </h3>
              <hr className="border-t border-black" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Father's Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fatherName"
                    placeholder="Enter father's name"
                    value={formData.fatherName}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded w-full"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Mother's Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="motherName"
                    placeholder="Enter mother's name"
                    value={formData.motherName}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded w-full"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Caste
                  </label>
                  <input
                    type="text"
                    name="caste"
                    placeholder="Enter caste"
                    value={formData.caste}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded w-full"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Sub-Caste
                  </label>
                  <input
                    type="text"
                    name="subCaste"
                    placeholder="Enter sub-caste"
                    value={formData.subCaste}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Nationality
                  </label>
                  <input
                    type="text"
                    name="nationality"
                    placeholder="Enter nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded w-full"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Place of Birth
                  </label>
                  <input
                    type="text"
                    name="placeOfBirth"
                    placeholder="Enter place of birth"
                    value={formData.placeOfBirth}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded w-full"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded w-full"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Date of Birth (in words)
                  </label>
                  <input
                    type="text"
                    name="dobWords"
                    placeholder="e.g., First January Two Thousand"
                    value={formData.dobWords}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded w-full"
                  />
                </div>
              </div>
              {/* College Details */}
              <h3 className="text-lg font-semibold text-gray-700">
                College Details
              </h3>
              <hr className="border-t border-black" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Branch <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded w-full"
                  >
                    <option value="">Select Branch</option>
                    <option value="COMPUTERSCIENCE">Computer Science</option>
                    <option value="MECHANICAL">Mechanical</option>
                    <option value="CIVIL">Civil</option>
                    <option value="ENTC">ENTC</option>
                    <option value="IT">IT</option>
                    <option value="MBA">MBA</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Year of Admission
                  </label>
                  <input
                    type="date"
                    name="yearOfAdmission"
                    value={formData.yearOfAdmission}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded w-full"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Admission Mode <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="admissionMode"
                    value={formData.admissionMode}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded w-full"
                  >
                    <option value="">Select Admission Mode</option>
                    <option value="FIRSTYEAR">First Year</option>
                    <option value="DIRECTSECONDYEAR">Direct Second Year</option>
                    <option value="MBA">MBA</option>
                    <option value="MCA">MCA</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Last College Attended
                  </label>
                  <input
                    type="text"
                    name="lastCollege"
                    placeholder="Enter last college name"
                    value={formData.lastCollege}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Reason for Leaving College
                  </label>
                  <textarea
                    name="reasonForLeaving"
                    placeholder="Explain your reason for leaving"
                    rows={3}
                    value={formData.reasonForLeaving}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded w-full"
                  />
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
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