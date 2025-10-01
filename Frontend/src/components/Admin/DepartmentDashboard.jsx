import React, { useEffect, useState, lazy, Suspense } from "react";
import { useParams } from "react-router-dom";

// ✅ Reverse slug back into readable deptName (fallback only)
const deslugify = (slug) =>
  slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// ✅ Lazy load components to prevent unnecessary imports and API calls
const PendingApprovals = lazy(() => import("./PendingApprovals"));
const RegistrarPendingLCs = lazy(() => import("./RegistrarPendingLCs"));

function DepartmentDashboard() {
  const { deptKey } = useParams();
  const [deptName, setDeptName] = useState("");
  const [isRegistrar, setIsRegistrar] = useState(false);

  useEffect(() => {
    // Prefer real deptName from localStorage
    const stored = localStorage.getItem("deptName");
    if (stored) {
      setDeptName(stored);
      setIsRegistrar(stored.toLowerCase() === "registrar");
    } else {
      // fallback: deslugify
      const name = deslugify(deptKey);
      setDeptName(name);
      setIsRegistrar(name.toLowerCase() === "registrar");
    }
  }, [deptKey]);

  // Common URLs - only used for non-registrar departments
  const commonFetchUrl = "http://localhost:5000/departments/pending-approvals";
  const commonUpdateUrl = "http://localhost:5000/departments/update-status";

  // ✅ Loading fallback
  if (!deptName) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <main className="flex-1 w-auto mx-auto px-6 lg:px-10 py-4">
      <Suspense fallback={
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      }>
        {/* ✅ If dept is registrar, load RegistrarPendingLCs */}
        {isRegistrar ? (
          <RegistrarPendingLCs />
        ) : (
          // ✅ Otherwise load normal PendingApprovals
          <PendingApprovals
            title={`${deptName} Dashboard`}
            subtitle={`Pending Approvals for ${deptName}`}
            fetchUrl={commonFetchUrl}
            updateUrl={commonUpdateUrl}
          />
        )}
      </Suspense>
    </main>
  );
}

export default DepartmentDashboard;