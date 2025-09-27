import prisma from "../prisma.js";

// Update approval status
export const updateApprovalStatus = async (req, res) => {
  const staffId = req.user.staffId; // staff performing the action
  const deptId = req.user.deptId; // staff's department
  const { approvalId, status, remarks } = req.body;

  if (
    !approvalId ||
    !status ||
    !["APPROVED", "REJECTED", "REQUESTED_INFO"].includes(status)
  ) {
    return res.status(400).json({ error: "Invalid approvalId or status" });
  }

  try {
    const approval = await prisma.approvalRequest.findUnique({
      where: { approvalId },
      include: {
        student: { include: { profile: true } },
        department: true,
      },
    });

    if (!approval)
      return res.status(404).json({ error: "Approval request not found" });

    if (approval.deptId !== deptId)
      return res
        .status(403)
        .json({ error: "You cannot modify this approval request" });

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
        const remainingDepts = await prisma.department.findMany({
          where: {
            NOT: { deptName: { in: ["Account", "Library", "Registrar"] } },
            branchId: null,
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

    res.json({
      success: true,
      message: `Approval request ${status.toLowerCase()}`,
      approval: updatedApproval,
    });
  } catch (err) {
    console.error("Something went wrong while updating approval status", err);
    res.status(400).json({ error: err.message });
  }
};

// Helper to create next approval
async function createApprovalIfNotExists(studentPrn, dept, student) {
  const existing = await prisma.approvalRequest.findFirst({
    where: { studentPrn, deptId: dept.deptId },
  });

  if (!existing) {
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
  }
}

// Fetch pending approvals
export const getPendingApprovals = async (req, res) => {
  const deptId = req.user.deptId;

  try {
    const pendingApprovals = await prisma.approvalRequest.findMany({
      where: { deptId, status: "PENDING" },
      include: {
        student: {
          select: { prn: true, studentName: true, email: true, phoneNo: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    if (!pendingApprovals.length)
      return res
        .status(404)
        .json({ error: "No pending approval requests found" });

    res.json({ success: true, pendingApprovals });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Fetch approved approvals
export const getApprovedApprovals = async (req, res) => {
  const deptId = req.user.deptId;

  try {
    const approvedApprovals = await prisma.approvalRequest.findMany({
      where: { deptId, status: "APPROVED" },
      include: {
        student: {
          select: { prn: true, studentName: true, email: true, phoneNo: true },
        },
      },
      orderBy: { approvedAt: "desc" },
    });

    if (!approvedApprovals.length)
      return res.status(404).json({ error: "No approved requests found" });

    res.json({ success: true, approvedApprovals });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Fetch rejected approvals
export const getRejectedApprovals = async (req, res) => {
  const deptId = req.user.deptId;

  try {
    const rejectedApprovals = await prisma.approvalRequest.findMany({
      where: { deptId, status: "REJECTED" },
      include: {
        student: {
          select: { prn: true, studentName: true, email: true, phoneNo: true },
        },
      },
      orderBy: { approvedAt: "desc" },
    });

    if (!rejectedApprovals.length)
      return res.status(404).json({ error: "No rejected requests found" });

    res.json({ success: true, rejectedApprovals });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Fetch requested info approvals
export const getRequestedInfoApprovals = async (req, res) => {
  const deptId = req.user.deptId;

  try {
    const requestedInfoApprovals = await prisma.approvalRequest.findMany({
      where: { deptId, status: "REQUESTED_INFO" },
      include: {
        student: {
          select: { prn: true, studentName: true, email: true, phoneNo: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    if (!requestedInfoApprovals.length)
      return res.status(404).json({ error: "No requests for more info found" });

    res.json({ success: true, requestedInfoApprovals });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};
