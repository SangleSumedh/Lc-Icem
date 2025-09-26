import prisma from "../prisma.js";

export const updateApprovalStatus = async (req, res) => {
  const deptId = req.user.deptId;
  const { approvalId, status, remarks } = req.body;

  // ✅ Allow REQUESTED_INFO status
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

    // ✅ Define studentPrn at the top
    const studentPrn = approval.student.prn;

    // Determine timestamp: approvedAt only for APPROVED/REJECTED
    const updateData = { status, remarks };
    if (status === "APPROVED" || status === "REJECTED") {
      updateData.approvedAt = new Date();
    }

    // Update current approval request
    const updatedApproval = await prisma.approvalRequest.update({
      where: { approvalId },
      data: updateData,
    });

    // Log the action
    await prisma.approvalAction.create({
      data: {
        approvalId,
        deptId,
        action: status,
        remarks,
      },
    });

    console.log(
      `Approval Request ${approvalId} marked as ${status} by dept ${deptId}`
    );

    // Trigger next approvals only if APPROVED
    if (status === "APPROVED") {
      const studentBranch = approval.student.profile?.branch;

      if (approval.department.deptName === "Account") {
        // After Account → Library
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
        // After Library → HOD of that branch
        const hodDepts = await prisma.department.findMany({
          where: {
            deptName: {
              contains: `HOD - ${studentBranch}`,
              mode: "insensitive", // ✅ case-insensitive match
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
        // After HOD → all remaining departments (excluding Account & Library)
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

    // ✅ Now studentPrn always defined here
    const pendingApprovals = await prisma.approvalRequest.findMany({
      where: {
        studentPrn,
        status: { not: "APPROVED" },
      },
    });

    if (pendingApprovals.length === 0) {
      // All approvals done
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
    console.error(
      "Something went wrong while updating approval status",
      err.message
    );
    res.status(400).json({ error: err.message });
  }
};

// Helper function to create approval if it doesn't exist
async function createApprovalIfNotExists(studentPrn, dept, student) {
  const existing = await prisma.approvalRequest.findFirst({
    where: { studentPrn: studentPrn, deptId: dept.deptId },
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

export const getPendingApprovals = async (req, res) => {
  const deptId = req.user.deptId; // From JWT

  try {
    const pendingApprovals = await prisma.approvalRequest.findMany({
      where: {
        deptId,
        status: "PENDING",
      },
      include: {
        student: {
          select: {
            prn: true,
            studentName: true,
            email: true,
            phoneNo: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (!pendingApprovals || pendingApprovals.length === 0) {
      return res
        .status(404)
        .json({ error: "No pending approval requests found" });
    }

    console.log(
      `Fetched ${pendingApprovals.length} pending approvals for dept ${deptId}`
    );

    res.json({
      success: true,
      pendingApprovals,
    });
  } catch (err) {
    console.error("Error fetching pending approvals:", err.message);
    res.status(400).json({ error: err.message });
  }
};

export const getApprovedApprovals = async (req, res) => {
  const deptId = req.user.deptId;

  try {
    const approvedApprovals = await prisma.approvalRequest.findMany({
      where: {
        deptId,
        status: "APPROVED",
      },
      include: {
        student: {
          select: {
            prn: true,
            studentName: true,
            email: true,
            phoneNo: true,
          },
        },
      },
      orderBy: {
        approvedAt: "desc",
      },
    });

    if (!approvedApprovals || approvedApprovals.length === 0) {
      return res.status(404).json({ error: "No approved requests found" });
    }

    console.log(
      `Fetched ${approvedApprovals.length} approved approvals for dept ${deptId}`
    );

    res.json({
      success: true,
      approvedApprovals,
    });
  } catch (err) {
    console.error("Error fetching approved approvals:", err.message);
    res.status(400).json({ error: err.message });
  }
};

export const getRejectedApprovals = async (req, res) => {
  const deptId = req.user.deptId;

  try {
    const rejectedApprovals = await prisma.approvalRequest.findMany({
      where: {
        deptId,
        status: "REJECTED",
      },
      include: {
        student: {
          select: {
            prn: true,
            studentName: true,
            email: true,
            phoneNo: true,
          },
        },
      },
      orderBy: {
        approvedAt: "desc",
      },
    });

    if (!rejectedApprovals || rejectedApprovals.length === 0) {
      return res.status(404).json({ error: "No rejected requests found" });
    }

    console.log(
      `Fetched ${rejectedApprovals.length} rejected approvals for dept ${deptId}`
    );

    res.json({
      success: true,
      rejectedApprovals,
    });
  } catch (err) {
    console.error("Error fetching rejected approvals:", err.message);
    res.status(400).json({ error: err.message });
  }
};

export const getRequestedInfoApprovals = async (req, res) => {
  const deptId = req.user.deptId;

  try {
    const requestedInfoApprovals = await prisma.approvalRequest.findMany({
      where: {
        deptId,
        status: "REQUESTED_INFO",
      },
      include: {
        student: {
          select: {
            prn: true,
            studentName: true,
            email: true,
            phoneNo: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    if (!requestedInfoApprovals || requestedInfoApprovals.length === 0) {
      return res.status(404).json({ error: "No requests for more info found" });
    }

    console.log(
      `Fetched ${requestedInfoApprovals.length} REQUESTED_INFO approvals for dept ${deptId}`
    );

    res.json({
      success: true,
      requestedInfoApprovals,
    });
  } catch (err) {
    console.error("Error fetching REQUESTED_INFO approvals:", err.message);
    res.status(400).json({ error: err.message });
  }
};
