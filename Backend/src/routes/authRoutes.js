import { Router } from "express";
import {
  registerStudent,
  loginStudent,
  staffLogin, // renamed from departmentLogin
  superAdminLogin,
  changeStaffPassword,
  changeStudentPassword,
  changeSuperAdminPassword,
} from "../controllers/Auth.Controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Student auth
router.post("/student/register", registerStudent);
router.post("/student/login", loginStudent);
router.post(
  "/student/change-password",
  verifyToken(["student"]),
  changeStudentPassword
);

// Department/staff auth
router.post("/department/login", staffLogin);
router.post(
  "/department/change-password",
  verifyToken(["department"]),
  changeStaffPassword
);

// Superadmin auth
router.post("/admin/login", superAdminLogin);
router.post(
  "/admin/change-password",
  verifyToken(["superadmin"]),
  changeSuperAdminPassword
);

export default router;
