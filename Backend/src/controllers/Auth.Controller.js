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
  const { email, password } = req.body;

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
      user: { prn: student.prn, email: student.email },
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
