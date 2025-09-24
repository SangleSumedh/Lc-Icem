import React from "react";
import PendingApprovals from "./PendingApprovals";

function AccountsDashboard() {
  return (
    <PendingApprovals
      title="Accounts Dashboard"
      subtitle="Pending Approvals for Fee Clearance"
      fetchUrl="http://localhost:5000/departments/pending-approvals"
      updateUrl="http://localhost:5000/departments/update-status"
    />
  );
}

export default AccountsDashboard;
