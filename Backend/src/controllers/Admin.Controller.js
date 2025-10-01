import prisma from "../prisma.js";
import bcrypt from "bcrypt";
import { sendEmail } from "../utils/mailer.js";

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

// ❌ Delete Department (transactional, delete staff also)
export const deleteDepartment = async (req, res) => {
  try {
    const { deptId } = req.params;
    const id = parseInt(deptId);

    await prisma.$transaction(async (tx) => {
      // 1. Delete approval actions linked to requests of this dept
      await tx.approvalAction.deleteMany({
        where: { approval: { deptId: id } },
      });

      // 2. Delete approval requests linked to this dept
      await tx.approvalRequest.deleteMany({
        where: { deptId: id },
      });

      // 3. Delete staff in this department
      await tx.staff.deleteMany({
        where: { deptId: id },
      });

      // 4. Finally delete the department
      await tx.department.delete({
        where: { deptId: id },
      });
    });

    console.log(`🗑️ Department and staff deleted (Dept ID: ${deptId})`);
    return sendResponse(res, true, "Department and staff deleted successfully");
  } catch (err) {
    console.error("Delete Department error:", err);
    return sendResponse(res, false, err.message, null, 500);
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

    // -------------------------------
    // Send HTML Email using sendEmail()
    // -------------------------------
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Staff Account Created - LC-ICEM Portal</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; padding: 40px 0;">
        <tr>
            <td align="center">
                <!-- Header with Branding -->
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0; padding: 30px;">
                    <tr>
                        <td align="center">
                            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">LC-ICEM Portal</h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Staff Account Activation</p>
                        </td>
                    </tr>
                </table>

                <!-- Main Content Card -->
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background: #ffffff; border-radius: 0 0 12px 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="padding: 40px;">
                            <!-- Welcome Icon -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 30px;">
                                        <div style="background: #10b981; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                                <path d="M9 12l2 2 4-4"/>
                                            </svg>
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Title -->
                            <h2 style="color: #1f2937; text-align: center; margin: 0 0 16px 0; font-size: 24px; font-weight: 700;">
                                Staff Account Created Successfully
                            </h2>

                            <!-- Greeting -->
                            <p style="color: #6b7280; text-align: center; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                Welcome to the <strong style="color: #374151;">LC-ICEM Portal</strong>, 
                                <strong style="color: #4f46e5;">${name}</strong>
                            </p>

                            <!-- Introduction -->
                            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                                Your staff account has been successfully created. You now have access to the Leaving Certificate management system of Indira College of Engineering and Management.
                            </p>

                            <!-- Credentials Card -->
                            <div style="background: #f0f9ff; border: 1px solid #e0f2fe; border-radius: 8px; padding: 25px; margin: 25px 0;">
                                <h3 style="color: #0369a1; margin: 0 0 20px 0; font-size: 18px; text-align: center;">
                                    🔐 Your Login Credentials
                                </h3>
                                
                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td width="30%" style="padding: 8px 0;">
                                            <strong style="color: #075985;">Email:</strong>
                                        </td>
                                        <td style="padding: 8px 0;">
                                            <code style="background: #ffffff; padding: 6px 12px; border-radius: 4px; color: #0c4a6e; font-weight: 600; border: 1px solid #bae6fd;">
                                                ${email}
                                            </code>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td width="30%" style="padding: 8px 0;">
                                            <strong style="color: #075985;">Password:</strong>
                                        </td>
                                        <td style="padding: 8px 0;">
                                            <code style="background: #ffffff; padding: 6px 12px; border-radius: 4px; color: #0c4a6e; font-weight: 600; border: 1px solid #bae6fd;">
                                                ${password}
                                            </code>
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <!-- Security Notice -->
                            <div style="background: #fefce8; border: 1px solid #fef08a; padding: 16px; border-radius: 8px; margin: 25px 0;">
                                <p style="color: #854d0e; margin: 0; font-size: 14px; text-align: center;">
                                    <strong>🔒 Security Notice:</strong> For security reasons, please change your password immediately after first login.
                                </p>
                            </div>

                            <!-- Action Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="https://debug-den.vercel.app/login" 
                                           target="_blank"
                                           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                                  color: white; 
                                                  text-decoration: none; 
                                                  padding: 16px 32px; 
                                                  border-radius: 8px; 
                                                  font-weight: 600; 
                                                  font-size: 16px;
                                                  display: inline-block;
                                                  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                                                  transition: all 0.3s ease;">
                                            🚀 Access LC-ICEM Portal
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Portal Features -->
                            <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 25px 0;">
                                <h4 style="color: #374151; margin: 0 0 15px 0; font-size: 16px; text-align: center;">
                                    📋 Portal Features Available:
                                </h4>
                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td align="center" width="33%" style="padding: 10px;">
                                            <div style="color: #059669; font-size: 14px;">• Student Management</div>
                                        </td>
                                        <td align="center" width="33%" style="padding: 10px;">
                                            <div style="color: #059669; font-size: 14px;">• LC Generation</div>
                                        </td>
                                        <td align="center" width="33%" style="padding: 10px;">
                                            <div style="color: #059669; font-size: 14px;">• Document Tracking</div>
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <!-- Support Information -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                                <tr>
                                    <td align="center">
                                        <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">
                                            Need assistance? Contact the admin team:
                                        </p>
                                        <p style="color: #374151; font-size: 14px; margin: 0; font-weight: 600;">
                                            📧 admin@indiraicem.ac.in | 📞 System Administrator
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <!-- Footer -->
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px;">
                    <tr>
                        <td align="center">
                            <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0;">
                                This account provides access to the LC-ICEM Portal for official college use only.<br>
                                &copy; ${new Date().getFullYear()} Indira College of Engineering and Management. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

    await sendEmail({
      to: email,
      subject: "Your Staff Account Credentials",
      text: `Hi ${name}, Your staff account has been created. Email: ${email} | Password: ${password}`,
      html: htmlContent,
    });

    console.log(
      `✅ Staff created: ${name} | Email: ${email}, Email sent successfully`
    );
    return sendResponse(res, true, "Staff created successfully", staff);
  } catch (err) {
    if (err.code === "P2002") {
      return sendResponse(res, false, "Email already exists", null, 400);
    }
    return sendResponse(res, false, err.message, null, 500);
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
    return sendResponse(res, false, err.message, null, 500);
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
    return sendResponse(res, false, err.message, null, 500);
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
    if (err.code === "P2002") {
      return sendResponse(res, false, "Email already exists", null, 400);
    }
    return sendResponse(res, false, err.message, null, 500);
  }
};

// ❌ Delete Staff
export const deleteStaff = async (req, res) => {
  try {
    const { staffId } = req.params;

    await prisma.$transaction(async (tx) => {
      // Unlink staff from actions & requests before delete
      await tx.approvalAction.updateMany({
        where: { staffId: parseInt(staffId) },
        data: { staffId: null },
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
    return sendResponse(res, false, err.message, null, 500);
  }
};