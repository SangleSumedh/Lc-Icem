import prisma from "../prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { handlePrismaError } from "../utils/handlePrismaError.js";
import { sendResponse } from "../utils/sendResponse.js";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET not set in environment variables");

export const registerStudent = async (req, res) => {
  try {
    const { prn, studentName, email, phoneNo, password, college } = req.body;

    // Validate required fields
    if (!prn || !studentName || !email || !phoneNo || !password || !college) {
      return sendResponse(
        res,
        false,
        "All fields are required, including college",
        null,
        400
      );
    }

    // Validate college
    const allowedColleges = ["ICEM", "IGSB"];
    if (!allowedColleges.includes(college)) {
      return sendResponse(
        res,
        false,
        "Invalid college value. Must be one of: ICEM, IGSB",
        null,
        400
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendResponse(
        res,
        false,
        "Please provide a valid email address",
        null,
        400
      );
    }

    // Validate phone number
    if (!/^\d{10}$/.test(phoneNo)) {
      return sendResponse(
        res,
        false,
        "Phone number must be exactly 10 digits",
        null,
        400
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await prisma.student.create({
      data: {
        prn,
        studentName: studentName.trim(),
        email: email, // KEEP ORIGINAL CASE
        phoneNo,
        password: hashedPassword,
        college,
      },
      select: {
        prn: true,
        studentName: true,
        email: true,
        phoneNo: true,
        college: true,
      },
    });

    console.log(`✅ Student Registered: ${studentName} (PRN: ${prn})`);

    return sendResponse(res, true, "Registration Successful", student, 201);
  } catch (err) {
    console.error("Student registration error:", err);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "student_registration",
      email: req.body.email,
      prn: req.body.prn,
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

export const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return sendResponse(
        res,
        false,
        "Email and password are required",
        null,
        400
      );
    }

    const student = await prisma.student.findUnique({
      where: { email }, // KEEP ORIGINAL CASE SEARCH
    });

    if (!student) {
      return sendResponse(res, false, "Student not found", null, 404);
    }

    const valid = await bcrypt.compare(password, student.password);
    if (!valid) {
      return sendResponse(res, false, "Invalid credentials", null, 401);
    }

    const token = jwt.sign(
      {
        role: "student",
        prn: student.prn,
        email: student.email,
        college: student.college,
      },
      JWT_SECRET,
      { expiresIn: "3h" }
    );

    return sendResponse(res, true, "Logged in successfully", {
      token,
      user: {
        prn: student.prn,
        email: student.email,
        college: student.college,
        studentName: student.studentName,
      },
    });
  } catch (err) {
    console.error("Student login error:", err);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "student_login",
      email: req.body.email,
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

export const staffLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return sendResponse(
        res,
        false,
        "Email and password are required",
        null,
        400
      );
    }

    const staff = await prisma.staff.findUnique({
      where: { email }, // KEEP ORIGINAL CASE SEARCH
      include: { department: true },
    });

    if (!staff) {
      return sendResponse(res, false, "Staff not found", null, 404);
    }

    const valid = await bcrypt.compare(password, staff.passwordHash);
    if (!valid) {
      return sendResponse(res, false, "Invalid credentials", null, 401);
    }

    // Generate JWT
    const token = jwt.sign(
      {
        role: "department",
        staffId: staff.staffId,
        deptId: staff.deptId,
        name: staff.name,
        deptName: staff.department?.deptName || "Unknown Department",
        email: staff.email,
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    // Create staff login log
    try {
      await prisma.staffLoginLog.create({
        data: {
          staffId: staff.staffId,
          staffName: staff.name,
          ipAddress: req.body.ip || req.connection.remoteAddress || null,
          userAgent: req.headers["user-agent"] || null,
        },
      });
      console.log(`✅ Staff login logged for ${staff.name}`);
    } catch (logErr) {
      console.error("⚠️ Failed to create staff login log:", logErr.message);
      // Do not block login if logging fails
    }

    return sendResponse(
      res,
      true,
      "Logged in successfully as department staff",
      {
        token,
        user: {
          staffId: staff.staffId,
          name: staff.name,
          deptId: staff.deptId,
          deptName: staff.department?.deptName || "Unknown Department",
          email: staff.email,
        },
      }
    );
  } catch (err) {
    console.error("Staff login error:", err);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "staff_login",
      email: req.body.email,
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

export const superAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return sendResponse(
        res,
        false,
        "Email and password are required",
        null,
        400
      );
    }

    const superAdmin = await prisma.superAdmin.findUnique({
      where: { email }, // KEEP ORIGINAL CASE SEARCH
    });

    if (!superAdmin) {
      return sendResponse(res, false, "Super admin not found", null, 404);
    }

    const valid = await bcrypt.compare(password, superAdmin.password);
    if (!valid) {
      return sendResponse(res, false, "Invalid credentials", null, 401);
    }

    const token = jwt.sign(
      {
        role: "superadmin",
        id: superAdmin.id,
        email: superAdmin.email,
        username: superAdmin.username,
      },
      JWT_SECRET,
      { expiresIn: "10h" }
    );

    return sendResponse(res, true, "Logged in successfully as super admin", {
      token,
      user: {
        id: superAdmin.id,
        email: superAdmin.email,
        username: superAdmin.username,
      },
    });
  } catch (err) {
    console.error("Super admin login error:", err);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "super_admin_login",
      email: req.body.email,
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

// Password change functions remain the same (they don't affect emails)
export const changeStaffPassword = async (req, res) => {
  try {
    const staffId = req.user.staffId;
    const { oldPassword, newPassword } = req.body;

    // Validate required fields
    if (!oldPassword || !newPassword) {
      return sendResponse(
        res,
        false,
        "Both old and new passwords are required",
        null,
        400
      );
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return sendResponse(
        res,
        false,
        "New password must be at least 6 characters long",
        null,
        400
      );
    }

    // Get staff
    const staff = await prisma.staff.findUnique({
      where: { staffId },
    });

    if (!staff) {
      return sendResponse(res, false, "Staff not found", null, 404);
    }

    // Check old password
    const isValid = await bcrypt.compare(oldPassword, staff.passwordHash);
    if (!isValid) {
      return sendResponse(res, false, "Old password is incorrect", null, 401);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.staff.update({
      where: { staffId },
      data: { passwordHash: hashedPassword },
    });

    console.log(`✅ Password changed for staff ID: ${staffId}`);

    return sendResponse(res, true, "Password changed successfully");
  } catch (err) {
    console.error("Change staff password error:", err);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "change_staff_password",
      staffId: req.user.staffId,
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

export const changeStudentPassword = async (req, res) => {
  try {
    const prn = req.user.prn;
    const { oldPassword, newPassword } = req.body;

    // Validate required fields
    if (!oldPassword || !newPassword) {
      return sendResponse(
        res,
        false,
        "Both old and new passwords are required",
        null,
        400
      );
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return sendResponse(
        res,
        false,
        "New password must be at least 6 characters long",
        null,
        400
      );
    }

    // Get student
    const student = await prisma.student.findUnique({
      where: { prn },
    });

    if (!student) {
      return sendResponse(res, false, "Student not found", null, 404);
    }

    // Check old password
    const isValid = await bcrypt.compare(oldPassword, student.password);
    if (!isValid) {
      return sendResponse(res, false, "Old password is incorrect", null, 401);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.student.update({
      where: { prn },
      data: { password: hashedPassword },
    });

    console.log(`✅ Password changed for student PRN: ${prn}`);

    return sendResponse(res, true, "Password changed successfully");
  } catch (err) {
    console.error("Change student password error:", err);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "change_student_password",
      prn: req.user.prn,
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

export const changeSuperAdminPassword = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    // Validate required fields
    if (!oldPassword || !newPassword) {
      return sendResponse(
        res,
        false,
        "Both old and new passwords are required",
        null,
        400
      );
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return sendResponse(
        res,
        false,
        "New password must be at least 6 characters long",
        null,
        400
      );
    }

    // Get super admin
    const admin = await prisma.superAdmin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      return sendResponse(res, false, "Super admin not found", null, 404);
    }

    // Check old password
    const isValid = await bcrypt.compare(oldPassword, admin.password);
    if (!isValid) {
      return sendResponse(res, false, "Old password is incorrect", null, 401);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.superAdmin.update({
      where: { id: adminId },
      data: { password: hashedPassword },
    });

    console.log(`✅ Password changed for super admin ID: ${adminId}`);

    return sendResponse(res, true, "Password changed successfully");
  } catch (err) {
    console.error("Change super admin password error:", err);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "change_super_admin_password",
      adminId: req.user.id,
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};
