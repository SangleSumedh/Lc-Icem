import prisma from "../prisma.js";
import bcrypt from "bcrypt";

/**
 * Utility: Standard response
 */
const sendResponse = (res, success, message, data = null, status = 200) => {
  return res.status(status).json({ success, message, data });
};

/* ================================
   📌 SuperAdmin CRUD
   ================================ */

// ➕ Create SuperAdmin
export const addSuperAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return sendResponse(res, false, "All fields are required", null, 400);

    const hashedPassword = await bcrypt.hash(password, 10);

    const superAdmin = await prisma.superAdmin.create({
      data: { username, email, password: hashedPassword },
      select: { id: true, username: true, email: true },
    });

    console.log(`✅ SuperAdmin created: ${username}`);
    return sendResponse(
      res,
      true,
      "SuperAdmin created successfully",
      superAdmin
    );
  } catch (err) {
    if (err.code === "P2002")
      return sendResponse(res, false, "Email already exists", null, 400);
    return sendResponse(res, false, err.message, null, 500);
  }
};

// ✏️ Update SuperAdmin
export const updateSuperAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password } = req.body;

    const data = {};
    if (username) data.username = username;
    if (email) data.email = email;
    if (password) data.password = await bcrypt.hash(password, 10);

    const superAdmin = await prisma.superAdmin.update({
      where: { id: parseInt(id) },
      data,
      select: { id: true, username: true, email: true },
    });

    console.log(`✅ SuperAdmin updated: ID ${id}`);
    return sendResponse(
      res,
      true,
      "SuperAdmin updated successfully",
      superAdmin
    );
  } catch (err) {
    if (err.code === "P2002")
      return sendResponse(res, false, "Email already exists", null, 400);
    return sendResponse(res, false, err.message, null, 500);
  }
};

// ❌ Delete SuperAdmin
export const deleteSuperAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.superAdmin.delete({ where: { id: parseInt(id) } });
    console.log(`🗑️ SuperAdmin deleted: ID ${id}`);
    return sendResponse(res, true, "SuperAdmin deleted successfully");
  } catch (err) {
    return sendResponse(res, false, err.message, null, 500);
  }
};

// 🔍 Get all SuperAdmins
export const getSuperAdmins = async (req, res) => {
  try {
    const superAdmins = await prisma.superAdmin.findMany({
      select: { id: true, username: true, email: true },
    });
    if (!superAdmins.length)
      return sendResponse(res, false, "No SuperAdmins found", []);
    return sendResponse(
      res,
      true,
      "SuperAdmins fetched successfully",
      superAdmins
    );
  } catch (err) {
    return sendResponse(res, false, err.message, null, 500);
  }
};

/* ================================
   📌 Department CRUD
   ================================ */

// ➕ Create Department
export const addDepartment = async (req, res) => {
  try {
    const { deptName, deptHeadId, branchId, college } = req.body;
    if (!deptName || !college)
      return sendResponse(
        res,
        false,
        "deptName and college are required",
        null,
        400
      );

    const department = await prisma.department.create({
      data: {
        deptName,
        deptHeadId: deptHeadId || null,
        branchId: branchId || null,
        college,
      },
      select: { deptId: true, deptName: true, deptHeadId: true, college: true },
    });

    console.log(`✅ Department created: ${deptName} | College: ${college}`);
    return sendResponse(
      res,
      true,
      "Department created successfully",
      department
    );
  } catch (err) {
    return sendResponse(res, false, err.message, null, 500);
  }
};

// ✏️ Update Department
export const updateDepartment = async (req, res) => {
  try {
    const { deptId, deptName, deptHeadId, branchId, college } = req.body;
    if (!deptId)
      return sendResponse(res, false, "deptId is required", null, 400);

    const data = {};
    if (deptName) data.deptName = deptName;
    if (deptHeadId) data.deptHeadId = deptHeadId;
    if (branchId) data.branchId = branchId;
    if (college) data.college = college;

    const department = await prisma.department.update({
      where: { deptId: parseInt(deptId) },
      data,
      select: { deptId: true, deptName: true, deptHeadId: true, college: true },
    });

    console.log(`✅ Department updated: Dept ID ${deptId}`);
    return sendResponse(
      res,
      true,
      "Department updated successfully",
      department
    );
  } catch (err) {
    return sendResponse(res, false, err.message, null, 500);
  }
};

// ❌ Delete Department
export const deleteDepartment = async (req, res) => {
  try {
    const { deptId } = req.params;
    await prisma.department.delete({ where: { deptId: parseInt(deptId) } });
    console.log(`🗑️ Department deleted: Dept ID ${deptId}`);
    return sendResponse(res, true, "Department deleted successfully");
  } catch (err) {
    return sendResponse(res, false, err.message, null, 500);
  }
};

// 🔍 Get All Departments
export const getDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      select: { deptId: true, deptName: true, deptHeadId: true, college: true },
    });
    return sendResponse(
      res,
      true,
      "Departments fetched successfully",
      departments
    );
  } catch (err) {
    return sendResponse(res, false, err.message, null, 500);
  }
};

// 🔍 Get Department by ID
export const getDepartmentById = async (req, res) => {
  try {
    const { deptId } = req.params;
    const department = await prisma.department.findUnique({
      where: { deptId: parseInt(deptId) },
      select: { deptId: true, deptName: true, deptHeadId: true, college: true },
    });
    if (!department)
      return sendResponse(res, false, "Department not found", null, 404);
    return sendResponse(
      res,
      true,
      "Department fetched successfully",
      department
    );
  } catch (err) {
    return sendResponse(res, false, err.message, null, 500);
  }
};

/* ================================
   📌 Student CRUD
   ================================ */

// ➕ Create Student
export const addStudent = async (req, res) => {
  try {
    const { prn, studentName, email, phoneNo, password, college } = req.body;
    if (!prn || !studentName || !email || !password)
      return sendResponse(
        res,
        false,
        "PRN, name, email, and password are required",
        null,
        400
      );

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await prisma.student.create({
      data: {
        prn,
        studentName,
        email,
        phoneNo: phoneNo || null,
        password: hashedPassword,
        college: college || "ICEM",
      },
      select: {
        prn: true,
        studentName: true,
        email: true,
        phoneNo: true,
        college: true,
      },
    });

    console.log(`✅ Student created: ${studentName} | PRN: ${prn}`);
    return sendResponse(res, true, "Student created successfully", student);
  } catch (err) {
    if (err.code === "P2002")
      return sendResponse(res, false, "PRN or email already exists", null, 400);
    return sendResponse(res, false, err.message, null, 500);
  }
};

// 🔍 Get All Students
export const getStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      select: {
        prn: true,
        studentName: true,
        email: true,
        phoneNo: true,
        college: true,
      },
    });
    return sendResponse(res, true, "Students fetched successfully", students);
  } catch (err) {
    return sendResponse(res, false, err.message, null, 500);
  }
};

// 🔍 Get Student by PRN
export const getStudentByPrn = async (req, res) => {
  try {
    const { prn } = req.params;
    const student = await prisma.student.findUnique({
      where: { prn },
      select: {
        prn: true,
        studentName: true,
        email: true,
        phoneNo: true,
        college: true,
      },
    });
    if (!student)
      return sendResponse(res, false, "Student not found", null, 404);
    return sendResponse(res, true, "Student fetched successfully", student);
  } catch (err) {
    return sendResponse(res, false, err.message, null, 500);
  }
};

// ✏️ Update Student
export const updateStudent = async (req, res) => {
  try {
    const { prn } = req.params;
    const { studentName, email, phoneNo, password, college } = req.body;

    const data = {};
    if (studentName) data.studentName = studentName;
    if (email) data.email = email;
    if (phoneNo) data.phoneNo = phoneNo;
    if (college) data.college = college;
    if (password) data.password = await bcrypt.hash(password, 10);

    if (!Object.keys(data).length)
      return sendResponse(
        res,
        false,
        "No fields provided to update",
        null,
        400
      );

    const student = await prisma.student.update({
      where: { prn },
      data,
      select: {
        prn: true,
        studentName: true,
        email: true,
        phoneNo: true,
        college: true,
      },
    });

    console.log(`✅ Student updated: PRN ${prn}`);
    return sendResponse(res, true, "Student updated successfully", student);
  } catch (err) {
    if (err.code === "P2002")
      return sendResponse(res, false, "Email already exists", null, 400);
    return sendResponse(res, false, err.message, null, 500);
  }
};

// ❌ Delete Student
export const deleteStudent = async (req, res) => {
  try {
    const { prn } = req.params;
    await prisma.$transaction(async (tx) => {
      await tx.approvalAction.deleteMany({
        where: { approval: { studentPrn: prn } },
      });
      await tx.approvalRequest.deleteMany({ where: { studentPrn: prn } });
      await tx.studentProfile.deleteMany({ where: { prn } });
      await tx.student.delete({ where: { prn } });
    });
    console.log(`🗑️ Student deleted (PRN: ${prn})`);
    return sendResponse(res, true, "Student deleted successfully");
  } catch (err) {
    return sendResponse(res, false, err.message, null, 500);
  }
};

/* ================================
   📌 Staff CRUD
   ================================ */

// ➕ Create Staff
export const addStaff = async (req, res) => {
  try {
    const { name, email, username, password, deptId } = req.body;

    if (!name || !email || !username || !password || !deptId) {
      return sendResponse(res, false, "All fields are required", null, 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const staff = await prisma.staff.create({
      data: {
        name,
        email,
        username,
        passwordHash: hashedPassword,
        deptId,
      },
      select: { staffId: true, name: true, email: true, username: true, deptId: true },
    });

    console.log(`✅ Staff created: ${name} | Username: ${username}`);
    return sendResponse(res, true, "Staff created successfully", staff);
  } catch (err) {
    if (err.code === "P2002") {
      return sendResponse(res, false, "Email or Username already exists", null, 400);
    }
    return sendResponse(res, false, err.message, null, 500);
  }
};

// 🔍 Get All Staff
export const getStaff = async (req, res) => {
  try {
    const staffList = await prisma.staff.findMany({
      select: { staffId: true, name: true, email: true, username: true, deptId: true },
    });
    return sendResponse(res, true, "Staff fetched successfully", staffList);
  } catch (err) {
    return sendResponse(res, false, err.message, null, 500);
  }
};

// 🔍 Get Staff by ID
export const getStaffById = async (req, res) => {
  try {
    const { staffId } = req.params;
    const staff = await prisma.staff.findUnique({
      where: { staffId: parseInt(staffId) },
      select: { staffId: true, name: true, email: true, username: true, deptId: true },
    });

    if (!staff) return sendResponse(res, false, "Staff not found", null, 404);
    return sendResponse(res, true, "Staff fetched successfully", staff);
  } catch (err) {
    return sendResponse(res, false, err.message, null, 500);
  }
};

// ✏️ Update Staff
export const updateStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { name, email, username, password, deptId } = req.body;

    const data = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (username) data.username = username;
    if (deptId) data.deptId = deptId;
    if (password && password.trim().length > 0) {
      data.passwordHash = await bcrypt.hash(password, 10);
    }

    if (Object.keys(data).length === 0) {
      return sendResponse(res, false, "No fields provided to update", null, 400);
    }

    const staff = await prisma.staff.update({
      where: { staffId: parseInt(staffId) },
      data,
      select: { staffId: true, name: true, email: true, username: true, deptId: true },
    });

    console.log(`✅ Staff updated: ID ${staffId}`);
    return sendResponse(res, true, "Staff updated successfully", staff);
  } catch (err) {
    if (err.code === "P2002") {
      return sendResponse(res, false, "Email or Username already exists", null, 400);
    }
    return sendResponse(res, false, err.message, null, 500);
  }
};

// ❌ Delete Staff 
export const deleteStaff = async (req, res) => {
  try {
    const { staffId } = req.params;

    // ✅ Start transaction to handle dependent records if needed
    await prisma.$transaction(async (tx) => {
      // Optionally, if there are ApprovalActions or ApprovalRequests linked
      await tx.approvalAction.updateMany({
        where: { staffId: parseInt(staffId) },
        data: { staffId: null }, // unlink staff from actions
      });

      await tx.approvalRequest.updateMany({
        where: { createdByStaffId: parseInt(staffId) },
        data: { createdByStaffId: null }, // unlink staff from requests
      });

      // Delete the staff
      await tx.staff.delete({
        where: { staffId: parseInt(staffId) },
      });
    });

    console.log(`🗑️ Staff deleted: ID ${staffId}`);
    return sendResponse(res, true, "Staff deleted successfully");
  } catch (err) {
    return sendResponse(res, false, err.message, null, 500);
  }
};
