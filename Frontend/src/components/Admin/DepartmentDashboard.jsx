import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PendingApprovals from "./PendingApprovals";

// ✅ Reverse slug back into readable deptName (fallback only)
const deslugify = (slug) =>
  slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
import RegistrarPendingLCs from "./RegistrarPendingLCs";

function DepartmentDashboard() {
  const { deptKey } = useParams();
  const [deptName, setDeptName] = useState("");

  const commonFetchUrl = "http://localhost:5000/departments/pending-approvals";
  const commonUpdateUrl = "http://localhost:5000/departments/update-status";

  useEffect(() => {
    // Prefer real deptName from localStorage
    const stored = localStorage.getItem("deptName");
    if (stored) {
      setDeptName(stored);
    } else {
      // fallback: deslugify
      setDeptName(deslugify(deptKey));
    }
  }, [deptKey]);
  
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
