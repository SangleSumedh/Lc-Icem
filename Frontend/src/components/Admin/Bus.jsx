import React from "react";
import PendingApprovals from "./PendingApprovals";


function BusDashboard() {
  return (
    <PendingApprovals
      title="Bus Dashboard"
      subtitle="Pending Approvals for Bus Clearance"
      fetchUrl="http://localhost:5000/bus/pending-approvals"
      updateUrl="http://localhost:5000/bus/update-status"
    />
  );
}

export default BusDashboard;
