import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  addDepartment,
  updateDepartmentHead,
} from "../controllers/Admin.Controller.js";
const router = Router();

router.post("/add-department", verifyToken(["superadmin"]), addDepartment);

router.post("/update-head", verifyToken(["superadmin"]), updateDepartmentHead);

export default router;
