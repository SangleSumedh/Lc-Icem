import React from "react";
import PendingApprovals from "./PendingApprovals";

function HODDashboard() {
  return (
    <PendingApprovals
      title="HOD Dashboard"
      subtitle="Pending Approvals for Department Clearance"
      fetchUrl="http://localhost:5000/hod/pending-approvals"
      updateUrl="http://localhost:5000/hod/update-status"
    />
  );
}

export default HODDashboard;
