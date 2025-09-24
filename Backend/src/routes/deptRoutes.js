import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  updateApprovalStatus,
  getPendingApprovals,
  getApprovedApprovals,
  getRejectedApprovals,
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

router.get(
  "/approvals/approved",
  verifyToken(["department"]),
  getApprovedApprovals
);

router.get(
  "/approvals/rejected",
  verifyToken(["department"]),
  getRejectedApprovals
);

export default router;
