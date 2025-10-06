import React, { useEffect, useState } from "react";
import {
  FiSearch,
  FiPlus,
  FiRefreshCw,
  FiMoreVertical,
  FiShield,
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

function AddSuperAdmin() {
  const token = localStorage.getItem("token");
  const BASE_URL = "http://localhost:5000/admin";
  const navigate = useNavigate();

  // Configure axios defaults
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  axios.defaults.headers.common["Content-Type"] = "application/json";

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [superAdmins, setSuperAdmins] = useState([]);
  const [editing, setEditing] = useState(null);
  const [deleteAdmin, setDeleteAdmin] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Fetch SuperAdmins with Axios and Toast
  const fetchSuperAdmins = async () => {
    setRefreshing(true);
    const toastId = toast.loading("Fetching superadmins...");

    try {
      const response = await axios.get(`${BASE_URL}/get-superAdmins`);
      if (response.data.success) {
        setSuperAdmins(
          response.data.data.map(({ id, username, email }) => ({
            id,
            username,
            email,
          }))
        );
        toast.success("Data loaded successfully!", { id: toastId });
      } else {
        toast.error(response.data.message || "Failed to fetch Data", {
          id: toastId,
        });
      }
    } catch (error) {
      console.error("Fetch superadmins error:", error);
      toast.error("Error fetching superadmins", { id: toastId });
    }
    setRefreshing(false);
  };

  useEffect(() => {
    fetchSuperAdmins();
  }, []);

  // Export Functions
  const exportToExcel = () => {
    try {
      const exportData = superAdmins.map((admin) => ({
        ID: admin.id,
        Username: admin.username,
        Email: admin.email,
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "SuperAdmins");

      XLSX.writeFile(
        wb,
        `superadmins_export_${new Date().toISOString().split("T")[0]}.xlsx`
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
              children: [new Paragraph("ID")],
              width: { size: 20, type: WidthType.DXA },
            }),
            new TableCell({
              children: [new Paragraph("Username")],
              width: { size: 40, type: WidthType.DXA },
            }),
            new TableCell({
              children: [new Paragraph("Email")],
              width: { size: 60, type: WidthType.DXA },
            }),
          ],
        }),
        ...superAdmins.map(
          (admin) =>
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph(admin.id.toString())],
                }),
                new TableCell({ children: [new Paragraph(admin.username)] }),
                new TableCell({ children: [new Paragraph(admin.email)] }),
              ],
            })
        ),
      ];

      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({
                text: "SuperAdmins Report",
                heading: "Heading1",
                spacing: { after: 400 },
              }),
              new Paragraph({
                text: `Generated on: ${new Date().toLocaleDateString()}`,
                spacing: { after: 400 },
              }),
              new Paragraph({
                text: `Total SuperAdmins: ${superAdmins.length}`,
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
        `superadmins_report_${new Date().toISOString().split("T")[0]}.docx`
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
      doc.text("SuperAdmins Report", 105, 15, { align: "center" });

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 22, {
        align: "center",
      });
      doc.text(`Total SuperAdmins: ${superAdmins.length}`, 105, 28, {
        align: "center",
      });

      const tableData = superAdmins.map((admin) => [
        admin.id.toString(),
        admin.username,
        admin.email,
      ]);

      // Use autoTable as a function, passing doc as first parameter
      autoTable(doc, {
        startY: 35,
        head: [["ID", "Username", "Email"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [0, 83, 156],
          textColor: 255,
          fontStyle: "bold",
        },
        styles: {
          fontSize: 9,
          cellPadding: 4,
          halign: "left",
        },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 40 },
          2: { cellWidth: 80 },
        },
      });

      doc.save(
        `superadmins_report_${new Date().toISOString().split("T")[0]}.pdf`
      );
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

  // Add SuperAdmin with Axios and Toast
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Adding superadmin...");

    try {
      const response = await axios.post(`${BASE_URL}/add-superadmin`, formData);

      if (response.data.success) {
        await fetchSuperAdmins();
        setFormData({ username: "", email: "", password: "" });
        setShowAddModal(false);
        toast.success("Superadmin added successfully!", { id: toastId });
      } else {
        toast.error(response.data.message || "Failed to add superadmin", {
          id: toastId,
        });
      }
    } catch (error) {
      console.error("Error adding superadmin:", error);
      toast.error("Error adding superadmin", { id: toastId });
    }
    setLoading(false);
  };

  // Update SuperAdmin with Axios and Toast
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Updating superadmin...");

    try {
      const response = await axios.put(
        `${BASE_URL}/update-superadmin/${editing.id}`,
        editing
      );

      if (response.data.success) {
        await fetchSuperAdmins();
        setEditing(null);
        toast.success("Superadmin updated successfully!", { id: toastId });
      } else {
        toast.error(response.data.message || "Update failed", { id: toastId });
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Error updating superadmin", { id: toastId });
    }
    setLoading(false);
  };

  // Delete SuperAdmin with Axios and Toast
  const handleDeleteConfirm = async () => {
    if (!deleteAdmin) return;
    setLoading(true);
    const toastId = toast.loading("Deleting superadmin...");

    try {
      const response = await axios.delete(
        `${BASE_URL}/delete-superadmin/${deleteAdmin.id}`
      );

      if (response.data.success) {
        await fetchSuperAdmins();
        setDeleteAdmin(null);
        toast.success("Superadmin deleted successfully!", { id: toastId });
      } else {
        toast.error("Failed to delete superadmin", { id: toastId });
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting superadmin", { id: toastId });
    }
    setLoading(false);
  };

  // Filtering + Pagination
  const filteredAdmins = superAdmins.filter(
    (s) =>
      !search ||
      s.username.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);
  const paginatedAdmins = filteredAdmins.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 text-sm bg-gray-50 min-h-screen">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white py-6 rounded-xl "
      >
        <div>
          <h1 className="text-2xl font-bold text-[#00539C]">SuperAdmins</h1>
          <p className="text-gray-600 mt-1 text-sm">
            Manage system super administrators
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
              disabled={loading || superAdmins.length === 0}
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
            <FiPlus size={16} /> Add SuperAdmin
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
            placeholder="Search superadmins by username or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm transition-all duration-200 focus:ring-1 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm"
          />
        </div>

        <button
          onClick={fetchSuperAdmins}
          disabled={refreshing || loading}
          className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:ring-1 focus:ring-blue-400 focus:outline-none focus:shadow-sm"
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
                ID
              </th>
              <th className="px-6 py-4 font-semibold text-sm">Username</th>
              <th className="px-6 py-4 font-semibold text-sm">Email</th>
              <th className="px-6 py-4 font-semibold text-sm w-20 rounded-tr-xl"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedAdmins.map((s, index) => (
              <tr
                key={s.id}
                className="transition-colors duration-150 rounded-lg"
              >
                <td className="px-6 py-4 font-medium text-gray-900 rounded-l-lg">
                  {s.id}
                </td>
                <td className="px-6 py-4 text-gray-700">{s.username}</td>
                <td className="px-6 py-4 text-gray-700">{s.email}</td>
                <td className="px-6 py-4 relative rounded-r-lg">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown(activeDropdown === s.id ? null : s.id);
                    }}
                    disabled={loading}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
                  >
                    <FiMoreVertical size={18} className="text-gray-600" />
                  </button>

                  {/* Dropdown Menu */}
                  {activeDropdown === s.id && (
                    <div
                      className={`absolute bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50 min-w-[140px] ${
                        // Check if this is one of the last few rows and position dropdown above
                        index >= paginatedAdmins.length - 3
                          ? "bottom-full mb-2"
                          : "top-full mt-2"
                      } right-5`}
                    >
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
                          setDeleteAdmin(s);
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
            {paginatedAdmins.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <FiShield className="h-12 w-12 text-gray-300 mb-2" />
                    <p className="text-sm">No superadmins found</p>
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
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-[#00539C] px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">
                Add SuperAdmin
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                disabled={loading}
                className="text-white disabled:opacity-50 hover:bg-white/10 p-1 rounded-lg transition-colors duration-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter username"
                    required
                    disabled={loading}
                    className="w-full p-2.5 rounded-lg text-sm disabled:opacity-50 focus:ring-1 border border-gray-300 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm  transition-all duration-200"
                  />
                </div>
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
                    className="w-full  p-2.5 rounded-lg text-sm disabled:opacity-50 focus:ring-1 border border-gray-300 focus:ring-gray-400  focus:outline-none focus:shadow-sm  transition-all duration-200"
                  />
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
                    className="w-full  p-2.5 rounded-lg text-sm disabled:opacity-50 focus:ring-1 border border-gray-300 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm  transition-all duration-200"
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
                  {loading ? "Adding..." : "Add SuperAdmin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-[#00539C] px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">
                Update SuperAdmin
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
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    ID
                  </label>
                  <input
                    value={editing.id}
                    disabled
                    className="w-full border border-gray-300 p-2.5 rounded-lg text-sm bg-gray-100 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="username"
                    value={editing.username}
                    onChange={handleChange}
                    placeholder="Username"
                    required
                    disabled={loading}
                    className="w-full  p-2.5 rounded-lg text-sm disabled:opacity-50 focus:ring-1 border border-gray-300 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm  transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editing.email}
                    onChange={handleChange}
                    placeholder="Email"
                    required
                    disabled={loading}
                    className="w-full p-2.5 rounded-lg text-sm disabled:opacity-50 focus:ring-1 border border-gray-300 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm  transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Leave empty to keep current password"
                    value={editing.password || ""}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full  p-2.5 rounded-lg text-sm disabled:opacity-50 focus:ring-1 border border-gray-300 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm  transition-all duration-200"
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
                  {loading ? "Updating..." : "Update SuperAdmin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteAdmin && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-[#00539C] px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">
                Confirm Delete
              </h2>
              <button
                onClick={() => setDeleteAdmin(null)}
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
                  {deleteAdmin.username}
                </span>
                ?
                <br />
                <span className="text-red-500 text-xs">
                  This action cannot be undone and will permanently remove the
                  superadmin account.
                </span>
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteAdmin(null)}
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
    </div>
  );
}

export default AddSuperAdmin;
