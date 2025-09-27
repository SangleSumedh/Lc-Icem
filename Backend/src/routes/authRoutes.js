import { Router } from "express";
import {
  registerStudent,
  loginStudent,
  staffLogin,       // renamed from departmentLogin
  superAdminLogin,
} from "../controllers/Auth.Controller.js";

const router = Router();

// Student auth
router.post("/student/register", registerStudent);
router.post("/student/login", loginStudent);

// Department/staff auth
router.post("/department/login", staffLogin);

// Superadmin auth
router.post("/admin/login", superAdminLogin);

export default router;
