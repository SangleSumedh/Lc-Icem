import prisma from "../prisma.js";
import multer from "multer";
import { uploadFile, getSignedFileUrl } from "../utils/s3.js";
import fs from "fs/promises";
import { sendEmail } from "../utils/mailer.js";

// Multer configuration for temporary file storage
const upload = multer({ dest: "tmp/" });

/**
 * GET all students whose LC is ready but not yet generated
 */
export const getPendingLCs = async (req, res) => {
  try {
    const pendingLCs = await prisma.studentProfile.findMany({
      where: { lcReady: true, lcGenerated: false },
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

    if (!profile) {
      return res.status(404).json({ error: "Student not found." });
    }

    // If lcUrl exists, generate signed URL valid for 15 days
    let lcSignedUrl = null;
    if (profile.lcUrl) {
      lcSignedUrl = await getSignedFileUrl(profile.lcUrl, 1296000);
    }

    res.json({ success: true, studentProfile: profile, lcSignedUrl });
  } catch (err) {
    console.error("Error fetching LC details:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /registrar/generate-lc/:prn
 * Update student profile fields (form data)
 */
export const generateLC = async (req, res) => {
  const { prn } = req.params;

  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { prn },
      include: { student: true },
    });

    if (!profile) {
      return res.status(404).json({ error: "Student not found." });
    }

    if (!profile.lcReady) {
      return res
        .status(400)
        .json({ error: "LC is not ready yet for this student." });
    }

    // Whitelist of allowed fields to update
    const allowedProfileFields = [
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
    for (let key of allowedProfileFields) {
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

    // Update studentName if provided
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

    // Merge studentName into profile for frontend consistency
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
 * Upload finalized LC PDF to S3 and update lcUrl + lcGenerated
 */
export const uploadLC = [
  upload.single("lcPdf"),
  async (req, res) => {
    const { prn } = req.params;
    if (!req.file) return res.status(400).json({ error: "No PDF uploaded" });

    let tempFilePath = req.file.path;

    try {
      // 1️⃣ Find the student's profile
      const profile = await prisma.studentProfile.findUnique({
        where: { prn },
      });
      if (!profile) return res.status(404).json({ error: "Student not found" });

      // 2️⃣ Upload PDF to S3
      const s3Key = await uploadFile(tempFilePath, prn);

      // 3️⃣ Generate signed URL valid for 7 days
      const signedUrl = await getSignedFileUrl(s3Key, 604800);

      // 4️⃣ Update DB
      const updatedProfile = await prisma.studentProfile.update({
        where: { prn },
        data: { lcUrl: signedUrl, lcGenerated: true },
      });

      // 5️⃣ Send email (optional failure handling)
      if (profile.student?.email) {
        try {
          const htmlContent = `
            <div style="font-family: Helvetica, Arial, sans-serif; background-color: #f4f6fa; padding: 30px;">
              <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                <h1 style="text-align: center; color: #4f46e5;">Your Leaving Certificate is Ready!</h1>
                <p style="text-align: center; color: #6b7280; font-size: 16px;">
                  Dear ${profile.student.studentName || "Student"},
                </p>
                <p style="font-size: 16px; color: #374151;">
                  Your Leaving Certificate (LC) has been generated successfully. You can open it by clicking the button below or download the attached file:
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${signedUrl}" target="_blank" 
                     style="display: inline-block; background-color: #4f46e5; color: #fff; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    Open LC
                  </a>
                </div>
                <p style="font-size: 14px; color: #9ca3af; text-align: center; margin-top: 30px;">
                  Generated on: ${new Date().toLocaleDateString()}<br/>
                  Regards,<br/>
                  <strong>LC-ICEM Admin Team</strong>
                </p>
              </div>
            </div>
          `;

          await sendEmail({
            to: profile.student.email,
            subject: "Your Leaving Certificate is Generated!",
            text: `Dear ${
              profile.student.studentName || "Student"
            }, your LC has been generated. Open it here: ${signedUrl}`,
            html: htmlContent,
            attachments: [{ path: tempFilePath }],
          });

          console.log(`✅ Email sent to ${profile.student.email}`);
        } catch (emailErr) {
          console.error(
            `❌ Failed to send email to ${profile.student.email}:`,
            emailErr.message
          );
        }
      }

      res.json({
        success: true,
        message: "LC uploaded to S3 successfully",
        lcUrl: signedUrl,
        studentProfile: updatedProfile,
      });
    } catch (err) {
      console.error("Error uploading LC:", err);
      res.status(500).json({ error: err.message });
    } finally {
      // Clean up temporary file regardless of success/failure
      try {
        await fs.unlink(tempFilePath);
      } catch (cleanupErr) {
        console.warn("⚠️ Failed to delete temp file:", cleanupErr.message);
      }
    }
  },
];
