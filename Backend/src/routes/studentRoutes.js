import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  submitLCForm,
  getApprovalStatus,
  getHodBranches,
  getRequestedInfoApprovals,
  resubmitLCForm,
  getLCForm,
  getDepartments,
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
router.get(
  "/approval-status",
  verifyToken(["student", "department"]),
  getApprovalStatus
);

router.get("/form", verifyToken(["student"]), getLCForm);

/* 

================================
   📌 HOD Branches Route
================================ 
*/

// Get all HOD branches (no auth required, or add roles if needed)
router.get("/hod-branches", getHodBranches);

router.get("/get-departments", getDepartments);

// GET all requests needing more info
router.get(
  "/requests-info",
  verifyToken(["student"]),
  getRequestedInfoApprovals
);

// PUT to resubmit updates
router.put("/resubmit", verifyToken(["student"]), resubmitLCForm);

export default router;
