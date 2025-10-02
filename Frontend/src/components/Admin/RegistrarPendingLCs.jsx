import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  DocumentArrowUpIcon,
  DocumentTextIcon,
  UserCircleIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import {
  FiSearch,
  FiRefreshCw,
  FiUser,
  FiMail,
  FiPhone,
  FiFileText,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { generatePDF, REQUIRED_FIELDS } from "./Register/PDFgenerator";

const RegistrarPendingLCs = () => {
  const [pendingLCs, setPendingLCs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const [generatedPDF, setGeneratedPDF] = useState(null);
  const [error, setError] = useState(null);
  const [pdfDownloaded, setPdfDownloaded] = useState({});
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Upload pdf to s3
  const handleUploadLC = async (e, student) => {
    const file = e.target.files[0];
    console.log("File selected:", file);
    console.log("Student:", student);

    if (!file) return;

    const currentStudent = student || selectedStudent;
    if (!currentStudent) {
      alert("No student selected");
      return;
    }

    try {
      setUploading(true);
      const token = localStorage.getItem("token");
      const prn = currentStudent.studentProfile?.prn || currentStudent.prn;

      const uploadFormData = new FormData();
      uploadFormData.append("lcPdf", file);

      console.log("Uploading PDF for PRN:", prn);

      const res = await axios.post(
        `http://localhost:5000/registrar/upload-lc/${prn}`,
        uploadFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        alert("✅ LC uploaded to server & saved to S3!");
        fetchPendingLCs();
      } else {
        throw new Error(res.data.message || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert(
        `Failed to upload LC PDF: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setUploading(false);
    }
  };

  // Fetch pending LCs from backend
  const fetchPendingLCs = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/registrar/pending-lc",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        setPendingLCs(res.data.pendingLCs || []);
        if (!res.data.pendingLCs || res.data.pendingLCs.length === 0) {
          setError("No pending leaving certificates found.");
        }
      } else {
        setError(res.data.message || "Failed to fetch pending LCs");
      }
    } catch (err) {
      console.error("Error fetching pending LCs:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Failed to fetch pending LCs. Please try again.";
      setError(errorMessage);
      setPendingLCs([]);
    } finally {
      setLoading(false);
    }
  };

  // Merge existing student data with LC form data
  const mergeStudentData = (student) => {
    console.log("Merging data for student:", student);

    const studentProfile = student.studentProfile || student;

    const mergedData = {
      ...(studentProfile.student || {}),
      ...studentProfile,
    };

    delete mergedData.student;

    console.log("Final merged data with studentID:", mergedData.studentID);
    return mergedData;
  };

  // Handle "Edit LC" button click
  const handleEdit = async (student) => {
    try {
      setSelectedStudent(student);
      const mergedData = mergeStudentData(student);
      setFormData(mergedData);
      setShowModal(true);
      setShowDownloadButton(false);
      setGeneratedPDF(null);

      const prn = student.studentProfile?.prn || student.prn;
      setPdfDownloaded((prev) => ({
        ...prev,
        [prn]: false,
      }));

      await fetchLCDetails(student.studentProfile?.prn || student.prn);
    } catch (err) {
      console.error("Error preparing LC form:", err);
      alert("Error preparing LC form. Please try again.");
    }
  };

  // Fetch LC details for selected student
  const fetchLCDetails = async (prn) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/registrar/lc-details/${prn}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success && res.data.lcForm?.profile) {
        setFormData((prev) => ({
          ...prev,
          ...res.data.lcForm.profile,
        }));
      }
    } catch (err) {
      console.error("Error fetching LC details:", err);
    }
  };

  // Handle Generate LC (Save to backend and prepare PDF)
  const handleGenerateLC = async () => {
    if (!selectedStudent) return;

    try {
      setGenerating(true);
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `http://localhost:5000/registrar/generate-lc/${
          selectedStudent.studentProfile?.prn || selectedStudent.prn
        }`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert("LC generated successfully ✅");

        const studentData =
          selectedStudent.studentProfile?.student ||
          selectedStudent.student ||
          selectedStudent;
        const pdfDoc = generatePDF(studentData, formData);
        setGeneratedPDF(pdfDoc);
        setShowDownloadButton(true);
      } else {
        throw new Error(response.data.message || "Failed to generate LC");
      }
    } catch (err) {
      console.error("Error generating LC:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to generate LC";
      alert(`Failed to generate LC: ${errorMessage}`);
    } finally {
      setGenerating(false);
    }
  };

  // Handle Download PDF
  const handleDownloadPDF = () => {
    if (generatedPDF) {
      try {
        const prn = selectedStudent.studentProfile?.prn || selectedStudent.prn;
        generatedPDF.save(`Leaving_Certificate_${prn || "student"}.pdf`);

        setPdfDownloaded((prev) => ({
          ...prev,
          [prn]: true,
        }));

        setShowDownloadButton(false);
        setGeneratedPDF(null);
        setShowModal(false);
        setSelectedStudent(null);
        setFormData({});
        fetchPendingLCs();
      } catch (err) {
        console.error("Error downloading PDF:", err);
        alert("Error downloading PDF. Please try again.");
      }
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
    setFormData({});
    setShowDownloadButton(false);
    setGeneratedPDF(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Check if all required fields are filled
  const isFormComplete = () =>
    REQUIRED_FIELDS.every((field) => {
      const value = formData[field];
      return (
        value !== undefined && value !== null && String(value).trim() !== ""
      );
    });
  // Helper function to format field names for display
  const formatFieldName = (field) => {
    return field
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  // Filter and paginate data
  const filteredLCs = pendingLCs.filter((student) => {
    const studentData = student.studentProfile || student;
    const basicInfo = studentData.student || studentData;
    return (
      !search ||
      basicInfo.studentName.toLowerCase().includes(search.toLowerCase()) ||
      basicInfo.email.toLowerCase().includes(search.toLowerCase()) ||
      basicInfo.prn.toString().includes(search)
    );
  });

  const totalPages = Math.ceil(filteredLCs.length / itemsPerPage);
  const paginatedLCs = filteredLCs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    fetchPendingLCs();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                Registrar Dashboard
              </h1>
              <p className="text-gray-600 text-sm leading-relaxed">
                Pending Leaving Certificates - Review and process student
                leaving certificate applications
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>{filteredLCs.length} pending certificates</span>
            </div>
          </div>
        </motion.header>

        {/* Search and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <FiSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search by Name, Email, or PRN..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchPendingLCs}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <FiRefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              {loading ? "Refreshing..." : "Refresh"}
            </motion.button>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-red-50 border border-red-200 rounded-xl"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </motion.div>
        )}

        {/* No Data Message */}
        {!loading && !error && filteredLCs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200"
          >
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <DocumentTextIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Pending Leaving Certificates
            </h3>
            <p className="text-gray-500 mb-4 max-w-md mx-auto">
              There are currently no students waiting for leaving certificate
              approval.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchPendingLCs}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
            >
              <FiRefreshCw size={14} />
              Check Again
            </motion.button>
          </motion.div>
        )}

        {/* Students Table */}
        {!loading && !error && filteredLCs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Student Information
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Contact Details
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedLCs.map((student, index) => {
                    const studentData = student.studentProfile || student;
                    const basicInfo = studentData.student || studentData;

                    return (
                      <motion.tr
                        key={basicInfo.prn}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {basicInfo.studentName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {basicInfo.studentName}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <FiUser size={12} />
                                PRN: {basicInfo.prn}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-600 flex items-center gap-2">
                              <FiMail size={14} className="text-gray-400" />
                              {basicInfo.email}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-2">
                              <FiPhone size={14} className="text-gray-400" />
                              {basicInfo.phoneNo}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-xs font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-2"
                              onClick={() => handleEdit(student)}
                            >
                              <DocumentTextIcon className="h-4 w-4" />
                              Edit LC
                            </motion.button>

                            <input
                              type="file"
                              accept="application/pdf"
                              id={`uploadLC-${basicInfo.prn}`}
                              className="hidden"
                              onChange={(e) => handleUploadLC(e, student)}
                            />

                            <motion.label
                              whileHover={{
                                scale: pdfDownloaded[basicInfo.prn] ? 1.05 : 1,
                              }}
                              whileTap={{
                                scale: pdfDownloaded[basicInfo.prn] ? 0.95 : 1,
                              }}
                              htmlFor={`uploadLC-${basicInfo.prn}`}
                              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                                pdfDownloaded[basicInfo.prn]
                                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                              }`}
                              onClick={(e) => {
                                if (!pdfDownloaded[basicInfo.prn]) {
                                  e.preventDefault();
                                  alert(
                                    "Please download the PDF first before uploading."
                                  );
                                }
                              }}
                            >
                              <DocumentArrowUpIcon className="h-4 w-4" />
                              {uploading ? "Uploading..." : "Upload Final LC"}
                            </motion.label>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center items-center gap-2"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              Previous
            </motion.button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <motion.button
                    key={page}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 flex items-center justify-center border rounded-lg text-sm font-medium transition-all duration-200 ${
                      currentPage === page
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow-sm"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </motion.button>
                )
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              Next
            </motion.button>
          </motion.div>
        )}

        {/* Edit LC Modal - UPDATED WITH NEW UI */}
        <AnimatePresence>
          {showModal && selectedStudent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-white">
                    Edit LC Form
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-white hover:text-gray-200"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Form */}
                <div className="p-8 max-h-[80vh] overflow-y-auto space-y-8">
                  {/* Personal Details */}
                  {/* Personal Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                      <UserCircleIcon className="h-5 w-5 text-blue-600" />
                      Personal Details
                    </h3>
                    <hr className="border-gray-300 my-2" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        {
                          label: "Student Full Name",
                          name: "studentName",
                          required: true,
                        },
                        {
                          label: "Student ID",
                          name: "studentID",
                          required: true,
                        },
                        {
                          label: "Father's Name",
                          name: "fatherName",
                          required: true,
                        },
                        {
                          label: "Mother's Name",
                          name: "motherName",
                          required: true,
                        },
                        { label: "Caste", name: "caste", required: true },
                        {
                          label: "Sub-Caste",
                          name: "subCaste",
                          required: false,
                        },
                        {
                          label: "Nationality",
                          name: "nationality",
                          required: true,
                        },
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
                          value: formData.dateOfBirth || "",
                        },
                        {
                          label: "DOB (in words)",
                          name: "dobWords",
                          required: true,
                        },
                      ].map((field, idx) => (
                        <div key={idx} className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">
                            {field.label}
                            {field.required && (
                              <span className="text-red-500">*</span>
                            )}
                          </label>
                          <input
                            type={field.type || "text"}
                            name={field.name}
                            value={
                              field.type === "date" && formData[field.name]
                                ? new Date(formData[field.name])
                                    .toISOString()
                                    .split("T")[0]
                                : formData[field.name] || ""
                            }
                            onChange={handleChange}
                            required={field.required}
                            className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* College Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                      <AcademicCapIcon className="h-5 w-5 text-blue-600" />
                      College Details
                    </h3>
                    <hr className="border-gray-300 my-2" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Branch <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="branch"
                          value={formData.branch || ""}
                          onChange={handleChange}
                          required
                          className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Year of Admission{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="yearOfAdmission"
                          value={formData.yearOfAdmission || ""}
                          onChange={handleChange}
                          required
                          className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Admission Mode <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="admissionMode"
                          value={formData.admissionMode || ""}
                          onChange={handleChange}
                          required
                          className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select Mode</option>
                          <option value="FIRSTYEAR">First Year</option>
                          <option value="DIRECTSECONDYEAR">
                            Direct Second Year
                          </option>
                          <option value="MBA">MBA</option>
                          <option value="MCA">MCA</option>
                        </select>
                      </div>
                    </div>

                    {/* Last College */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Last College Attended{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="lastCollege"
                          placeholder="Enter last college"
                          value={formData.lastCollege || ""}
                          onChange={handleChange}
                          required
                          className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                          Note: Mention the type of Leaving Certificate –
                          Migration or Leaving / Transfer
                        </span>
                      </div>
                      <textarea
                        name="reasonForLeaving"
                        placeholder="Explain your reason for leaving"
                        rows={3}
                        value={formData.reasonForLeaving || ""}
                        onChange={handleChange}
                        required
                        className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Additional Fields */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                      <InformationCircleIcon className="h-5 w-5 text-blue-600" />
                      Additional Information
                    </h3>
                    <hr className="border-gray-300 my-2" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                      {[
                        {
                          name: "dateOfAdmission",
                          type: "date",
                          required: true,
                        },
                        { name: "dateOfLeaving", type: "date", required: true },
                        {
                          name: "progressAndConduct",
                          type: "text",
                          required: true,
                        },
                        { name: "certificateNo", type: "text", required: true },
                        { name: "remarks", type: "text", required: false },
                      ].map((field) => (
                        <div key={field.name} className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">
                            {formatFieldName(field.name)}{" "}
                            {field.required && (
                              <span className="text-red-500">*</span>
                            )}
                          </label>
                          <input
                            type={field.type}
                            name={field.name}
                            value={
                              field.type === "date" && formData[field.name]
                                ? new Date(formData[field.name])
                                    .toISOString()
                                    .split("T")[0]
                                : formData[field.name] || ""
                            }
                            onChange={handleChange}
                            required={field.required}
                            className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={`Enter ${formatFieldName(
                              field.name
                            ).toLowerCase()}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-gray-50 px-6 py-3 flex justify-between items-center rounded-lg">
                    <div className="text-sm">
                      {isFormComplete() ? (
                        <span className="text-green-600 flex items-center gap-2">
                          <CheckIcon className="h-4 w-4" />
                          All required fields are filled
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center gap-2">
                          <ExclamationTriangleIcon className="h-4 w-4" />
                          Please fill all required fields (*)
                        </span>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                      >
                        Cancel
                      </button>

                      {!showDownloadButton ? (
                        <button
                          type="button"
                          onClick={handleGenerateLC}
                          disabled={!isFormComplete() || generating}
                          className={`px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 flex items-center gap-2 ${
                            isFormComplete() && !generating
                              ? "bg-blue-600 hover:bg-blue-700"
                              : "bg-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {generating ? (
                            <>
                              <FiRefreshCw className="animate-spin" size={16} />
                              Generating...
                            </>
                          ) : (
                            <>
                              <DocumentTextIcon className="h-4 w-4" />
                              Generate LC
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleDownloadPDF}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium flex items-center gap-2"
                        >
                          <DocumentArrowUpIcon className="h-4 w-4" />
                          Download PDF
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RegistrarPendingLCs;
