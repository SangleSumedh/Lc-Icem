import React from "react";
import { useParams } from "react-router-dom";
import PendingApprovals from "./PendingApprovals";
import RegistrarPendingLCs from "./RegistrarPendingLCs";

function DepartmentDashboard() {
  const { deptKey } = useParams(); // slug from URL
  const deptName = deptKey.replace(/-/g, " "); // convert slug back to readable name

  const commonFetchUrl = "http://localhost:5000/departments/pending-approvals";
  const commonUpdateUrl = "http://localhost:5000/departments/update-status";

  // ✅ If dept is registrar, load RegistrarPendingLCs
  if (deptName.toLowerCase() === "registrar") {
    return (
      <RegistrarPendingLCs />
    );
  }

  // ✅ Otherwise load normal PendingApprovals
  return (
    <PendingApprovals
      title={`${deptName} Dashboard`}
      subtitle={`Pending Approvals for ${deptName}`}
      fetchUrl={commonFetchUrl}
      updateUrl={commonUpdateUrl}
    />
  );
}

export default DepartmentDashboard;
