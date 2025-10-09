import prisma from "../prisma.js";
import { handlePrismaError } from "../utils/handlePrismaError.js";
import { sendResponse } from "../utils/sendResponse.js";

// Update approval status
export const updateApprovalStatus = async (req, res) => {
  try {
    const staffId = req.user.staffId; // staff performing the action
    const deptId = req.user.deptId; // staff's department
    const { approvalId, status, remarks } = req.body;

    if (
      !approvalId ||
      !status ||
      !["APPROVED", "REJECTED", "REQUESTED_INFO"].includes(status)
    ) {
      return sendResponse(
        res,
        false,
        "Invalid approvalId or status",
        null,
        400
      );
    }

    const approval = await prisma.approvalRequest.findUnique({
      where: { approvalId },
      include: {
        student: { include: { profile: true } },
        department: true,
      },
    });

    if (!approval) {
      return sendResponse(res, false, "Approval request not found", null, 404);
    }

    if (approval.deptId !== deptId) {
      return sendResponse(
        res,
        false,
        "You cannot modify this approval request",
        null,
        403
      );
    }

    const studentPrn = approval.student.prn;

    // Update approval status
    const updateData = { status, remarks };
    if (status === "APPROVED" || status === "REJECTED") {
      updateData.approvedAt = new Date();
    }

    const updatedApproval = await prisma.approvalRequest.update({
      where: { approvalId },
      data: updateData,
    });

    // Log action with staffId
    await prisma.approvalAction.create({
      data: {
        approvalId,
        staffId,
        action: status,
        remarks,
      },
    });

    // Lock/unlock LC form based on status
    if (status === "APPROVED") {
      await prisma.studentProfile.update({
        where: { prn: studentPrn },
        data: { isFormEditable: false },
      });
    } else if (status === "REQUESTED_INFO") {
      await prisma.studentProfile.update({
        where: { prn: studentPrn },
        data: { isFormEditable: true },
      });
    }

    // Trigger next approvals if APPROVED
    if (status === "APPROVED") {
      const studentBranch = approval.student.profile?.branch;

      if (approval.department.deptName === "Account") {
        const libraryDept = await prisma.department.findFirst({
          where: { deptName: "Library" },
        });
        if (libraryDept) {
          await createApprovalIfNotExists(
            studentPrn,
            libraryDept,
            approval.student
          );
        }
      } else if (approval.department.deptName === "Library") {
        const hodDepts = await prisma.department.findMany({
          where: {
            deptName: {
              contains: `HOD - ${studentBranch}`,
              mode: "insensitive",
            },
            college: approval.student.college,
          },
        });

        for (const hodDept of hodDepts) {
          await createApprovalIfNotExists(
            studentPrn,
            hodDept,
            approval.student
          );
        }
      } else if (approval.department.deptName.includes("HOD")) {
        const studentCollege = approval.student.college;

        const remainingDepts = await prisma.department.findMany({
          where: {
            NOT: { deptName: { in: ["Account", "Library", "Registrar"] } },
            branchId: null,
            OR: [
              { college: studentCollege }, // student's college-specific departments
              { college: "ALL" }, // global/common departments
            ],
          },
        });

        for (const dept of remainingDepts) {
          await createApprovalIfNotExists(studentPrn, dept, approval.student);
        }
      }
    }

    // Check if all approvals are done
    const pendingApprovals = await prisma.approvalRequest.findMany({
      where: {
        studentPrn,
        status: { not: "APPROVED" },
      },
    });

    if (pendingApprovals.length === 0) {
      await prisma.studentProfile.update({
        where: { prn: studentPrn },
        data: { lcReady: true, lcGenerated: false, lcUrl: null },
      });
      console.log(`🎉 LC ready for student ${studentPrn}`);
    }

    return sendResponse(res, true, `Approval request ${status.toLowerCase()}`, {
      approval: updatedApproval,
    });
  } catch (err) {
    console.error("❌ Error in updateApprovalStatus:", err);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "update_approval_status",
      approvalId: req.body.approvalId,
      status: req.body.status,
      staffId: req.user?.staffId,
      deptId: req.user?.deptId,
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

// Helper to create next approval (unchanged)
async function createApprovalIfNotExists(studentPrn, dept, student) {
  // Check if approval request already exists
  const existing = await prisma.approvalRequest.findFirst({
    where: {
      studentPrn,
      deptId: dept.deptId,
    },
  });

  if (!existing) {
    try {
      await prisma.approvalRequest.create({
        data: {
          status: "PENDING",
          studentName: student.studentName,
          yearOfAdmission: student.profile?.yearOfAdmission,
          deptName: dept.deptName,
          branch: student.profile?.branch,
          student: { connect: { prn: studentPrn } },
          department: { connect: { deptId: dept.deptId } },
        },
      });
      console.log(`✅ Created approval request for ${dept.deptName}`);
    } catch (err) {
      if (err.code === "P2002") {
        // Unique constraint violation → another request already created it
        console.log(`ℹ️ Approval request already exists for ${dept.deptName}`);
      } else {
        throw err;
      }
    }
  } else {
    console.log(`ℹ️ Approval request already exists for ${dept.deptName}`);
  }
}

// Fetch pending approvals
export const getPendingApprovals = async (req, res) => {
  try {
    const deptId = req.user.deptId;

    const pendingApprovals = await prisma.approvalRequest.findMany({
      where: { deptId, status: "PENDING" },
      include: {
        student: {
          select: { prn: true, studentName: true, email: true, phoneNo: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    if (!pendingApprovals.length) {
      return sendResponse(
        res,
        false,
        "No pending approval requests found",
        null,
        404
      );
    }

    return sendResponse(res, true, "Pending approvals fetched successfully", {
      pendingApprovals,
    });
  } catch (err) {
    console.error("Error fetching pending approvals:", err);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "get_pending_approvals",
      deptId: req.user?.deptId,
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

// Fetch approved approvals
export const getApprovedApprovals = async (req, res) => {
  try {
    const deptId = req.user.deptId;

    const approvedApprovals = await prisma.approvalRequest.findMany({
      where: { deptId, status: "APPROVED" },
      include: {
        student: {
          select: { prn: true, studentName: true, email: true, phoneNo: true },
        },
      },
      orderBy: { approvedAt: "desc" },
    });

    if (!approvedApprovals.length) {
      return sendResponse(res, false, "No approved requests found", null, 404);
    }

    return sendResponse(res, true, "Approved approvals fetched successfully", {
      approvedApprovals,
    });
  } catch (err) {
    console.error("Error fetching approved approvals:", err);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "get_approved_approvals",
      deptId: req.user?.deptId,
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

// Fetch rejected approvals
export const getRejectedApprovals = async (req, res) => {
  try {
    const deptId = req.user.deptId;

    const rejectedApprovals = await prisma.approvalRequest.findMany({
      where: { deptId, status: "REJECTED" },
      include: {
        student: {
          select: { prn: true, studentName: true, email: true, phoneNo: true },
        },
      },
      orderBy: { approvedAt: "desc" },
    });

    if (!rejectedApprovals.length) {
      return sendResponse(res, false, "No rejected requests found", null, 404);
    }

    return sendResponse(res, true, "Rejected approvals fetched successfully", {
      rejectedApprovals,
    });
  } catch (err) {
    console.error("Error fetching rejected approvals:", err);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "get_rejected_approvals",
      deptId: req.user?.deptId,
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

// Fetch requested info approvals
export const getRequestedInfoApprovals = async (req, res) => {
  try {
    const deptId = req.user.deptId;

    const requestedInfoApprovals = await prisma.approvalRequest.findMany({
      where: { deptId, status: "REQUESTED_INFO" },
      include: {
        student: {
          select: { prn: true, studentName: true, email: true, phoneNo: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    if (!requestedInfoApprovals.length) {
      return sendResponse(
        res,
        false,
        "No requests for more info found",
        null,
        404
      );
    }

    return sendResponse(
      res,
      true,
      "Requested info approvals fetched successfully",
      { requestedInfoApprovals }
    );
  } catch (err) {
    console.error("Error fetching requested info approvals:", err);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "get_requested_info_approvals",
      deptId: req.user?.deptId,
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};
