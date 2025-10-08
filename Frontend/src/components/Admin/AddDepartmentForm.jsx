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
} from "docx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import ENV from "../../env.js";
import useDepartmentStore from "../../store/departmentStore.js";

const AddDepartmentForm = () => {
  const token = localStorage.getItem("token");

  const {
    departments,
    allStaff,
    loadingStates,
    fetchDepartments,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    addStaff,
    updateStaff,
    deleteStaff,
    getStaffByDepartment,
    shouldFetchInitially,
  } = useDepartmentStore();

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      axios.defaults.headers.common["Content-Type"] = "application/json";
    }
  }, [token]);

  const [search, setSearch] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("");
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deleteDept, setDeleteDept] = useState(null);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffDept, setStaffDept] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Staff management states - RENAMED to avoid conflict
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showEditStaffModal, setShowEditStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [staffToDelete, setStaffToDelete] = useState(null); // CHANGED: Renamed from deleteStaff

  const [staffDropdown, setStaffDropdown] = useState(null);
  const [refreshingStaff, setRefreshingStaff] = useState(false);

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

  // Fetch departments on component mount
  useEffect(() => {
    if (token && shouldFetchInitially()) {
      fetchDepartmentsData();
    }
  }, [token, shouldFetchInitially]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
      setShowExportDropdown(false);
      setStaffDropdown(null);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Update staff list when staffDept changes
  useEffect(() => {
    if (staffDept && showStaffModal) {
      refreshStaffList();
    }
  }, [staffDept, showStaffModal, allStaff]);

  const fetchDepartmentsData = async (forceRefresh = false) => {
    try {
      await fetchDepartments(token, forceRefresh);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  // Handle field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStaffChange = (e) => {
    const { name, value } = e.target;
    setStaffData((prev) => ({ ...prev, [name]: value }));
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
    const toastId = toast.loading("Adding department...");

    try {
      await addDepartment(token, formData, staffData);
      setFormData({ deptName: "", branchId: "", college: "ICEM" });
      setStaffData({ name: "", email: "", password: "" });
      setShowAddModal(false);
      toast.success("Department added successfully!", { id: toastId });
    } catch (error) {
      toast.error("Error adding department", { id: toastId });
    }
  };

  // Update Department
  const handleUpdate = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Updating department...");

    try {
      await updateDepartment(token, editingDept);
      setShowEditModal(false);
      setEditingDept(null);
      toast.success("Department updated successfully!", { id: toastId });
    } catch (error) {
      toast.error("Error updating department", { id: toastId });
    }
  };

  // Delete Department
  const handleDeleteConfirm = async () => {
    if (!deleteDept) return;
    const toastId = toast.loading("Deleting department...");

    try {
      await deleteDepartment(token, deleteDept.deptId);
      setDeleteDept(null);
      toast.success("Department deleted successfully!", { id: toastId });
    } catch (error) {
      toast.error("Error deleting department", { id: toastId });
    }
  };

  // View staff of department
  const handleViewStaff = (dept) => {
    setStaffDept(dept);
    setShowStaffModal(true);
  };

  // Add Staff Handler
  const handleAddStaff = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Adding staff...");

    try {
      await addStaff(token, { ...staffData, deptId: staffDept.deptId });
      setStaffData({ name: "", email: "", password: "" });
      setShowAddStaffModal(false);
      toast.success("Staff added successfully!", { id: toastId });
    } catch (error) {
      toast.error("Error adding staff", { id: toastId });
    }
  };

  // Update Staff Handler
  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Updating staff...");

    try {
      await updateStaff(token, editingStaff.staffId, {
        ...editingStaff,
        deptId: staffDept.deptId,
      });
      setShowEditStaffModal(false);
      setEditingStaff(null);
      toast.success("Staff updated successfully!", { id: toastId });
    } catch (error) {
      toast.error("Error updating staff", { id: toastId });
    }
  };

  // Delete Staff Handler - UPDATED to use staffToDelete
  const handleDeleteStaffConfirm = async () => {
    if (!staffToDelete) return;
    const toastId = toast.loading("Deleting staff...");

    try {
      await deleteStaff(token, staffToDelete.staffId);
      setStaffToDelete(null);
      toast.success("Staff deleted successfully!", { id: toastId });
    } catch (error) {
      toast.error("Error deleting staff", { id: toastId });
    }
  };

  // Refresh staff list
  const refreshStaffList = () => {
    setRefreshingStaff(true);
    try {
      const staffForDept = getStaffByDepartment(staffDept.deptId);
      setStaffList(staffForDept);
    } catch (error) {
      console.error("Error refreshing staff:", error);
      toast.error("Error refreshing staff data");
    } finally {
      setRefreshingStaff(false);
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
              disabled={loadingStates.operations || departments.length === 0}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors duration-200"
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
                  <span className="text-emerald-600 font-medium">Excel</span>
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
                  <span className="text-rose-600 font-medium">PDF</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            disabled={loadingStates.operations}
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
          onClick={fetchDepartmentsData}
          disabled={loadingStates.departments || loadingStates.operations}
          className="p-2.5 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:ring-1 border border-gray-300 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm"
        >
          <FiRefreshCw
            size={16}
            className={loadingStates.departments ? "animate-spin" : ""}
          />
        </button>
      </div>

      {loadingStates.departments ||
        (loadingStates.operations && (
          // ✅ Skeleton Loader
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow p-4 space-y-3 border border-gray-200"
              >
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                <div className="h-10 bg-gray-300 rounded mt-3"></div>
              </div>
            ))}
          </div>
        ))}

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
                    disabled={loadingStates.operations}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
                  >
                    <FiMoreVertical size={18} className="text-gray-600" />
                  </button>

                  {/* Dropdown Menu */}
                  {activeDropdown === dept.deptId && (
                    <div
                      className={`absolute bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50 min-w-[140px] ${
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
                        disabled={loadingStates.operations}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2 transition-colors duration-150"
                      >
                        <Users size={14} />
                        View Staff
                      </button>
                      <button
                        onClick={() => {
                          setEditingDept(dept);
                          setShowEditModal(true);
                          setActiveDropdown(null);
                        }}
                        disabled={loadingStates.operations}
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
                        disabled={loadingStates.operations}
                        className="w-full px-4 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50 disabled:opacity-50 flex items-center gap-2 transition-colors duration-150"
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
            disabled={currentPage === 1 || loadingStates.operations}
            className="px-4 py-2 h-9 flex items-center justify-center border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors duration-200"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              disabled={loadingStates.operations}
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
            disabled={currentPage === totalPages || loadingStates.operations}
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
                disabled={loadingStates.operations}
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
                      Department Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      name="deptName"
                      value={formData.deptName}
                      onChange={handleChange}
                      required
                      disabled={loadingStates.operations}
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
                      disabled={loadingStates.operations}
                      className="w-full p-2.5 rounded-lg text-sm disabled:opacity-50 focus:ring-1 border border-gray-300 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      College <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="college"
                      value={formData.college}
                      onChange={handleChange}
                      disabled={loadingStates.operations}
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
                      Staff Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      name="name"
                      value={staffData.name}
                      onChange={handleStaffChange}
                      required
                      disabled={loadingStates.operations}
                      className="w-full  p-2.5 rounded-lg text-sm disabled:opacity-50 focus:ring-1 border border-gray-300 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={staffData.email}
                      onChange={handleStaffChange}
                      required
                      disabled={loadingStates.operations}
                      className="w-full  p-2.5 rounded-lg text-sm disabled:opacity-50 focus:ring-1 border border-gray-300 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={staffData.password}
                      onChange={handleStaffChange}
                      required
                      disabled={loadingStates.operations}
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
                  disabled={loadingStates.operations}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingStates.operations}
                  className="px-5 py-2.5 bg-[#00539C] text-white rounded-lg hover:bg-[#004085] disabled:opacity-50 transition-colors duration-200 text-sm font-medium"
                >
                  {loadingStates.operations ? "Adding..." : "Add Department"}
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
                Edit Department
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                disabled={loadingStates.operations}
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
                        setEditingDept((prev) => ({
                          ...prev,
                          branchId: e.target.value,
                        }))
                      }
                      disabled={loadingStates.operations}
                      className="w-full p-2.5 rounded-lg text-sm disabled:opacity-50 focus:ring-1 border border-gray-300 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      College
                    </label>
                    <select
                      value={editingDept.college}
                      onChange={(e) =>
                        setEditingDept((prev) => ({
                          ...prev,
                          college: e.target.value,
                        }))
                      }
                      disabled={loadingStates.operations}
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

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={loadingStates.operations}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingStates.operations}
                  className="px-5 py-2.5 bg-[#00539C] text-white rounded-lg hover:bg-[#004085] disabled:opacity-50 transition-colors duration-200 text-sm font-medium"
                >
                  {loadingStates.operations
                    ? "Updating..."
                    : "Update Department"}
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
                  disabled={refreshingStaff || loadingStates.operations}
                  className="flex items-center gap-2 text-white px-3 py-1.5 rounded-lg disabled:opacity-50 text-sm font-medium transition-colors duration-200 border border-gray-300"
                >
                  <FiRefreshCw
                    size={18}
                    className={refreshingStaff ? "animate-spin" : ""}
                  />
                </button>
                <button
                  onClick={() => setShowAddStaffModal(true)}
                  disabled={loadingStates.operations}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50 text-sm font-medium transition-colors duration-200"
                >
                  <FiPlus size={14} /> Add Staff
                </button>
                <button
                  onClick={() => setShowStaffModal(false)}
                  disabled={loadingStates.operations}
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
                            disabled={loadingStates.operations}
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
                                disabled={loadingStates.operations}
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
                                  setStaffToDelete(staff); // UPDATED: Changed from setDeleteStaffState
                                  setStaffDropdown(null);
                                }}
                                disabled={loadingStates.operations}
                                className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 disabled:opacity-50 flex items-center gap-2 transition-colors duration-150"
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
                disabled={loadingStates.operations}
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
                  disabled={loadingStates.operations}
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
                  disabled={loadingStates.operations}
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
                  disabled={loadingStates.operations}
                  className="w-full  p-2.5 rounded-lg text-sm focus:ring-1 border border-gray-300 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  disabled={loadingStates.operations}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingStates.operations}
                  className="px-4 py-2 bg-[#00539C] text-white rounded-lg hover:bg-[#004085] disabled:opacity-50"
                >
                  {loadingStates.operations ? "Adding..." : "Add Staff"}
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
                disabled={loadingStates.operations}
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
                  disabled={loadingStates.operations}
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
                  disabled={loadingStates.operations}
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
                  disabled={loadingStates.operations}
                  className="w-full p-2.5 rounded-lg text-sm focus:ring-1 border border-gray-300 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditStaffModal(false)}
                  disabled={loadingStates.operations}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingStates.operations}
                  className="px-4 py-2 bg-[#00539C] text-white rounded-lg hover:bg-[#004085] disabled:opacity-50"
                >
                  {loadingStates.operations ? "Updating..." : "Update Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Staff Modal - UPDATED to use staffToDelete */}
      {staffToDelete && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-rose-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">
                Confirm Delete Staff
              </h2>
              <button
                onClick={() => setStaffToDelete(null)}
                disabled={loadingStates.operations}
                className="text-white disabled:opacity-50"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-700">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{staffToDelete.name}</span>?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setStaffToDelete(null)}
                  disabled={loadingStates.operations}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteStaffConfirm}
                  disabled={loadingStates.operations}
                  className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50"
                >
                  {loadingStates.operations ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Department Modal */}
      {deleteDept && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-[#00539C] px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">
                Confirm Delete
              </h2>
              <button
                onClick={() => setDeleteDept(null)}
                disabled={loadingStates.operations}
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
                <span className="text-rose-500 text-xs">
                  This action cannot be undone and will remove all associated
                  staff members.
                </span>
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteDept(null)}
                  disabled={loadingStates.operations}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={loadingStates.operations}
                  className="px-5 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 transition-colors duration-200 text-sm font-medium"
                >
                  {loadingStates.operations ? "Deleting..." : "Delete"}
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
