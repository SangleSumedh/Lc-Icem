import React, { useEffect, useState } from "react";
import { SortAsc } from "lucide-react";
import { XMarkIcon } from "@heroicons/react/24/outline";

function RequestedInfoApprovals() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [remarks, setRemarks] = useState("");

  const token = localStorage.getItem("token");
  const deptName = localStorage.getItem("deptName"); // for header only

  const fetchUrl = "http://localhost:5000/departments/approvals/requested-info";
  const updateUrl = "http://localhost:5000/departments/update-status";

  // ✅ Fetch only REQUESTED_INFO approvals
  const fetchApprovals = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Only Approve action (REQUESTED_INFO -> APPROVED)
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
            {deptName ? `${deptName} Dashboard` : "Department Dashboard"}
          </h2>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Requests for More Info</h2>
          <button
            onClick={fetchApprovals}
            className="flex items-center gap-2 font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-2 px-5 transition"
          >
            <SortAsc size={18} />
            Refresh
          </button>
        </div>

        {loading && <p>Loading approvals...</p>}

        {/* Table */}
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
              {approvals.map((a) => (
                <tr key={a.approvalId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {a.student.studentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {a.student.prn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {a.student.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {a.student.phoneNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
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
            </tbody>
          </table>

          {approvals.length === 0 && !loading && (
            <p className="p-4 text-gray-500">No requests pending for more info</p>
          )}
        </div>

        {/* Modal for Approval Remarks */}
        {selectedApproval && (
          <div className="fixed inset-0 z-50 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-4 py-3 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-white">Approve Request</h2>
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
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                    />
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-4 py-3 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedApproval(null)}
                  className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  className="px-5 py-2 rounded-lg text-white font-medium bg-green-600 hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default RequestedInfoApprovals;
