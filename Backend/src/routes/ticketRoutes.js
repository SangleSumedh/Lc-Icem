import express from "express";
import {
  getTickets,
  getStudentTickets,
  getTicketDetails,
  createTicket,
  updateTicketStatus,
} from "../controllers/Ticket.Controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* ================================
   📌 Ticket Routes with JWT Authentication
================================ */

// 🔹 Get all tickets (SuperAdmin + Department can view)
router.get("/", verifyToken(["superadmin", "department"]), getTickets);

// 🔹 Get ticket statistics (SuperAdmin + Department can view)
// CURRENTLY NOT IN USE
// router.get("/stats", verifyToken(["superadmin", "department"]), getTicketStats);

// 🔹 Get tickets for a specific student (Student can view their own tickets, SuperAdmin + Department can view all)
router.get(
  "/student/:prn",
  verifyToken(["superadmin", "department", "student"]),
  getStudentTickets
);

// 🔹 Get single ticket details (Student can view their own, SuperAdmin + Department can view all)
router.get(
  "/:ticketId",
  verifyToken(["superadmin", "department", "student"]),
  getTicketDetails
);

// 🔹 Create a new ticket (Student + Public access - no auth required for ticket creation)
router.post("/", createTicket);

// 🔹 Update ticket status (Only SuperAdmin + Department can resolve/update tickets)
router.patch(
  "/:ticketId/status",
  verifyToken(["superadmin", "department"]),
  updateTicketStatus
);

export default router;
