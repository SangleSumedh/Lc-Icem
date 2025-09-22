import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const LeavingCertificate = () => {
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <div className="flex flex-col justify-start items-start w-full max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Leaving Certificate Dashboard
      </h1>

      {/* Instruction Box */}
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

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <h3 className="text-sm font-medium text-gray-500">Total Requests</h3>
          <p className="text-2xl font-bold text-gray-800">128</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <h3 className="text-sm font-medium text-gray-500">Approved</h3>
          <p className="text-2xl font-bold text-green-600">95</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <h3 className="text-sm font-medium text-gray-500">Pending</h3>
          <p className="text-2xl font-bold text-yellow-600">25</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <h3 className="text-sm font-medium text-gray-500">Rejected</h3>
          <p className="text-2xl font-bold text-red-600">8</p>
        </div>
      </div>

      {/* Fill Form Button */}
      <button
        onClick={handleOpenModal}
        className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
      >
        Fill Form
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
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

            {/* Form Content */}
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <form className="space-y-6">
                {/* Personal Details */}
                <h3 className="text-lg font-semibold text-gray-700">
                  Personal Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Student ID *"
                    maxLength={15}
                    className="border p-2 rounded"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Full Name *"
                    className="border p-2 rounded col-span-2"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Father's Name *"
                    className="border p-2 rounded"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Mother's Name *"
                    className="border p-2 rounded"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Caste & Sub-Caste"
                    className="border p-2 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Nationality"
                    className="border p-2 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Place of Birth"
                    className="border p-2 rounded"
                  />
                  <input
                    type="date"
                    className="border p-2 rounded"
                    placeholder="Date of Birth"
                  />
                  <input
                    type="text"
                    placeholder="Date of Birth (in words)"
                    className="border p-2 rounded"
                  />
                </div>

                {/* College Details */}
                <h3 className="text-lg font-semibold text-gray-700">
                  College Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select className="border p-2 rounded" required>
                    <option value="">Select Branch</option>
                    <option>Computer Science</option>
                    <option>Mechanical</option>
                    <option>Civil</option>
                    <option>ENTC</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Year of Admission"
                    className="border p-2 rounded"
                  />
                  <select className="border p-2 rounded">
                    <option value="">Admission Mode</option>
                    <option>First Year</option>
                    <option>Direct Second Year</option>
                    <option>MBA</option>
                    <option>MCA</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Last College Attended"
                    className="border p-2 rounded col-span-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <textarea
                    placeholder="Reason for leaving college"
                    rows={3}
                    className="border p-2 rounded"
                  />
                  <textarea
                    placeholder="Remarks"
                    rows={3}
                    className="border p-2 rounded"
                  />
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 flex justify-end gap-2">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeavingCertificate;
