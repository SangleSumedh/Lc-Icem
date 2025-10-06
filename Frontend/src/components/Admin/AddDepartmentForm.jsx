import React, { useEffect, useState } from "react";
import {
  FiSearch,
  FiPlus,
  FiRefreshCw,
  FiMoreVertical,
  FiDownload,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Building2, Users } from "lucide-react";
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
  BorderStyle,
} from "docx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import ENV from "../../env.js"

const AddDepartmentForm = () => {
  const token = localStorage.getItem("token");
  const BASE_URL = `${ENV.BASE_URL}/admin` || "http://localhost:5000/admin";

  // Configure axios defaults
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  axios.defaults.headers.common["Content-Type"] = "application/json";

  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [allStaff, setAllStaff] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deleteDept, setDeleteDept] = useState(null);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffDept, setStaffDept] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Add these states
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showEditStaffModal, setShowEditStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [deleteStaff, setDeleteStaff] = useState(null);
  const [staffDropdown, setStaffDropdown] = useState(null);
  const [refreshingStaff, setRefreshingStaff] = useState(false);

  // Add Staff Handler
  const handleAddStaff = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Adding staff...");

    try {
      await axios.post(`${BASE_URL}/add-staff`, {
        ...staffData,
        deptId: staffDept.deptId,
      });

      await refreshStaffList(); // Refresh the staff list
      setStaffData({ name: "", email: "", password: "" });
      setShowAddStaffModal(false);
      toast.success("Staff added successfully!", { id: toastId });
    } catch (error) {
      console.error("Add staff error", error);
      toast.error("Error adding staff", { id: toastId });
    }
    setLoading(false);
  };

  // Update Staff Handler
  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Updating staff...");

    try {
      const payload = {
        name: editingStaff.name,
        email: editingStaff.email,
        deptId: staffDept.deptId,
      };

      if (editingStaff.password && editingStaff.password.trim() !== "") {
        payload.password = editingStaff.password;
      }

      await axios.put(
        `${BASE_URL}/update-staff/${editingStaff.staffId}`,
        payload
      );

      await refreshStaffList(); // Refresh the staff list
      setShowEditStaffModal(false);
      setEditingStaff(null);
      toast.success("Staff updated successfully!", { id: toastId });
    } catch (error) {
      console.error("Update staff error", error);
      toast.error("Error updating staff", { id: toastId });
    }
    setLoading(false);
  };

  // Delete Staff Handler
  const handleDeleteStaffConfirm = async () => {
    if (!deleteStaff) return;
    setLoading(true);
    const toastId = toast.loading("Deleting staff...");

    try {
      await axios.delete(`${BASE_URL}/delete-staff/${deleteStaff.staffId}`);

      await refreshStaffList(); // Refresh the staff list
      setDeleteStaff(null);
      toast.success("Staff deleted successfully!", { id: toastId });
    } catch (error) {
      console.error("Delete staff error", error);
      toast.error("Error deleting staff", { id: toastId });
    }
    setLoading(false);
  };

  // Form states
  const [formData, setFormData] = useState({
    deptName: "",
    branchId: "",
    college: "ICEM",
  });
  const [staffData, setStaffData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const collegeOptions = [
    { value: "ICEM", label: "ICEM - Indira College of Engineering" },
    { value: "IGSB", label: "IGSB - Indira Global School of Business" },
    { value: "ALL", label: "All - Common Departments For ICEM & IGSB" },
  ];

  // Fetch departments with loading and toast
  const fetchDepartments = async () => {
    setRefreshing(true);
    const toastId = toast.loading("Fetching departments...");

    try {
      const [deptResponse, staffResponse] = await Promise.all([
        axios.get(`${BASE_URL}/departments`),
        axios.get(`${BASE_URL}/staff`),
      ]);

      if (!deptResponse.data.success) {
        throw new Error(
          deptResponse.data.message || "Failed to fetch departments"
        );
      }

      setDepartments(deptResponse.data.data);

      if (staffResponse.data.success) {
        setAllStaff(staffResponse.data.data);
      }

      // ✅ Show success toast only once here
      toast.success("Data loaded successfully!", { id: toastId });
    } catch (error) {
      console.error("Fetch data error:", error);
      toast.error("Error fetching data", { id: toastId });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

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

  // Handle field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleStaffChange = (e) => {
    const { name, value } = e.target;
    setStaffData((p) => ({ ...p, [name]: value }));
  };

  // Export Functions
  const exportToExcel = () => {
    try {
      const exportData = departments.map((dept) => {
        const deptStaff = allStaff.filter(
          (staff) => staff.deptId === dept.deptId
        );
        return {
          "Department ID": dept.deptId,
          "Department Name": dept.deptName,
          "Branch ID": dept.branchId || "N/A",
          College: dept.college,
          "Staff Count": deptStaff.length,
          "Staff Details":
            deptStaff
              .map((staff) => `${staff.name} (${staff.email})`)
              .join("; ") || "No staff",
        };
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Departments");

      // Add Staff sheet
      const staffSheetData = allStaff.map((staff) => {
        const dept = departments.find((d) => d.deptId === staff.deptId);
        return {
          "Staff ID": staff.staffId,
          "Staff Name": staff.name,
          Email: staff.email,
          "Department ID": staff.deptId,
          "Department Name": dept?.deptName || "N/A",
          College: dept?.college || "N/A",
        };
      });
      const staffWs = XLSX.utils.json_to_sheet(staffSheetData);
      XLSX.utils.book_append_sheet(wb, staffWs, "Staff");

      XLSX.writeFile(
        wb,
        `departments_export_${new Date().toISOString().split("T")[0]}.xlsx`
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
      // Department table
      const deptTableRows = [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph("Dept ID")],
              width: { size: 20, type: WidthType.DXA },
            }),
            new TableCell({
              children: [new Paragraph("Dept Name")],
              width: { size: 40, type: WidthType.DXA },
            }),
            new TableCell({
              children: [new Paragraph("Branch ID")],
              width: { size: 20, type: WidthType.DXA },
            }),
            new TableCell({
              children: [new Paragraph("College")],
              width: { size: 30, type: WidthType.DXA },
            }),
            new TableCell({
              children: [new Paragraph("Staff Count")],
              width: { size: 20, type: WidthType.DXA },
            }),
          ],
        }),
        ...departments.map((dept) => {
          const deptStaff = allStaff.filter(
            (staff) => staff.deptId === dept.deptId
          );
          return new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph(dept.deptId.toString())],
              }),
              new TableCell({ children: [new Paragraph(dept.deptName)] }),
              new TableCell({
                children: [new Paragraph(dept.branchId?.toString() || "N/A")],
              }),
              new TableCell({ children: [new Paragraph(dept.college)] }),
              new TableCell({
                children: [new Paragraph(deptStaff.length.toString())],
              }),
            ],
          });
        }),
      ];

      // Staff table
      const staffTableRows = [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph("Staff ID")],
              width: { size: 20, type: WidthType.DXA },
            }),
            new TableCell({
              children: [new Paragraph("Staff Name")],
              width: { size: 40, type: WidthType.DXA },
            }),
            new TableCell({
              children: [new Paragraph("Email")],
              width: { size: 50, type: WidthType.DXA },
            }),
            new TableCell({
              children: [new Paragraph("Dept ID")],
              width: { size: 20, type: WidthType.DXA },
            }),
            new TableCell({
              children: [new Paragraph("Dept Name")],
              width: { size: 40, type: WidthType.DXA },
            }),
          ],
        }),
        ...allStaff.map((staff) => {
          const dept = departments.find((d) => d.deptId === staff.deptId);
          return new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph(staff.staffId.toString())],
              }),
              new TableCell({ children: [new Paragraph(staff.name)] }),
              new TableCell({ children: [new Paragraph(staff.email)] }),
              new TableCell({
                children: [new Paragraph(staff.deptId.toString())],
              }),
              new TableCell({
                children: [new Paragraph(dept?.deptName || "N/A")],
              }),
            ],
          });
        }),
      ];

      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({
                text: "Departments and Staff Report",
                heading: "Heading1",
                spacing: { after: 400 },
              }),
              new Paragraph({
                text: `Generated on: ${new Date().toLocaleDateString()}`,
                spacing: { after: 400 },
              }),
              new Paragraph({
                text: "Departments",
                heading: "Heading2",
                spacing: { after: 200 },
              }),
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: deptTableRows,
              }),
              new Paragraph({
                text: "Staff Members",
                heading: "Heading2",
                spacing: { before: 400, after: 200 },
              }),
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: staffTableRows,
              }),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(
        blob,
        `departments_report_${new Date().toISOString().split("T")[0]}.docx`
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
      doc.text("Departments and Staff Report", 105, 15, { align: "center" });

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 22, {
        align: "center",
      });

      let yPosition = 35;

      // Departments table
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Departments", 14, yPosition);
      yPosition += 8;

      const deptData = departments.map((dept) => {
        const deptStaff = allStaff.filter(
          (staff) => staff.deptId === dept.deptId
        );
        return [
          dept.deptId.toString(),
          dept.deptName,
          dept.branchId?.toString() || "N/A",
          dept.college,
          deptStaff.length.toString(),
        ];
      });

      // Use autoTable as a function, not as doc.autoTable
      autoTable(doc, {
        startY: yPosition,
        head: [["Dept ID", "Dept Name", "Branch ID", "College", "Staff Count"]],
        body: deptData,
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
          0: { cellWidth: 20 },
          1: { cellWidth: 45 },
          2: { cellWidth: 25 },
          3: { cellWidth: 30 },
          4: { cellWidth: 25 },
        },
      });

      // Staff table
      const finalY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.text("Staff Members", 14, finalY);

      const staffData = allStaff.map((staff) => {
        const dept = departments.find((d) => d.deptId === staff.deptId);
        return [
          staff.staffId.toString(),
          staff.name,
          staff.email,
          staff.deptId.toString(),
          dept?.deptName || "N/A",
        ];
      });

      autoTable(doc, {
        startY: finalY + 8,
        head: [
          ["Staff ID", "Staff Name", "Email", "Dept ID", "Department Name"],
        ],
        body: staffData,
        theme: "grid",
        headStyles: {
          fillColor: [0, 83, 156],
          textColor: 255,
          fontStyle: "bold",
        },
        styles: {
          fontSize: 7,
          cellPadding: 2,
          halign: "left",
        },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 35 },
          2: { cellWidth: 50 },
          3: { cellWidth: 20 },
          4: { cellWidth: 40 },
        },
      });

      doc.save(
        `departments_report_${new Date().toISOString().split("T")[0]}.pdf`
      );
      toast.success("Exported to PDF successfully!");
      setShowExportDropdown(false);
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Error exporting to PDF");
    }
  };

  // Add Department + Staff
  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Adding department...");

    try {
      // Convert branchId to int or null
      const deptPayload = {
        ...formData,
        branchId: formData.branchId ? parseInt(formData.branchId) : null,
      };

      // 1. Add department
      const deptResponse = await axios.post(
        `${BASE_URL}/add-department`,
        deptPayload
      );

      if (!deptResponse.data.success) {
        toast.error(deptResponse.data.message || "Failed to add department", {
          id: toastId,
        });
        setLoading(false);
        return;
      }

      const deptId = deptResponse.data.data.deptId;

      // 2. Add staff if provided
      if (staffData.name && staffData.email && staffData.password) {
        await axios.post(`${BASE_URL}/add-staff`, { ...staffData, deptId });
      }

      await fetchDepartments();
      setFormData({ deptName: "", branchId: "", college: "ICEM" });
      setStaffData({ name: "", email: "", password: "" });
      setShowAddModal(false);
      toast.success("Department added successfully!", { id: toastId });
    } catch (error) {
      console.error("Add error", error);
      toast.error("Error adding department", { id: toastId });
    }
    setLoading(false);
  };

  // Update Department + Staff
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Updating department...");

    try {
      // 1. Update department
      const deptPayload = {
        deptId: editingDept.deptId,
        college: editingDept.college,
        branchId: editingDept.branchId ? parseInt(editingDept.branchId) : null,
      };

      await axios.put(`${BASE_URL}/update-department`, deptPayload);

      // 2. Update staff if provided
      if (editingDept.staff && editingDept.staff.staffId) {
        const staffPayload = {
          name: editingDept.staff.name,
          email: editingDept.staff.email,
          deptId: editingDept.deptId,
        };

        if (
          editingDept.staff.password &&
          editingDept.staff.password.trim() !== ""
        ) {
          staffPayload.password = editingDept.staff.password;
        }

        await axios.put(
          `${BASE_URL}/update-staff/${editingDept.staff.staffId}`,
          staffPayload
        );
      }

      await fetchDepartments();
      setShowEditModal(false);
      setEditingDept(null);
      toast.success("Department updated successfully!", { id: toastId });
    } catch (error) {
      console.error("Update error", error);
      toast.error("Error updating department", { id: toastId });
    }
    setLoading(false);
  };

  // Delete Department (delete staff first)
  const handleDeleteConfirm = async () => {
    if (!deleteDept) return;
    setLoading(true);
    const toastId = toast.loading("Deleting department...");

    try {
      // Delete department
      await axios.delete(`${BASE_URL}/delete-department/${deleteDept.deptId}`);

      await fetchDepartments();
      setDeleteDept(null);
      toast.success("Department deleted successfully!", { id: toastId });
    } catch (error) {
      console.error("Delete error", error);
      toast.error("Error deleting department", { id: toastId });
    }
    setLoading(false);
  };

  // View staff of department
  const handleViewStaff = async (dept) => {
    const toastId = toast.loading("Fetching staff...");

    try {
      const response = await axios.get(`${BASE_URL}/staff`);
      if (response.data.success) {
        setStaffList(
          response.data.data.filter((s) => s.deptId === dept.deptId)
        );
        toast.success("Staff loaded successfully!", { id: toastId });
      } else {
        toast.error("Failed to fetch staff", { id: toastId });
      }
      setStaffDept(dept);
      setShowStaffModal(true);
    } catch (error) {
      console.error("Fetch staff error:", error);
      toast.error("Error fetching staff", { id: toastId });
    }
  };

  // Filtering
  const filteredDepts = departments.filter(
    (d) =>
      (!search ||
        d.deptName.toLowerCase().includes(search.toLowerCase()) ||
        d.deptId.toString().includes(search)) &&
      (!collegeFilter || d.college === collegeFilter)
  );

  // Pagination
  const totalPages = Math.ceil(filteredDepts.length / itemsPerPage);
  const paginatedDepts = filteredDepts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Add this function after your other handlers
  const refreshStaffList = async () => {
    setRefreshingStaff(true);
    try {
      const response = await axios.get(`${BASE_URL}/staff`);
      if (response.data.success) {
        setStaffList(
          response.data.data.filter((s) => s.deptId === staffDept.deptId)
        );
      }
    } catch (error) {
      console.error("Error refreshing staff:", error);
      toast.error("Error refreshing staff data");
    } finally {
      setRefreshingStaff(false);
    }
  };

  return (
    <div className="space-y-6 text-sm bg-gray-50 min-h-screen">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white py-6 rounded-xl "
      >
        <div>
          <h1 className="text-2xl font-bold text-[#00539C]">Departments</h1>
          <p className="text-gray-600 mt-1 text-sm">
            Manage system departments and staff members
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
              disabled={loading || departments.length === 0}
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
            className="flex items-center gap-2 bg-[#00539C] text-white px-4 py-2.5 rounded-lg hover:bg-[#00539C] disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors duration-200"
          >
            <FiPlus size={16} /> Add Department
          </button>
        </div>
      </motion.header>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 text-sm bg-white py-4 rounded-xl">
        <div className="relative flex-1">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search by ID or Name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm transition-all duration-200 focus:ring-1 border border-gray-300 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm"
          />
        </div>

        <div className="relative">
          <select
            value={collegeFilter}
            onChange={(e) => {
              setCollegeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-8 py-2.5 border border-gray-300 rounded-lg text-sm transition-all duration-200 focus:ring-1 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm appearance-none cursor-pointer"
          >
            <option value="">All Colleges</option>
            {[...new Set(departments.map((d) => d.college))].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        <button
          onClick={fetchDepartments}
          disabled={refreshing || loading}
          className="p-2.5 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:ring-1 border border-gray-300 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm"
        >
          <FiRefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60]">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00539C]"></div>
            <span className="text-sm">Processing...</span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-300 relative">
        <table className="w-full text-left font-semibold">
          <thead className="bg-[#00539C] text-white">
            <tr>
              <th className="px-6 py-4 font-semibold text-sm rounded-tl-xl">
                Dept ID
              </th>
              <th className="px-6 py-4 font-semibold text-sm">Dept Name</th>
              <th className="px-6 py-4 font-semibold text-sm">Branch ID</th>
              <th className="px-6 py-4 font-semibold text-sm">College</th>
              <th className="px-6 py-4 font-semibold text-sm w-20 rounded-tr-xl">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedDepts.map((dept, index) => (
              <tr
                key={dept.deptId}
                className="transition-colors duration-150 rounded-lg"
              >
                <td className="px-6 py-4 text-md font-medium text-gray-900 rounded-l-lg">
                  {dept.deptId}
                </td>
                <td className="px-6 py-4 text-md text-gray-700">
                  {dept.deptName}
                </td>
                <td className="px-6 py-4 text-md text-gray-700">
                  {dept.branchId || 0}
                </td>
                <td className="px-6 py-4 text-md text-gray-700">
                  {dept.college}
                </td>
                <td className="px-6 py-4 text-md relative rounded-r-lg">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown(
                        activeDropdown === dept.deptId ? null : dept.deptId
                      );
                    }}
                    disabled={loading}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
                  >
                    <FiMoreVertical size={18} className="text-gray-600" />
                  </button>

                  {/* Dropdown Menu */}
                  {activeDropdown === dept.deptId && (
                    <div
                      className={`absolute bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50 min-w-[140px] ${
                        // Check if this is one of the last few rows and position dropdown above
                        index >= paginatedDepts.length - 3
                          ? "bottom-full mb-2"
                          : "top-full "
                      } right-5`}
                    >
                      <button
                        onClick={() => {
                          handleViewStaff(dept);
                          setActiveDropdown(null);
                        }}
                        disabled={loading}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2 transition-colors duration-150"
                      >
                        <Users size={14} />
                        View Staff
                      </button>
                      <button
                        onClick={() => {
                          setEditingDept({
                            ...dept,
                            staff: { name: "", email: "", password: "" },
                          });
                          setShowEditModal(true);
                          setActiveDropdown(null);
                        }}
                        disabled={loading}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2 transition-colors duration-150"
                      >
                        <svg
                          className="w-3.5 h-3.5"
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
                          setDeleteDept(dept);
                          setActiveDropdown(null);
                        }}
                        disabled={loading}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 flex items-center gap-2 transition-colors duration-150"
                      >
                        <svg
                          className="w-3.5 h-3.5"
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
            {paginatedDepts.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <Building2 className="h-12 w-12 text-gray-300 mb-2" />
                    <p className="text-sm">No departments found</p>
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
            {/* Header */}
            <div className="bg-[#00539C] px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">
                Add Department & Staff
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                disabled={loading}
                className="text-white disabled:opacity-50 hover:bg-white/10 p-1 rounded-lg transition-colors duration-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAdd} className="p-6 space-y-6">
              {/* Department Details Section */}
              <div className="border border-gray-200 rounded-lg p-5 space-y-4 bg-gray-50">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
                  <Building2 className="h-5 w-5 text-[#00539C]" />
                  Department Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Department Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="deptName"
                      value={formData.deptName}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="w-full p-2.5 rounded-lg text-sm disabled:opacity-50 focus:ring-1 border border-gray-300 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Branch ID
                    </label>
                    <input
                      name="branchId"
                      value={formData.branchId}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full p-2.5 rounded-lg text-sm disabled:opacity-50 focus:ring-1 border border-gray-300 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      College <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="college"
                      value={formData.college}
                      onChange={handleChange}
                      disabled={loading}
                      required
                      className="w-full  p-2.5 rounded-lg text-sm disabled:opacity-50 focus:ring-1 border border-gray-300 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm transition-all duration-200"
                    >
                      {collegeOptions.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Staff Details Section */}
              <div className="border border-gray-200 rounded-lg p-5 space-y-4 bg-gray-50">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
                  <Users className="h-5 w-5 text-[#00539C]" />
                  Staff Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Staff Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="name"
                      value={staffData.name}
                      onChange={handleStaffChange}
                      required
                      disabled={loading}
                      className="w-full  p-2.5 rounded-lg text-sm disabled:opacity-50 focus:ring-1 border border-gray-300 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={staffData.email}
                      onChange={handleStaffChange}
                      required
                      disabled={loading}
                      className="w-full  p-2.5 rounded-lg text-sm disabled:opacity-50 focus:ring-1 border border-gray-300 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={staffData.password}
                      onChange={handleStaffChange}
                      required
                      disabled={loading}
                      className="w-full p-2.5 rounded-lg text-sm disabled:opacity-50 focus:ring-1 border border-gray-300 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
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
                  {loading ? "Adding..." : "Add Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {showEditModal && editingDept && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-[#00539C] px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">
                Edit Department & Staff
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                disabled={loading}
                className="text-white disabled:opacity-50 hover:bg-white/10 p-1 rounded-lg transition-colors duration-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              {/* Department Section */}
              <div className="border border-gray-200 rounded-lg p-5 space-y-4 bg-gray-50">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
                  <Building2 className="h-5 w-5 text-[#00539C]" />
                  Department Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Department ID
                    </label>
                    <input
                      value={editingDept.deptId}
                      disabled
                      className="w-full border border-gray-300 p-2.5 rounded-lg text-sm bg-gray-100 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Department Name
                    </label>
                    <input
                      value={editingDept.deptName}
                      disabled
                      className="w-full border border-gray-300 p-2.5 rounded-lg text-sm bg-gray-100 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Branch ID
                    </label>
                    <input
                      value={editingDept.branchId || ""}
                      onChange={(e) =>
                        setEditingDept((p) => ({
                          ...p,
                          branchId: e.target.value,
                        }))
                      }
                      disabled={loading}
                      className="w-full p-2.5 rounded-lg text-sm disabled:opacity-50 focus:ring-1 border border-gray-300 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      College
                    </label>
                    <select
                      name="college"
                      value={editingDept.college}
                      onChange={(e) =>
                        setEditingDept((p) => ({
                          ...p,
                          college: e.target.value,
                        }))
                      }
                      disabled={loading}
                      className="w-full  p-2.5 rounded-lg text-sm disabled:opacity-50 focus:ring-1 border border-gray-300 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm transition-all duration-200"
                    >
                      {collegeOptions.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Staff Section */}
              <div className="border border-gray-200 rounded-lg p-5 space-y-4 bg-gray-50">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
                  <Users className="h-5 w-5 text-[#00539C]" />
                  Staff Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Name
                    </label>
                    <input
                      name="name"
                      value={editingDept.staff?.name || ""}
                      onChange={(e) =>
                        setEditingDept((p) => ({
                          ...p,
                          staff: { ...p.staff, name: e.target.value },
                        }))
                      }
                      disabled={loading}
                      className="w-full  p-2.5 rounded-lg text-sm disabled:opacity-50 focus:ring-1 border border-gray-300 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={editingDept.staff?.email || ""}
                      onChange={(e) =>
                        setEditingDept((p) => ({
                          ...p,
                          staff: { ...p.staff, email: e.target.value },
                        }))
                      }
                      disabled={loading}
                      className="w-full  p-2.5 rounded-lg text-sm disabled:opacity-50 focus:ring-1 border border-gray-300 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={editingDept.staff?.password || ""}
                      onChange={(e) =>
                        setEditingDept((p) => ({
                          ...p,
                          staff: { ...p.staff, password: e.target.value },
                        }))
                      }
                      disabled={loading}
                      className="w-full  p-2.5 rounded-lg text-sm disabled:opacity-50 focus:ring-1 border border-gray-300 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Dept ID
                    </label>
                    <input
                      value={editingDept.deptId}
                      disabled
                      className="w-full border border-gray-300 p-2.5 rounded-lg text-sm bg-gray-100 text-gray-600"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
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
                  {loading ? "Updating..." : "Update Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Modal */}
      {showStaffModal && staffDept && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-[#00539C] px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">
                Staff of {staffDept.deptName}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={refreshStaffList}
                  disabled={refreshingStaff || loading}
                  className="flex items-center gap-2 text-white px-3 py-1.5 rounded-lg disabled:opacity-50 text-sm font-medium transition-colors duration-200 border border-gray-300"
                >
                  <FiRefreshCw
                    size={18}
                    className={refreshingStaff ? "animate-spin" : ""}
                  />
                </button>
                <button
                  onClick={() => setShowAddStaffModal(true)}
                  disabled={loading}
                  className="flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium transition-colors duration-200"
                >
                  <FiPlus size={14} /> Add Staff
                </button>
                <button
                  onClick={() => setShowStaffModal(false)}
                  disabled={loading}
                  className="text-white disabled:opacity-50 hover:bg-white/10 p-1 rounded-lg transition-colors duration-200"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {staffList.length > 0 ? (
                <div className="space-y-3">
                  {staffList.map((staff, index) => (
                    <div
                      key={staff.staffId}
                      className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-white transition-colors duration-200 relative"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <strong className="text-gray-700">Staff ID:</strong>
                          <p className="text-gray-900">{staff.staffId}</p>
                        </div>
                        <div>
                          <strong className="text-gray-700">Name:</strong>
                          <p className="text-gray-900">{staff.name}</p>
                        </div>
                        <div>
                          <strong className="text-gray-700">Email:</strong>
                          <p className="text-gray-900">{staff.email}</p>
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setStaffDropdown(
                                staffDropdown === staff.staffId
                                  ? null
                                  : staff.staffId
                              );
                            }}
                            disabled={loading}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200 disabled:opacity-50"
                          >
                            <FiMoreVertical
                              size={16}
                              className="text-gray-600"
                            />
                          </button>

                          {/* Staff Action Dropdown */}
                          {staffDropdown === staff.staffId && (
                            <div
                              className={`absolute bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50 min-w-[140px] ${
                                index >= staffList.length - 3
                                  ? "bottom-12"
                                  : "top-12"
                              } right-4`}
                            >
                              <button
                                onClick={() => {
                                  setEditingStaff(staff);
                                  setShowEditStaffModal(true);
                                  setStaffDropdown(null);
                                }}
                                disabled={loading}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2 transition-colors duration-150"
                              >
                                <svg
                                  className="w-3.5 h-3.5"
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
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteStaff(staff);
                                  setStaffDropdown(null);
                                }}
                                disabled={loading}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 flex items-center gap-2 transition-colors duration-150"
                              >
                                <svg
                                  className="w-3.5 h-3.5"
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
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    No staff found for this department
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-[#00539C] px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Add Staff</h2>
              <button
                onClick={() => setShowAddStaffModal(false)}
                disabled={loading}
                className="text-white disabled:opacity-50"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAddStaff} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Name
                </label>
                <input
                  name="name"
                  value={staffData.name}
                  onChange={handleStaffChange}
                  required
                  disabled={loading}
                  className="w-full p-2.5 rounded-lg text-sm focus:ring-1 border border-gray-300 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={staffData.email}
                  onChange={handleStaffChange}
                  required
                  disabled={loading}
                  className="w-full p-2.5 rounded-lg text-sm focus:ring-1 border border-gray-300 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={staffData.password}
                  onChange={handleStaffChange}
                  required
                  disabled={loading}
                  className="w-full  p-2.5 rounded-lg text-sm focus:ring-1 border border-gray-300 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#00539C] text-white rounded-lg hover:bg-[#004085] disabled:opacity-50"
                >
                  {loading ? "Adding..." : "Add Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditStaffModal && editingStaff && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-[#00539C] px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Edit Staff</h2>
              <button
                onClick={() => setShowEditStaffModal(false)}
                disabled={loading}
                className="text-white disabled:opacity-50"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleUpdateStaff} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Name
                </label>
                <input
                  value={editingStaff.name}
                  onChange={(e) =>
                    setEditingStaff({ ...editingStaff, name: e.target.value })
                  }
                  required
                  disabled={loading}
                  className="w-full  p-2.5 rounded-lg text-sm focus:ring-1 border border-gray-300 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={editingStaff.email}
                  onChange={(e) =>
                    setEditingStaff({ ...editingStaff, email: e.target.value })
                  }
                  required
                  disabled={loading}
                  className="w-full p-2.5 rounded-lg text-sm focus:ring-1 border border-gray-300 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={editingStaff.password || ""}
                  onChange={(e) =>
                    setEditingStaff({
                      ...editingStaff,
                      password: e.target.value,
                    })
                  }
                  disabled={loading}
                  className="w-full p-2.5 rounded-lg text-sm focus:ring-1 border border-gray-300 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditStaffModal(false)}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#00539C] text-white rounded-lg hover:bg-[#004085] disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Staff Modal */}
      {deleteStaff && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-red-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">
                Confirm Delete Staff
              </h2>
              <button
                onClick={() => setDeleteStaff(null)}
                disabled={loading}
                className="text-white disabled:opacity-50"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-700">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{deleteStaff.name}</span>?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteStaff(null)}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteStaffConfirm}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteDept && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-[#00539C] px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">
                Confirm Delete
              </h2>
              <button
                onClick={() => setDeleteDept(null)}
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
                  {deleteDept.deptName}
                </span>
                ?
                <br />
                <span className="text-red-500 text-xs">
                  This action cannot be undone and will remove all associated
                  staff members.
                </span>
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteDept(null)}
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
};

export default AddDepartmentForm;
