import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiSearch, FiRefreshCw, FiDownload } from "react-icons/fi";
import axios from "axios";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  WidthType,
  TextRun,
} from "docx";
import { saveAs } from "file-saver";
import useApprovalsStore from "../../store/approvalsStore";

function ApprovedApprovalRequests({ title, subtitle }) {
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const token = localStorage.getItem("token");

  const { approvalsData, loadingStates, fetchApprovals } = useApprovalsStore();

  const approvals = approvalsData.approved;
  const loading = loadingStates.approved;

  // ✅ Fetch approvals using Zustand
  const fetchData = async () => {
    setRefreshing(true);
    const fetchUrl =
      `${ENV.BASE_URL}/departments/approvals/approved` ||
      "http://localhost:5000/departments/approvals/approved";
    await fetchApprovals("approved", fetchUrl, token);
    setRefreshing(false);
  };

  // Export to Excel
  const exportToExcel = () => {
    try {
      const exportData = approvals.map((a) => ({
        "Approval ID": a.approvalId,
        "Department ID": a.deptId,
        "Department Name": a.deptName || "N/A",
        Branch: a.branch || "N/A",
        "Student Name": a.student.studentName,
        PRN: a.student.prn,
        Email: a.student.email,
        Phone: a.student.phoneNo || "N/A",
        "Year of Admission": a.yearOfAdmission,
        Status: a.status,
        Remarks: a.remarks || "N/A",
        "Created By Staff ID": a.createdByStaffId || "N/A",
        "Created At": a.createdAt
          ? new Date(a.createdAt).toLocaleString()
          : "N/A",
        "Updated At": a.updatedAt
          ? new Date(a.updatedAt).toLocaleString()
          : "N/A",
        "Approved At": a.approvedAt
          ? new Date(a.approvedAt).toLocaleString()
          : "N/A",
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Approvals");
      XLSX.writeFile(
        wb,
        `${title.toLowerCase().replace(/\s+/g, "_")}_export_${
          new Date().toISOString().split("T")[0]
        }.xlsx`
      );
      toast.success("Exported to Excel successfully!");
      setShowExportDropdown(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to export to Excel!");
    }
  };

  // Export to PDF
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.setTextColor(40, 53, 147);
      doc.text(`${title} Report`, 105, 15, { align: "center" });
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 22, {
        align: "center",
      });
      doc.text(`Total Records: ${approvals.length}`, 105, 28, {
        align: "center",
      });

      const tableData = approvals.map((a) => [
        a.approvalId,
        a.deptId,
        a.deptName || "N/A",
        a.branch || "N/A",
        a.student.studentName,
        a.student.prn,
        a.student.email,
        a.student.phoneNo || "—",
        a.yearOfAdmission,
        a.status,
        a.remarks || "N/A",
        a.createdByStaffId || "N/A",
        a.createdAt ? new Date(a.createdAt).toLocaleString() : "N/A",
        a.updatedAt ? new Date(a.updatedAt).toLocaleString() : "N/A",
        a.approvedAt ? new Date(a.approvedAt).toLocaleString() : "N/A",
      ]);

      autoTable(doc, {
        startY: 35,
        head: [
          [
            "Approval ID",
            "Dept ID",
            "Dept Name",
            "Branch",
            "Student Name",
            "PRN",
            "Email",
            "Phone",
            "Year of Admission",
            "Status",
            "Remarks",
            "Created By Staff ID",
            "Created At",
            "Updated At",
            "Approved At",
          ],
        ],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [0, 83, 156] },
        styles: { fontSize: 6, cellPadding: 2 },
      });

      doc.save(
        `${title.toLowerCase().replace(/\s+/g, "_")}_report_${
          new Date().toISOString().split("T")[0]
        }.pdf`
      );
      toast.success("Exported to PDF successfully!");
      setShowExportDropdown(false);
    } catch (err) {
      console.error(err);
      toast.error("Error exporting to PDF");
    }
  };

  // Export to Word
  const exportToWord = () => {
    try {
      const tableRows = [
        new TableRow({
          children: [
            "Approval ID",
            "Dept ID",
            "Dept Name",
            "Branch",
            "Student Name",
            "PRN",
            "Email",
            "Phone",
            "Year of Admission",
            "Status",
            "Remarks",
            "Created By Staff ID",
            "Created At",
            "Updated At",
            "Approved At",
          ].map(
            (header) =>
              new TableCell({
                children: [new Paragraph({ text: header, bold: true })],
                width: { size: 10, type: WidthType.PERCENTAGE },
              })
          ),
        }),
        ...approvals.map(
          (a) =>
            new TableRow({
              children: [
                a.approvalId,
                a.deptId,
                a.deptName || "N/A",
                a.branch || "N/A",
                a.student.studentName,
                a.student.prn,
                a.student.email,
                a.student.phoneNo || "N/A",
                a.yearOfAdmission,
                a.status,
                a.remarks || "N/A",
                a.createdByStaffId || "N/A",
                a.createdAt ? new Date(a.createdAt).toLocaleString() : "N/A",
                a.updatedAt ? new Date(a.updatedAt).toLocaleString() : "N/A",
                a.approvedAt ? new Date(a.approvedAt).toLocaleString() : "N/A",
              ].map(
                (value) =>
                  new TableCell({
                    children: [new Paragraph(String(value))],
                    width: { size: 10, type: WidthType.PERCENTAGE },
                  })
              ),
            })
        ),
      ];

      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({ text: `${title} Report`, heading: "Heading1" }),
              new Paragraph({
                text: `Generated on: ${new Date().toLocaleDateString()}`,
              }),
              new Table({ rows: tableRows }),
            ],
          },
        ],
      });

      Packer.toBlob(doc).then((blob) => {
        saveAs(
          blob,
          `${title.toLowerCase().replace(/\s+/g, "_")}_report_${
            new Date().toISOString().split("T")[0]
          }.docx`
        );
        toast.success("Exported to Word successfully!");
        setShowExportDropdown(false);
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to export to Word!");
    }
  };

  // Filtering + Pagination
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
    <div className="space-y-6 text-sm  min-h-screen">
      {/* Header & Export Buttons */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white py-6 rounded-xl"
      >
        <div>
          <h1 className="text-2xl font-bold text-[#00539C]">{title}</h1>
          <p className="text-gray-600 mt-1 text-sm">{subtitle}</p>
        </div>

        {approvals.length > 0 && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowExportDropdown(!showExportDropdown);
              }}
              disabled={loading || approvals.length === 0}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors duration-200"
            >
              <FiDownload size={16} /> Export
            </button>

            {showExportDropdown && (
              <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-20 min-w-[140px]">
                <button
                  onClick={exportToExcel}
                  className="w-full px-4 py-2.5 text-left text-sm text-emerald-700 hover:bg-gray-50 flex items-center gap-2 transition-colors duration-150"
                >
                  Excel
                </button>
                <button
                  onClick={exportToWord}
                  className="w-full px-4 py-2.5 text-left text-sm text-sky-700 hover:bg-gray-50 flex items-center gap-2 transition-colors duration-150"
                >
                  Word
                </button>
                <button
                  onClick={exportToPDF}
                  className="w-full px-4 py-2.5 text-left text-sm text-rose-700 hover:bg-gray-50 flex items-center gap-2 transition-colors duration-150"
                >
                  PDF
                </button>
              </div>
            )}
          </div>
        )}
      </motion.header>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 text-sm  py-4 rounded-xl">
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
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm transition-all duration-200 focus:ring-1 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm"
          />
        </div>
        <button
          onClick={fetchData} 
          disabled={refreshing}
          className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
        >
          <FiRefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-300 relative">
        <table className="w-full text-left">
          <thead className="bg-[#00539C] text-white">
            <tr>
              <th className="px-6 py-4 font-semibold text-sm rounded-tl-xl">
                Student Name
              </th>
              <th className="px-6 py-4 font-semibold text-sm">PRN</th>
              <th className="px-6 py-4 font-semibold text-sm">Email</th>
              <th className="px-6 py-4 font-semibold text-sm">Phone</th>
              <th className="px-6 py-4 font-semibold text-sm rounded-tr-xl text-center">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedApprovals.map((a) => (
              <tr
                key={a.approvalId}
                className="transition-colors duration-150 rounded-lg"
              >
                <td className="px-6 py-4 font-medium text-gray-900 rounded-l-lg">
                  {a.student.studentName}
                </td>
                <td className="px-6 py-4 text-gray-700">{a.student.prn}</td>
                <td className="px-6 py-4 text-gray-700">{a.student.email}</td>
                <td className="px-6 py-4 text-gray-700">
                  {a.student.phoneNo || "—"}
                </td>
                <td className="px-6 text-emerald-500 ">
                  <div className="bg-emerald-50 text-center p-2 rounded-xl ">
                    {a.status}
                  </div>
                </td>
              </tr>
            ))}
            {paginatedApprovals.length === 0 && !loading && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  No approved requests
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
    </div>
  );
}

export default ApprovedApprovalRequests;
