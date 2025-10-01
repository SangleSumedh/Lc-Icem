import React, { useState, useEffect } from "react";
import { FaWpforms, FaEye, FaEdit } from "react-icons/fa";
import { FaFileWaveform } from "react-icons/fa6";
import { ClipboardDocumentIcon } from "@heroicons/react/24/solid";
import LeavingCertificateForm from "../LeavingCertificateForm"; // Import the reusable component

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
          "http://localhost:5000/lc-form/approval-status",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Fetch LC form data
        const formRes = await fetch("http://localhost:5000/lc-form/form", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (statusData.approvals && statusData.approvals.length > 0) {
            setSubmitted(true);
          }
        }

        if (formRes.ok) {
          const formData = await formRes.json();
          if (formData.success && formData.lcForm) {
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
        const studentCollege = localStorage.getItem("college"); // ✅ get student’s college

        const res = await fetch("http://localhost:5000/lc-form/hod-branches", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (data.success) {
          // ✅ Filter branches for logged-in student’s college
          const filteredBranches = data.branches.filter(
            (b) => b.college === studentCollege
          );

          const branchOptions = filteredBranches.map((b) => ({
            value: b.branch,
            label: b.branch,
          }));
          setBranches(branchOptions);
        }
      } catch (err) {
        console.error("❌ Error fetching branches:", err);
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
      const res = await fetch("http://localhost:5000/lc-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
        setShowModal(false);
        setEditMode(false);
        // Refresh form data
        const formRes = await fetch("http://localhost:5000/lc-form/form", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (formRes.ok) {
          const formData = await formRes.json();
          if (formData.success && formData.lcForm) {
            setLcFormData(formData.lcForm);
            setIsFormEditable(formData.lcForm.profile?.isFormEditable || false);
          }
        }
      } else {
        alert(data.error || "❌ Failed to submit form");
      }
    } catch (err) {
      console.log(lcFormData);
      alert("Could not connect to backend.", err);
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
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full p-6 space-y-6 overflow-y-auto">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-gray-800">
        Leaving Certificate Dashboard
      </h1>

      {/* Status Section */}
      {submitted ? (
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-blue-800 flex items-center gap-2">
            <ClipboardDocumentIcon className="h-6 w-6 text-blue-600" />
            Form Submitted
          </h2>
          <p className="mt-2 text-gray-700">
            Your form has been submitted. Please wait for verification.
          </p>

          {/* View and Edit Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleViewClick}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
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
                <span className="text-red-500">*</span>.
              </li>
              <li>The application will be processed within 7 working days.</li>
              <li>Contact the admin office in case of discrepancies.</li>
            </ul>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleOpenModal}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow hover:bg-blue-700 transition"
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
