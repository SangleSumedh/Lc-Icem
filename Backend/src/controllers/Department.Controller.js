import prisma from "../prisma.js";

export const updateApprovalStatus = async (req, res) => {
  const deptId = req.user.deptId;
  const { approvalId, status, remarks } = req.body;

  if (!approvalId || !status || !["APPROVED", "REJECTED"].includes(status)) {
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

    // Update current approval request

    const updatedApproval = await prisma.approvalRequest.update({
      where: { approvalId },
      data: { status, remarks, approvedAt: new Date() },
    });

    // Log the action
    await prisma.approvalAction.create({
      data: {
        approvalId,
        deptId,
        action: status === "APPROVED" ? "APPROVED" : "REJECTED",
        remarks,
      },
    });

    console.log(
      `Approval Request ${approvalId} marked as ${status} by dept ${deptId}`
    );

    // Trigger next approval request if current is approved
    if (status === "APPROVED") {
      const studentId = approval.studentId;
      const studentBranch = approval.student.profile?.branch;

      if (approval.department.deptName === "Account") {
        // Create Library request
        const libraryDept = await prisma.department.findFirst({
          where: { deptName: "Library" },
        });
        if (libraryDept)
          await createApprovalIfNotExists(
            studentId,
            libraryDept,
            approval.student
          );
      } else if (approval.department.deptName === "Library") {
        // Create HOD request(s) for student's branch
        const hodDepts = await prisma.department.findMany({
          where: {
            deptName: `HOD - ${studentBranch}`,
           //Ex-> HOD - Computer Engineering matches exactly avoids matching M.tech in computer engineering
           //Frontend has to add exact branch as given in database to avoid conflicts 
           //run hodSeed.js to get exact branches in database 
          },
        });
        for (const hodDept of hodDepts)
          await createApprovalIfNotExists(studentId, hodDept, approval.student);
      } else if (approval.department.deptName.includes("HOD")) {
        // Create remaining requests for all other departments except Account, Library, and HOD
        const remainingDepts = await prisma.department.findMany({
          where: {
            NOT: { deptName: { in: ["Account", "Library"] } },
            branchId: null, // Only include departments that are not branch-specific
          },
        });

        for (const dept of remainingDepts)
          await createApprovalIfNotExists(studentId, dept, approval.student);
      }
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
async function createApprovalIfNotExists(studentId, dept, student) {
  const existing = await prisma.approvalRequest.findFirst({
    where: { studentId, deptId: dept.deptId },
  });
  if (!existing) {
    await prisma.approvalRequest.create({
      data: {
        status: "PENDING",
        studentName: student.studentName,
        yearOfAdmission: student.profile?.yearOfAdmission,
        deptName: dept.deptName,
        branch: student.profile?.branch,
        student: { connect: { prn: studentId } },
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
