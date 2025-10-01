import React, { useEffect, useState } from "react";
import { FiSearch, FiRefreshCw, FiMoreVertical, FiDownload } from "react-icons/fi";
import { motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType } from "docx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

function RequestedInfoApprovals() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const token = localStorage.getItem("token");
  const deptName = localStorage.getItem("deptName");

  const fetchUrl = "http://localhost:5000/departments/approvals/requested-info";
  const updateUrl = "http://localhost:5000/departments/update-status";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
      setShowExportDropdown(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // ✅ Fetch only REQUESTED_INFO approvals
  const fetchApprovals = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(fetchUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (res.ok && data.success) {
          setApprovals(data.requestedInfoApprovals || []);
        } else {
          console.error("Fetch error:", data);
          setApprovals([]);
        }
      } catch {
        console.error("Non-JSON response:", text);
        setApprovals([]);
      }
    } catch (err) {
      console.error("Error fetching requested-info approvals:", err);
      setApprovals([]);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Export Functions
  const exportToExcel = () => {
    try {
      const exportData = approvals.map(approval => ({
        "Approval ID": approval.approvalId,
        "Student Name": approval.student.studentName,
        "PRN": approval.student.prn,
        "Email": approval.student.email,
        "Phone": approval.student.phoneNo || "N/A",
        "Department": approval.deptName || "N/A",
        "Branch": approval.branch || "N/A",
        "Year of Admission": approval.yearOfAdmission || "N/A",
        "Status": approval.status,
        "Remarks": approval.remarks || "N/A",
        "Created At": approval.createdAt ? new Date(approval.createdAt).toLocaleDateString() : "N/A",
        "Requested Info At": approval.updatedAt ? new Date(approval.updatedAt).toLocaleDateString() : "N/A"
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "RequestedInfoApprovals");

      XLSX.writeFile(wb, `requested_info_approvals_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      alert("✅ Exported to Excel successfully!");
      setShowExportDropdown(false);
    } catch (error) {
      console.error("Excel export error:", error);
      alert("❌ Error exporting to Excel");
    }
  };

  const exportToWord = async () => {
    try {
      const tableRows = [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Student Name")], width: { size: 40, type: WidthType.DXA } }),
            new TableCell({ children: [new Paragraph("PRN")], width: { size: 30, type: WidthType.DXA } }),
            new TableCell({ children: [new Paragraph("Email")], width: { size: 50, type: WidthType.DXA } }),
            new TableCell({ children: [new Paragraph("Phone")], width: { size: 35, type: WidthType.DXA } }),
            new TableCell({ children: [new Paragraph("Department")], width: { size: 40, type: WidthType.DXA } }),
            new TableCell({ children: [new Paragraph("Branch")], width: { size: 30, type: WidthType.DXA } }),
          ],
        }),
        ...approvals.map(approval => 
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(approval.student.studentName)] }),
              new TableCell({ children: [new Paragraph(approval.student.prn)] }),
              new TableCell({ children: [new Paragraph(approval.student.email)] }),
              new TableCell({ children: [new Paragraph(approval.student.phoneNo || "N/A")] }),
              new TableCell({ children: [new Paragraph(approval.deptName || "N/A")] }),
              new TableCell({ children: [new Paragraph(approval.branch || "N/A")] }),
            ],
          })
        ),
      ];

      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({
              text: "Requested Information Approvals Report",
              heading: "Heading1",
              spacing: { after: 400 },
            }),
            new Paragraph({
              text: `Generated on: ${new Date().toLocaleDateString()}`,
              spacing: { after: 400 },
            }),
            new Paragraph({
              text: `Total Records: ${approvals.length}`,
              spacing: { after: 200 },
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: tableRows,
            }),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `requested_info_approvals_report_${new Date().toISOString().split('T')[0]}.docx`);
      alert("✅ Exported to Word successfully!");
      setShowExportDropdown(false);
    } catch (error) {
      console.error("Word export error:", error);
      alert("❌ Error exporting to Word");
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.setTextColor(40, 53, 147);
      doc.text("Requested Information Approvals Report", 105, 15, { align: "center" });
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 22, { align: "center" });
      doc.text(`Total Records: ${approvals.length}`, 105, 28, { align: "center" });

      const tableData = approvals.map(approval => [
        approval.student.studentName,
        approval.student.prn,
        approval.student.email,
        approval.student.phoneNo || "N/A",
        approval.deptName || "N/A",
        approval.branch || "N/A"
      ]);

      doc.autoTable({
        startY: 35,
        head: [['Student Name', 'PRN', 'Email', 'Phone', 'Department', 'Branch']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [0, 83, 156] },
        styles: { fontSize: 7, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 25 },
          2: { cellWidth: 40 },
          3: { cellWidth: 25 },
          4: { cellWidth: 30 },
          5: { cellWidth: 25 }
        }
      });

      doc.save(`requested_info_approvals_report_${new Date().toISOString().split('T')[0]}.pdf`);
      alert("✅ Exported to PDF successfully!");
      setShowExportDropdown(false);
    } catch (error) {
      console.error("PDF export error:", error);
      alert("❌ Error exporting to PDF");
    }
  };

  // ✅ Only Approve action
  const handleApprove = async () => {
    if (!selectedApproval) return;
    if (!remarks.trim()) {
      alert("Remarks are required");
      return;
    }

    try {
      const res = await fetch(updateUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          approvalId: Number(selectedApproval.approvalId),
          status: "APPROVED",
          remarks,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("✅ Request approved");
        setSelectedApproval(null);
        setRemarks("");
        fetchApprovals();
      } else {
        alert(data.error || "❌ Failed to approve");
      }
    } catch (err) {
      console.error("Approve error:", err);
      alert("❌ Error approving request");
    }
  };

  // ✅ Filtering + Pagination
  const filteredApprovals = approvals.filter(
    (a) =>
      !search ||
      a.student.studentName.toLowerCase().includes(search.toLowerCase()) ||
      a.student.email.toLowerCase().includes(search.toLowerCase()) ||
      a.student.prn.toString().includes(search)
  );

  const totalPages = Math.ceil(filteredApprovals.length / itemsPerPage);
  const paginatedApprovals = filteredApprovals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 text-sm bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border"
      >
        <div>
          <h1 className="text-2xl font-bold text-[#00539C]">
            {deptName ? `${deptName} Dashboard` : "Department Dashboard"}
          </h1>
          <p className="text-gray-600 mt-1 text-sm">
            Requests for More Information
          </p>
        </div>
        
        {/* Export Button */}
        {approvals.length > 0 && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowExportDropdown(!showExportDropdown);
              }}
              disabled={loading || approvals.length === 0}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors duration-200"
            >
              <FiDownload size={16} /> Export
            </button>

            {/* Export Dropdown */}
            {showExportDropdown && (
              <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-20 min-w-[140px]">
                <button
                  onClick={exportToExcel}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors duration-150"
                >
                  <span className="text-green-600 font-medium">Excel</span>
                </button>
                <button
                  onClick={exportToWord}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors duration-150"
                >
                  <span className="text-blue-600 font-medium">Word</span>
                </button>
                <button
                  onClick={exportToPDF}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors duration-150"
                >
                  <span className="text-red-600 font-medium">PDF</span>
                </button>
              </div>
            )}
          </div>
        )}
      </motion.header>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 text-sm bg-white p-4 rounded-xl shadow-sm border">
        <div className="relative flex-1">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search by name, email, or PRN..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#00539C] focus:border-transparent transition-all duration-200"
          />
        </div>
        <button
          onClick={fetchApprovals}
          disabled={refreshing}
          className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
        >
          <FiRefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#00539C] text-white">
            <tr>
              <th className="px-6 py-4 font-semibold text-sm">Student Name</th>
              <th className="px-6 py-4 font-semibold text-sm">PRN</th>
              <th className="px-6 py-4 font-semibold text-sm">Email</th>
              <th className="px-6 py-4 font-semibold text-sm">Phone</th>
              <th className="px-6 py-4 font-semibold text-sm w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedApprovals.map((a) => (
              <tr key={a.approvalId} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 font-medium text-gray-900">{a.student.studentName}</td>
                <td className="px-6 py-4 text-gray-700">{a.student.prn}</td>
                <td className="px-6 py-4 text-gray-700">{a.student.email}</td>
                <td className="px-6 py-4 text-gray-700">{a.student.phoneNo || "—"}</td>
                <td className="px-6 py-4 relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown(activeDropdown === a.approvalId ? null : a.approvalId);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <FiMoreVertical size={18} className="text-gray-600" />
                  </button>

                  {/* Dropdown Menu */}
                  {activeDropdown === a.approvalId && (
                    <div className="absolute right-6 top-12 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10 min-w-[140px]">
                      <button
                        onClick={() => {
                          setSelectedApproval(a);
                          setRemarks("");
                          setActiveDropdown(null);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-green-700 hover:bg-green-50 flex items-center gap-2 transition-colors duration-150"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Approve
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {paginatedApprovals.length === 0 && !loading && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <svg className="h-12 w-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm">No requests pending for more information</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6 text-sm">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 h-9 flex items-center justify-center border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors duration-200"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-9 h-9 flex items-center justify-center border rounded-lg text-sm transition-colors duration-200 ${
                currentPage === page
                  ? "bg-[#00539C] text-white border-[#00539C]"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 h-9 flex items-center justify-center border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors duration-200"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {selectedApproval && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-[#00539C] px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">
                Approve Request
              </h2>
              <button
                onClick={() => setSelectedApproval(null)}
                className="text-white hover:bg-white/10 p-1 rounded-lg transition-colors duration-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Student:</span>{" "}
                  {selectedApproval.student.studentName}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">PRN:</span> {selectedApproval.student.prn}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Email:</span> {selectedApproval.student.email}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter your approval remarks here..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#00539C] focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
              <button
                onClick={() => setSelectedApproval(null)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
              >
                Approve Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RequestedInfoApprovals;