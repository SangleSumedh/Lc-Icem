import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  submitLCForm,
  getApprovalStatus,
  getHodBranches,
  getRequestedInfoApprovals,
  resubmitLCForm,
} from "../controllers/Student.Controller.js";

const router = Router();

/* 
================================
   📌 LC Form Routes
================================ 
*/

// Submit LC Form
router.post("/", verifyToken(["student"]), submitLCForm);

// Get Approval Status
router.get("/approval-status", verifyToken(["student"]), getApprovalStatus);

/* 
================================
   📌 HOD Branches Route
================================ 
*/

// Get all HOD branches (no auth required, or add roles if needed)
router.get("/hod-branches", getHodBranches);

// GET all requests needing more info
router.get(
  "/requests-info",
  verifyToken(["student"]),
  getRequestedInfoApprovals
);

// PUT to resubmit updates
router.put("/resubmit", verifyToken(["student"]), resubmitLCForm);

export default router;
