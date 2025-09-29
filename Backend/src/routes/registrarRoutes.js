import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  getPendingLCs,
  generateLC,
  getLCDetails,
  uploadLC, // new endpoint
} from "../controllers/Registrar.controller.js";

const router = Router();

// Only Registrar can access
router.get("/pending-lc", verifyToken(["department"]), getPendingLCs);

// Get full LC details for a student
router.get("/lc-details/:prn", verifyToken(["department"]), getLCDetails);

// Update student profile (form data)
router.post("/generate-lc/:prn", verifyToken(["department"]), generateLC);

// Upload finalized LC PDF to S3
router.post("/upload-lc/:prn", verifyToken(["department"]), uploadLC);

export default router;
