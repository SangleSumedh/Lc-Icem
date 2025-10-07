import prisma from "../prisma.js";
import multer from "multer";
import { uploadFile, getSignedFileUrl } from "../utils/s3.js";
import fs from "fs/promises";
import path from "path";
import { sendEmail, emailTemplates } from "../utils/mailer.js";
import { handlePrismaError } from "../utils/handlePrismaError.js";
import { sendResponse } from "../utils/sendResponse.js";

// Multer configuration for temporary file storage (unchanged)
const upload = multer({ dest: path.join(process.cwd(), "tmp") });

// Date handling utility functions (unchanged)
const parseDate = (dateString) => {
  if (!dateString) return null;
  // If it's already a Date object or timestamp, convert to ISO string first
  if (dateString instanceof Date) {
    return new Date(dateString);
  }
  // If it's a timestamp number, convert to Date
  if (typeof dateString === "number") {
    return new Date(dateString);
  }
  // If it's ISO string or date string, parse normally
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

const formatDateForFrontend = (date) => {
  if (!date) return null;
  // For date-only fields, return YYYY-MM-DD format
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split("T")[0]; // Returns "YYYY-MM-DD"
};

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
            college: true,
          },
        },
      },
      orderBy: { prn: "asc" },
    });

    if (!pendingLCs.length) {
      return sendResponse(res, false, "No pending LCs found", null, 404);
    }

    // Format dates for frontend (unchanged)
    const formattedPendingLCs = pendingLCs.map((lc) => ({
      ...lc,
      dateOfBirth: formatDateForFrontend(lc.dateOfBirth),
      dateOfAdmission: formatDateForFrontend(lc.dateOfAdmission),
      dateOfLeaving: formatDateForFrontend(lc.dateOfLeaving),
      // yearOfAdmission remains as integer
    }));

    return sendResponse(res, true, "Pending LCs fetched successfully", {
      pendingLCs: formattedPendingLCs,
    });
  } catch (err) {
    console.error("Error fetching pending LCs:", err.message);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "get_pending_lcs",
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

/**
 * GET details of a single student's LC
 */
export const getLCDetails = async (req, res) => {
  try {
    const { prn } = req.params;

    const profile = await prisma.studentProfile.findUnique({
      where: { prn },
      include: {
        student: {
          select: {
            prn: true,
            studentName: true,
            email: true,
            phoneNo: true,
            college: true,
          },
        },
      },
    });

    if (!profile) {
      return sendResponse(res, false, "Student not found", null, 404);
    }

    let lcSignedUrl = null;
    if (profile.lcUrl) {
      lcSignedUrl = await getSignedFileUrl(profile.lcUrl, 1296000); // 15 days
    }

    // Format dates for frontend (unchanged)
    const formattedProfile = {
      ...profile,
      dateOfBirth: formatDateForFrontend(profile.dateOfBirth),
      dateOfAdmission: formatDateForFrontend(profile.dateOfAdmission),
      dateOfLeaving: formatDateForFrontend(profile.dateOfLeaving),
      // yearOfAdmission remains as integer
    };

    return sendResponse(res, true, "LC details fetched successfully", {
      studentProfile: formattedProfile,
      lcSignedUrl,
    });
  } catch (err) {
    console.error("Error fetching LC details:", err.message);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "get_lc_details",
      prn: req.params.prn,
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

/**
 * POST /registrar/generate-lc/:prn
 * Update student profile fields with proper date handling
 */
export const generateLC = async (req, res) => {
  try {
    const { prn } = req.params;

    const profile = await prisma.studentProfile.findUnique({
      where: { prn },
      include: { student: true },
    });

    if (!profile) {
      return sendResponse(res, false, "Student not found", null, 404);
    }
    if (!profile.lcReady) {
      return sendResponse(res, false, "LC is not ready yet", null, 400);
    }

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
        if (["dateOfBirth", "dateOfAdmission", "dateOfLeaving"].includes(key)) {
          // Handle date fields (unchanged)
          profileUpdates[key] = req.body[key] ? parseDate(req.body[key]) : null;
        } else if (key === "yearOfAdmission") {
          // Handle yearOfAdmission as integer (unchanged)
          profileUpdates[key] = req.body[key] ? parseInt(req.body[key]) : null;
        } else {
          // Handle all other fields (unchanged)
          profileUpdates[key] = req.body[key];
        }
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

    // Format dates for response (unchanged)
    const formattedProfile = {
      ...updatedProfile,
      studentName: updatedStudent?.studentName || profile.student.studentName,
      dateOfBirth: formatDateForFrontend(updatedProfile.dateOfBirth),
      dateOfAdmission: formatDateForFrontend(updatedProfile.dateOfAdmission),
      dateOfLeaving: formatDateForFrontend(updatedProfile.dateOfLeaving),
    };

    return sendResponse(
      res,
      true,
      `Profile updated for ${formattedProfile.studentName}`,
      { studentProfile: formattedProfile }
    );
  } catch (err) {
    console.error("Error updating LC profile:", err.message);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "generate_lc",
      prn: req.params.prn,
    });

    return sendResponse(res, false, message, null, statusCode);
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

    if (!req.file) {
      return sendResponse(res, false, "No PDF uploaded", null, 400);
    }

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
        return sendResponse(res, false, "Student not found", null, 404);
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

      // 5️⃣ Send email using email template
      let emailSent = false;
      let emailError = null;

      if (profile.student?.email) {
        try {
          console.log(
            `📨 Attempting to send email to: ${profile.student.email}`
          );

          // Use the email template from mailer
          const emailTemplate = emailTemplates.lcReady(
            profile.student.studentName || "Student",
            prn,
            signedUrl
          );

          await sendEmail({
            to: profile.student.email,
            subject: emailTemplate.subject,
            text: emailTemplate.text,
            html: emailTemplate.html,
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

      const responseMessage = emailSent
        ? "LC uploaded to S3 and email sent successfully"
        : "LC uploaded to S3 successfully" +
          (emailError ? ", but email failed" : "");

      return sendResponse(res, true, responseMessage, {
        lcUrl: signedUrl,
        studentProfile: updatedProfile,
        emailSent,
        ...(emailError && { emailError }),
      });
    } catch (err) {
      console.error("Error uploading LC:", err);

      const { message, statusCode } = handlePrismaError(err, {
        operation: "upload_lc",
        prn: req.params.prn,
      });

      return sendResponse(res, false, message, null, statusCode);
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
