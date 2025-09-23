import prisma from "../prisma.js";

export const submitLCForm = async (req, res) => {
  const studentId = req.user.prn; // PRN from JWT
  const {
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

  try {
    // Upsert student profile
    const profile = await prisma.studentProfile.upsert({
      where: { studentID: studentId },
      update: {
        fatherName,
        motherName,
        caste,
        subCaste,
        nationality,
        placeOfBirth,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        dobWords,
        lastCollege,
        yearOfAdmission: yearOfAdmission ? new Date(yearOfAdmission) : null,
        branch,
        admissionMode,
        reasonForLeaving,
      },
      create: {
        prn: studentId,
        studentID: studentId,
        fatherName,
        motherName,
        caste,
        subCaste,
        nationality,
        placeOfBirth,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        dobWords,
        lastCollege,
        yearOfAdmission: yearOfAdmission ? new Date(yearOfAdmission) : null,
        branch,
        admissionMode,
        reasonForLeaving,
      },
    });

    // Fetch only the Account department
    const accountDept = await prisma.department.findFirst({
      where: { deptName: "Account" },
    });

    if (!accountDept) {
      return res.status(404).json({ error: "Account department not found" });
    }

    const existing = await prisma.approvalRequest.findFirst({
      where: { studentId, deptId: accountDept.deptId },
    });

    if (!existing) {
      await prisma.approvalRequest.create({
        data: {
          status: "PENDING",
          studentName: profile.studentName || undefined,
          yearOfAdmission: profile.yearOfAdmission || undefined,
          deptName: accountDept.deptName,
          branch: branch || undefined,
          student: { connect: { prn: studentId } },
          department: { connect: { deptId: accountDept.deptId } },
        },
      });
      console.log(`✅ Created approval request for Account department`);
    }

    res.json({ success: true, message: "LC form submitted", profile });
  } catch (err) {
    console.error(
      "Something went wrong while creating student profile:",
      err.message
    );
    res.status(400).json({ error: err.message });
  }
};

export const getApprovalStatus = async (req, res) => {
  const studentId = req.user.prn;

  try {
    const approvals = await prisma.approvalRequest.findMany({
      where: { studentId },
      include: {
        department: {
          select: { deptId: true, deptName: true, deptHead: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!approvals || approvals.length === 0) {
      return res.status(404).json({ error: "No approval requests found" });
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
    }));

    res.json({
      success: true,
      approvals: approvalsWithExtra,
    });
  } catch (err) {
    console.error("Error fetching approval status:", err.message);
    res.status(400).json({ error: err.message });
  }
};
