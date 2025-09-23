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
    res.status(400).json({error: err.message});
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
      where: { deptId },
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
