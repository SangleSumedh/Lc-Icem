import React from "react";
import PendingApprovals from "./PendingApprovals";

function LibraryDashboard() {
  return (
    <PendingApprovals
      title="Library Dashboard"
      subtitle="Pending Approvals for Library Clearance"
      fetchUrl="http://localhost:5000/library/pending-approvals"
      updateUrl="http://localhost:5000/library/update-status"
    />
  );
}

export default LibraryDashboard;
