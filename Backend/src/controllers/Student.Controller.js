import prisma from "../prisma.js";
import { handlePrismaError } from "../utils/handlePrismaError.js";
import { sendResponse } from "../utils/sendResponse.js";

// Submit LC form
export const submitLCForm = async (req, res) => {
  try {
    const prn = req.user.prn; // PRN from JWT
    const {
      studentName,
      studentID,
      fatherName,
      motherName,
      caste,
      subCaste,
      nationality,
      placeOfBirth,
      dateOfBirth,
      dobWords,
      lastCollege,
      yearOfAdmission,
      branch,
      admissionMode,
      reasonForLeaving,
    } = req.body;

    // Date handling utility function (unchanged)
    const parseDate = (dateString) => {
      if (!dateString) return null;
      // If it's already a Date object or timestamp, convert to ISO string first
      if (dateString instanceof Date) {
        return new Date(dateString);
      }
      // If it's a timestamp number, convert to Date
      if (typeof dateString === "number") {
        return new Date(dateString);
      }
      // If it's ISO string or date string, parse normally
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    };

    const profileData = {
      fatherName,
      motherName,
      caste,
      subCaste,
      nationality,
      placeOfBirth,
      dateOfBirth: parseDate(dateOfBirth),
      dobWords,
      lastCollege,
      yearOfAdmission: yearOfAdmission ? parseInt(yearOfAdmission) : null,
      branch,
      admissionMode,
      reasonForLeaving,
      forMigrationFlag: req.body.forMigrationFlag || false,
    };

    if (studentID) profileData.studentID = studentID;

    // Upsert student profile
    const profile = await prisma.studentProfile.upsert({
      where: { prn },
      update: profileData,
      create: { prn, ...profileData },
    });

    if (studentName) {
      await prisma.student.update({
        where: { prn },
        data: { studentName },
      });
    }

    const student = await prisma.student.findUnique({
      where: { prn },
      select: { studentName: true },
    });

    const accountDept = await prisma.department.findFirst({
      where: { deptName: "Account" },
    });
    if (!accountDept) {
      return sendResponse(
        res,
        false,
        "Account department not found",
        null,
        404
      );
    }

    // Create approval request if not exists
    const existing = await prisma.approvalRequest.findFirst({
      where: { studentPrn: prn, deptId: accountDept.deptId },
    });

    if (!existing) {
      await prisma.approvalRequest.create({
        data: {
          status: "PENDING",
          studentName: student?.studentName,
          yearOfAdmission: profile.yearOfAdmission || undefined,
          deptName: accountDept.deptName,
          branch: branch || undefined,
          student: { connect: { prn } },
          department: { connect: { deptId: accountDept.deptId } },
        },
      });
      console.log(`✅ Created approval request for Account department`);
    }

    return sendResponse(res, true, "LC form submitted successfully", {
      profile,
    });
  } catch (err) {
    console.error("Error submitting LC form:", err.message);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "submit_lc_form",
      prn: req.user?.prn,
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

// Get all HOD branches
export const getHodBranches = async (req, res) => {
  try {
    const hodDepartments = await prisma.department.findMany({
      where: { deptName: { contains: "HOD -", mode: "insensitive" } },
      select: { deptId: true, deptName: true, college: true },
    });

    const branches = hodDepartments.map((dept) => ({
      deptId: dept.deptId,
      branch: dept.deptName.replace(/^HOD\s*-\s*/i, ""),
      college: dept.college,
    }));

    return sendResponse(res, true, "HOD branches fetched successfully", {
      branches,
    });
  } catch (err) {
    console.error("Error fetching HOD branches:", err.message);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "get_hod_branches",
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

export const getDepartments = async (req, res) => {
  try {
    const Departments = await prisma.department.findMany({
      select: { deptId: true, deptName: true, college: true },
    });

    return sendResponse(res, true, "Departments fetched successfully", {
      Departments,
    });
  } catch (err) {
    console.error("Error fetching Departments:", err.message);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "get_departments",
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

// Get approval status for student
export const getApprovalStatus = async (req, res) => {
  try {
    const prn = req.user.prn;

    const approvals = await prisma.approvalRequest.findMany({
      where: { studentPrn: prn },
      include: {
        department: {
          select: { deptId: true, deptName: true, deptHead: true },
        },
        student: {
          select: { profile: { select: { lcGenerated: true, lcUrl: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!approvals.length) {
      return sendResponse(res, false, "No approval requests found", null, 404);
    }

    const approvalsWithExtra = approvals.map((approval) => ({
      approvalId: approval.approvalId,
      status: approval.status,
      approvedAt: approval.approvedAt,
      remarks: approval.remarks,
      createdAt: approval.createdAt,
      updatedAt: approval.updatedAt,
      deptName: approval.deptName || approval.department.deptName,
      branch: approval.branch,
      studentName: approval.studentName,
      yearOfAdmission: approval.yearOfAdmission,
      department: approval.department,
      lcUrl:
        approval.student?.profile?.lcGenerated === true
          ? approval.student.profile.lcUrl
          : null,
    }));

    return sendResponse(res, true, "Approval status fetched successfully", {
      approvals: approvalsWithExtra,
    });
  } catch (err) {
    console.error("Error fetching approval status:", err.message);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "get_approval_status",
      prn: req.user?.prn,
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

// Get REQUESTED_INFO approvals for student
export const getRequestedInfoApprovals = async (req, res) => {
  try {
    const prn = req.user.prn;

    const requests = await prisma.approvalRequest.findMany({
      where: { studentPrn: prn, status: "REQUESTED_INFO" },
      include: { department: { select: { deptName: true } } },
      orderBy: { updatedAt: "desc" },
    });

    if (!requests.length) {
      return sendResponse(
        res,
        false,
        "No requests for more information",
        null,
        404
      );
    }

    return sendResponse(
      res,
      true,
      "Requested info approvals fetched successfully",
      { requests }
    );
  } catch (err) {
    console.error("Error fetching REQUESTED_INFO approvals:", err.message);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "get_requested_info_approvals",
      prn: req.user?.prn,
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

// Resubmit LC form
export const resubmitLCForm = async (req, res) => {
  try {
    const prn = req.user.prn;
    const { approvalId, updates, studentName, forMigrationFlag } = req.body;

    if (!approvalId || !updates) {
      return sendResponse(
        res,
        false,
        "approvalId and updates are required",
        null,
        400
      );
    }

    const approval = await prisma.approvalRequest.findUnique({
      where: { approvalId },
    });

    if (!approval) {
      return sendResponse(res, false, "Approval request not found", null, 404);
    }
    if (approval.studentPrn !== prn) {
      return sendResponse(
        res,
        false,
        "You cannot update this approval request",
        null,
        403
      );
    }
    if (approval.status !== "REQUESTED_INFO") {
      return sendResponse(
        res,
        false,
        "Approval request is not requesting more info",
        null,
        400
      );
    }

    // Handle date parsing for updates (unchanged)
    const parseDate = (dateString) => {
      if (!dateString) return null;
      if (dateString instanceof Date) return new Date(dateString);
      if (typeof dateString === "number") return new Date(dateString);
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    };

    const profileUpdates = { ...updates };

    // Convert dateOfBirth if present in updates
    if (updates.dateOfBirth !== undefined) {
      profileUpdates.dateOfBirth = parseDate(updates.dateOfBirth);
    }

    // Ensure yearOfAdmission remains integer
    if (updates.yearOfAdmission !== undefined) {
      profileUpdates.yearOfAdmission =
        parseInt(updates.yearOfAdmission) || null;
    }

    if (forMigrationFlag !== undefined) {
      profileUpdates.forMigrationFlag = forMigrationFlag;
    }

    // Update student profile with profileUpdates
    const updatedProfile = await prisma.studentProfile.update({
      where: { prn },
      data: profileUpdates,
    });

    // Update student name if provided
    let updatedStudent = null;
    if (studentName) {
      updatedStudent = await prisma.student.update({
        where: { prn },
        data: { studentName },
      });
    }

    // Update approval status back to PENDING
    const updatedApproval = await prisma.approvalRequest.update({
      where: { approvalId },
      data: { status: "PENDING" },
    });

    return sendResponse(res, true, "LC form resubmitted successfully", {
      profile: updatedProfile,
      student: updatedStudent || undefined,
      approval: updatedApproval,
    });
  } catch (err) {
    console.error("Error resubmitting LC form:", err.message);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "resubmit_lc_form",
      prn: req.user?.prn,
      approvalId: req.body?.approvalId,
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

// Get LC form for student
export const getLCForm = async (req, res) => {
  try {
    const prn = req.user.prn;

    const studentWithProfile = await prisma.student.findUnique({
      where: { prn },
      select: {
        prn: true,
        studentName: true,
        email: true,
        phoneNo: true,
        profile: {
          select: {
            studentID: true,
            fatherName: true,
            motherName: true,
            caste: true,
            subCaste: true,
            nationality: true,
            placeOfBirth: true,
            dateOfBirth: true,
            dobWords: true,
            lastCollege: true,
            yearOfAdmission: true, // This remains as integer
            branch: true,
            admissionMode: true,
            reasonForLeaving: true,
            lcReady: true,
            lcGenerated: true,
            lcUrl: true,
            isFormEditable: true,
            forMigrationFlag: true,
            deletedRequests: true,
            createdAt: true,
          },
        },
      },
    });

    if (!studentWithProfile || !studentWithProfile.profile) {
      return sendResponse(
        res,
        false,
        "LC form not found for this student",
        null,
        404
      );
    }

    // Format dates for frontend - convert to ISO string without timezone issues (unchanged)
    const formatDateForFrontend = (date) => {
      if (!date) return null;
      // For date-only fields, return YYYY-MM-DD format
      const d = new Date(date);
      if (isNaN(d.getTime())) return null;
      return d.toISOString().split("T")[0]; // Returns "YYYY-MM-DD"
    };

    const profileWithFormattedDates = {
      ...studentWithProfile.profile,
      studentName: studentWithProfile.studentName,
      // Format date fields for frontend
      dateOfBirth: formatDateForFrontend(
        studentWithProfile.profile.dateOfBirth
      ),
      // yearOfAdmission remains as integer - no formatting needed
    };

    return sendResponse(res, true, "LC form fetched successfully", {
      lcForm: {
        ...studentWithProfile,
        profile: profileWithFormattedDates,
      },
    });
  } catch (err) {
    console.error("Error fetching LC form:", err.message);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "get_lc_form",
      prn: req.user?.prn,
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};
