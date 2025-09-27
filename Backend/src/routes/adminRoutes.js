import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  // 🔹 Department Controllers
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
  // 🔹 Staff Controllers
  addStaff,
  getStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
} from "../controllers/Admin.Controller.js";

const router = Router();

/* ================================
   📌 Department CRUD via Admin Routes
================================ */
router.post("/add-department", verifyToken(["superadmin"]), addDepartment);
router.put("/update-department", verifyToken(["superadmin"]), updateDepartment);
router.delete(
  "/delete-department/:deptId",
  verifyToken(["superadmin"]),
  deleteDepartment
);
router.get("/departments", getDepartments);
router.get(
  "/departments/:deptId",
  verifyToken(["superadmin", "department"]),
  getDepartmentById
);

/* ================================
   📌 SuperAdmin Routes
================================ */
router.post("/add-superadmin", verifyToken(["superadmin"]), addSuperAdmin);
router.put(
  "/update-superadmin/:id",
  verifyToken(["superadmin"]),
  updateSuperAdmin
);
router.delete(
  "/delete-superadmin/:id",
  verifyToken(["superadmin"]),
  deleteSuperAdmin
);
router.get("/get-superAdmins", getSuperAdmins);

/* ================================
   📌 Student CRUD via Admin Routes
================================ */
router.post("/add-student", verifyToken(["superadmin"]), addStudent);
router.get("/students", verifyToken(["superadmin"]), getStudents);
router.get("/students/:prn", verifyToken(["superadmin"]), getStudentByPrn);
router.put("/update-student/:prn", verifyToken(["superadmin"]), updateStudent);
router.delete(
  "/delete-student/:prn",
  verifyToken(["superadmin"]),
  deleteStudent
);

/* ================================
   📌 Staff CRUD via Admin Routes
================================ */
router.post("/add-staff", verifyToken(["superadmin"]), addStaff);
router.get("/staff", verifyToken(["superadmin"]), getStaff);
router.get("/staff/:staffId", verifyToken(["superadmin"]), getStaffById);
router.put("/update-staff/:staffId", verifyToken(["superadmin"]), updateStaff);
router.delete(
  "/delete-staff/:staffId",
  verifyToken(["superadmin"]),
  deleteStaff
);

export default router;
