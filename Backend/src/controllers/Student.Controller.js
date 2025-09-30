import prisma from "../prisma.js";
import { sendEmail } from "../utils/mailer.js";

// Submit LC form
export const submitLCForm = async (req, res) => {
  const prn = req.user.prn; // PRN from JWT
  const {
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

  try {
    const profileData = {
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
    };
    if (studentID) profileData.studentID = studentID;

    // Upsert student profile
    const profile = await prisma.studentProfile.upsert({
      where: { prn },
      update: profileData,
      create: { prn, ...profileData },
    });

    const student = await prisma.student.findUnique({
      where: { prn },
      select: { studentName: true },
    });

    const accountDept = await prisma.department.findFirst({
      where: { deptName: "Account" },
    });
    if (!accountDept)
      return res.status(404).json({ error: "Account department not found" });

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

    res.json({ success: true, message: "LC form submitted", profile });
  } catch (err) {
    console.error(
      "Something went wrong while creating student profile:",
      err.message
    );
    res.status(400).json({ error: err.message });
  }
};

// Get approval status for student

export const getApprovalStatus = async (req, res) => {
  const prn = req.user.prn;

  try {
    const approvals = await prisma.approvalRequest.findMany({
      where: { studentPrn: prn },
      include: {
        department: {
          select: { deptId: true, deptName: true, deptHead: true },
        },
        student: {
          select: {
            email: true,
            profile: { select: { lcGenerated: true, lcUrl: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!approvals.length)
      return res.status(404).json({ error: "No approval requests found" });

    const approvalsWithExtra = await Promise.all(
      approvals.map(async (approval) => {
        const lcUrl =
          approval.student?.profile?.lcGenerated === true
            ? approval.student.profile.lcUrl
            : null;

        if (lcUrl && approval.student?.email) {
          try {
            const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6fa; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">

          <h1 style="text-align: center; color: #4f46e5; margin-bottom: 10px;">Your Leaving Certificate is Ready!</h1>
          <p style="text-align: center; color: #6b7280; font-size: 16px; margin-bottom: 30px;">
            Dear ${approval.studentName || "Student"},
          </p>

          <p style="font-size: 16px; color: #374151;">
            Your Leaving Certificate (LC) has been generated successfully. You can open it by clicking the button below:
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${lcUrl}" 
               target="_blank" 
               style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">
               Open LC
            </a>
          </div>

          <p style="font-size: 14px; color: #9ca3af; text-align: center; margin-top: 30px;">
            Generated on: ${new Date(
              approval.updatedAt
            ).toLocaleDateString()}<br/>
            Regards, <br/>
            <strong>LC-ICEM Admin Team</strong>
          </p>

        </div>
      </div>
    `;

            await sendEmail({
              to: approval.student.email,
              subject: "Your Leaving Certificate is Generated!",
              text: `Dear ${
                approval.studentName || "Student"
              }, your LC has been generated. Open it here: ${lcUrl}`,
              html: htmlContent,
            });

            console.log(`✅ LC email sent to ${approval.student.email}`);
          } catch (err) {
            console.error(
              `❌ Failed to send LC email to ${approval.student.email}:`,
              err.message
            );
          }
        }

        return {
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
          lcUrl,
        };
      })
    );

    res.json({ success: true, approvals: approvalsWithExtra });
  } catch (err) {
    console.error("Error fetching approval status:", err.message);
    res.status(400).json({ error: err.message });
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

    res.json({ success: true, branches });
  } catch (err) {
    console.error("Error fetching HOD branches:", err.message);
    res.status(500).json({ error: "Failed to fetch HOD branches" });
  }
};

// Get REQUESTED_INFO approvals for student
export const getRequestedInfoApprovals = async (req, res) => {
  const prn = req.user.prn;

  try {
    const requests = await prisma.approvalRequest.findMany({
      where: { studentPrn: prn, status: "REQUESTED_INFO" },
      include: { department: { select: { deptName: true } } },
      orderBy: { updatedAt: "desc" },
    });

    if (!requests.length)
      return res
        .status(404)
        .json({ error: "No requests for more information" });

    res.json({ success: true, requests });
  } catch (err) {
    console.error("Error fetching REQUESTED_INFO approvals:", err.message);
    res.status(400).json({ error: err.message });
  }
};

// Resubmit LC form after REQUESTED_INFO
export const resubmitLCForm = async (req, res) => {
  const prn = req.user.prn;
  const { approvalId, updates } = req.body;

  if (!approvalId || !updates)
    return res
      .status(400)
      .json({ error: "approvalId and updates are required" });

  try {
    const approval = await prisma.approvalRequest.findUnique({
      where: { approvalId },
    });

    if (!approval)
      return res.status(404).json({ error: "Approval request not found" });
    if (approval.studentPrn !== prn)
      return res
        .status(403)
        .json({ error: "You cannot update this approval request" });
    if (approval.status !== "REQUESTED_INFO")
      return res
        .status(400)
        .json({ error: "Approval request is not requesting more info" });

    const updatedProfile = await prisma.studentProfile.update({
      where: { prn },
      data: updates,
    });

    const updatedApproval = await prisma.approvalRequest.update({
      where: { approvalId },
      data: { status: "PENDING", remarks: null, updatedAt: new Date() },
    });

    res.json({
      success: true,
      message: "LC form resubmitted successfully",
      profile: updatedProfile,
      approval: updatedApproval,
    });
  } catch (err) {
    console.error("Error resubmitting LC form:", err.message);
    res.status(400).json({ error: err.message });
  }
};

// Get LC form for student
export const getLCForm = async (req, res) => {
  const prn = req.user.prn;

  try {
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
            yearOfAdmission: true,
            branch: true,
            admissionMode: true,
            reasonForLeaving: true,
            lcReady: true,
            lcGenerated: true,
            lcUrl: true,
            isFormEditable: true,
          },
        },
      },
    });

    if (!studentWithProfile || !studentWithProfile.profile)
      return res
        .status(404)
        .json({ error: "LC form not found for this student" });

    res.json({ success: true, lcForm: studentWithProfile });
  } catch (err) {
    console.error("Error fetching LC form:", err.message);
    res.status(400).json({ error: err.message });
  }
};
