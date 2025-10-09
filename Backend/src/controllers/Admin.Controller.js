import prisma from "../prisma.js";
import bcrypt from "bcrypt";
import { sendEmail, emailTemplates } from "../utils/mailer.js";
import { sendResponse } from "../utils/sendResponse.js";
import { handlePrismaError } from "../utils/handlePrismaError.js";

/* ================================
   📌 SuperAdmin CRUD
   ================================ */

// ➕ Create SuperAdmin
export const addSuperAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return sendResponse(res, false, "All fields are required", null, 400);
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

    // Validate password strength
    if (password.length < 6) {
      return sendResponse(
        res,
        false,
        "Password must be at least 6 characters long",
        null,
        400
      );
    }

    // Validate username
    if (username.length < 3) {
      return sendResponse(
        res,
        false,
        "Username must be at least 3 characters long",
        null,
        400
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const superAdmin = await prisma.superAdmin.create({
      data: {
        username: username.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    console.log(`✅ SuperAdmin created: ${username} (${email})`);

    return sendResponse(
      res,
      true,
      "Super admin created successfully",
      superAdmin,
      201
    );
  } catch (err) {
    console.error("Add super admin error:", err);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "create_super_admin",
      email: req.body.email,
      username: req.body.username,
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

// ✏️ Update SuperAdmin
export const updateSuperAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password } = req.body;

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return sendResponse(
        res,
        false,
        "Valid super admin ID is required",
        null,
        400
      );
    }

    const adminId = parseInt(id);

    // Check if at least one field is provided for update
    if (!username && !email && !password) {
      return sendResponse(
        res,
        false,
        "At least one field (username, email, or password) is required for update",
        null,
        400
      );
    }

    // Validate email format if provided
    if (email) {
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
    }

    // Validate password strength if provided
    if (password && password.length < 6) {
      return sendResponse(
        res,
        false,
        "Password must be at least 6 characters long",
        null,
        400
      );
    }

    // Validate username if provided
    if (username && username.length < 3) {
      return sendResponse(
        res,
        false,
        "Username must be at least 3 characters long",
        null,
        400
      );
    }

    // Check if super admin exists before updating
    const existingAdmin = await prisma.superAdmin.findUnique({
      where: { id: adminId },
    });

    if (!existingAdmin) {
      return sendResponse(res, false, "Super admin not found", null, 404);
    }

    // Check for duplicate email/username if they are being updated
    if (email || username) {
      const duplicateCondition = {
        OR: [],
        NOT: { id: adminId }, // Exclude current admin from duplicate check
      };

      if (email)
        duplicateCondition.OR.push({ email: email.toLowerCase().trim() });
      if (username) duplicateCondition.OR.push({ username: username.trim() });

      const duplicateAdmin = await prisma.superAdmin.findFirst({
        where: duplicateCondition,
      });

      if (duplicateAdmin) {
        if (duplicateAdmin.email === email?.toLowerCase().trim()) {
          return sendResponse(
            res,
            false,
            "Email address already exists",
            null,
            409
          );
        }
        if (duplicateAdmin.username === username?.trim()) {
          return sendResponse(res, false, "Username already exists", null, 409);
        }
      }
    }

    // Prepare update data
    const data = {};
    if (username) data.username = username.trim();
    if (email) data.email = email.toLowerCase().trim();
    if (password) data.password = await bcrypt.hash(password, 10);
    data.updatedAt = new Date();

    const superAdmin = await prisma.superAdmin.update({
      where: { id: adminId },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        updatedAt: true,
      },
    });

    console.log(
      `✅ SuperAdmin updated: ID ${adminId} (${superAdmin.username})`
    );

    return sendResponse(
      res,
      true,
      "Super admin updated successfully",
      superAdmin
    );
  } catch (err) {
    console.error("Update super admin error:", err);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "update_super_admin",
      adminId: req.params.id,
      attemptedEmail: req.body.email,
      attemptedUsername: req.body.username,
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

// ❌ Delete SuperAdmin
export const deleteSuperAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return sendResponse(
        res,
        false,
        "Valid super admin ID is required",
        null,
        400
      );
    }

    const adminId = parseInt(id);

    // Prevent deletion of the last super admin
    const totalAdmins = await prisma.superAdmin.count();
    if (totalAdmins <= 1) {
      return sendResponse(
        res,
        false,
        "Cannot delete the last super admin. At least one super admin must remain in the system.",
        null,
        400
      );
    }

    // Check if super admin exists before attempting deletion
    const existingAdmin = await prisma.superAdmin.findUnique({
      where: { id: adminId },
      select: { id: true, username: true, email: true },
    });

    if (!existingAdmin) {
      return sendResponse(res, false, "Super admin not found", null, 404);
    }

    // Optional: Prevent self-deletion (if the authenticated user is deleting themselves)
    const currentUserId = req.user?.id; // Assuming user info is in req.user
    if (currentUserId && currentUserId === adminId) {
      return sendResponse(
        res,
        false,
        "You cannot delete your own account",
        null,
        400
      );
    }

    // Perform the deletion
    await prisma.superAdmin.delete({
      where: { id: adminId },
    });

    console.log(
      `🗑️ SuperAdmin deleted: ID ${adminId} (${existingAdmin.username})`
    );

    // Log the deletion activity for audit
    console.log(
      `📝 SuperAdmin deletion audit - ID: ${adminId}, Username: ${
        existingAdmin.username
      }, Email: ${existingAdmin.email}, Deleted at: ${new Date().toISOString()}`
    );

    return sendResponse(res, true, "Super admin deleted successfully");
  } catch (err) {
    console.error("Delete super admin error:", err);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "delete_super_admin",
      adminId: req.params.id,
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

// 🔍 Get all SuperAdmins
export const getSuperAdmins = async (req, res) => {
  try {
    const superAdmins = await prisma.superAdmin.findMany({
      select: { id: true, username: true, email: true },
    });

    if (!superAdmins.length) {
      return sendResponse(res, true, "No super admins found", []);
    }

    return sendResponse(
      res,
      true,
      "Super admins fetched successfully",
      superAdmins
    );
  } catch (err) {
    console.error("Get super admins error:", err);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "get_super_admins",
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

/* ================================
   📌 Department CRUD
   ================================ */

// ➕ Create Department
export const addDepartment = async (req, res) => {
  try {
    const { deptName, deptHeadId, branchId, college } = req.body;

    // Validate required fields
    if (!deptName || !college) {
      return sendResponse(
        res,
        false,
        "Department name and college are required",
        null,
        400
      );
    }

    // Validate department name
    if (deptName.trim().length < 2) {
      return sendResponse(
        res,
        false,
        "Department name must be at least 2 characters long",
        null,
        400
      );
    }

    if (deptName.trim().length > 100) {
      return sendResponse(
        res,
        false,
        "Department name must be less than 100 characters",
        null,
        400
      );
    }

    // Validate college
    const validColleges = ["ICEM", "IGSB"];
    if (!validColleges.includes(college)) {
      return sendResponse(
        res,
        false,
        `Invalid college. Must be one of: ${validColleges.join(", ")}`,
        null,
        400
      );
    }

    // Validate deptHeadId if provided
    if (deptHeadId) {
      if (isNaN(parseInt(deptHeadId))) {
        return sendResponse(
          res,
          false,
          "Department head ID must be a valid number",
          null,
          400
        );
      }
    }

    // Validate branchId if provided
    if (branchId) {
      if (isNaN(parseInt(branchId))) {
        return sendResponse(
          res,
          false,
          "Branch ID must be a valid number",
          null,
          400
        );
      }
    }

    // Check for duplicate department name in the same college
    const existingDepartment = await prisma.department.findFirst({
      where: {
        deptName: {
          equals: deptName.trim(),
          mode: "insensitive",
        },
        college: college,
      },
    });

    if (existingDepartment) {
      return sendResponse(
        res,
        false,
        `Department '${deptName}' already exists in ${college}`,
        null,
        409
      );
    }

    const department = await prisma.department.create({
      data: {
        deptName: deptName.trim(),
        deptHeadId: deptHeadId ? parseInt(deptHeadId) : null,
        branchId: branchId ? parseInt(branchId) : null,
        college: college.trim(),
      },
      select: {
        deptId: true,
        deptName: true,
        deptHeadId: true,
        branchId: true,
        college: true,
      },
    });

    console.log(
      `✅ Department created: ${deptName} | College: ${college} | ID: ${department.deptId}`
    );

    return sendResponse(
      res,
      true,
      "Department created successfully",
      department,
      201
    );
  } catch (err) {
    console.error("Add department error:", err);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "create_department",
      deptName: req.body.deptName,
      college: req.body.college,
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

// ✏️ Update Department
export const updateDepartment = async (req, res) => {
  try {
    const { deptId, deptName, deptHeadId, branchId, college } = req.body;

    // ✅ Validate deptId
    if (!deptId || isNaN(parseInt(deptId))) {
      return sendResponse(res, false, "Valid deptId is required", null, 400);
    }

    // ✅ Validate at least one field to update
    if (!deptName && !deptHeadId && !branchId && !college) {
      return sendResponse(
        res,
        false,
        "No fields provided to update",
        null,
        400
      );
    }

    // ✅ Build update data object dynamically
    const data = {};

    if (deptName) {
      if (deptName.trim().length < 2)
        return sendResponse(
          res,
          false,
          "Department name must be at least 2 characters long",
          null,
          400
        );
      if (deptName.trim().length > 100)
        return sendResponse(
          res,
          false,
          "Department name must be less than 100 characters",
          null,
          400
        );
      data.deptName = deptName.trim();
    }

    if (deptHeadId) {
      if (isNaN(parseInt(deptHeadId))) {
        return sendResponse(
          res,
          false,
          "Department head ID must be a valid number",
          null,
          400
        );
      }
      data.deptHeadId = parseInt(deptHeadId);
    }

    if (branchId) {
      if (isNaN(parseInt(branchId))) {
        return sendResponse(
          res,
          false,
          "Branch ID must be a valid number",
          null,
          400
        );
      }
      data.branchId = parseInt(branchId);
    }

    if (college) {
      const validColleges = ["ICEM", "IGSB"];
      if (!validColleges.includes(college)) {
        return sendResponse(
          res,
          false,
          `Invalid college. Must be one of: ${validColleges.join(", ")}`,
          null,
          400
        );
      }
      data.college = college.trim();
    }

    // ✅ Check if department exists
    const existingDept = await prisma.department.findUnique({
      where: { deptId: parseInt(deptId) },
    });

    if (!existingDept) {
      return sendResponse(
        res,
        false,
        `Department with ID ${deptId} not found`,
        null,
        404
      );
    }

    // ✅ Prevent duplicate name in same college
    if (deptName && college) {
      const duplicate = await prisma.department.findFirst({
        where: {
          deptName: { equals: deptName.trim(), mode: "insensitive" },
          college: college.trim(),
          NOT: { deptId: parseInt(deptId) },
        },
      });
      if (duplicate) {
        return sendResponse(
          res,
          false,
          `Department '${deptName}' already exists in ${college}`,
          null,
          409
        );
      }
    }

    // ✅ Update operation
    const updatedDepartment = await prisma.department.update({
      where: { deptId: parseInt(deptId) },
      data,
      select: {
        deptId: true,
        deptName: true,
        deptHeadId: true,
        branchId: true,
        college: true,
      },
    });

    console.log(`✅ Department updated: Dept ID ${deptId}`);
    return sendResponse(
      res,
      true,
      "Department updated successfully",
      updatedDepartment
    );
  } catch (err) {
    console.error("Update department error:", err);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "update_department",
      deptId: req.body.deptId,
      deptName: req.body.deptName,
      college: req.body.college,
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

// ❌ Delete Department (transactional, delete staff also)
export const deleteDepartment = async (req, res) => {
  try {
    const { deptId } = req.params;

    // ✅ Validate deptId
    if (!deptId || isNaN(parseInt(deptId))) {
      return sendResponse(res, false, "Valid deptId is required", null, 400);
    }

    const id = parseInt(deptId);

    // ✅ Check if department exists before attempting deletion
    const existingDepartment = await prisma.department.findUnique({
      where: { deptId: id },
      select: { deptId: true, deptName: true, college: true },
    });

    if (!existingDepartment) {
      return sendResponse(
        res,
        false,
        `Department with ID ${deptId} not found`,
        null,
        404
      );
    }

    // ✅ Execute cascading deletion in a transaction
    await prisma.$transaction(async (tx) => {
      // 1️⃣ Delete approval actions linked to approval requests of this dept
      await tx.approvalAction.deleteMany({
        where: { approval: { deptId: id } },
      });

      // 2️⃣ Delete approval requests linked to this dept
      await tx.approvalRequest.deleteMany({
        where: { deptId: id },
      });

      // 3️⃣ Delete staff in this department
      await tx.staff.deleteMany({
        where: { deptId: id },
      });

      // 4️⃣ Finally delete the department itself
      await tx.department.delete({
        where: { deptId: id },
      });
    });

    console.log(
      `🗑️ Department deleted: ${existingDepartment.deptName} (${existingDepartment.college}) | ID: ${deptId}`
    );

    return sendResponse(
      res,
      true,
      `Department '${existingDepartment.deptName}' and related data deleted successfully`
    );
  } catch (err) {
    console.error("❌ Delete Department error:", err);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "delete_department",
      deptId: req.params.deptId,
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

// 🔍 Get All Departments
export const getDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      select: {
        deptId: true,
        deptName: true,
        branchId: true,
        deptHeadId: true,
        college: true,
      },
      orderBy: {
        deptId: "asc", // ✅ Sort by deptId in ascending order
      },
    });

    return sendResponse(
      res,
      true,
      "Departments fetched successfully",
      departments
    );
  } catch (err) {
    console.error("❌ Get departments error:", err);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "get_departments",
    });

    return sendResponse(res, false, message, null, statusCode);
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
    console.error("Get department by ID error:", err);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "get_department_by_id",
      deptId: req.params.deptId,
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

/* ================================
   📌 Student CRUD
   ================================ */

// ➕ Create Student
export const addStudent = async (req, res) => {
  try {
    const { prn, studentName, email, phoneNo, password, college } = req.body;

    // ✅ Validate required fields
    if (!prn || !studentName || !email || !password) {
      return sendResponse(
        res,
        false,
        "PRN, name, email, and password are required",
        null,
        400
      );
    }

    // ✅ Validate PRN format (optional — customize as per your system)
    if (!/^\d{5,}$/.test(prn)) {
      return sendResponse(
        res,
        false,
        "Invalid PRN format. Must be numeric and at least 5 digits.",
        null,
        400
      );
    }

    // ✅ Validate student name
    if (studentName.trim().length < 2) {
      return sendResponse(
        res,
        false,
        "Student name must be at least 2 characters long",
        null,
        400
      );
    }

    // ✅ Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return sendResponse(res, false, "Invalid email format", null, 400);
    }

    // ✅ Validate phone number if provided
    if (phoneNo && !/^\d{10}$/.test(phoneNo)) {
      return sendResponse(
        res,
        false,
        "Phone number must be 10 digits long",
        null,
        400
      );
    }

    // ✅ Validate college
    const validColleges = ["ICEM", "IGSB"];
    const selectedCollege = college ? college.trim() : "ICEM";
    if (!validColleges.includes(selectedCollege)) {
      return sendResponse(
        res,
        false,
        `Invalid college. Must be one of: ${validColleges.join(", ")}`,
        null,
        400
      );
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Check for duplicates before insert
    const existingStudent = await prisma.student.findFirst({
      where: {
        OR: [{ prn }, { email }],
      },
    });

    if (existingStudent) {
      return sendResponse(
        res,
        false,
        "PRN or email already exists. Please use unique values.",
        null,
        409
      );
    }

    // ✅ Create new student
    const student = await prisma.student.create({
      data: {
        prn,
        studentName: studentName.trim(),
        email: email.toLowerCase(),
        phoneNo: phoneNo || null,
        password: hashedPassword,
        college: selectedCollege,
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
    console.error("❌ Add Student error:", err);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "create_student",
      prn: req.body.prn,
      email: req.body.email,
      studentName: req.body.studentName,
    });

    return sendResponse(res, false, message, null, statusCode);
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
    console.error("Get students error:", err);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "get_students",
    });

    return sendResponse(res, false, message, null, statusCode);
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
    console.error("Get student by PRN error:", err);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "get_student_by_prn",
      prn: req.params.prn,
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

// ✏️ Update Student
export const updateStudent = async (req, res) => {
  try {
    const { prn } = req.params;
    const { studentName, email, phoneNo, password, college } = req.body;

    // ✅ Validate PRN
    if (!prn || !/^\d{5,}$/.test(prn)) {
      return sendResponse(res, false, "Valid PRN is required", null, 400);
    }

    // ✅ Ensure at least one field is provided
    if (!studentName && !email && !phoneNo && !password && !college) {
      return sendResponse(
        res,
        false,
        "No fields provided to update",
        null,
        400
      );
    }

    // ✅ Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { prn },
    });
    if (!existingStudent) {
      return sendResponse(
        res,
        false,
        `Student with PRN ${prn} not found`,
        null,
        404
      );
    }

    // ✅ Build update object with validation
    const data = {};

    if (studentName) {
      if (studentName.trim().length < 2)
        return sendResponse(
          res,
          false,
          "Student name must be at least 2 characters long",
          null,
          400
        );
      data.studentName = studentName.trim();
    }

    if (email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return sendResponse(res, false, "Invalid email format", null, 400);
      }
      data.email = email.toLowerCase();
    }

    if (phoneNo) {
      if (!/^\d{10}$/.test(phoneNo)) {
        return sendResponse(
          res,
          false,
          "Phone number must be 10 digits long",
          null,
          400
        );
      }
      data.phoneNo = phoneNo;
    }

    if (college) {
      const validColleges = ["ICEM", "IGSB"];
      if (!validColleges.includes(college.trim())) {
        return sendResponse(
          res,
          false,
          `Invalid college. Must be one of: ${validColleges.join(", ")}`,
          null,
          400
        );
      }
      data.college = college.trim();
    }

    if (password) {
      if (password.length < 6)
        return sendResponse(
          res,
          false,
          "Password must be at least 6 characters long",
          null,
          400
        );
      data.password = await bcrypt.hash(password, 10);
    }

    // ✅ Update student record
    const updatedStudent = await prisma.student.update({
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

    return sendResponse(
      res,
      true,
      "Student updated successfully",
      updatedStudent
    );
  } catch (err) {
    console.error("❌ Update Student error:", err);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "update_student",
      prn: req.params.prn,
      email: req.body.email,
      college: req.body.college,
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

// ❌ Delete Student
export const deleteStudent = async (req, res) => {
  const { prn } = req.params;

  try {
    // 1️⃣ Validate PRN
    if (!prn || typeof prn !== "string" || !prn.trim()) {
      console.warn("⚠️ Invalid or missing PRN in delete request");
      return sendResponse(res, false, "Invalid or missing PRN", null, 400);
    }

    // 2️⃣ Check if the student exists
    const existingStudent = await prisma.student.findUnique({
      where: { prn },
      select: { prn: true, studentName: true },
    });

    if (!existingStudent) {
      console.warn(`⚠️ Student not found for PRN: ${prn}`);
      return sendResponse(res, false, "Student not found", null, 404);
    }

    // 3️⃣ Attempt deletion in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete approval actions linked to approvals by student
      await tx.approvalAction.deleteMany({
        where: { approval: { studentPrn: prn } },
      });

      // Delete approval requests
      await tx.approvalRequest.deleteMany({
        where: { studentPrn: prn },
      });

      // Delete student profiles
      await tx.studentProfile.deleteMany({
        where: { prn },
      });

      // Finally delete the student
      await tx.student.delete({
        where: { prn },
      });
    });

    console.log(
      `🗑️ Successfully deleted student: ${existingStudent.studentName} (PRN: ${prn})`
    );
    return sendResponse(res, true, "Student deleted successfully");
  } catch (err) {
    console.error("❌ Error deleting student:", err);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "delete_student",
      prn: req.params.prn,
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

/* ================================
   📌 Staff CRUD
   ================================ */

// ➕ Add Staff
export const addStaff = async (req, res) => {
  try {
    const { name, email, password, deptId } = req.body;

    if (!name || !email || !password || !deptId) {
      return sendResponse(res, false, "All fields are required", null, 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const staff = await prisma.staff.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        deptId,
      },
      select: { staffId: true, name: true, email: true, deptId: true },
    });

    // Use the email template from mailer
    const emailTemplate = emailTemplates.staffCredentials(
      name,
      email,
      password
    );

    await sendEmail({
      to: email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    });

    console.log(
      `✅ Staff created: ${name} | Email: ${email}, Email sent successfully`
    );
    return sendResponse(res, true, "Staff created successfully", staff);
  } catch (err) {
    console.error("Add staff error:", err);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "create_staff",
      email: req.body.email,
      name: req.body.name,
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

// 🔍 Get All Staff
export const getStaff = async (req, res) => {
  try {
    const staffList = await prisma.staff.findMany({
      select: { staffId: true, name: true, email: true, deptId: true },
    });
    return sendResponse(res, true, "Staff fetched successfully", staffList);
  } catch (err) {
    console.error("Get staff error:", err);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "get_staff",
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

// 🔍 Get Staff by ID
export const getStaffById = async (req, res) => {
  try {
    const { staffId } = req.params;
    const staff = await prisma.staff.findUnique({
      where: { staffId: parseInt(staffId) },
      select: { staffId: true, name: true, email: true, deptId: true },
    });

    if (!staff) return sendResponse(res, false, "Staff not found", null, 404);
    return sendResponse(res, true, "Staff fetched successfully", staff);
  } catch (err) {
    console.error("Get staff by ID error:", err);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "get_staff_by_id",
      staffId: req.params.staffId,
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

// ✏️ Update Staff
export const updateStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { name, email, password, deptId } = req.body;

    const data = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (deptId) data.deptId = deptId;
    if (password && password.trim().length > 0) {
      data.passwordHash = await bcrypt.hash(password, 10);
    }

    if (Object.keys(data).length === 0) {
      return sendResponse(
        res,
        false,
        "No fields provided to update",
        null,
        400
      );
    }

    const staff = await prisma.staff.update({
      where: { staffId: parseInt(staffId) },
      data,
      select: { staffId: true, name: true, email: true, deptId: true },
    });

    console.log(`✅ Staff updated: ID ${staffId}`);
    return sendResponse(res, true, "Staff updated successfully", staff);
  } catch (err) {
    console.error("Update staff error:", err);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "update_staff",
      staffId: req.params.staffId,
      email: req.body.email,
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

// ❌ Delete Staff
export const deleteStaff = async (req, res) => {
  try {
    const { staffId } = req.params;

    await prisma.$transaction(async (tx) => {
      // Unlink staff from actions & requests before delete
      await tx.approvalAction.deleteMany({
        where: { staffId: parseInt(staffId) },
      });

      await tx.approvalRequest.updateMany({
        where: { createdByStaffId: parseInt(staffId) },
        data: { createdByStaffId: null },
      });

      await tx.staff.delete({
        where: { staffId: parseInt(staffId) },
      });
    });

    console.log(`🗑️ Staff deleted: ID ${staffId}`);
    return sendResponse(res, true, "Staff deleted successfully");
  } catch (err) {
    console.error("Delete staff error:", err);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "delete_staff",
      staffId: req.params.staffId,
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

// 🔍 Get All Staff Login Logs (Sorted by latest first)
export const getStaffLoginLogs = async (req, res) => {
  try {
    const loginLogs = await prisma.staffLoginLog.findMany({
      orderBy: {
        loginAt: "desc", // Latest logs first
      },
      select: {
        id: true,
        staffId: true,
        staffName: true,
        loginAt: true,
        ipAddress: true,
        userAgent: true,
      },
    });
    console.log("Staff login logs fetched successfully");

    return sendResponse(
      res,
      true,
      "Staff login logs fetched successfully",
      loginLogs
    );
  } catch (err) {
    console.error("Get staff login logs error:", err);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "get_staff_login_logs",
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};
