// components/Common/PendingApprovals.jsx
import React, { useEffect, useState } from "react";
import { SortAsc, Edit } from "lucide-react";

function PendingApprovals({ title, subtitle, fetchUrl, updateUrl }) {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [status, setStatus] = useState("");
  const [remarks, setRemarks] = useState("");

  const token = localStorage.getItem("token");

  // Fetch pending approvals
  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const res = await fetch(fetchUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 404) {
        setApprovals([]);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        console.error("Failed response:", res.status);
        setApprovals([]);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setApprovals(data.pendingApprovals || []);
    } catch (err) {
      console.error("Error fetching approvals:", err);
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  // Handle update approval status
  const handleUpdateStatus = async () => {
    if (!status) {
      alert("Please select a status");
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
          approvalId: selectedApproval.approvalId,
          status,
          remarks,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Approval updated successfully");
        setSelectedApproval(null);
        setStatus("");
        setRemarks("");
        fetchApprovals();
      } else {
        alert(data.error || "❌ Failed to update approval");
      }
    } catch (err) {
      console.error("Error updating approval:", err);
      alert("❌ Error updating approval");
    }
  };

  return (
    <main className="flex-1 w-auto mx-auto px-6 lg:px-10 py-4">
      <div className="bg-white rounded-xl min-h-[90vh] w-full shadow-xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{subtitle}</h2>
          <button
            onClick={fetchApprovals}
            className="flex items-center gap-2 font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-2 px-4 transition"
          >
            <SortAsc size={18} />
            Refresh
          </button>
        </div>

        {loading && <p>Loading approvals...</p>}

        {/* Students Table */}
        <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100/80">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">PRN</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {approvals.map((a) => (
                <tr key={a.approvalId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{a.student.studentName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{a.student.prn}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{a.student.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{a.student.phoneNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button
                      className="p-2 rounded-lg text-blue-600 hover:bg-blue-200 transition"
                      onClick={() => setSelectedApproval(a)}
                    >
                      <Edit size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {approvals.length === 0 && !loading && (
            <p className="p-4 text-gray-500">No pending approvals</p>
          )}
        </div>

        {/* Modal for Update */}
        {selectedApproval && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">Update Approval</h3>
              <p className="mb-2">
                Student: <span className="font-medium">{selectedApproval.student.studentName}</span>
              </p>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border rounded p-2 mb-3"
              >
                <option value="">Select Status</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>

              <textarea
                placeholder="Remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full border rounded p-2 mb-3"
              />

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedApproval(null)}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStatus}
                  className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default PendingApprovals;
