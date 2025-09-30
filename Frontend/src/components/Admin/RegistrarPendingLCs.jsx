import React, { useEffect, useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { XMarkIcon } from "@heroicons/react/24/outline";

const REQUIRED_FIELDS = [
  "studentID",
  "dateOfLeaving",
  "dateOfAdmission",
  "progressAndConduct",
];

const generatePDF = (studentData, formData) => {
  const doc = new jsPDF();

  // Set page size and margins
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Add border around entire page
  doc.setDrawColor(0);
  doc.setLineWidth(2);
  doc.rect(
    margin,
    margin,
    pageWidth - margin * 2,
    doc.internal.pageSize.getHeight() - margin * 2
  );

  // Top Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(
    "INDIRA COLLEGE OF ENGINEERING AND MANAGEMENT",
    pageWidth / 2,
    margin + 10,
    { align: "center" }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("(Shree Chanakya Education Society's)", pageWidth / 2, margin + 16, {
    align: "center",
  });

  doc.setFontSize(10);
  const collegeAddress =
    "Survey No.64 & 65, Gat No.270, At. Parandwadi, Tal. Maval, Dist. Pune-410 506";
  const approvalInfo =
    "Approved by AICTE, New Delhi, DTE (MS) and affiliated to Savitribai Phule Pune University";

  doc.text(collegeAddress, pageWidth / 2, margin + 22, { align: "center" });
  doc.text(approvalInfo, pageWidth / 2, margin + 28, { align: "center" });

  // Transfer Certificate Title and Number
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("For Migration", margin + 5, margin + 40);
  doc.text(
    `No: ${formData.certificateNo || "____"}`,
    pageWidth - margin - 40,
    margin + 40
  );

  // Main Title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("LEAVING CERTIFICATE", pageWidth / 2, margin + 55, {
    align: "center",
  });

  // Draw underline for title
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - 40, margin + 57, pageWidth / 2 + 40, margin + 57);

  // Student Details Table
  const tableColumns = ["", "Particulars", "Details"];
  const tableRows = [
    ["1", "Student ID", formData.studentID || ""],
    ["2", "Name of the Student in Full", studentData.studentName || ""],
    ["3", "Father's Name", formData.fatherName || ""],
    ["4", "Mother's Name", formData.motherName || ""],
    [
      "5",
      "Caste & Sub-caste",
      `${formData.caste || ""} ${formData.subCaste || ""}`,
    ],
    ["6", "Nationality", formData.nationality || ""],
    ["7", "Place of Birth", formData.placeOfBirth || ""],
    ["8", "Date of Birth", formData.dateOfBirth || ""],
    ["9", "Date of Birth in Words", formData.dobWords || ""],
    ["10", "Last College attended", formData.lastCollege || ""],
    ["11", "Date of Admission", formData.yearOfAdmission || ""],
    ["12", "Progress & Conduct", formData.progressAndConduct || "Good"],
    ["13", "Date of Leaving College", formData.dateOfLeaving || "____"],
    [
      "14",
      "Year in which studying & since when",
      `${formData.branch || ""} From ${formData.yearOfAdmission || ""}`,
    ],
    ["15", "Reason for Leaving College", formData.reasonForLeaving || ""],
    ["16", "Remarks", formData.remarks || "____"],
  ];

  autoTable(doc, {
    startY: margin + 65,
    head: [tableColumns],
    body: tableRows,
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 3,
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 15, fontStyle: "bold" },
      1: { cellWidth: 70 },
      2: { cellWidth: 85 },
    },
    margin: { left: margin, right: margin },
  });

  // Footer signatures
  const finalY = doc.lastAutoTable.finalY + 20;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  // Prepared By
  doc.text("Prepared By", margin + 25, finalY);
  doc.line(margin + 15, finalY + 10, margin + 65, finalY + 10);

  // Checked By
  doc.text("Checked By", pageWidth / 2 - 20, finalY);
  doc.line(pageWidth / 2 - 35, finalY + 10, pageWidth / 2 + 15, finalY + 10);

  // Principal
  doc.text("Principal", pageWidth - margin - 40, finalY);
  doc.line(
    pageWidth - margin - 55,
    finalY + 10,
    pageWidth - margin - 5,
    finalY + 10
  );

  return doc;
};

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

  //Upload pdf to s3
  const handleUploadLC = async (e, student) => {
    const file = e.target.files[0];
    console.log("File selected:", file);
    console.log("Student:", student);
    
    if (!file) return;

    // Use the student passed from the table, or fall back to selectedStudent
    const currentStudent = student || selectedStudent;
    if (!currentStudent) {
      alert("No student selected");
      return;
    }

    try {
      setUploading(true); // Start loading
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
        fetchPendingLCs(); // Refresh the list
      } else {
        throw new Error(res.data.message || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert(
        `Failed to upload LC PDF: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setUploading(false); // End loading
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
      // Basic student info
      ...(studentProfile.student || {}),

      // All the LC form data from studentProfile
      ...studentProfile,
    };

    // Clean up the data - remove the nested student object since we've already spread its properties
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

      // Reset download state for this student when opening modal
      const prn = student.studentProfile?.prn || student.prn;
      setPdfDownloaded(prev => ({
        ...prev,
        [prn]: false
      }));

      // Also fetch additional LC details if needed
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

        // Generate PDF but don't download automatically
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
        
        // Fix this line - update by PRN
        setPdfDownloaded(prev => ({
          ...prev,
          [prn]: true
        }));
        
        // Reset and close modal after download
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
    REQUIRED_FIELDS.every((field) => formData[field] && formData[field].trim());

  // Helper function to format field names for display
  const formatFieldName = (field) => {
    return field
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  useEffect(() => {
    fetchPendingLCs();
  }, []);

  return (
    <main className="flex-1 w-auto mx-auto px-6 lg:px-10 py-4">
      <style>
        {`
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-scaleIn {
            animation: scaleIn 0.25s ease-out;
          }
        `}
      </style>

      <div className="bg-white rounded-xl min-h-[90vh] w-full shadow-xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Registrar Dashboard
          </h2>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Pending Leaving Certificates
          </h2>
          <button
            onClick={fetchPendingLCs}
            className="flex items-center gap-2 font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-2 px-5 transition"
          >
            Refresh
          </button>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Error Message */}
        {error && !loading && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {/* No Data Message */}
        {!loading && !error && pendingLCs.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Pending Leaving Certificates
            </h3>
            <p className="text-gray-500 mb-4">
              There are currently no students waiting for leaving certificate
              approval.
            </p>
            <button
              onClick={fetchPendingLCs}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Check Again
            </button>
          </div>
        )}

        {/* Students Table */}
        {!loading && !error && pendingLCs.length > 0 && (
          <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100/80">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    PRN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {pendingLCs.map((student) => {
                  const studentData = student.studentProfile || student;
                  const basicInfo = studentData.student || studentData;

                  return (
                    <tr
                      key={basicInfo.prn}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {basicInfo.studentName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {basicInfo.prn}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {basicInfo.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {basicInfo.phoneNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(student)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          Edit LC
                        </button>
                        <input
                          type="file"
                          accept="application/pdf"
                          id={`uploadLC-${basicInfo.prn}`}
                          className="hidden"
                          onChange={(e) => handleUploadLC(e, student)}
                        />

                        <label
                          htmlFor={`uploadLC-${basicInfo.prn}`}
                          className={`px-4 py-2 rounded-lg transition cursor-pointer ${
                            pdfDownloaded[basicInfo.prn]
                              ? "bg-green-600 text-white hover:bg-green-700"
                              : "bg-gray-400 text-gray-200 cursor-not-allowed"
                          }`}
                          onClick={(e) => {
                            if (!pdfDownloaded[basicInfo.prn]) {
                              e.preventDefault();
                              alert("Please download the PDF first before uploading.");
                            }
                          }}
                        >
                          {uploading ? "Uploading..." : "Upload Final LC"}
                        </label>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && selectedStudent && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 animate-scaleIn">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                  Edit LC –{" "}
                  {formData.studentName ||
                    selectedStudent.studentProfile?.student?.studentName}
                </h3>
                <button onClick={handleCloseModal}>
                  <XMarkIcon className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">
                  Student Information
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <strong>PRN:</strong>{" "}
                    {formData.prn || selectedStudent.studentProfile?.prn}
                  </div>
                  <div>
                    <strong>Email:</strong>{" "}
                    {formData.email ||
                      selectedStudent.studentProfile?.student?.email}
                  </div>
                  <div>
                    <strong>Phone:</strong>{" "}
                    {formData.phoneNo ||
                      selectedStudent.studentProfile?.student?.phoneNo}
                  </div>
                  <div>
                    <strong>Name:</strong>{" "}
                    {formData.studentName ||
                      selectedStudent.studentProfile?.student?.studentName}
                  </div>
                  <div>
                    <strong>Student ID:</strong>{" "}
                    {formData.studentID || "Not found"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto">
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
                  "certificateNo",
                  "remarks",
                ].map((field) => (
                  <div key={field} className="flex flex-col">
                    <label className="text-sm font-medium mb-1">
                      {formatFieldName(field)}
                      {REQUIRED_FIELDS.includes(field) && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    <input
                      type="text"
                      name={field}
                      value={formData[field] || ""}
                      onChange={handleChange}
                      className="border rounded-md px-3 py-2 text-sm"
                      placeholder={`Enter ${formatFieldName(
                        field
                      ).toLowerCase()}`}
                    />
                    {formData[field] && (
                      <span className="text-xs text-green-600 mt-1">
                        ✓ Current value: {formData[field]}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-600">
                  {isFormComplete() ? (
                    <span className="text-green-600">
                      ✓ All required fields are filled
                    </span>
                  ) : (
                    <span className="text-red-600">
                      ✗ Please fill all required fields (*)
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>

                  {!showDownloadButton ? (
                    <button
                      onClick={handleGenerateLC}
                      disabled={!isFormComplete() || generating}
                      className={`px-4 py-2 rounded-lg text-white transition ${
                        isFormComplete() && !generating
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {generating ? "Generating..." : "Generate LC"}
                    </button>
                  ) : (
                    <button
                      onClick={handleDownloadPDF}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Download PDF
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default RegistrarPendingLCs;