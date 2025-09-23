import React, { useState, useEffect } from "react";
import axios from "axios";

const StudentDashboard = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const token = localStorage.getItem("token"); // Get token from localStorage
        const response = await axios.get(
          "http://localhost:5000/lc-form/status",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setApprovals(response.data.approvals);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch approvals");
        setLoading(false);
      }
    };

    fetchApprovals();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-600">{error}</p>
          <p className="mt-2 text-sm text-red-500">
            Please submit your LC form first
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">LC Form Approval Status</h2>

      <div className="grid grid-cols-3 gap-12 relative">
        {[...approvals].reverse().map((approval, index) => (
          <div
            key={approval.approvalId}
            className="relative"
          >
            {/* Approval Card */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 w-80">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {approval.department.deptName}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium
                    ${approval.status === "APPROVED"
                      ? "bg-green-100 text-green-800"
                      : approval.status === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                >
                  {approval.status}
                </span>
              </div>

              <div className="text-sm text-gray-600">
                {approval.remarks && (
                  <div className="mt-2">
                    <p className="font-medium">Remarks:</p>
                    <p className="text-gray-700">{approval.remarks}</p>
                  </div>
                )}
              </div>

              {approval.updatedAt && (
                <p className="text-xs text-gray-500 mt-4">
                  Last updated:{" "}
                  {new Date(approval.updatedAt).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Connecting Lines */}
            {index < approvals.length - 1 && (
              <>
                {/* Right side line for first two cards in each row */}
                {(index + 1) % 3 !== 0 && (
                  <div className="absolute top-1/2 -right-8 w-10 h-1 bg-blue-500"></div>
                )}
                {/* Bottom line for third card */}
                {(index + 1) % 3 === 0 && index < approvals.length - 3 && (
                  <div className="absolute left-1/2 -bottom-8 h-10 w-1 bg-blue-500"></div>
                )}
                {/* Left side line after bottom connection */}
                {(index + 1) % 3 === 0 && index < approvals.length - 3 && (
                  <div className="absolute -bottom-8 -left-8 w-[calc(100%+4rem)] h-1 bg-blue-500"></div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentDashboard;
