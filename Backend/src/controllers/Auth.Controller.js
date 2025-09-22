import prisma from "../prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET not set in environment variables");



export const registerStudent = async (req, res) => {
    const {prn, studentName, email, phoneNo, password} = req.body;
    
    if (!prn || !studentName || !email || !phoneNo || !password) {
    return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const student = await prisma.student.create({
            data: {prn, studentName, email, phoneNo, password: hashedPassword},
        });
        console.log("Student Registered")
        res.json({message: "Registration Successful", student});
    } catch (err) {
        console.log("Something went wrong while registration")
        res.status(400).json({error: err.message})
    }
}


export const loginStudent = async (req, res) => {
    const {email, password} = req.body;

    try {
        const student = await prisma.student.findUnique({where: {email}});
        if (!student) return res.status(400).json({error: "Student not found"});

        const valid = await bcrypt.compare(password, student.password);
        if(!valid) return res.status(401).json({error: "Invalid credentials"});

        const token = jwt.sign({role: "student", prn: student.prn , email: student.email }, JWT_SECRET, {
            expiresIn: "3h",
        })

       res.json({
        success: true,
        message: "Logged In",
        token,
        user: { prn: student.prn, email: student.email }
       });
    } catch (err) {
        res.status(400).json({error: err.message});
    }
}

export const departmentLogin = async (req, res) => {
    const {username, password} = req.body;

    try {
        const dept = await prisma.department.findUnique({where: {username}});
        if(!dept) return res.status(400).json({error: "Department not found"});

        const valid = await bcrypt.compare(password, dept.passwordHash);
        if(!valid) return res.status(401).json({error: "Invalid credentials"});

        const token  = jwt.sign({role: "department", deptId: dept.deptId, deptName: dept.deptName }, JWT_SECRET, {expiresIn: "8h"});
        res.json({
        success: true,
        message: "Logged In as department",
        token,
        user: {deptId: dept.deptId, deptName: dept.deptName }
       });

    } catch (err) {
     res.status(400).json({error: err.message});   
    }
}

export const superAdminLogin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const superAdmin = await prisma.superAdmin.findUnique({ where: { username } });
    if (!superAdmin) return res.status(400).json({ error: "Super Admin not found" });

    const valid = await bcrypt.compare(password, superAdmin.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { role: "superadmin", id: superAdmin.id, username: superAdmin.username },
      JWT_SECRET,
      { expiresIn: "10h" }
    );

    res.json({
      success: true,
      message: "Logged In as Super Admin",
      token,
      user: { id: superAdmin.id, username: superAdmin.username, email: superAdmin.email },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
