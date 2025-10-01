import React from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import {
  BanknotesIcon,
  BookOpenIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  BriefcaseIcon,
  TrophyIcon,
  ClipboardDocumentListIcon,
  HomeIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

const ApprovalTimeline = ({ approvals }) => {
  // Define all departments in the required order
  const allDepartments = [
    {
      id: "accounts",
      name: "Accounts",
      icon: <BanknotesIcon className="h-5 w-5" />,
    },
    {
      id: "library",
      name: "Library",
      icon: <BookOpenIcon className="h-5 w-5" />,
    },
    {
      id: "hod",
      name: "HOD",
      icon: <BuildingOfficeIcon className="h-5 w-5" />,
    },
    {
      id: "alumni",
      name: "Alumni",
      icon: <UserGroupIcon className="h-5 w-5" />,
    },
    {
      id: "central_placement",
      name: "Central Placement Dept",
      icon: <BriefcaseIcon className="h-5 w-5" />,
    },
    {
      id: "dept_placement",
      name: "Department Placement Dept",
      icon: <BriefcaseIcon className="h-5 w-5" />,
    },
    {
      id: "scholarship",
      name: "Scholarship",
      icon: <TrophyIcon className="h-5 w-5" />,
    },
    {
      id: "exam_section",
      name: "Exam Section",
      icon: <ClipboardDocumentListIcon className="h-5 w-5" />,
    },
    {
      id: "hostel_mess",
      name: "Hostel Mess",
      icon: <HomeIcon className="h-5 w-5" />,
    },
    {
      id: "bus_transport",
      name: "Bus Transport",
      icon: <TruckIcon className="h-5 w-5" />,
    },
  ];

  // Create department status array with all departments
  const departmentStatuses = allDepartments.map((dept) => {
    const approval = approvals.find(
      (app) =>
        app.department.deptName.toLowerCase().includes(dept.id.toLowerCase()) ||
        dept.name.toLowerCase().includes(app.department.deptName.toLowerCase())
    );

    return {
      ...dept,
      status: approval ? approval.status : "PENDING",
      approvalData: approval || null,
    };
  });

  // Sort departments: Approved first, then Requested Info, then Rejected, then Pending
  const sortedDepartmentStatuses = [...departmentStatuses].sort((a, b) => {
    const statusOrder = {
      APPROVED: 1,
      REQUESTED_INFO: 2,
      REJECTED: 3,
      PENDING: 4,
    };

    return statusOrder[a.status] - statusOrder[b.status];
  });

  const getStatusDisplayText = (status) => {
    if (status === "APPROVED") return "Approved";
    if (status === "REJECTED") return "Rejected";
    if (status === "REQUESTED_INFO") return "More Info Needed";
    return "Pending";
  };

  const approvedCount = departmentStatuses.filter(
    (dept) => dept.status === "APPROVED"
  ).length;
  const totalCount = departmentStatuses.length;
  const progressPercentage = (approvedCount / totalCount) * 100;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-500 shadow-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
        Approval Progress
      </h3>

      {/* Progress Timeline */}
      <div className="relative ">
        {/* Background progress line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200"></div>

        {/* Filled progress line */}
        <div
          className="absolute top-5 h-1 bg-green-500 transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        ></div>

        {/* Department dots - using sorted array */}
        <div className="relative flex justify-between">
          {sortedDepartmentStatuses.map((dept, index) => (
            <div key={dept.id} className="flex flex-col items-center z-10">
              <div
                className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  dept.status === "APPROVED"
                    ? "bg-green-500 border-green-600 text-white"
                    : dept.status === "REJECTED"
                    ? "bg-red-500 border-red-600 text-white"
                    : dept.status === "REQUESTED_INFO"
                    ? "bg-orange-500 border-orange-600 text-white"
                    : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                {dept.status === "APPROVED" ? (
                  <CheckCircleIcon className="h-6 w-6" />
                ) : dept.status === "REJECTED" ? (
                  <XCircleIcon className="h-6 w-6" />
                ) : dept.status === "REQUESTED_INFO" ? (
                  <ExclamationTriangleIcon className="h-6 w-6" />
                ) : (
                  <ClockIcon className="h-5 w-5" />
                )}
              </div>
              <div className="mt-2 text-center max-w-[100px]">
                <p className="text-xs font-medium text-gray-700 leading-tight">
                  {dept.name}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    dept.status === "APPROVED"
                      ? "text-green-600"
                      : dept.status === "REJECTED"
                      ? "text-red-600"
                      : dept.status === "REQUESTED_INFO"
                      ? "text-orange-600"
                      : "text-gray-500"
                  }`}
                >
                  {getStatusDisplayText(dept.status)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Summary */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Progress: {approvedCount} of {totalCount} departments approved
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div
            className="bg-green-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Status Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-600">Approved ({approvedCount})</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span className="text-gray-600">Info Needed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-gray-600">Rejected</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          <span className="text-gray-600">Pending</span>
        </div>
      </div>
    </div>
  );
};

export default ApprovalTimeline;
