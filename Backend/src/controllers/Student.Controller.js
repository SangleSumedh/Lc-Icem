import prisma from "../prisma.js";

export const submitLCForm = async (req, res) => {
  const studentId = req.user.prn; //Prn from JWT
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

    const departments = await prisma.department.findMany();

    for (const dept of departments) {
      const existing = await prisma.approvalRequest.findFirst({
        where: { studentId, deptId: dept.deptId },
      });

      if (!existing) {
        await prisma.approvalRequest.create({
          data: {
            status: "PENDING",
            student: { connect: { prn: studentId } },
            department: { connect: { deptId: dept.deptId } },
          },
        });
        console.log(`✅ Created approval request for dept ${dept.deptName}`);
      }
    }

    res.json({ success: true, message: "LC form submitted", profile });
  } catch (err) {
    console.log("Something went wrong while creating student profile");
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
    });

    if (!approvals || approvals.length === 0) {
      return res.status(404).json({ error: "No approval requests found" });
    }

    res.json({
      success: true,
      approvals,
    });
  } catch (err) {
    console.error("Error fetching approval status:", err.message);
    res.status(400).json({ error: err.message });
  }
};
