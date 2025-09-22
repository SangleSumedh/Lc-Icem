import { Router } from "express";
import {verifyToken} from "../middlewares/auth.middleware.js";
import { submitLCForm, getApprovalStatus } from "../controllers/Student.Controller.js";


const router = Router();

//Submit LC Form 
router.post("/", verifyToken(["student"]), submitLCForm);
router.get("/status", verifyToken(["student"]), getApprovalStatus);

export default router;