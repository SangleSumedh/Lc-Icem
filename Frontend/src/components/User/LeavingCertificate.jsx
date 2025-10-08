import React, { useState, useEffect } from "react";
import { FaWpforms, FaEye, FaEdit } from "react-icons/fa";
import { FaFileWaveform } from "react-icons/fa6";
import { ClipboardDocumentIcon } from "@heroicons/react/24/solid";
import LeavingCertificateForm from "../LeavingCertificateForm"; 
import ENV from "../../env";
import axios from "axios";
import toast from "react-hot-toast";

const LeavingCertificate = () => {
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    studentName: "",
    studentID: "",
    fatherName: "",
    motherName: "",
    caste: "",
    subCaste: "",
    nationality: "",
    placeOfBirth: "",
    dateOfBirth: "",
    dobWords: "",
    lastCollege: "",
    lcType: "",
    yearOfAdmission: "",
    branch: "",
    admissionMode: "",
    reasonForLeaving: "",
  });
  const [originalFormData, setOriginalFormData] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [lcFormData, setLcFormData] = useState(null);
  const [isFormEditable, setIsFormEditable] = useState(false);

  // Branches state
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(true);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setViewMode(false);
    setEditMode(false);
  };

  // 🔍 Check approval status and fetch LC form data
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const token = localStorage.getItem("token");

        // Check approval status
        const statusRes = await fetch(
          `${ENV.BASE_URL}/lc-form/approval-status` ||
            "http://localhost:5000/lc-form/approval-status",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Fetch LC form data
        const formRes = await fetch(
          `${ENV.BASE_URL}/lc-form/form` ||
            "http://localhost:5000/lc-form/form",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (statusRes.ok) {
          const statusResponse = await statusRes.json();
          const statusData = statusResponse.data; // Access the data property
          if (
            statusData &&
            statusData.approvals &&
            statusData.approvals.length > 0
          ) {
            setSubmitted(true);
          }
        }

        if (formRes.ok) {
          const formResponse = await formRes.json();
          const formData = formResponse.data; // Access the data property

          if (formResponse.success && formData.lcForm) {
            setLcFormData(formData.lcForm);
            setIsFormEditable(formData.lcForm.profile?.isFormEditable || false);

            // Prepopulate form data if exists
            if (formData.lcForm.profile) {
              const profile = formData.lcForm.profile;
              const newFormData = {
                studentName: profile.studentName || "",
                studentID: profile.studentID || "",
                fatherName: profile.fatherName || "",
                motherName: profile.motherName || "",
                caste: profile.caste || "",
                subCaste: profile.subCaste || "",
                nationality: profile.nationality || "",
                placeOfBirth: profile.placeOfBirth || "",
                dateOfBirth: profile.dateOfBirth || "",
                dobWords: profile.dobWords || "",
                lastCollege: profile.lastCollege || "",
                lcType: "LEAVING",
                yearOfAdmission: profile.yearOfAdmission || "",
                branch: profile.branch || "",
                admissionMode: profile.admissionMode || "",
                reasonForLeaving: profile.reasonForLeaving || "",
              };
              setFormData(newFormData);
              setOriginalFormData(newFormData);
            }
          }
        }
      } catch (err) {
        console.error("❌ Error checking form status:", err);
        toast.error("Error checking form status");
      } finally {
        setCheckingStatus(false);
      }
    };
    checkStatus();
  }, []);

  // 🔍 Fetch branches once
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const token = localStorage.getItem("token");
        const studentCollege = localStorage.getItem("college");

        if (!token || !studentCollege) {
          console.error("❌ Missing token or college information");
          setBranches([]);
          toast.error("Missing authentication information");
          return;
        }

        const response = await axios.get(
          `${ENV.BASE_URL}/lc-form/hod-branches` ||
            "http://localhost:5000/lc-form/hod-branches",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // With Axios, the response data is directly accessible via response.data
        const { success, message, data } = response.data;

        if (!success) {
          console.error("❌ Failed to fetch branches:", message);
          setBranches([]);
          toast.error(message || "Failed to fetch branches");
          return;
        }

        // Ensure we have the branches array
        const branchesArray = data?.branches || [];

        if (!Array.isArray(branchesArray)) {
          console.error("❌ Invalid branches data format:", branchesArray);
          setBranches([]);
          toast.error("Invalid branches data format");
          return;
        }

        // Filter branches by college
        const filteredBranches = branchesArray.filter(
          (b) => b.college === studentCollege
        );

        // Create options for dropdown
        const branchOptions = filteredBranches.map((b) => ({
          value: b.branch,
          label: b.branch,
        }));

        setBranches(branchOptions);
      } catch (err) {
        console.error("❌ Error fetching branches:", err);

        // Axios error handling
        if (err.response) {
          // Server responded with error status
          console.error(
            "Server error:",
            err.response.status,
            err.response.data
          );
          toast.error(err.response.data?.message || "Failed to fetch branches");
        } else if (err.request) {
          // Request made but no response received
          console.error("Network error:", err.request);
          toast.error("Network error - please check your connection");
        } else {
          // Something else happened
          console.error("Error:", err.message);
          toast.error("Error fetching branches");
        }

        setBranches([]); // Set empty array on error
      } finally {
        setBranchesLoading(false);
      }
    };

    fetchBranches();
  }, []);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${ENV.BASE_URL}/lc-form`, formData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // Axios automatically throws for non-2xx status, so if we're here, it's successful
      const { success, message, data } = response.data;

      if (success) {
        setSubmitted(true);
        setShowModal(false);
        setEditMode(false);

        // Refresh form data
        const formResponse = await axios.get(`${ENV.BASE_URL}/lc-form/form`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (formResponse.data.success && formResponse.data.data?.lcForm) {
          setLcFormData(formResponse.data.data.lcForm);
          setIsFormEditable(
            formResponse.data.data.lcForm.profile?.isFormEditable || false
          );
        }

        // Show success message
        toast.success("Form submitted successfully!");
      } else {
        toast.error(message || "Failed to submit form");
      }
    } catch (err) {
      console.error("Submission error:", err);

      // Enhanced error handling for axios
      if (err.response) {
        // Server responded with error status
        const errorMessage = err.response.data?.message || "Submission failed";
        toast.error(errorMessage);
      } else if (err.request) {
        // Request was made but no response received
        toast.error("Network error - please check your connection");
      } else {
        // Something else happened
        toast.error("An error occurred while submitting the form");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle edit button click
  const handleEditClick = () => {
    setEditMode(true);
    setViewMode(false);
    setShowModal(true);
  };

  // Handle view button click
  const handleViewClick = () => {
    setViewMode(true);
    setEditMode(false);
    setShowModal(true);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditMode(false);
    setFormData(originalFormData);
  };

 if (checkingStatus) {
   return (
     <div className="flex flex-col w-full h-full p-6 space-y-6 overflow-y-auto animate-pulse">
       {/* Page Title Skeleton */}
       <div className="h-8 w-2/5 bg-gray-300 rounded-lg mb-4"></div>

       {/* Instruction Card Skeleton */}
       <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6 space-y-3">
         <div className="h-5 w-1/3 bg-gray-300 rounded"></div>
         <ul className="space-y-2 mt-3">
           {[...Array(4)].map((_, i) => (
             <li key={i} className="h-4 w-full bg-gray-200 rounded"></li>
           ))}
         </ul>
       </div>

       {/* Submitted Status Card Skeleton */}
       <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
         <div className="flex items-center gap-2 mb-3">
           <div className="h-5 w-5 bg-gray-300 rounded-full"></div>
           <div className="h-5 w-1/4 bg-gray-300 rounded"></div>
         </div>
         <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
         <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
       </div>

       {/* CTA Button Skeleton */}
       <div className="h-10 w-40 bg-gray-300 rounded-xl shadow"></div>
     </div>
   );
 }


  return (
    <div className="flex flex-col w-full h-full p-6 space-y-6 overflow-y-auto">
      {/* Page Title */}
      <h1 className="text-2xl sm:text-3xl text-center md:text-left text-nowrap font-bold text-[#00539C]">
        Leaving Certificate Dashboard
      </h1>

      {/* Status Section */}
      {submitted ? (
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-[#00539C] flex items-center gap-2">
            <ClipboardDocumentIcon className="h-6 w-6 text-[#00539C]" />
            Form Submitted
          </h2>
          <p className="mt-2 text-gray-700">
            Your form has been submitted. Please wait for verification.
          </p>

          {/* View and Edit Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleViewClick}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              <FaEye className="text-sm" />
              View Form
            </button>

            {isFormEditable && (
              <button
                onClick={handleEditClick}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
              >
                <FaEdit className="text-sm" />
                Edit Form
              </button>
            )}
          </div>

          {/* Editable Status Message */}
          {!isFormEditable && (
            <p className="mt-2 text-sm text-gray-600">
              Form editing is currently disabled
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-300 p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-yellow-800 flex items-center gap-2">
              <FaWpforms className="text-yellow-600" /> Instructions
            </h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-2 mt-2">
              <li>Ensure all details are accurate before submission.</li>
              <li>
                Mandatory fields are marked with{" "}
                <span className="text-rose-500">*</span>.
              </li>
              <li>The application will be processed within 7 working days.</li>
              <li>Contact the admin office in case of discrepancies.</li>
            </ul>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleOpenModal}
            className="flex items-center max-w-sm sm:max-w-[200px] justify-center gap-2 px-6 py-3 bg-[#00539C] text-white font-semibold rounded-xl shadow hover:bg-[#023d71] transition"
          >
            <FaFileWaveform className="text-lg" />
            Fill Form
          </button>
        </>
      )}

      {/* Reusable Form Component */}
      <LeavingCertificateForm
        showModal={showModal || viewMode || editMode}
        onClose={handleCloseModal}
        viewMode={viewMode}
        editMode={editMode}
        onSubmit={handleSubmit}
        onCancelEdit={handleCancelEdit}
        initialFormData={formData}
        loading={loading}
        branches={branches}
        branchesLoading={branchesLoading}
      />
    </div>
  );
};

export default LeavingCertificate;
