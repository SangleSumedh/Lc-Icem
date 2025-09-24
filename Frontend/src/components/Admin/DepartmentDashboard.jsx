// Admin/DepartmentDashboard.jsx
import React from "react";
import PendingApprovals from "./PendingApprovals";
import { useParams } from "react-router-dom";

function DepartmentDashboard() {
  const { deptKey } = useParams(); // dynamic slug e.g. "account", "library", "hod-computer-science"

  // ✅ All departments now use the same endpoints
  const commonFetchUrl = "http://localhost:5000/departments/pending-approvals";
  const commonUpdateUrl = "http://localhost:5000/departments/update-status";

  // Map deptKey to UI titles only
  const deptConfigs = {
    account: {
      title: "Accounts Dashboard",
      subtitle: "Pending Approvals for Fee Clearance",
    },
    library: {
      title: "Library Dashboard",
      subtitle: "Pending Approvals for Library Clearance",
    },
    hostel: {
      title: "Hostel Dashboard",
      subtitle: "Pending Approvals for Hostel Clearance",
    },
    alumni: {
      title: "Alumni Coordinator Dashboard",
      subtitle: "Pending Approvals for Alumni Section",
    },
    placement: {
      title: "Central Placement Department",
      subtitle: "Pending Approvals for Placement Clearance",
    },
    "department-placement": {
      title: "Department Placement Coordinator",
      subtitle: "Pending Approvals for Department Placement",
    },
    scholarship: {
      title: "Scholarship Dashboard",
      subtitle: "Pending Approvals for Scholarship Clearance",
    },
    exam: {
      title: "Exam Section",
      subtitle: "Pending Approvals for Exam Section Clearance",
    },
    bus: {
      title: "Bus Dashboard",
      subtitle: "Pending Approvals for Bus Clearance",
    },
  };

  // ✅ Handle all HODs dynamically
  if (deptKey.startsWith("hod-")) {
    deptConfigs[deptKey] = {
      title: `HOD Dashboard (${deptKey
        .replace("hod-", "")
        .replace(/-/g, " ")})`,
      subtitle: "Pending Approvals for Department Clearance",
    };
  }

  const config = deptConfigs[deptKey];

  if (!config) {
    return (
      <main className="flex-1 w-auto mx-auto px-6 lg:px-10 py-4">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-red-600">
            Invalid Department
          </h2>
          <p>No configuration found for "{deptKey}"</p>
        </div>
      </main>
    );
  }

  return (
    <PendingApprovals
      title={config.title}
      subtitle={config.subtitle}
      fetchUrl={commonFetchUrl}   // ✅ always common
      updateUrl={commonUpdateUrl} // ✅ always common
    />
  );
}

export default DepartmentDashboard;
