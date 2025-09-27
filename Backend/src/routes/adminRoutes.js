import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  // 🔹 Department Controllers via superadmin
  addDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartments,
  getDepartmentById,
  // 🔹 SuperAdmin Controllers
  addSuperAdmin,
  updateSuperAdmin,
  deleteSuperAdmin,
  getSuperAdmins,
  // 🔹 Student Controllers
  addStudent,
  getStudents,
  getStudentByPrn,
  updateStudent,
  deleteStudent,
} from "../controllers/Admin.Controller.js";

const router = Router();

/* 
================================
📌 Department CRUD via Admin Routes
================================ 
*/
// ➕ Create Department
router.post("/add-department", verifyToken(["superadmin"]), addDepartment);

// ✏️ Update Department (deptHead, username, password optional)
router.put("/update-department", verifyToken(["superadmin"]), updateDepartment);

// ❌ Delete Department
router.delete(
  "/delete-department/:deptId",
  verifyToken(["superadmin"]),
  deleteDepartment
);

// 📜 Get All Departments (no auth to allow frontend seeding)
router.get("/departments", getDepartments);

// 🔍 Get Department by ID
router.get(
  "/departments/:deptId",
  verifyToken(["superadmin", "department"]),
  getDepartmentById
);

/* 
================================
📌 SuperAdmin Routes
================================ 
*/
// ➕ Create SuperAdmin
router.post("/add-superadmin", verifyToken(["superadmin"]), addSuperAdmin);

// ✏️ Update SuperAdmin
router.put(
  "/update-superadmin/:id",
  verifyToken(["superadmin"]),
  updateSuperAdmin
);

// ❌ Delete SuperAdmin
router.delete(
  "/delete-superadmin/:id",
  verifyToken(["superadmin"]),
  deleteSuperAdmin
);

router.get("/get-superAdmins", getSuperAdmins);
/* 
================================
📌 Student CRUD via Admin Routes
================================ 
*/
// ➕ Create Student
router.post("/add-student", verifyToken(["superadmin"]), addStudent);

// 🔍 Get All Students
router.get("/students", verifyToken(["superadmin"]), getStudents);

// 🔍 Get Student by PRN
router.get("/students/:prn", verifyToken(["superadmin"]), getStudentByPrn);

// ✏️ Update Student
router.put("/update-student/:prn", verifyToken(["superadmin"]), updateStudent);

// ❌ Delete Student
router.delete(
  "/delete-student/:prn",
  verifyToken(["superadmin"]),
  deleteStudent
);

export default router;
