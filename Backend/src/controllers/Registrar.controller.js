import prisma from "../prisma.js";
import multer from "multer";
import { uploadFile, getSignedFileUrl } from "../utils/s3.js";
import fs from "fs/promises";
import path from "path";
import { sendEmail } from "../utils/mailer.js";

// Multer configuration for temporary file storage
const upload = multer({ dest: path.join(process.cwd(), "tmp") });

/**
 * GET all students whose LC is ready but not yet generated
 */
export const getPendingLCs = async (req, res) => {
  try {
    const pendingLCs = await prisma.studentProfile.findMany({
      where: { lcReady: true, lcGenerated: false },
      include: {
        student: {
          select: { prn: true, studentName: true, email: true, phoneNo: true },
        },
      },
      orderBy: { prn: "asc" },
    });

    if (!pendingLCs.length) {
      return res.status(404).json({ message: "No pending LCs found." });
    }

    res.json({ success: true, pendingLCs });
  } catch (err) {
    console.error("Error fetching pending LCs:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET details of a single student's LC
 */
export const getLCDetails = async (req, res) => {
  const { prn } = req.params;

  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { prn },
      include: {
        student: {
          select: { prn: true, studentName: true, email: true, phoneNo: true },
        },
      },
    });

    if (!profile) return res.status(404).json({ error: "Student not found." });

    let lcSignedUrl = null;
    if (profile.lcUrl) {
      lcSignedUrl = await getSignedFileUrl(profile.lcUrl, 1296000); // 15 days
    }

    res.json({ success: true, studentProfile: profile, lcSignedUrl });
  } catch (err) {
    console.error("Error fetching LC details:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /registrar/generate-lc/:prn
 * Update student profile fields
 */
export const generateLC = async (req, res) => {
  const { prn } = req.params;

  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { prn },
      include: { student: true },
    });

    if (!profile) return res.status(404).json({ error: "Student not found." });
    if (!profile.lcReady)
      return res.status(400).json({ error: "LC is not ready yet." });

    const allowedFields = [
      "studentID",
      "fatherName",
      "motherName",
      "caste",
      "subCaste",
      "nationality",
      "placeOfBirth",
      "dateOfBirth",
      "dobWords",
      "lastCollege",
      "yearOfAdmission",
      "branch",
      "admissionMode",
      "reasonForLeaving",
      "dateOfAdmission",
      "dateOfLeaving",
      "progressAndConduct",
    ];

    const profileUpdates = {};
    for (let key of allowedFields) {
      if (req.body[key] !== undefined) {
        profileUpdates[key] = [
          "dateOfBirth",
          "yearOfAdmission",
          "dateOfAdmission",
          "dateOfLeaving",
        ].includes(key)
          ? req.body[key]
            ? new Date(req.body[key])
            : null
          : req.body[key];
      }
    }

    let updatedStudent = null;
    if (req.body.studentName) {
      updatedStudent = await prisma.student.update({
        where: { prn },
        data: { studentName: req.body.studentName },
      });
    }

    const updatedProfile = await prisma.studentProfile.update({
      where: { prn },
      data: profileUpdates,
    });

    const mergedProfile = {
      ...updatedProfile,
      studentName: updatedStudent?.studentName || profile.student.studentName,
    };

    res.json({
      success: true,
      message: `Profile updated for ${mergedProfile.studentName}`,
      studentProfile: mergedProfile,
    });
  } catch (err) {
    console.error("Error updating LC profile:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /registrar/upload-lc/:prn
 * Upload finalized LC PDF to S3, update lcUrl + lcGenerated, send email
 */
export const uploadLC = [
  upload.single("lcPdf"),
  async (req, res) => {
    const { prn } = req.params;

    if (!req.file) return res.status(400).json({ error: "No PDF uploaded" });

    const tempFilePath = path.resolve(req.file.path);
    let fileReadSuccessfully = false;
    let pdfBuffer = null;

    try {
      // 1️⃣ Find student profile WITH student relation
      const profile = await prisma.studentProfile.findUnique({
        where: { prn },
        include: {
          student: {
            select: { email: true, studentName: true },
          },
        },
      });

      if (!profile) {
        return res.status(404).json({ error: "Student not found" });
      }

      console.log(`📧 Preparing to send email to: ${profile.student?.email}`);

      // 2️⃣ Read file buffer FIRST
      pdfBuffer = await fs.readFile(tempFilePath);
      fileReadSuccessfully = true;

      // 3️⃣ Upload PDF to S3
      const s3Key = await uploadFile(tempFilePath, prn);
      const signedUrl = await getSignedFileUrl(s3Key, 604800);

      // 4️⃣ Update DB
      const updatedProfile = await prisma.studentProfile.update({
        where: { prn },
        data: { lcUrl: signedUrl, lcGenerated: true },
      });

      // 5️⃣ Send email
      let emailSent = false;
      let emailError = null;

      if (profile.student?.email) {
        try {
          console.log(
            `📨 Attempting to send email to: ${profile.student.email}`
          );

          const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leaving Certificate Ready</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; padding: 40px 0;">
        <tr>
            <td align="center">
                <!-- Header with College Branding -->
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0; padding: 30px;">
                    <tr>
                        <td align="center">
                            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Indira College of Engineering and Management</h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Leaving Certificate Department</p>
                        </td>
                    </tr>
                </table>

                <!-- Main Content Card -->
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background: #ffffff; border-radius: 0 0 12px 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="padding: 40px;">
                            <!-- Success Icon -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 30px;">
                                        <div style="background: #10b981; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                                                <path d="M20 6L9 17l-5-5"/>
                                            </svg>
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Title -->
                            <h2 style="color: #1f2937; text-align: center; margin: 0 0 16px 0; font-size: 24px; font-weight: 700;">
                                Leaving Certificate Generated Successfully
                            </h2>

                            <!-- Student Greeting -->
                            <p style="color: #6b7280; text-align: center; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                Dear <strong style="color: #374151;">${
                                  profile.student.studentName || "Student"
                                }</strong>,
                            </p>

                            <!-- Main Message -->
                            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                                We are pleased to inform you that your Leaving Certificate has been officially generated and is now ready for access. This document has been verified by the college administration. Please Download the LC within 7 days of generation else the LC will be deleted from cloud.
                                Visit Registrar office at ICEM to collect official document.
                            </p>

                            <!-- Important Information -->
                            <div style="background: #f0f9ff; border-left: 4px solid #0369a1; padding: 20px; margin: 25px 0; border-radius: 4px;">
                                <p style="color: #075985; margin: 0; font-size: 14px; font-weight: 600;">Important Information:</p>
                                <ul style="color: #075985; margin: 8px 0 0 0; padding-left: 20px; font-size: 14px;">
                                    <li>PRN: <strong>${prn}</strong></li>
                                    <li>Certificate generated on: <strong>${new Date().toLocaleDateString(
                                      "en-IN",
                                      {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      }
                                    )}</strong></li>
                                    <li>This is an electronically generated document</li>
                                </ul>
                            </div>

                            <!-- Action Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="${signedUrl}" 
                                           target="_blank"
                                           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                                  color: white; 
                                                  text-decoration: none; 
                                                  padding: 16px 32px; 
                                                  border-radius: 8px; 
                                                  font-weight: 600; 
                                                  font-size: 16px;
                                                  display: inline-block;
                                                  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                                                  transition: all 0.3s ease;">
                                            📄 Download Leaving Certificate
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Additional Instructions -->
                            <div style="background: #fefce8; border: 1px solid #fef08a; padding: 16px; border-radius: 8px; margin: 25px 0;">
                                <p style="color: #854d0e; margin: 0; font-size: 14px; text-align: center;">
                                    <strong>Note:</strong> The attached PDF contains your official Leaving Certificate. 
                                    Please keep this document safe for future reference.
                                </p>
                            </div>

                            <!-- Contact Information -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                                <tr>
                                    <td align="center">
                                        <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">
                                            For any queries, please contact:
                                        </p>
                                        <p style="color: #374151; font-size: 14px; margin: 0; font-weight: 600;">
                                            Registrar Office • Indira College of Engineering and Management<br>
                                            Email: registrar@indiraicem.ac.in • Phone: +91-20-12345678
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <!-- Footer -->
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px;">
                    <tr>
                        <td align="center">
                            <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0;">
                                This is an auto-generated email. Please do not reply to this message.<br>
                                &copy; ${new Date().getFullYear()} Indira College of Engineering and Management. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

          await sendEmail({
            to: profile.student.email,
            subject: "Your LC is Ready!",
            text: `Dear ${
              profile.student.studentName || "Student"
            }, your LC is generated. Download it from: ${signedUrl}`,
            html: htmlContent,
            attachments: [
              {
                filename: `LC_${prn}.pdf`,
                content: pdfBuffer,
                contentType: "application/pdf",
              },
            ],
          });

          emailSent = true;
          console.log(`✅ Email sent successfully to ${profile.student.email}`);
        } catch (emailErr) {
          emailError = emailErr.message;
          console.error(
            `❌ Failed to send email to ${profile.student.email}:`,
            emailErr.message
          );
        }
      } else {
        console.log("⚠️ No email address found for student");
      }

      res.json({
        success: true,
        message: emailSent
          ? "LC uploaded to S3 and email sent successfully"
          : "LC uploaded to S3 successfully" +
            (emailError ? ", but email failed" : ""),
        lcUrl: signedUrl,
        studentProfile: updatedProfile,
        emailSent,
        ...(emailError && { emailError }),
      });
    } catch (err) {
      console.error("Error uploading LC:", err);
      res.status(500).json({ error: err.message });
    } finally {
      // Clean up temp file only if we haven't processed it successfully
      if (!fileReadSuccessfully) {
        try {
          await fs.unlink(tempFilePath);
          console.log("✅ Temporary file cleaned up");
        } catch (cleanupErr) {
          console.warn("⚠️ Failed to delete temp file:", cleanupErr.message);
        }
      }
    }
  },
];
