import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";

const StudentDashboard = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const token = localStorage.getItem("token"); 
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

  // Function to render icon based on status
  const renderStatusIcon = (status) => {
    if (status === "APPROVED")
      return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
    if (status === "REJECTED")
      return <XCircleIcon className="h-6 w-6 text-red-500" />;
    return <ClockIcon className="h-6 w-6 text-yellow-500" />;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">
        LC Form Approval Status
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...approvals].reverse().map((approval) => (
          <div
            key={approval.approvalId}
            className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center justify-center border"
          >
            <div className="mb-3">{renderStatusIcon(approval.status)}</div>
            <h3 className="text-lg font-semibold text-gray-800 text-center">
              {approval.department.deptName}
            </h3>
            <p
              className={`mt-2 font-medium ${
                approval.status === "APPROVED"
                  ? "text-green-600"
                  : approval.status === "REJECTED"
                  ? "text-red-600"
                  : "text-yellow-600"
              }`}
            >
              {approval.status}
            </p>
          </div>
        ))}
      </div>

      {approvals.length === 0 && (
        <div className="text-center py-8 w-full">
          <p className="text-gray-500 text-lg">No approval records found.</p>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
