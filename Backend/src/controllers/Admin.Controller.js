import prisma from "../prisma.js";
import bcrypt from "bcrypt";

/* 
    Add a new Department 
    req.body: {deptName, username, email, password, branchId (optional)}
*/

export const addDepartment = async (req, res) => {
  const { deptName, username, email, password, branchId } = req.body;

  if (!deptName || !username || !email || !password) {
    return res
      .status(400)
      .json({ error: "All fields are required except branchId" });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const department = await prisma.department.create({
      data: {
        deptName,
        username,
        email,
        passwordHash,
        branchId: branchId || null,
      },
    });

    console.log(`Department ${deptName} created by superadmin`);

    res.json({
      success: true,
      message: "Department created successfully",
      department: {
        deptId: department.deptId,
        deptName: department.deptName,
        username: department.username,
        email: department.email,
        branchId: department.branchId,
      },
    });
  } catch (err) {
    console.log("error creating department", err.message);
    res.status(400).json({ error: err.message });
  }
};

/*
    Update department Head
    req.body: {deptId, deptHead}
*/

export const updateDepartmentHead = async (req, res) => {
  const { deptId, deptHead } = req.body;

  if (!deptId || !deptHead) {
    return res.status(400).json({ error: "deptId and deptHead are required" });
  }

  try {
    const updatedDept = await prisma.department.update({
      where: { deptId: Number(deptId) },
      data: { deptHead },
    });

    console.log(
      `✅ Department ${updatedDept.deptName} head updated to ${deptHead}`
    );

    res.json({
      success: true,
      message: `Department head updated successfully`,
      department: {
        deptId: updatedDept.deptId,
        deptName: updatedDept.deptName,
        deptHead: updatedDept.deptHead,
      },
    });
  } catch (err) {
    console.error("Error updating department head:", err.message);
    res.status(400).json({ error: err.message });
  }
};

export const deleteDepartment = async (req, res) => {
  const { deptId } = req.body;

  if (!deptId) {
    return res
      .status(400)
      .json({ success: false, error: "deptId is required" });
  }

  try {
    const department = await prisma.department.findUnique({
      where: { deptId: Number(deptId) },
    });

    if (!department) {
      return res
        .status(404)
        .json({ success: false, error: "department does not exist" });
    }

    const deletedDept = await prisma.department.delete({
      where: { deptId: Number(deptId) },
    });

    console.log(`Department ${deletedDept.deptName} deleted by superadmin`);

    res.json({
      success: true,
      message: `Department ${deletedDept.deptName} deleted successfully`,
      department: {
        deptId: deletedDept.deptId,
        deptName: deletedDept.deptName,
      },
    });
  } catch (err) {
    if (err.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, error: "Department Not Found" });
    }
    console.log("Error deleting department ");
    res.status(400).json({ success: false, error: err.message });
  }
};

/* 

    Get All Departments
    Get /departments    
*/

export const getDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      select: {
        deptId: true,
        deptName: true,
        username: true,
        email: true,
        deptHead: true,
        branchId: true,
      },
    });

    res.json({
      success: true,
      count: departments.length,
      departments,
    });
  } catch (err) {
    console.error("❌ Error fetching departments:", err.message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

/*

    Get department by Id 
    Get /departments/:id
*/

export const getDepartmentById = async (req, res) => {
  const { deptId } = req.params;

  if (!deptId) {
    return res
      .status(400)
      .json({ success: false, error: "deptId is required" });
  }

  try {
    const department = await prisma.department.findUnique({
      where: { deptId: Number(deptId) },
      select: {
        deptId: true,
        deptName: true,
        username: true,
        email: true,
        deptHead: true,
        branchId: true,
      },
    });

    if (!department) {
      return res
        .status(404)
        .json({ success: false, error: "Department not found" });
    }

    res.json({
      success: true,
      department,
    });
  } catch (err) {
    console.error("❌ Error fetching department:", err.message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
