import { Router } from "express";
import { registerStudent, loginStudent, departmentLogin, superAdminLogin } from "../controllers/Auth.Controller.js";   

const router = Router();


//student auth 
router.post("/student/register", registerStudent);
router.post("/student/login", loginStudent)


//department auth
router.post("/department/login", departmentLogin);

//superadmin auth
router.post("/admin/login", superAdminLogin);


export default router;

