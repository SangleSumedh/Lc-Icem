import React, { useState, useEffect } from "react";
import axios from "axios";
import { CheckCircleIcon, XCircleIcon, ClockIcon } from "@heroicons/react/24/solid";
import {
  BuildingLibraryIcon,
  AcademicCapIcon,
  ComputerDesktopIcon,
  WrenchIcon,
  BuildingOfficeIcon,
  BookOpenIcon,
  UserGroupIcon,
  ChartBarIcon,
  TrophyIcon,
  ClipboardDocumentListIcon,
  HomeIcon,
  TruckIcon,
  CubeIcon,
  CpuChipIcon,
  CodeBracketIcon,
  BanknotesIcon,
  PuzzlePieceIcon,
  BriefcaseIcon,
  BeakerIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";

const StudentDashboard = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      className="size-5 text-gray-500 hover:text-gray-700 transition-colors"
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
    if (department.includes("account")) return <BanknotesIcon className="h-6 w-6 text-blue-600" />;
    if (department.includes("library")) return <BookOpenIcon className="h-6 w-6 text-green-600" />;
    if (department.includes("alumni")) return <UserGroupIcon className="h-6 w-6 text-purple-600" />;
    if (department.includes("placement")) return <BriefcaseIcon className="h-6 w-6 text-indigo-600" />;
    if (department.includes("scholarship")) return <TrophyIcon className="h-6 w-6 text-yellow-600" />;
    if (department.includes("exam")) return <ClipboardDocumentListIcon className="h-6 w-6 text-red-600" />;
    if (department.includes("hostel") || department.includes("mess")) return <HomeIcon className="h-6 w-6 text-gray-600" />;
    if (department.includes("bus") || department.includes("transport")) return <TruckIcon className="h-6 w-6 text-orange-600" />;
    if (department.includes("civil")) return <BuildingOfficeIcon className="h-6 w-6 text-brown-600" />;
    if (department.includes("computer")) return <ComputerDesktopIcon className="h-6 w-6 text-blue-500" />;
    if (department.includes("mechanical")) return <WrenchIcon className="h-6 w-6 text-gray-700" />;
    if (department.includes("ai") || department.includes("data")) return <CpuChipIcon className="h-6 w-6 text-purple-500" />;
    if (department.includes("electronics") || department.includes("telecommunication")) return <CubeIcon className="h-6 w-6 text-green-500" />;
    if (department.includes("first year")) return <AcademicCapIcon className="h-6 w-6 text-indigo-500" />;
    if (department.includes("it")) return <CodeBracketIcon className="h-6 w-6 text-red-500" />;
    if (department.includes("mba")) return <ChartBarIcon className="h-6 w-6 text-green-700" />;
    if (department.includes("mca")) return <PuzzlePieceIcon className="h-6 w-6 text-blue-700" />;
    if (department.includes("m.tech")) return <BeakerIcon className="h-6 w-6 text-orange-500" />;
    if (department.includes("engineering")) return <RocketLaunchIcon className="h-6 w-6 text-teal-600" />;
    return <BuildingLibraryIcon className="h-6 w-6 text-gray-500" />;
  };

  const renderStatusIcon = (status) => {
    if (status === "APPROVED") return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
    if (status === "REJECTED") return <XCircleIcon className="h-4 w-4 text-red-500" />;
    return <ClockIcon className="h-4 w-4 text-yellow-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 p-10 space-y-6 h-full">
      {/* Show Instructions if no approvals or error */}
      {(approvals.length === 0 || error) && (
        <div className="bg-yellow-50 border border-yellow-300 p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-yellow-800">Instructions</h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-2 mt-2">
            <li>Ensure all details are accurate before submission.</li>
            <li>
              Mandatory fields are marked with <span className="text-red-500">*</span>.
            </li>
            <li>The application will be processed within 7 working days.</li>
            <li>Contact the admin office in case of discrepancies.</li>
          </ul>
        </div>
      )}

      {/* Approval Grid */}
      {approvals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3">
          {[...approvals].reverse().map((approval) => (
            <div
              key={approval.approvalId}
              className="bg-white shadow-sm rounded-md p-3 flex flex-col items-center justify-center border border-gray-200 hover:shadow-md hover:bg-blue-50 active:bg-blue-100 transition-transform transform hover:-translate-y-1 active:scale-95 duration-200 min-h-[120px]"
            >
              <div className="absolute top-2 right-2">
                <ChatBubbleIcon />
              </div>
              <div className="mb-2 p-2 bg-gray-50 rounded-full">
                {getDepartmentIcon(approval.department.deptName)}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 text-center mb-1 leading-tight">
                {approval.department.deptName}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                {renderStatusIcon(approval.status)}
                <span
                  className={`text-s font-medium ${
                    approval.status === "APPROVED"
                      ? "text-green-600"
                      : approval.status === "REJECTED"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {approval.status}
                </span>
              </div>
              {approval.remarks && (
                <p className="mt-1 text-[10px] text-gray-500 truncate max-w-full text-center">
                  {approval.remarks}
                </p>
              )}
              {approval.updatedAt && (
                <p className="text-[12px] text-gray-400 mt-1 text-center">
                  Updated at: {new Date(approval.updatedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
