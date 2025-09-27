import prisma from "../prisma.js";

// GET all students whose LC is ready but not yet generated
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

// GET details of a single student's LC
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

    res.json({ success: true, studentProfile: profile });
  } catch (err) {
    console.error("Error fetching LC details:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// POST /registrar/generate-lc/:prn - generate/update LC
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

    if (profile.lcGenerated) {
      return res
        .status(400)
        .json({ error: "LC has already been generated for this student." });
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
      "lcUrl",
    ];

    const updates = {};

    // Copy only allowed fields from req.body
    for (let key of allowedFields) {
      if (req.body[key] !== undefined) {
        // Convert date strings to Date objects
        if (
          [
            "dateOfBirth",
            "yearOfAdmission",
            "dateOfAdmission",
            "dateOfLeaving",
          ].includes(key)
        ) {
          updates[key] = req.body[key] ? new Date(req.body[key]) : null;
        } else {
          updates[key] = req.body[key];
        }
      }
    }

    // Always mark LC as generated
    updates.lcGenerated = true;

    const updatedProfile = await prisma.studentProfile.update({
      where: { prn },
      data: updates,
    });

    console.log(`🎉 LC generated/updated for student ${prn}`);

    res.json({
      success: true,
      message: `LC generated for ${profile.student.studentName}`,
      student: updatedProfile,
    });
  } catch (err) {
    console.error("Error generating/updating LC:", err.message);
    res.status(500).json({ error: err.message });
  }
};
