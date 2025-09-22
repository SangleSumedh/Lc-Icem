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
    });

    if (!approval) {
      return res.status(404).json({ error: "Approval request not found" });
    }

    if (approval.deptId != deptId) {
      return res
        .status(403)
        .json({ error: "You cannot modify this approval request" });
    }

    const updatedApproval = await prisma.approvalRequest.update({
      where: { approvalId },
      data: {
        status,
        remarks,
        approvedAt: new Date(),
      },
    });

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