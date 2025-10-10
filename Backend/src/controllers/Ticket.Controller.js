import prisma from "../prisma.js";
import { handlePrismaError } from "../utils/handlePrismaError.js";
import { sendResponse } from "../utils/sendResponse.js";

/**
 * GET all tickets with filtering and pagination
 */
export const getTickets = async (req, res) => {
  try {
    const {
      status,
      department,
      category,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const pageFinal = isNaN(pageNumber) ? 1 : pageNumber;
    const limitFinal = isNaN(limitNumber) ? 10 : limitNumber;

    // Build where clause
    const where = {};
    if (status) where.status = status;
    if (department) where.department = department;
    if (category) where.category = category;

    // Get tickets with pagination
    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        student: {
          select: {
            prn: true,
            studentName: true,
            email: true,
            phoneNo: true,
            college: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit),
    });

    const total = await prisma.ticket.count({ where });

    const formattedTickets = tickets.map((ticket) => ({
      ...ticket,
      createdAt: formatDate(ticket.createdAt),
      updatedAt: formatDate(ticket.updatedAt),
      closedAt: formatDate(ticket.closedAt),
    }));

    return sendResponse(res, true, "Tickets fetched successfully", {
      tickets: formattedTickets,
      pagination: {
        page: parseInt(pageFinal),
        limit: parseInt(limitFinal),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Error fetching tickets:", err.message);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "get_tickets",
      query: req.query,
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

/**
 * GET tickets for a specific student
 */
export const getStudentTickets = async (req, res) => {
  const { prn } = req.params;

  try {
    const tickets = await prisma.ticket.findMany({
      where: { studentPrn: prn },
      orderBy: { createdAt: "desc" },
    });

    const formattedTickets = tickets.map((ticket) => ({
      ...ticket,
      createdAt: formatDate(ticket.createdAt),
      updatedAt: formatDate(ticket.updatedAt),
      closedAt: formatDate(ticket.closedAt),
    }));

    return sendResponse(res, true, "Student tickets fetched successfully", {
      tickets: formattedTickets,
    });
  } catch (err) {
    console.error("Error fetching student tickets:", err.message);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "get_student_tickets",
      prn: req.params.prn,
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

/**
 * GET single ticket details
 */
export const getTicketDetails = async (req, res) => {
  const { ticketId } = req.params;

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { ticketId },
      include: {
        student: {
          select: {
            prn: true,
            studentName: true,
            email: true,
            phoneNo: true,
            college: true,
          },
        },
      },
    });

    if (!ticket) {
      return sendResponse(res, false, "Ticket not found", null, 404);
    }

    const formattedTicket = {
      ...ticket,
      createdAt: formatDate(ticket.createdAt),
      updatedAt: formatDate(ticket.updatedAt),
      closedAt: formatDate(ticket.closedAt),
    };

    return sendResponse(res, true, "Ticket details fetched successfully", {
      ticket: formattedTicket,
    });
  } catch (err) {
    console.error("Error fetching ticket details:", err.message);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "get_ticket_details",
      ticketId: req.params.ticketId,
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

/**
 * POST create a new ticket
 * Required fields
 * subject,
 * description,
 * category,
 * department,
 * contactEmail,
 */
export const createTicket = async (req, res) => {
  try {
    const {
      subject,
      description,
      category,
      department,
      contactEmail,
      contactPhone,
      relatedTo,
      studentPrn,
    } = req.body;

    if (!subject || !description || !category || !department || !contactEmail) {
      return sendResponse(
        res,
        false,
        "Missing required fields: subject, description, category, department, contactEmail",
        null,
        400
      );
    }

    // Verify student if PRN provided
    if (studentPrn) {
      const student = await prisma.student.findUnique({
        where: { prn: studentPrn },
      });
      if (!student) {
        return sendResponse(res, false, "Student not found", null, 404);
      }
    }

    const ticket = await prisma.ticket.create({
      data: {
        ticketId: `TKT-${Date.now()}`,
        subject,
        description,
        category,
        department,
        contactEmail,
        contactPhone,
        relatedTo,
        studentPrn,
        status: "OPEN",
      },
    });

    return sendResponse(
      res,
      true,
      "Ticket created successfully",
      { ticket },
      201
    );
  } catch (err) {
    console.error("Error creating ticket:", err.message);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "create_ticket",
      studentPrn: req.body.studentPrn,
      department: req.body.department,
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

/**
 * PATCH update ticket status
 */
export const updateTicketStatus = async (req, res) => {
  const { ticketId } = req.params;
  const { status } = req.body;

  try {
    const updateData = { status };
    if (status === "RESOLVED" || status === "CLOSED") {
      updateData.closedAt = new Date();
    }

    const ticket = await prisma.ticket.update({
      where: { ticketId },
      data: updateData,
    });

    return sendResponse(res, true, `Ticket status updated to ${status}`, {
      ticket,
    });
  } catch (err) {
    console.error("Error updating ticket status:", err.message);

    const { message, statusCode } = handlePrismaError(err, {
      operation: "update_ticket_status",
      ticketId: req.params.ticketId,
      status: req.body.status,
    });

    return sendResponse(res, false, message, null, statusCode);
  }
};

/**
 * GET ticket statistics (currently NOT USED)
 * Counts tickets by status and aggregates by department.
 * ⚠️ Commented out due to performance concerns. Consider re-implementing efficiently if needed.
 */
// export const getTicketStats = async (req, res) => {
//   try {
//     const total = await prisma.ticket.count();
//     const open = await prisma.ticket.count({ where: { status: "OPEN" } });
//     const inProgress = await prisma.ticket.count({
//       where: { status: "IN_PROGRESS" },
//     });
//     const resolved = await prisma.ticket.count({
//       where: { status: "RESOLVED" },
//     });
//     const closed = await prisma.ticket.count({ where: { status: "CLOSED" } });

//     const departmentStats = await prisma.ticket.groupBy({
//       by: ["department"],
//       _count: { _all: true },
//     }); -> problematic reducing performance of database if the size becomes large

//     return sendResponse(res, true, "Ticket statistics fetched successfully", {
//       stats: { total, open, inProgress, resolved, closed },
//       departmentStats,
//     });
//   } catch (err) {
//     console.error("Error fetching ticket statistics:", err.message);

//     const { message, statusCode } = handlePrismaError(err, {
//       operation: "get_ticket_stats",
//     });

//     return sendResponse(res, false, message, null, statusCode);
//   }
// };

// Formats a Date object to 'YYYY-MM-DD', returns null if invalid
const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split("T")[0];
};
