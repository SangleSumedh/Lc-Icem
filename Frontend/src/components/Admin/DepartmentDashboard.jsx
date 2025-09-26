import React from "react";
import { useParams } from "react-router-dom";
import PendingApprovals from "./PendingApprovals";
function DepartmentDashboard() {
  const { deptKey } = useParams(); // slug from URL
  const deptName = deptKey.replace(/-/g, " "); // convert slug back to readable name

  const commonFetchUrl = "http://localhost:5000/departments/pending-approvals";
  const commonUpdateUrl = "http://localhost:5000/departments/update-status";

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
