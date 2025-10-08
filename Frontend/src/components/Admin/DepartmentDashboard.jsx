import React, { useEffect, useState, lazy, Suspense } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiClipboard, FiCheckCircle, FiInfo, FiXCircle } from "react-icons/fi";
import RegistrarPendingLCs from "./RegistrarPendingLCs";
import ENV from "../../env.js";

// Lazy-loaded components
const PendingApprovals = lazy(() => import("./PendingApprovals"));
const ApprovedApprovalRequests = lazy(() =>
  import("./ApprovedApprovalRequests")
);
const RequestedInfo = lazy(() => import("./RequestedInfoApprovals"));
const RejectedApprovals = lazy(() => import("./RejectedApprovals"));

// Utility to deslugify
const deslugify = (slug) =>
  slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const DepartmentDashboard = () => {
  const { deptKey } = useParams();
  const [deptName, setDeptName] = useState("");
  const [isRegistrar, setIsRegistrar] = useState(false);
  const [isAccountDept, setIsAccountDept] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    const stored = localStorage.getItem("deptName");
    const name = stored || deslugify(deptKey);
    setDeptName(name);
    setIsRegistrar(name.toLowerCase() === "registrar");
    setIsAccountDept(name.toLowerCase().includes("account"));
  }, [deptKey]);

  // Base tabs for all departments
  const baseTabs = [
    { id: "pending", label: "Pending", icon: FiClipboard, color: "red" },
    { id: "requested", label: "Requested Info", icon: FiInfo, color: "blue" },
    { id: "approved", label: "Approved", icon: FiCheckCircle, color: "green" },
  ];

  // Add rejected tab only for Account Department
  const accountTabs = [
    ...baseTabs,
    { id: "rejected", label: "Rejected", icon: FiXCircle, color: "orange" },
  ];

  const tabs = isAccountDept ? accountTabs : baseTabs;

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: "bg-sky-50",
        border: "border-sky-200",
        text: "text-sky-600",
        dark: "bg-sky-500",
      },
      green: {
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        text: "text-emerald-600",
        dark: "bg-emerald-500",
      },
      red: {
        bg: "bg-rose-50",
        border: "border-rose-200",
        text: "text-rose-600",
        dark: "bg-rose-500",
      },
      orange: {
        bg: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-600",
        dark: "bg-orange-500",
      },
    };
    return colors[color] || colors.blue;
  };

  const fetchUrls = {
    pending:
      `${ENV.BASE_URL}/departments/pending-approvals` ||
      "http://localhost:5000/departments/pending-approvals",
    approved:
      `${ENV.BASE_URL}/departments/approvals/approved` ||
      "http://localhost:5000/departments/approvals/approved",
    requested:
      `${ENV.BASE_URL}/departments/requests/infos` ||
      "http://localhost:5000/departments/requests/info",
    rejected:
      `${ENV.BASE_URL}/departments/approvals/rejected` ||
      "http://localhost:5000/departments/approvals/rejected",
  };

  const updateUrl =
    `${ENV.BASE_URL}/departments/update-status` ||
    "http://localhost:5000/departments/update-status";

  if (!deptName) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const renderContent = () => {
    if (isRegistrar) return <RegistrarPendingLCs />;

    return (
      <div className="space-y-6">
        {/* Navigation */}
        <div className="px-6">
          <div className="flex space-x-2 rounded-xl p-1 backdrop-blur-sm">
            {tabs.map((tab) => {
              const colorClass = getColorClasses(tab.color);
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 border border-gray-200 ${
                    activeTab === tab.id
                      ? `${colorClass.bg} ${colorClass.text} shadow-sm`
                      : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Suspense
              fallback={
                <div className="flex justify-center items-center min-h-[300px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              }
            >
              {activeTab === "pending" && (
                <PendingApprovals
                  title={`${deptName} - Pending Approvals`}
                  subtitle={`Pending Approvals for ${deptName}`}
                  fetchUrl={fetchUrls.pending}
                  updateUrl={updateUrl}
                />
              )}

              {activeTab === "requested" && (
                <RequestedInfo
                  title={`${deptName} - Requested Info`}
                  subtitle={`Requested Information for ${deptName}`}
                  fetchUrl={fetchUrls.requested}
                />
              )}

              {activeTab === "approved" && (
                <ApprovedApprovalRequests
                  title={`${deptName} - Approved Requests`}
                  subtitle={`Approved Requests for ${deptName}`}
                  fetchUrl={fetchUrls.approved}
                />
              )}

              {/* Only show RejectedApprovals for Account Department */}
              {activeTab === "rejected" && isAccountDept && (
                <RejectedApprovals
                  title={`${deptName} - Rejected Requests`}
                  subtitle={`Rejected Requests for ${deptName}`}
                  fetchUrl={fetchUrls.rejected}
                  updateUrl={updateUrl}
                />
              )}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  };

  return <main className="min-h-screen bg-white p-6">{renderContent()}</main>;
};

export default DepartmentDashboard;
