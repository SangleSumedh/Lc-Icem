import prisma from "../prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET not set in environment variables");

export const registerStudent = async (req, res) => {
  const { prn, studentName, email, phoneNo, password, college } = req.body;

  if (!prn || !studentName || !email || !phoneNo || !password || !college) {
    return res
      .status(400)
      .json({ error: "All fields are required, including college" });
  }

  const allowedColleges = ["ICEM", "IGSB"];
  if (!allowedColleges.includes(college)) {
    return res.status(400).json({ error: "Invalid college value" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const student = await prisma.student.create({
      data: {
        prn,
        studentName,
        email,
        phoneNo,
        password: hashedPassword,
        college,
      },
    });

    console.log("Student Registered");
    res.json({ message: "Registration Successful", student });
  } catch (err) {
    console.error("Something went wrong during registration:", err.message);
    res.status(400).json({ error: err.message });
  }
};

export const loginStudent = async (req, res) => {
  const { email, password  } = req.body;

  try {
    const student = await prisma.student.findUnique({ where: { email } });
    if (!student) return res.status(400).json({ error: "Student not found" });

    const valid = await bcrypt.compare(password, student.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { role: "student", prn: student.prn, email: student.email },
      JWT_SECRET,
      { expiresIn: "3h" }
    );

    res.json({
      success: true,
      message: "Logged In",
      token,
      user: { prn: student.prn, email: student.email, college: student.college },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const staffLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const staff = await prisma.staff.findUnique({
      where: { email },
      include: { department: true },
    });
    if (!staff) return res.status(400).json({ error: "Staff not found" });

    const valid = await bcrypt.compare(password, staff.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    // 🔹 Generate JWT
    const token = jwt.sign(
      {
        role: "department",
        staffId: staff.staffId,
        deptId: staff.deptId,
        name: staff.name,
        deptName: staff.department.deptName,
        email: staff.email,
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    // 🔹 Create staff login log
    try {
      await prisma.staffLoginLog.create({
        data: {
          staffId: staff.staffId,
          staffName: staff.name,
          ipAddress: req.ip || null,
          userAgent: req.headers["user-agent"] || null,
        },
      });
      console.log(`✅ Staff login logged for ${staff.name}`);
    } catch (logErr) {
      console.error("⚠️ Failed to create staff login log:", logErr.message);
      // Do not block login if logging fails
    }

    res.json({
      success: true,
      message: "Logged In as Department",
      token,
      user: {
        staffId: staff.staffId,
        name: staff.name,
        deptId: staff.deptId,
        deptName: staff.department.deptName,
        email: staff.email,
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const superAdminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const superAdmin = await prisma.superAdmin.findUnique({ where: { email } });
    if (!superAdmin)
      return res.status(400).json({ error: "Super Admin not found" });

    const valid = await bcrypt.compare(password, superAdmin.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { role: "superadmin", id: superAdmin.id, email: superAdmin.email },
      JWT_SECRET,
      { expiresIn: "10h" }
    );

    res.json({
      success: true,
      message: "Logged In as Super Admin",
      token,
      user: { id: superAdmin.id, email: superAdmin.email },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Change Staff Password
 * Expects: { oldPassword, newPassword }
 * Requires: staffId from JWT (req.user.staffId)
 */
export const changeStaffPassword = async (req, res) => {
  const staffId = req.user.staffId; // Ensure you have auth middleware
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ error: "Both old and new passwords are required" });
  }

  try {
    // 1️⃣ Get staff
    const staff = await prisma.staff.findUnique({ where: { staffId } });
    if (!staff) return res.status(404).json({ error: "Staff not found" });

    // 2️⃣ Check old password
    const isValid = await bcrypt.compare(oldPassword, staff.passwordHash);
    if (!isValid) return res.status(401).json({ error: "Old password is incorrect" });

    // 3️⃣ Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4️⃣ Update password in DB
    await prisma.staff.update({
      where: { staffId },
      data: { passwordHash: hashedPassword },
    });

    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error("Error changing staff password:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Change Student Password
 * Expects: { oldPassword, newPassword }
 * Requires: prn from JWT (req.user.prn)
 */
export const changeStudentPassword = async (req, res) => {
  const prn = req.user.prn; // Ensure you have auth middleware
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ error: "Both old and new passwords are required" });
  }

  try {
    // 1️⃣ Get student
    const student = await prisma.student.findUnique({ where: { prn } });
    if (!student) return res.status(404).json({ error: "Student not found" });

    // 2️⃣ Check old password
    const isValid = await bcrypt.compare(oldPassword, student.password);
    if (!isValid) return res.status(401).json({ error: "Old password is incorrect" });

    // 3️⃣ Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4️⃣ Update password in DB
    await prisma.student.update({
      where: { prn },
      data: { password: hashedPassword },
    });

    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error("Error changing student password:", err.message);
    res.status(500).json({ error: err.message });
  }
};


/**
 * Change SuperAdmin Password
 * Expects: { oldPassword, newPassword }
 * Requires: prn from JWT (req.user.prn)
 */
export const changeSuperAdminPassword = async (req, res) => {
  const adminId = req.user.id; // Comes from JWT
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ error: "Both old and new passwords are required" });
  }

  try {
    // 1️⃣ Get super admin
    const admin = await prisma.superAdmin.findUnique({
      where: { id: adminId },
    });
    if (!admin) return res.status(404).json({ error: "Super Admin not found" });

    // 2️⃣ Check old password
    const isValid = await bcrypt.compare(oldPassword, admin.password);
    if (!isValid)
      return res.status(401).json({ error: "Old password is incorrect" });

    // 3️⃣ Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4️⃣ Update password in DB
    await prisma.superAdmin.update({
      where: { id: adminId },
      data: { password: hashedPassword },
    });

    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error("Error changing super admin password:", err.message);
    res.status(500).json({ error: err.message });
  }
};
