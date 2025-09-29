import React, { useEffect, useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
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

const generatePDF = (studentData, formData) => {
  const doc = new jsPDF();
  
  // Set page size and margins
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  // Add border around entire page
  doc.setDrawColor(0);
  doc.setLineWidth(2);
  doc.rect(margin, margin, pageWidth - (margin * 2), doc.internal.pageSize.getHeight() - (margin * 2));

  // Top Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("INDIRA COLLEGE OF ENGINEERING AND MANAGEMENT", pageWidth / 2, margin + 10, { align: "center" });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("(Shree Chanakya Education Society's)", pageWidth / 2, margin + 16, { align: "center" });
  
  doc.setFontSize(10);
  const collegeAddress = "Survey No.64 & 65, Gat No.270, At. Parandwadi, Tal. Maval, Dist. Pune-410 506";
  const approvalInfo = "Approved by AICTE, New Delhi, DTE (MS) and affiliated to Savitribai Phule Pune University";
  
  doc.text(collegeAddress, pageWidth / 2, margin + 22, { align: "center" });
  doc.text(approvalInfo, pageWidth / 2, margin + 28, { align: "center" });

  // Transfer Certificate Title and Number
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("For Migration", margin + 5, margin + 40);
  doc.text(`No: ${formData.certificateNo || "____"}`, pageWidth - margin - 40, margin + 40);

  // Main Title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("LEAVING CERTIFICATE", pageWidth / 2, margin + 55, { align: "center" });

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
    ["5", "Caste & Sub-caste", `${formData.caste || ""} ${formData.subCaste || ""}`],
    ["6", "Nationality", formData.nationality || ""],
    ["7", "Place of Birth", formData.placeOfBirth || ""],
    ["8", "Date of Birth", formData.dateOfBirth || ""],
    ["9", "Date of Birth in Words", formData.dobWords || ""],
    ["10", "Last College attended", formData.lastCollege || ""],
    ["11", "Date of Admission", formData.yearOfAdmission || ""],
    ["12", "Progress & Conduct", formData.progressAndConduct || "Good"],
    ["13", "Date of Leaving College", formData.dateOfLeaving || "____"],
    ["14", "Year in which studying & since when", `${formData.branch || ""} From ${formData.yearOfAdmission || ""}`],
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
  doc.line(pageWidth - margin - 55, finalY + 10, pageWidth - margin - 5, finalY + 10);

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
      alert("Failed to fetch pending LCs");
    } finally {
      setLoading(false);
    }
  };

  // Merge existing student data with LC form data
  const mergeStudentData = (student) => {
    console.log("Merging data for student:", student);

    // Based on your API response, the data structure is:
    // student.studentProfile contains all the LC form data including studentID
    // student.studentProfile.student contains basic student info
    
    const studentProfile = student.studentProfile || student;
    
    const mergedData = {
      // Basic student info
      ...(studentProfile.student || {}),
      
      // All the LC form data from studentProfile
      ...studentProfile,
      
      // Remove nested student object to avoid duplication
    };
    
    // Clean up the data - remove the nested student object since we've already spread its properties
    delete mergedData.student;

    console.log("Final merged data with studentID:", mergedData.studentID);
    return mergedData;
  };

  // Handle "Edit LC" button click
  const handleEdit = async (student) => {
    setSelectedStudent(student);
    const mergedData = mergeStudentData(student);
    setFormData(mergedData);
    setShowModal(true);
    setShowDownloadButton(false);
    setGeneratedPDF(null);
    
    // Also fetch additional LC details if needed
    await fetchLCDetails(student.studentProfile?.prn || student.prn);
  };

  // Fetch LC details for selected student
  const fetchLCDetails = async (prn) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/registrar/lc-details/${prn}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success && res.data.lcForm?.profile) {
        setFormData(prev => ({
          ...prev,
          ...res.data.lcForm.profile
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
        `http://localhost:5000/registrar/generate-lc/${selectedStudent.studentProfile?.prn || selectedStudent.prn}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert("LC generated successfully ✅");
        
        // Generate PDF but don't download automatically
        const studentData = selectedStudent.studentProfile?.student || selectedStudent.student || selectedStudent;
        const pdfDoc = generatePDF(studentData, formData);
        setGeneratedPDF(pdfDoc);
        setShowDownloadButton(true);
        
      } else {
        throw new Error(response.data.message || "Failed to generate LC");
      }
    } catch (err) {
      console.error("Error generating LC:", err);
      alert(`Failed to generate LC: ${err.response?.data?.message || err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  // Handle Download PDF
  const handleDownloadPDF = () => {
    if (generatedPDF) {
      const prn = selectedStudent.studentProfile?.prn || selectedStudent.prn;
      generatedPDF.save(`Leaving_Certificate_${prn || "student"}.pdf`);
      // Reset and close modal after download
      setShowDownloadButton(false);
      setGeneratedPDF(null);
      setShowModal(false);
      setSelectedStudent(null);
      setFormData({});
      fetchPendingLCs();
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
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

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
            {pendingLCs.map((student) => {
              const studentData = student.studentProfile || student;
              const basicInfo = studentData.student || studentData;
              
              return (
                <tr key={basicInfo.prn} className="text-center">
                  <td className="p-2 border">{basicInfo.prn}</td>
                  <td className="p-2 border">{basicInfo.studentName}</td>
                  <td className="p-2 border">{basicInfo.email}</td>
                  <td className="p-2 border">{basicInfo.phoneNo}</td>
                  <td className="p-2 border">
                    <button
                      onClick={() => handleEdit(student)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Edit LC
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Edit LC – {formData.studentName || selectedStudent.studentProfile?.student?.studentName}
              </h3>
              <button onClick={handleCloseModal}>
                <XMarkIcon className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Student Information</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>PRN:</strong> {formData.prn || selectedStudent.studentProfile?.prn}</div>
                <div><strong>Email:</strong> {formData.email || selectedStudent.studentProfile?.student?.email}</div>
                <div><strong>Phone:</strong> {formData.phoneNo || selectedStudent.studentProfile?.student?.phoneNo}</div>
                <div><strong>Name:</strong> {formData.studentName || selectedStudent.studentProfile?.student?.studentName}</div>
                <div><strong>Student ID:</strong> {formData.studentID || "Not found"}</div>
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
                "remarks"
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
                    placeholder={`Enter ${formatFieldName(field).toLowerCase()}`}
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
                  <span className="text-green-600">✓ All required fields are filled</span>
                ) : (
                  <span className="text-red-600">✗ Please fill all required fields (*)</span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                
                {!showDownloadButton ? (
                  <button
                    onClick={handleGenerateLC}
                    disabled={!isFormComplete() || generating}
                    className={`px-4 py-2 rounded-lg text-white ${
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
  );
};

export default RegistrarPendingLCs;