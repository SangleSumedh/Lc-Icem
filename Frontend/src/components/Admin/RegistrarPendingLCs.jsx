// src/components/Registrar/RegistrarPendingLCs.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { XMarkIcon } from "@heroicons/react/24/outline";

const REQUIRED_FIELDS = [
  "fatherName",
  "motherName",
  "caste",
  "subCaste",
  "nationality",
  "placeOfBirth",
  "dateOfBirth",
  "dobWords",
  "lastCollege",
  "yearOfAdmission",
  "branch",
  "admissionMode",
  "reasonForLeaving",
];

const RegistrarPendingLCs = () => {
  const [pendingLCs, setPendingLCs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({});
  const [showModal, setShowModal] = useState(false);

  // Fetch pending LCs from backend
  const fetchPendingLCs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/registrar/pending-lc", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingLCs(res.data.pendingLCs || []);
    } catch (err) {
      console.error("Error fetching pending LCs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch LC details for selected student
  const fetchLCDetails = async (prn) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/registrar/lc-details/${prn}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success && res.data.lcForm?.profile) {
        setFormData(res.data.lcForm.profile);
      }
    } catch (err) {
      console.error("Error fetching LC details:", err);
    }
  };

  // Handle "Edit LC" button click
  const handleEdit = async (student) => {
    setSelectedStudent(student);
    // Prepopulate form from pendingLCs
    setFormData(student);
    setShowModal(true);

    // Optionally, fetch latest details from backend
    await fetchLCDetails(student.student.prn);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateLC = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/registrar/generate-lc/${selectedStudent.student.prn}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("LC generated successfully ✅");
      setShowModal(false);
      setSelectedStudent(null);
      fetchPendingLCs();
    } catch (err) {
      console.error("Error generating LC:", err);
      alert("Failed to generate LC ❌");
    }
  };

  // Check if all required fields are filled
  const isFormComplete = () =>
    REQUIRED_FIELDS.every((field) => formData[field]);

  useEffect(() => {
    fetchPendingLCs();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">📋 Pending LCs</h2>

      {loading ? (
        <p>Loading...</p>
      ) : pendingLCs.length === 0 ? (
        <p className="text-gray-500">No pending LCs found.</p>
      ) : (
        <table className="w-full border rounded-lg shadow-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">PRN</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Phone</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingLCs.map((student) => (
              <tr key={student.student.prn} className="text-center">
                <td className="p-2 border">{student.student.prn}</td>
                <td className="p-2 border">{student.student.studentName}</td>
                <td className="p-2 border">{student.student.email}</td>
                <td className="p-2 border">{student.student.phoneNo}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => handleEdit(student)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Edit LC
                  </button>
                  <button
                    onClick={handleGenerateLC}
                    disabled={!isFormComplete()}
                    className={`ml-2 px-3 py-1 rounded-md text-white ${
                      isFormComplete()
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Generate LC
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Edit LC – {selectedStudent.student.studentName}
              </h3>
              <button onClick={() => setShowModal(false)}>
                <XMarkIcon className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
              {[
                "studentID",
                "fatherName",
                "motherName",
                "caste",
                "subCaste",
                "nationality",
                "placeOfBirth",
                "dateOfBirth",
                "dobWords",
                "lastCollege",
                "yearOfAdmission",
                "branch",
                "admissionMode",
                "reasonForLeaving",
                "dateOfAdmission",
                "dateOfLeaving",
                "progressAndConduct",
              ].map((field) => (
                <div key={field} className="flex flex-col">
                  <label className="text-sm font-medium mb-1 capitalize">
                    {field}
                  </label>
                  <input
                    type="text"
                    name={field}
                    value={formData[field] || ""}
                    onChange={handleChange}
                    className="border rounded-md px-3 py-2 text-sm"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateLC}
                disabled={!isFormComplete()}
                className={`px-4 py-2 rounded-lg text-white ${
                  isFormComplete()
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Generate LC
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrarPendingLCs;
