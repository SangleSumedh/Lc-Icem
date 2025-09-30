import prisma from "../prisma.js";
import multer from "multer";
import { uploadFile, getSignedFileUrl } from "../utils/s3.js";

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

    const updates = {};

    for (let key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = [
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

    const updatedProfile = await prisma.studentProfile.update({
      where: { prn },
      data: updates,
    });

    res.json({
      success: true,
      message: `Profile updated for ${profile.student.studentName}`,
      studentProfile: updatedProfile,
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
  upload.single("lcPdf"), // frontend must send field name as 'lcPdf'
  async (req, res) => {
    const { prn } = req.params;
    if (!req.file) return res.status(400).json({ error: "No PDF uploaded" });

    try {
      const profile = await prisma.studentProfile.findUnique({
        where: { prn },
      });
      if (!profile) return res.status(404).json({ error: "Student not found" });

      // Upload PDF to S3
      const s3Key = await uploadFile(req.file.path, prn);

      // Update studentProfile: lcUrl and lcGenerated = true
      const updatedProfile = await prisma.studentProfile.update({
        where: { prn },
        data: {
          lcUrl: s3Key,
          lcGenerated: true,
        },
      });

      // Generate signed URL valid for 15 days for student download
      const signedUrl = await getSignedFileUrl(s3Key, 604800);

      res.json({
        success: true,
        message: "LC uploaded to S3 successfully",
        lcUrl: signedUrl,
        studentProfile: updatedProfile,
      });
    } catch (err) {
      console.error("Error uploading LC to S3:", err);
      res.status(500).json({ error: err.message });
    }
  },
];
