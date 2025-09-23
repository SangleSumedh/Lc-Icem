import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  updateApprovalStatus,
  getPendingApprovals,
} from "../controllers/Department.Controller.js";

const router = Router();

router.get(
  "/pending-approvals",
  verifyToken(["department"]),
  getPendingApprovals
);

router.post(
  "/update-status",
  verifyToken(["department"]),
  updateApprovalStatus
);

export default router;
