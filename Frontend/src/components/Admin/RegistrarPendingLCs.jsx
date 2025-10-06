import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
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
  EllipsisVerticalIcon,
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
import { generatePDF2 } from "./Register/PDFgenerator2";
import ENV from "../../env";

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
  const [menuOpen, setMenuOpen] = useState(null); // Track which menu is open
  const [generatedLCs, setGeneratedLCs] = useState({});

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [studentToUpload, setStudentToUpload] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);

  const itemsPerPage = 10;

  const menuRef = useRef(null);

  // Updated Upload pdf to s3 function
  const handleUploadLC = async (file, student) => {
    console.log("File selected:", file);
    console.log("Student:", student);

    if (!file) return;

    const currentStudent = student || selectedStudent;
    if (!currentStudent) {
      toast.error("No student selected"); // Replace alert with toast
      return;
    }

    try {
      setUploading(true);
      const token = localStorage.getItem("token");
      const prn = currentStudent.studentProfile?.prn || currentStudent.prn;

      const uploadFormData = new FormData();
      uploadFormData.append("lcPdf", file);

      const uploadPromise = axios.post(
        `${ENV.BASE_URL}/registrar/upload-lc/${prn}` ||
          `http://localhost:5000/registrar/upload-lc/${prn}`,
        uploadFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Use toast.promise for better UX
      await toast.promise(uploadPromise, {
        loading: "Uploading LC...",
        success: (res) => {
          if (res.data.success) {
            fetchPendingLCs();
            return "LC uploaded to server & saved to S3!";
          } else {
            throw new Error(res.data.message || "Upload failed");
          }
        },
        error: (err) =>
          `Failed to upload LC: ${err.response?.data?.message || err.message}`,
      });
    } catch (err) {
      console.error("Upload error:", err);
      // Error is already handled by toast.promise
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
        `${ENV.BASE_URL}/registrar/pending-lc` ||
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
      toast.error(errorMessage);
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
      toast.error("Error preparing LC form. Please try again."); // Replace alert with toast
    }
  };

  // Fetch LC details for selected student
  const fetchLCDetails = async (prn) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${ENV.BASE_URL}/registrar/lc-details/${prn}` ||
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

  //Helper function for checking migration
  const isForMigration = (student) => {
    return (
      student?.studentProfile?.forMigrationFlag ||
      student?.forMigrationFlag ||
      false
    );
  };
  // Handle Generate LC (Save to backend and prepare PDF)
  const handleGenerateLC = async () => {
    if (!selectedStudent) return;

    try {
      setGenerating(true);
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${ENV.BASE_URL}/registrar/generate-lc/${
          selectedStudent.studentProfile?.prn || selectedStudent.prn
        }` ||
          `http://localhost:5000/registrar/generate-lc/${
            selectedStudent.studentProfile?.prn || selectedStudent.prn
          }`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("LC generated successfully"); // Replace alert with toast

        const studentData =
          selectedStudent.studentProfile?.student ||
          selectedStudent.student ||
          selectedStudent;

        const college =
          selectedStudent.studentProfile?.student?.college ||
          selectedStudent.student?.college ||
          "Unknown";

        // Generate PDF
        let pdfDoc;
        if (college === "IGSB") {
          pdfDoc = generatePDF2(studentData, formData);
        } else {
          pdfDoc = generatePDF(studentData, formData);
        }

        setGeneratedPDF(pdfDoc);
        setShowDownloadButton(true);

        // Mark this PRN as having a generated LC
        const prn = selectedStudent.studentProfile?.prn || selectedStudent.prn;
        setGeneratedLCs((prev) => ({ ...prev, [prn]: true }));
      } else {
        throw new Error(response.data.message || "Failed to generate LC");
      }
    } catch (err) {
      console.error("Error generating LC:", err);
      const errorMessage = `Failed to generate LC: ${
        err.response?.data?.message || err.message
      }`;
      toast.error(errorMessage); // Replace alert with toast
    } finally {
      setGenerating(false);
    }
  };

  // Handle Download PDF
  const handleDownloadPDF = () => {
    if (generatedPDF) {
      try {
        const prn = selectedStudent.studentProfile?.prn || selectedStudent.prn;

        const college =
          selectedStudent.studentProfile?.student?.college ||
          selectedStudent.student?.college ||
          "Unknown";

        // Create appropriate filename based on college
        let fileName;
        if (college === "IGSB") {
          fileName = `IGSB_Leaving_Certificate_${prn || "student"}.pdf`;
        } else if (college === "ICEM") {
          fileName = `ICEM_Leaving_Certificate_${prn || "student"}.pdf`;
        } else {
          fileName = `Leaving_Certificate_${prn || "student"}.pdf`;
        }

        generatedPDF.save(fileName);

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

        toast.success("LC downloaded successfully!"); // Add success toast
      } catch (err) {
        console.error("Error downloading PDF:", err);
        toast.error("Error downloading PDF. Please try again."); // Replace alert with toast
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="space-y-6 text-sm bg-gray-50 min-h-screen">
      <div className="max-w-8xl mx-auto space-y-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white py-6 rounded-xl"
        >
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-[#00539C]">
              Registrar Dashboard
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              Pending Leaving Certificates - Review and process student leaving
              certificate applications
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span>{filteredLCs.length} pending certificates</span>
          </div>
        </motion.header>

        {/* Search and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl"
        >
          <div className="flex flex-col sm:flex-row gap-3 text-sm bg-white py-4 rounded-xl">
            <div className="relative flex-1 ">
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
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm transition-all duration-200 focus:ring-1 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm "
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchPendingLCs}
              disabled={loading}
              className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:ring-1  focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm"
            >
              <FiRefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
            </motion.button>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-rose-50 border border-red-200 rounded-xl"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-rose-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-rose-800">{error}</h3>
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#00539C] text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
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
            className="bg-white rounded-xl shadow-sm border border-gray-300 relative"
          >
            <div className="">
              <table className="w-full text-left">
                <thead className="bg-[#00539C] text-white">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-sm rounded-tl-xl">
                      Student Information
                    </th>
                    <th className="px-6 py-4 font-semibold text-sm">
                      Contact Details
                    </th>
                    <th className="px-6 py-4 font-semibold text-sm w-20 rounded-tr-xl">
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
                        <td className="px-6 py-4 text-md relative rounded-r-lg">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpen(
                                menuOpen === basicInfo.prn
                                  ? null
                                  : basicInfo.prn
                              );
                            }}
                            disabled={loading}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
                          >
                            <EllipsisVerticalIcon className="h-5 w-5 text-gray-600" />
                          </button>

                          {/* Dropdown Menu */}
                          {/* Dropdown Menu */}
                          {menuOpen === basicInfo.prn && (
                            <div
                              className={`absolute bg-gray-100 border border-gray-300 rounded-lg shadow-2xl py-2 z-50 min-w-[160px] ${
                                // Check if this is one of the last few rows and position dropdown above
                                index >= paginatedLCs.length - 3
                                  ? "bottom-[80%]"
                                  : "top-full"
                              } right-5`}
                            >
                              {/* Edit LC Option */}
                              <button
                                onClick={() => {
                                  handleEdit(student);
                                  setMenuOpen(null);
                                }}
                                disabled={loading}
                                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2 transition-colors duration-150"
                              >
                                <DocumentTextIcon className="h-4 w-4" />
                                Edit LC
                              </button>

                              {/* Upload LC Option */}
                              <button
                                onClick={() => {
                                  if (!generatedLCs[basicInfo.prn]) {
                                    toast.error(
                                      "Please generate the LC first before uploading."
                                    );
                                    return;
                                  }
                                  setStudentToUpload(student);
                                  setShowUploadModal(true);
                                  setMenuOpen(null);
                                }}
                                disabled={
                                  !generatedLCs[basicInfo.prn] || loading
                                }
                                className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 transition-colors duration-150 ${
                                  generatedLCs[basicInfo.prn]
                                    ? "text-gray-700 hover:bg-gray-50"
                                    : "text-gray-400 cursor-not-allowed"
                                }`}
                              >
                                <DocumentArrowUpIcon className="h-4 w-4" />
                                {uploading ? "Uploading..." : "Upload Final LC"}
                              </button>

                              {/* REMOVED the hidden file input from here */}
                            </div>
                          )}
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
                className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl  max-h-[90vh] "
              >
                {/* Header */}
                <div className="bg-[#00539C] px-6 py-4 flex justify-between items-center rounded-t-xl">
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
                  {/* Migration Alert Banner */}
                  {isForMigration(selectedStudent) && (
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-lg">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <ExclamationTriangleIcon className="h-5 w-5 text-orange-400 mt-0.5" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-semibold text-orange-800">
                            Migration Certificate Request
                          </h3>
                          <p className="text-sm text-orange-700 mt-1">
                            <strong>Note for Registrar:</strong> This student is
                            requesting a <strong>Migration Certificate</strong>.
                            Please ensure all migration-specific details are
                            properly filled and verified.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
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
                              <span className="text-rose-500">*</span>
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
                            className="border p-2 rounded-lg w-full focus:ring-1  focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm"
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
                          Branch <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="branch"
                          value={formData.branch || ""}
                          onChange={handleChange}
                          required
                          className="border p-2 rounded-lg w-full focus:ring-1  focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Year of Admission{" "}
                          <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="yearOfAdmission"
                          value={formData.yearOfAdmission || ""}
                          onChange={handleChange}
                          required
                          className="border p-2 rounded-lg w-full focus:ring-1  focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Admission Mode <span className="text-rose-500">*</span>
                        </label>
                        <select
                          name="admissionMode"
                          value={formData.admissionMode || ""}
                          onChange={handleChange}
                          required
                          className="border p-2 rounded-lg w-full focus:ring-1  focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm"
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
                          <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="lastCollege"
                          placeholder="Enter last college"
                          value={formData.lastCollege || ""}
                          onChange={handleChange}
                          required
                          className="border p-2 rounded-lg w-full focus:ring-1  focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm "
                        />
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700">
                          Reason for Leaving College{" "}
                          <span className="text-rose-500">*</span>
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
                        className="border p-2 rounded-lg w-full focus:ring-1  focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm"
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
                              <span className="text-rose-500">*</span>
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
                            className="border p-2 rounded-lg w-full focus:ring-1  focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm"
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
                        <span className="text-emerald-600 flex items-center gap-2">
                          <CheckIcon className="h-4 w-4" />
                          All required fields are filled
                        </span>
                      ) : (
                        <span className="text-rose-600 flex items-center gap-2">
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
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 font-medium flex items-center gap-2"
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

        {/* Upload LC Modal */}
        <AnimatePresence>
          {showUploadModal && studentToUpload && (
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
                className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
              >
                {/* Header */}
                <div className="bg-[#00539C] px-6 py-4 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-white">
                    Upload Leaving Certificate
                  </h2>
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadFile(null);
                    }}
                    className="text-white hover:text-gray-200 transition-colors duration-200"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Student Info */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserCircleIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {studentToUpload.studentProfile?.student
                            ?.studentName || studentToUpload.studentName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          PRN:{" "}
                          {studentToUpload.studentProfile?.prn ||
                            studentToUpload.prn}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* File Upload */}
                  {/* File Upload */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Select PDF File
                    </label>

                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
                      {uploadFile ? (
                        <div className="space-y-2">
                          <DocumentTextIcon className="h-12 w-12 text-green-500 mx-auto" />
                          <p className="text-sm font-medium text-gray-900">
                            {uploadFile.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <button
                            onClick={() => setUploadFile(null)}
                            className="text-xs text-rose-600 hover:text-rose-700"
                          >
                            Remove file
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto" />
                          <div>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium text-blue-600">
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">
                              PDF files only (MAX 2MB)
                            </p>
                          </div>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setUploadFile(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Upload Button */}
                  <button
                    onClick={() => {
                      if (!uploadFile) {
                        toast.error("Please select a PDF file first.");
                        return;
                      }
                      handleUploadLC(uploadFile, studentToUpload); // Pass file directly, not event object
                      setShowUploadModal(false);
                      setUploadFile(null);
                    }}
                    disabled={!uploadFile || uploading}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                  >
                    {uploading ? (
                      <>
                        <FiRefreshCw className="animate-spin" size={18} />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <DocumentArrowUpIcon className="h-5 w-5" />
                        Upload Leaving Certificate
                      </>
                    )}
                  </button>

                  {/* Help Text */}
                  <p className="text-xs text-gray-500 text-center">
                    Make sure the PDF is the final version before uploading.
                    This will be sent to the student.
                  </p>
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
