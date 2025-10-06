import prisma from "../prisma.js";

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

    res.json({
      success: true,
      tickets: formattedTickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Error fetching tickets:", err.message);
    res.status(500).json({ error: err.message });
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

    res.json({ success: true, tickets: formattedTickets });
  } catch (err) {
    console.error("Error fetching student tickets:", err.message);
    res.status(500).json({ error: err.message });
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
      return res.status(404).json({ error: "Ticket not found" });
    }

    const formattedTicket = {
      ...ticket,
      createdAt: formatDate(ticket.createdAt),
      updatedAt: formatDate(ticket.updatedAt),
      closedAt: formatDate(ticket.closedAt),
    };

    res.json({ success: true, ticket: formattedTicket });
  } catch (err) {
    console.error("Error fetching ticket details:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST create a new ticket
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
      return res.status(400).json({
        error:
          "Missing required fields: subject, description, category, department, contactEmail",
      });
    }

    // Verify student if PRN provided
    if (studentPrn) {
      const student = await prisma.student.findUnique({
        where: { prn: studentPrn },
      });
      if (!student) return res.status(404).json({ error: "Student not found" });
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

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      ticket,
    });
  } catch (err) {
    console.error("Error creating ticket:", err.message);
    res.status(500).json({ error: err.message });
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

    res.json({
      success: true,
      message: `Ticket status updated to ${status}`,
      ticket,
    });
  } catch (err) {
    console.error("Error updating ticket status:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET ticket statistics
 */
export const getTicketStats = async (req, res) => {
  try {
    const total = await prisma.ticket.count();
    const open = await prisma.ticket.count({ where: { status: "OPEN" } });
    const inProgress = await prisma.ticket.count({
      where: { status: "IN_PROGRESS" },
    });
    const resolved = await prisma.ticket.count({
      where: { status: "RESOLVED" },
    });
    const closed = await prisma.ticket.count({ where: { status: "CLOSED" } });

    const departmentStats = await prisma.ticket.groupBy({
      by: ["department"],
      _count: { _all: true },
    });

    res.json({
      success: true,
      stats: { total, open, inProgress, resolved, closed },
      departmentStats,
    });
  } catch (err) {
    console.error("Error fetching ticket statistics:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Simple date formatter
const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split("T")[0];
};
