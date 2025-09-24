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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 p-4 rounded-lg max-w-md w-full">
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
      <h2 className="text-2xl font-bold mb-6 text-center md:text-left">
        LC Form Approval Status
      </h2>

      <div className="flex flex-col items-center">
        <div className="w-full max-w-2xl">
          <div className="relative">
            {/* Vertical Timeline Line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-500 transform -translate-x-1/2"></div>

            {[...approvals].reverse().map((approval) => (
              <div
                key={approval.approvalId}
                className="relative flex items-start mb-8"
              >
                {/* Timeline Dot */}
                <div className="absolute left-4 w-3 h-3 bg-blue-500 rounded-full transform -translate-x-1/2 z-10"></div>

                {/* Card */}
                <div className="ml-10 bg-white rounded-lg shadow-md p-4 border border-gray-200 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 sm:mb-0">
                      {approval.department.deptName}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium w-fit
                        ${
                          approval.status === "APPROVED"
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
                    <p className="text-xs text-gray-500 mt-3">
                      Last updated:{" "}
                      {new Date(approval.updatedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* No Approvals Message */}
        {approvals.length === 0 && (
          <div className="text-center py-8 w-full">
            <p className="text-gray-500 text-lg">No approval records found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
