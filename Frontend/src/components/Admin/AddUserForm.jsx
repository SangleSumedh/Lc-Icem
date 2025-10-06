import React, { useEffect, useState } from "react";
import {
  FiSearch,
  FiPlus,
  FiRefreshCw,
  FiMoreVertical,
  FiUsers,
  FiDownload,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  WidthType,
} from "docx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";

function AddUserForm() {
  const token = localStorage.getItem("token");
  const BASE_URL = "http://localhost:5000/admin";

  // Configure axios defaults
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  axios.defaults.headers.common["Content-Type"] = "application/json";

  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    prn: "",
    studentName: "",
    email: "",
    phoneNo: "",
    college: "ICEM",
    password: "",
  });

  const [editing, setEditing] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const [search, setSearch] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

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

  // Fetch Students with Axios and Toast
  const fetchStudents = async () => {
    setRefreshing(true);
    const toastId = toast.loading("Fetching students...");

    try {
      const response = await axios.get(`${BASE_URL}/students`);
      if (response.data.success) {
        setStudents(response.data.data);
        toast.success("Data loaded successfully!", { id: toastId });
      } else {
        toast.error(response.data.message || "Failed to fetch students", {
          id: toastId,
        });
      }
    } catch (error) {
      console.error("Fetch students error:", error);
      toast.error("Error fetching students", { id: toastId });
    }
    setRefreshing(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Export Functions
  const exportToExcel = () => {
    try {
      const exportData = students.map((student) => ({
        PRN: student.prn,
        "Student Name": student.studentName,
        Email: student.email,
        "Phone Number": student.phoneNo || "N/A",
        College: student.college,
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Students");

      XLSX.writeFile(
        wb,
        `students_export_${new Date().toISOString().split("T")[0]}.xlsx`
      );
      toast.success("Exported to Excel successfully!");
      setShowExportDropdown(false);
    } catch (error) {
      console.error("Excel export error:", error);
      toast.error("Error exporting to Excel");
    }
  };

  const exportToWord = async () => {
    try {
      const tableRows = [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph("PRN")],
              width: { size: 30, type: WidthType.DXA },
            }),
            new TableCell({
              children: [new Paragraph("Student Name")],
              width: { size: 50, type: WidthType.DXA },
            }),
            new TableCell({
              children: [new Paragraph("Email")],
              width: { size: 60, type: WidthType.DXA },
            }),
            new TableCell({
              children: [new Paragraph("Phone")],
              width: { size: 40, type: WidthType.DXA },
            }),
            new TableCell({
              children: [new Paragraph("College")],
              width: { size: 30, type: WidthType.DXA },
            }),
          ],
        }),
        ...students.map(
          (student) =>
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph(student.prn)] }),
                new TableCell({
                  children: [new Paragraph(student.studentName)],
                }),
                new TableCell({ children: [new Paragraph(student.email)] }),
                new TableCell({
                  children: [new Paragraph(student.phoneNo || "N/A")],
                }),
                new TableCell({ children: [new Paragraph(student.college)] }),
              ],
            })
        ),
      ];

      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({
                text: "Students Report",
                heading: "Heading1",
                spacing: { after: 400 },
              }),
              new Paragraph({
                text: `Generated on: ${new Date().toLocaleDateString()}`,
                spacing: { after: 400 },
              }),
              new Paragraph({
                text: `Total Students: ${students.length}`,
                spacing: { after: 200 },
              }),
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: tableRows,
              }),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(
        blob,
        `students_report_${new Date().toISOString().split("T")[0]}.docx`
      );
      toast.success("Exported to Word successfully!");
      setShowExportDropdown(false);
    } catch (error) {
      console.error("Word export error:", error);
      toast.error("Error exporting to Word");
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();

      // Title
      doc.setFontSize(20);
      doc.setTextColor(40, 53, 147);
      doc.text("Students Report", 105, 15, { align: "center" });

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 22, {
        align: "center",
      });
      doc.text(`Total Students: ${students.length}`, 105, 28, {
        align: "center",
      });

      const tableData = students.map((student) => [
        student.prn,
        student.studentName,
        student.email,
        student.phoneNo || "N/A",
        student.college,
      ]);

      // Use autoTable as a function, passing doc as first parameter
      autoTable(doc, {
        startY: 35,
        head: [["PRN", "Student Name", "Email", "Phone", "College"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [0, 83, 156],
          textColor: 255,
          fontStyle: "bold",
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
          halign: "left",
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 40 },
          2: { cellWidth: 50 },
          3: { cellWidth: 30 },
          4: { cellWidth: 25 },
        },
        margin: { top: 35 },
      });

      doc.save(`students_report_${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("Exported to PDF successfully!");
      setShowExportDropdown(false);
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Error exporting to PDF");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (editing) {
      setEditing((p) => ({ ...p, [name]: value }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  // Add Student with Axios and Toast
  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Adding student...");

    try {
      const response = await axios.post(`${BASE_URL}/add-student`, formData);

      if (response.data.success) {
        await fetchStudents();
        setFormData({
          prn: "",
          studentName: "",
          email: "",
          phoneNo: "",
          college: "ICEM",
          password: "",
        });
        setShowAddModal(false);
        toast.success("Student added successfully!", { id: toastId });
      } else {
        toast.error(response.data.message || "Failed to add student", {
          id: toastId,
        });
      }
    } catch (error) {
      console.error("Add student error:", error);
      toast.error("Error adding student", { id: toastId });
    }
    setLoading(false);
  };

  // Update Student with Axios and Toast
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Updating student...");

    try {
      const response = await axios.put(
        `${BASE_URL}/update-student/${editing.prn}`,
        editing
      );

      if (response.data.success) {
        await fetchStudents();
        setEditing(null);
        toast.success("Student updated successfully!", { id: toastId });
      } else {
        toast.error(response.data.message || "Update failed", { id: toastId });
      }
    } catch (error) {
      console.error("Update error", error);
      toast.error("Error updating student", { id: toastId });
    }
    setLoading(false);
  };

  // Delete Student with Axios and Toast
  const handleDeleteConfirm = async () => {
    if (!deleteUser) return;
    setLoading(true);
    const toastId = toast.loading("Deleting student...");

    try {
      const response = await axios.delete(
        `${BASE_URL}/delete-student/${deleteUser.prn}`
      );

      if (response.data.success) {
        await fetchStudents();
        setDeleteUser(null);
        toast.success("Student deleted successfully!", { id: toastId });
      } else {
        toast.error("Failed to delete student", { id: toastId });
      }
    } catch (error) {
      console.error("Delete error", error);
      toast.error("Error deleting student", { id: toastId });
    }
    setLoading(false);
  };

  // Filtering
  const filteredStudents = students.filter(
    (s) =>
      (!search ||
        s.studentName.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())) &&
      (!collegeFilter || s.college === collegeFilter)
  );

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <main className="space-y-6 text-sm bg-gray-50 min-h-screen">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white py-6 rounded-xl "
      >
        <div>
          <h1 className="text-2xl font-bold text-[#00539C]">Students</h1>
          <p className="text-gray-600 mt-1 text-sm">
            Manage system students and their information
          </p>
        </div>
        <div className="flex gap-3">
          {/* Export Button */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowExportDropdown(!showExportDropdown);
              }}
              disabled={loading || students.length === 0}
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

          <button
            onClick={() => setShowAddModal(true)}
            disabled={loading}
            className="flex items-center gap-2 bg-[#00539C] text-white px-4 py-2.5 rounded-lg hover:bg-[#004085] disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors duration-200"
          >
            <FiPlus size={16} /> Add Student
          </button>
        </div>
      </motion.header>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60]">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00539C]"></div>
            <span className="text-sm">Processing...</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 text-sm bg-white py-4 rounded-xl">
        <div className="relative flex-1">
          <FiSearch
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search students by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm transition-all duration-200 focus:ring-1 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm"
          />
        </div>

        <select
          value={collegeFilter}
          onChange={(e) => {
            setCollegeFilter(e.target.value);
            setCurrentPage(1);
          }}
          className=" px-8 py-2.5 border border-gray-300 rounded-lg text-sm transition-all duration-200 focus:ring-1 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm appearance-none cursor-pointer"
        >
          <option value="">All Colleges </option>
          {[...new Set(students.map((s) => s.college))].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <button
          onClick={fetchStudents}
          disabled={refreshing || loading}
          className="p-2.5  rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:ring-1 border border-gray-300 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm"
        >
          <FiRefreshCw
            size={16}
            className={`${refreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-300 relative">
        <table className="w-full text-left font-semibold">
          <thead className="bg-[#00539C] text-white">
            <tr>
              <th className="px-6 py-4 font-semibold text-sm rounded-tl-xl">
                PRN
              </th>
              <th className="px-6 py-4 font-semibold text-sm">Name</th>
              <th className="px-6 py-4 font-semibold text-sm">Email</th>
              <th className="px-6 py-4 font-semibold text-sm">Phone</th>
              <th className="px-6 py-4 font-semibold text-sm">College</th>
              <th className="px-6 py-4 font-semibold text-sm w-20 rounded-tr-xl"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedStudents.map((s, index) => (
              <tr
                key={s.prn}
                className="transition-colors duration-150 rounded-lg"
              >
                <td className="px-6 py-4 font-medium text-gray-900 rounded-l-lg">
                  {s.prn}
                </td>
                <td className="px-6 py-4 text-gray-700">{s.studentName}</td>
                <td className="px-6 py-4 text-gray-700">{s.email}</td>
                <td className="px-6 py-4 text-gray-700">{s.phoneNo || "—"}</td>
                <td className="px-6 py-4 text-gray-700">{s.college}</td>
                <td className="px-6 py-4 relative rounded-r-lg">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown(
                        activeDropdown === s.prn ? null : s.prn
                      );
                    }}
                    disabled={loading}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
                  >
                    <FiMoreVertical size={18} className="text-gray-600" />
                  </button>

                  {/* Dropdown Menu */}
                  {activeDropdown === s.prn && (
                    <div className="absolute top-full right-5 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50 min-w-[140px]">
                      <button
                        onClick={() => {
                          setEditing({ ...s, password: "" });
                          setActiveDropdown(null);
                        }}
                        disabled={loading}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2 transition-colors duration-150"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Update
                      </button>
                      <button
                        onClick={() => {
                          setDeleteUser(s);
                          setActiveDropdown(null);
                        }}
                        disabled={loading}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 flex items-center gap-2 transition-colors duration-150"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {paginatedStudents.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <FiUsers className="h-12 w-12 text-gray-300 mb-2" />
                    <p className="text-sm">No students found</p>
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
            disabled={currentPage === 1 || loading}
            className="px-4 py-2 h-9 flex items-center justify-center border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors duration-200"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              disabled={loading}
              className={`w-9 h-9 flex items-center justify-center border rounded-lg text-sm transition-colors duration-200 ${
                currentPage === page
                  ? "bg-[#00539C] text-white border-[#00539C]"
                  : "border-gray-300 hover:bg-gray-50"
              } disabled:opacity-50`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || loading}
            className="px-4 py-2 h-9 flex items-center justify-center border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors duration-200"
          >
            Next
          </button>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-[#00539C] px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Add Student</h2>
              <button
                onClick={() => setShowAddModal(false)}
                disabled={loading}
                className="text-white disabled:opacity-50 hover:bg-white/10 p-1 rounded-lg transition-colors duration-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    PRN <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="prn"
                    value={formData.prn}
                    onChange={handleChange}
                    placeholder="Enter PRN"
                    required
                    disabled={loading}
                    className="w-full border border-gray-300 p-2.5 rounded-lg text-sm disabled:opacity-50 focus:ring-2 focus:ring-[#00539C] focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    required
                    disabled={loading}
                    className="w-full border border-gray-300 p-2.5 rounded-lg text-sm disabled:opacity-50 focus:ring-2 focus:ring-[#00539C] focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    required
                    disabled={loading}
                    className="w-full border border-gray-300 p-2.5 rounded-lg text-sm disabled:opacity-50 focus:ring-2 focus:ring-[#00539C] focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Phone Number
                  </label>
                  <input
                    name="phoneNo"
                    value={formData.phoneNo}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    disabled={loading}
                    className="w-full border border-gray-300 p-2.5 rounded-lg text-sm disabled:opacity-50 focus:ring-2 focus:ring-[#00539C] focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    College <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full border border-gray-300 p-2.5 rounded-lg text-sm disabled:opacity-50 focus:ring-2 focus:ring-[#00539C] focus:border-transparent transition-all duration-200"
                  >
                    <option value="ICEM">ICEM</option>
                    <option value="IGSB">IGSB</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    required
                    disabled={loading}
                    className="w-full border border-gray-300 p-2.5 rounded-lg text-sm disabled:opacity-50 focus:ring-2 focus:ring-[#00539C] focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={loading}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-[#00539C] text-white rounded-lg hover:bg-[#004085] disabled:opacity-50 transition-colors duration-200 text-sm font-medium"
                >
                  {loading ? "Adding..." : "Add Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-[#00539C] px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">
                Update Student
              </h2>
              <button
                onClick={() => setEditing(null)}
                disabled={loading}
                className="text-white disabled:opacity-50 hover:bg-white/10 p-1 rounded-lg transition-colors duration-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    PRN
                  </label>
                  <input
                    value={editing.prn}
                    disabled
                    className="w-full border border-gray-300 p-2.5 rounded-lg text-sm bg-gray-100 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={editing.studentName}
                    name="studentName"
                    onChange={handleChange}
                    placeholder="Full Name"
                    required
                    disabled={loading}
                    className="w-full border border-gray-300 p-2.5 rounded-lg text-sm disabled:opacity-50 focus:ring-2 focus:ring-[#00539C] focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={editing.email}
                    name="email"
                    onChange={handleChange}
                    placeholder="Email"
                    required
                    disabled={loading}
                    className="w-full border border-gray-300 p-2.5 rounded-lg text-sm disabled:opacity-50 focus:ring-2 focus:ring-[#00539C] focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Phone Number
                  </label>
                  <input
                    value={editing.phoneNo || ""}
                    name="phoneNo"
                    onChange={handleChange}
                    placeholder="Phone Number"
                    disabled={loading}
                    className="w-full border border-gray-300 p-2.5 rounded-lg text-sm disabled:opacity-50 focus:ring-2 focus:ring-[#00539C] focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    College <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editing.college}
                    name="college"
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full border border-gray-300 p-2.5 rounded-lg text-sm disabled:opacity-50 focus:ring-2 focus:ring-[#00539C] focus:border-transparent transition-all duration-200"
                  >
                    <option value="ICEM">ICEM</option>
                    <option value="IGSB">IGSB</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={editing.password || ""}
                    onChange={handleChange}
                    placeholder="Leave empty to keep current password"
                    disabled={loading}
                    className="w-full border border-gray-300 p-2.5 rounded-lg text-sm disabled:opacity-50 focus:ring-2 focus:ring-[#00539C] focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  disabled={loading}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-[#00539C] text-white rounded-lg hover:bg-[#004085] disabled:opacity-50 transition-colors duration-200 text-sm font-medium"
                >
                  {loading ? "Updating..." : "Update Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteUser && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-[#00539C] px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">
                Confirm Delete
              </h2>
              <button
                onClick={() => setDeleteUser(null)}
                disabled={loading}
                className="text-white disabled:opacity-50 hover:bg-white/10 p-1 rounded-lg transition-colors duration-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-700">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-900">
                  {deleteUser.studentName}
                </span>
                ?
                <br />
                <span className="text-red-500 text-xs">
                  This action cannot be undone and will permanently remove the
                  student record.
                </span>
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteUser(null)}
                  disabled={loading}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={loading}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors duration-200 text-sm font-medium"
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AddUserForm;
