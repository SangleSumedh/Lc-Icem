import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  addDepartment,
  updateDepartmentHead,
  deleteDepartment,
  getDepartments,
  getDepartmentById,
} from "../controllers/Admin.Controller.js";

const router = Router();

// ✅ Create
router.post("/add-department", verifyToken(["superadmin"]), addDepartment);

// ✅ Update Head
router.post("/update-head", verifyToken(["superadmin"]), updateDepartmentHead);

// ✅ Delete
router.delete(
  "/delete-department/:deptId",
  verifyToken(["superadmin"]),
  deleteDepartment
);

// ✅ Get All Departments
router.get(
  "/departments",
  verifyToken(["superadmin", "department"]),
  getDepartments
);

// ✅ Get Department by Id
router.get(
  "/departments/:deptId",
  verifyToken(["superadmin", "department"]),
  getDepartmentById
);

export default router;
