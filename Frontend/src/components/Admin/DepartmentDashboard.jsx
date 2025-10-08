// DepartmentDashboard.js
import React, { useEffect, useState, lazy, Suspense } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiClipboard, FiCheckCircle, FiInfo, FiXCircle } from "react-icons/fi";
import RegistrarPendingLCs from "./RegistrarPendingLCs";
import ENV from "../../env.js";
import useApprovalsStore from "../../store/approvalsStore.js";

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

  // Use Zustand store - REMOVE clearTab
  const { fetchApprovals } = useApprovalsStore();

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

  // Fetch data only once when component mounts or deptName changes
  useEffect(() => {
    if (!deptName || isRegistrar) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    // Fetch all tabs data initially
    const fetchAllData = async () => {
      for (const tab of tabs) {
        const fetchUrl = getFetchUrl(tab.id);
        await fetchApprovals(tab.id, fetchUrl, token);
      }
    };

    fetchAllData();
  }, [deptName, isRegistrar]); // Remove activeTab from dependencies

  const getFetchUrl = (tab) => {
    const baseUrl = ENV.BASE_URL || "http://localhost:5000";
    const urls = {
      pending: `${baseUrl}/departments/pending-approvals`,
      approved: `${baseUrl}/departments/approvals/approved`,
      requested: `${baseUrl}/departments/approvals/requested-info`,
      rejected: `${baseUrl}/departments/approvals/rejected`,
    };
    return urls[tab];
  };

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
                <div className="space-y-6 min-h-[300px] p-6">
                  {/* Header Skeleton */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-6">
                    <div className="space-y-2">
                      <div className="h-8 bg-gray-200 rounded-lg w-64 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
                  </div>

                  {/* Filters Skeleton */}
                  <div className="flex flex-col sm:flex-row gap-3 py-4">
                    <div className="flex-1">
                      <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                    </div>
                    <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>

                  {/* Table Skeleton */}
                  <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-300">
                    <div className="w-full">
                      {/* Table Header Skeleton */}
                      <div className="bg-gray-200 px-6 py-4 rounded-t-xl">
                        <div className="grid grid-cols-5 gap-4">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className="h-4 bg-gray-200 rounded animate-pulse"
                            ></div>
                          ))}
                        </div>
                      </div>

                      {/* Table Rows Skeleton */}
                      <div className="divide-y divide-gray-100">
                        {[...Array(5)].map((_, index) => (
                          <div
                            key={index}
                            className="px-6 py-4 grid grid-cols-5 gap-4"
                          >
                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-8 bg-gray-200 rounded w-8 animate-pulse"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              }
            >
              {activeTab === "pending" && (
                <PendingApprovals
                  title={`${deptName} - Pending Approvals`}
                  subtitle={`Pending Approvals for ${deptName}`}
                  updateUrl={updateUrl}
                />
              )}

              {activeTab === "requested" && (
                <RequestedInfo
                  title={`${deptName} - Requested Info`}
                  subtitle={`Requested Information for ${deptName}`}
                  updateUrl={updateUrl}
                />
              )}

              {activeTab === "approved" && (
                <ApprovedApprovalRequests
                  title={`${deptName} - Approved Requests`}
                  subtitle={`Approved Requests for ${deptName}`}
                />
              )}

              {activeTab === "rejected" && isAccountDept && (
                <RejectedApprovals
                  title={`${deptName} - Rejected Requests`}
                  subtitle={`Rejected Requests for ${deptName}`}
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
