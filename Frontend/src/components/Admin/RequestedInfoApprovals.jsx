import React, { useEffect, useState } from "react";
import { FiSearch, FiRefreshCw } from "react-icons/fi";
import { motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";

function RequestedInfoApprovals() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [remarks, setRemarks] = useState("");

  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const token = localStorage.getItem("token");
  const deptName = localStorage.getItem("deptName");

  const fetchUrl = "http://localhost:5000/departments/approvals/requested-info";
  const updateUrl = "http://localhost:5000/departments/update-status";

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
    <div className="space-y-6 text-sm">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-lg font-bold text-gray-900">
            {deptName ? `${deptName} Dashboard` : "Department Dashboard"}
          </h1>
          <p className="text-gray-500 mt-1 text-xs">
            Requests for More Info
          </p>
        </div>
      </motion.header>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 text-xs">
        <div className="relative flex-1">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={14}
          />
          <input
            type="text"
            placeholder="Search by Name, Email, or PRN..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-4 py-1.5 border rounded-md text-xs focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          onClick={fetchApprovals}
          disabled={refreshing}
          className="p-1.5 border rounded-md hover:bg-gray-50"
        >
          <FiRefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto text-xs">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-2">Student Name</th>
              <th className="px-4 py-2">PRN</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedApprovals.map((a) => (
              <tr key={a.approvalId} className="hover:bg-gray-50">
                <td className="px-4 py-2">{a.student.studentName}</td>
                <td className="px-4 py-2">{a.student.prn}</td>
                <td className="px-4 py-2">{a.student.email}</td>
                <td className="px-4 py-2">{a.student.phoneNo}</td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button
                    className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                    onClick={() => {
                      setSelectedApproval(a);
                      setRemarks("");
                    }}
                  >
                    Approve
                  </button>
                </td>
              </tr>
            ))}
            {paginatedApprovals.length === 0 && !loading && (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-4 text-center text-gray-500"
                >
                  No requests pending for more info
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6 text-sm">
          {/* Prev button */}
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-6 h-8 flex items-center justify-center border rounded-full disabled:opacity-50 hover:bg-gray-100"
          >
            Prev
          </button>

          {/* Page number buttons */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 flex items-center justify-center border rounded-full text-xs ${
                currentPage === page
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ))}

          {/* Next button */}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-6 h-8 flex items-center justify-center border rounded-full disabled:opacity-50 hover:bg-gray-100"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {selectedApproval && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">
                Approve Request
              </h2>
              <button
                onClick={() => setSelectedApproval(null)}
                className="text-white hover:text-gray-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                Student:{" "}
                <span className="font-medium">
                  {selectedApproval.student.studentName}
                </span>
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter remarks"
                  rows={3}
                  className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3">
              <button
                onClick={() => setSelectedApproval(null)}
                className="px-4 py-2 border rounded-md text-sm hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RequestedInfoApprovals;
