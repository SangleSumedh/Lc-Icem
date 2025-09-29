import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  getPendingLCs,
  generateLC,
  getLCDetails,
} from "../controllers/Registrar.controller.js";

const router = Router();

// Only Registrar can access
router.get("/pending-lc", verifyToken(["department"]), getPendingLCs);

// Get full LC details for a student
router.get("/lc-details/:prn", verifyToken(["department"]), getLCDetails);

// Generate LC for a student
router.post("/generate-lc/:prn", verifyToken(["department"]), generateLC);

export default router;
