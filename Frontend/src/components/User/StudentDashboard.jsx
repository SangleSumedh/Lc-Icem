import React, { useState, useEffect } from "react";
import axios from "axios";
import ApprovalTimeline from "./ApprovalTimeline";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import {
  XMarkIcon,
  PhoneIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import {
  BookOpenIcon,
  UserGroupIcon,
  BriefcaseIcon,
  TrophyIcon,
  ClipboardDocumentListIcon,
  HomeIcon,
  TruckIcon,
  BuildingOfficeIcon,
  ComputerDesktopIcon,
  WrenchIcon,
  CpuChipIcon,
  CubeIcon,
  AcademicCapIcon,
  CodeBracketIcon,
  ChartBarIcon,
  PuzzlePieceIcon,
  BeakerIcon,
  RocketLaunchIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";

const StudentDashboard = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRemarks, setSelectedRemarks] = useState(null);
  const [showRemarksDialog, setShowRemarksDialog] = useState(false);

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/lc-form/approval-status",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setApprovals(response.data.approvals);
      } catch (err) {
        setError("Please submit your LC form first");
      } finally {
        setLoading(false);
      }
    };
    fetchApprovals();
  }, []);

  const ChatBubbleIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="size-5 text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
      />
    </svg>
  );

  const getDepartmentIcon = (deptName) => {
    const department = deptName.toLowerCase();
    if (department.includes("account"))
      return <BanknotesIcon className="h-6 w-6 text-blue-600" />;
    if (department.includes("library"))
      return <BookOpenIcon className="h-6 w-6 text-green-600" />;
    if (department.includes("alumni"))
      return <UserGroupIcon className="h-6 w-6 text-purple-600" />;
    if (department.includes("placement"))
      return <BriefcaseIcon className="h-6 w-6 text-indigo-600" />;
    if (department.includes("scholarship"))
      return <TrophyIcon className="h-6 w-6 text-yellow-600" />;
    if (department.includes("exam"))
      return <ClipboardDocumentListIcon className="h-6 w-6 text-red-600" />;
    if (department.includes("hostel") || department.includes("mess"))
      return <HomeIcon className="h-6 w-6 text-gray-600" />;
    if (department.includes("bus") || department.includes("transport"))
      return <TruckIcon className="h-6 w-6 text-orange-600" />;
    if (department.includes("civil"))
      return <BuildingOfficeIcon className="h-6 w-6 text-brown-600" />;
    if (department.includes("computer"))
      return <ComputerDesktopIcon className="h-6 w-6 text-blue-500" />;
    if (department.includes("mechanical"))
      return <WrenchIcon className="h-6 w-6 text-gray-700" />;
    if (department.includes("ai") || department.includes("data"))
      return <CpuChipIcon className="h-6 w-6 text-purple-500" />;
    if (
      department.includes("electronics") ||
      department.includes("telecommunication")
    )
      return <CubeIcon className="h-6 w-6 text-green-500" />;
    if (department.includes("first year"))
      return <AcademicCapIcon className="h-6 w-6 text-indigo-500" />;
    if (department.includes("it"))
      return <CodeBracketIcon className="h-6 w-6 text-red-500" />;
    if (department.includes("mba"))
      return <ChartBarIcon className="h-6 w-6 text-green-700" />;
    if (department.includes("mca"))
      return <PuzzlePieceIcon className="h-6 w-6 text-blue-700" />;
    if (department.includes("m.tech"))
      return <BeakerIcon className="h-6 w-6 text-orange-500" />;
    if (department.includes("engineering"))
      return <RocketLaunchIcon className="h-6 w-6 text-teal-600" />;
    return <BuildingLibraryIcon className="h-6 w-6 text-gray-500" />;
  };

  const renderStatusIcon = (status) => {
    if (status === "APPROVED")
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    if (status === "REJECTED")
      return <XCircleIcon className="h-5 w-5 text-red-500" />;
    if (status === "REQUESTED_INFO")
      return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
    return <ClockIcon className="h-5 w-5 text-yellow-500" />;
  };

  const getStatusColor = (status) => {
    if (status === "APPROVED") return "text-green-600";
    if (status === "REJECTED") return "text-red-600";
    if (status === "REQUESTED_INFO") return "text-orange-600";
    return "text-yellow-600";
  };

  const getStatusDisplayText = (status) => {
    if (status === "APPROVED") return "Approved";
    if (status === "REJECTED") return "Rejected";
    if (status === "REQUESTED_INFO") return "More Info Needed";
    return "Pending";
  };

  const extractContactInfo = (remarks) => {
  if (!remarks) return { phone: null, email: null, message: remarks };

  const phoneRegex = /(\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})/g;
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

  // Extract phone and email
  const phones = remarks.match(phoneRegex) || [];
  const emails = remarks.match(emailRegex) || [];

  // Remove the "Phone: " and "Email: " labels along with the actual numbers/emails
  let message = remarks
    .replace(/Phone:\s*[^\n]*/gi, '')  // Remove "Phone: xxx" lines
    .replace(/Email:\s*[^\n]*/gi, '')  // Remove "Email: xxx" lines
    .replace(/\n\s*\n/g, '\n')         // Clean up extra newlines
    .trim();

  // If message is empty after removal, provide a default
  if (!message) {
    message = "Additional information required";
  }

  return {
    phone: phones[0] || null,
    email: emails[0] || null,
    message: message,
  };
};

  const handleRemarksClick = (approval) => {
    if (approval.remarks && approval.status === "REQUESTED_INFO") {
      setSelectedRemarks({
        department: approval.department.deptName,
        ...extractContactInfo(approval.remarks),
      });
      setShowRemarksDialog(true);
    }
  };

  const closeRemarksDialog = () => {
    setShowRemarksDialog(false);
    setSelectedRemarks(null);
  };

  // Check if all departments have approved
  const allApproved =
    approvals.length > 0 &&
    approvals.every((approval) => approval.status === "APPROVED");

  // Find LC card (if LC is already generated)
  const lcCard = approvals.find((a) => a.lcUrl);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-yellow-800 mb-3">
            Instructions
          </h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-2">
            <li>Ensure all details are accurate before submission.</li>
            <li>
              Mandatory fields are marked with{" "}
              <span className="text-red-500">*</span>.
            </li>
            <li>The application will be processed within 7 working days.</li>
            <li>Contact the admin office in case of discrepancies.</li>
          </ul>
          <div className="mt-4 p-3 bg-red-50 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const approvalsToRender = [...approvals];

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        LC Form Approval Status
      </h2>

      {/* Approval Timeline Component */}
      <ApprovalTimeline approvals={approvals} />

      {/* LC Generated Card - Show when LC is actually generated */}
      {lcCard && (
        <div className="max-w-md mx-auto bg-green-50 border-2 border-green-300 rounded-lg p-5 flex flex-col items-center shadow-md hover:shadow-lg transition-all">
          <CheckCircleIcon className="h-8 w-8 text-green-600 mb-2" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">
            Your LC is Generated!
          </h3>
          <button
            onClick={() => window.open(lcCard.lcUrl, "_blank")}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Open LC
          </button>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Generated on: {new Date(lcCard.updatedAt).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* LC Being Generated Card - Show when all approved but LC not generated yet */}
      {allApproved && !lcCard && (
        <div className="max-w-md mx-auto bg-blue-50 border-2 border-blue-300 rounded-lg p-5 flex flex-col items-center shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-center mb-2">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">
            Your LC is Being Generated!
          </h3>
          <p className="text-sm text-gray-600 text-center mb-3">
            All departments have approved. Your LC will be available shortly.
          </p>
          <div className="px-4 py-2 bg-blue-500 text-white rounded cursor-not-allowed opacity-75">
            Generating LC...
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Please check back later
          </p>
        </div>
      )}

      {/* Approvals Grid */}
      {approvalsToRender.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          {approvalsToRender.reverse().map((approval) => {
            const hasRemarks =
              approval.remarks && approval.status === "REQUESTED_INFO";
            return (
              <div
                key={approval.approvalId}
                className={`bg-white rounded-lg p-4 flex flex-col items-center justify-center border-2 hover:shadow-lg transition-all duration-200 min-h-[140px] relative group ${
                  hasRemarks
                    ? "border-orange-300 bg-orange-50 hover:bg-orange-100"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {hasRemarks && (
                  <div
                    className="absolute top-3 right-3 cursor-pointer"
                    onClick={() => handleRemarksClick(approval)}
                    title="View remarks"
                  >
                    <ChatBubbleIcon />
                  </div>
                )}

                <div
                  className={`mb-3 p-2 rounded-full ${
                    hasRemarks ? "bg-orange-100" : "bg-gray-100"
                  }`}
                >
                  {getDepartmentIcon(approval.department.deptName)}
                </div>

                <h3 className="text-sm font-semibold text-gray-800 text-center mb-2 leading-tight">
                  {approval.department.deptName}
                </h3>

                <div className="flex items-center gap-2 mt-1">
                  {renderStatusIcon(approval.status)}
                  <span
                    className={`text-sm font-medium ${getStatusColor(
                      approval.status
                    )}`}
                  >
                    {getStatusDisplayText(approval.status)}
                  </span>
                </div>

                {hasRemarks && (
                  <div className="mt-2 text-center">
                    <p className="text-xs text-orange-600 font-medium">
                      Click icon for details
                    </p>
                  </div>
                )}

                {approval.updatedAt && (
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    {new Date(approval.updatedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Remarks Dialog */}
      {showRemarksDialog && selectedRemarks && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/30 bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 rounded-t-xl flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                {selectedRemarks.department} - Remarks
              </h3>
              <button
                onClick={closeRemarksDialog}
                className="text-white hover:text-orange-200 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {selectedRemarks.message}
                </p>
              </div>

              {(selectedRemarks.phone || selectedRemarks.email) && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Contact Information:
                  </h4>
                  {selectedRemarks.phone && (
                    <div className="flex items-center gap-3 mb-2">
                      <PhoneIcon className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <a
                          href={`tel:${selectedRemarks.phone}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {selectedRemarks.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {selectedRemarks.email && (
                    <div className="flex items-center gap-3">
                      <EnvelopeIcon className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <a
                          href={`mailto:${selectedRemarks.email}`}
                          className="text-blue-600 hover:text-blue-800 font-medium break-all"
                        >
                          {selectedRemarks.email}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button
                  onClick={closeRemarksDialog}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;