const Ticket = require('../models/Ticket');
const { getDBStatus } = require('../config/db');

// In-Memory store for when local MongoDB is not running
let memoryTickets = [
  {
    _id: '65f1a1000000000000000001',
    title: 'Unable to login',
    description: 'Login issue with 500 internal server error during SSO',
    priority: 'HIGH',
    status: 'OPEN',
    category: 'TECHNICAL',
    customerName: 'Aarav Sharma',
    customerEmail: 'aarav.sharma@example.com',
    assignedTo: 'Vikram Singh',
    tags: ['auth', 'sso'],
    responses: [
      {
        _id: 'res-101',
        author: 'Vikram Singh',
        role: 'Support Agent',
        message: 'Investigating SSO provider latency.',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: '65f1a1000000000000000002',
    title: 'Invoice calculation discrepancy',
    description: 'Taxes on invoice #4812 were calculated at 22% instead of 18%',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    category: 'BILLING',
    customerName: 'Priya Patel',
    customerEmail: 'priya.patel@example.com',
    assignedTo: 'Neha Gupta',
    tags: ['tax', 'invoice'],
    responses: [],
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    updatedAt: new Date(Date.now() - 5400000).toISOString(),
  },
  {
    _id: '65f1a1000000000000000003',
    title: 'General question about office locations',
    description: 'Looking for contact numbers of the Bangalore development center',
    priority: 'LOW',
    status: 'RESOLVED',
    category: 'GENERAL',
    customerName: 'Sunita Rao',
    customerEmail: 'sunita.rao@example.com',
    assignedTo: 'Vikram Singh',
    tags: ['general'],
    responses: [],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
  },
];

// Helper to generate simulated MongoDB ObjectID
const generateId = () => {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random = Math.floor(Math.random() * 0xffffffffffff).toString(16).padStart(16, '0');
  return timestamp + random;
};

// Normalize values (e.g. 'high' -> 'HIGH', 'Open' -> 'OPEN')
const normalizeUpper = (str) => (str ? str.toString().trim().toUpperCase().replace(/\s+/g, '_') : str);

// @desc    Get all tickets with optional search, filter, and pagination
// @route   GET /api/tickets
// @access  Public
const getTickets = async (req, res, next) => {
  try {
    const { status, priority, category, search, sortBy = 'createdAt', order = 'desc', page = 1, limit = 50 } = req.query;

    if (getDBStatus()) {
      const query = {};

      if (status && status !== 'All') {
        query.status = { $in: [status, status.toUpperCase(), status.replace(/_/g, ' ')] };
      }
      if (priority && priority !== 'All') {
        query.priority = { $in: [priority, priority.toUpperCase()] };
      }
      if (category && category !== 'All') {
        query.category = { $in: [category, category.toUpperCase()] };
      }

      if (search && search.trim()) {
        const searchRegex = new RegExp(search.trim(), 'i');
        query.$or = [
          { title: searchRegex },
          { description: searchRegex },
          { customerName: searchRegex },
          { customerEmail: searchRegex },
        ];
      }

      const sortOptions = {};
      sortOptions[sortBy] = order === 'asc' ? 1 : -1;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const total = await Ticket.countDocuments(query);
      const tickets = await Ticket.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit));

      return res.status(200).json({
        success: true,
        count: tickets.length,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        data: tickets,
      });
    }

    // In-Memory Mode
    let filtered = [...memoryTickets];

    if (status && status !== 'All') {
      const norm = normalizeUpper(status);
      filtered = filtered.filter((t) => normalizeUpper(t.status) === norm);
    }
    if (priority && priority !== 'All') {
      const norm = normalizeUpper(priority);
      filtered = filtered.filter((t) => normalizeUpper(t.priority) === norm);
    }
    if (category && category !== 'All') {
      const norm = normalizeUpper(category);
      filtered = filtered.filter((t) => normalizeUpper(t.category) === norm);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.customerName && t.customerName.toLowerCase().includes(q))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const valA = a[sortBy] || '';
      const valB = b[sortBy] || '';
      if (order === 'asc') return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

    const total = filtered.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginated = filtered.slice(startIndex, startIndex + parseInt(limit));

    res.status(200).json({
      success: true,
      count: paginated.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: paginated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard metrics / stats
// @route   GET /api/tickets/stats
// @access  Public
const getTicketStats = async (req, res, next) => {
  try {
    let tickets;
    if (getDBStatus()) {
      tickets = await Ticket.find({});
    } else {
      tickets = memoryTickets;
    }

    const total = tickets.length;
    const open = tickets.filter((t) => ['OPEN', 'Open'].includes(t.status)).length;
    const inProgress = tickets.filter((t) => ['IN_PROGRESS', 'In Progress', 'IN PROGRESS'].includes(t.status)).length;
    const resolved = tickets.filter((t) => ['RESOLVED', 'Resolved'].includes(t.status)).length;
    const closed = tickets.filter((t) => ['CLOSED', 'Closed'].includes(t.status)).length;
    const urgent = tickets.filter((t) => ['URGENT', 'Urgent'].includes(t.priority)).length;

    res.status(200).json({
      success: true,
      data: {
        total,
        open,
        inProgress,
        resolved,
        closed,
        urgent,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single ticket by ID
// @route   GET /api/tickets/:id
// @access  Public
const getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getDBStatus()) {
      const ticket = await Ticket.findById(id);
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: `Ticket not found with id: ${id}`,
        });
      }
      return res.status(200).json({ success: true, data: ticket });
    }

    const ticket = memoryTickets.find((t) => t._id.toString() === id.toString());
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: `Ticket not found with id: ${id}`,
      });
    }

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new support ticket
// @route   POST /api/tickets
// @access  Public
const createTicket = async (req, res, next) => {
  try {
    const { title, description, priority, status, category, customerName, customerEmail, assignedTo, tags } = req.body;

    const ticketData = {
      title: title.trim(),
      description: description.trim(),
      priority: priority || 'MEDIUM',
      status: status || 'OPEN',
      category: category || 'TECHNICAL',
      customerName: (customerName && customerName.trim()) || 'Guest User',
      customerEmail: (customerEmail && customerEmail.trim()) || 'user@example.com',
      assignedTo: (assignedTo && assignedTo.trim()) || 'Unassigned',
      tags: Array.isArray(tags) ? tags : [],
      responses: [],
    };

    if (getDBStatus()) {
      const ticket = await Ticket.create(ticketData);
      return res.status(201).json({
        success: true,
        message: 'Ticket created successfully',
        data: ticket,
      });
    }

    const newTicket = {
      _id: generateId(),
      ...ticketData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    memoryTickets.unshift(newTicket);
    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: newTicket,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a ticket by ID
// @route   PUT /api/tickets/:id
// @access  Public
const updateTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (getDBStatus()) {
      const ticket = await Ticket.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      });

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: `Ticket not found with id: ${id}`,
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Ticket updated successfully',
        data: ticket,
      });
    }

    const index = memoryTickets.findIndex((t) => t._id.toString() === id.toString());
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Ticket not found with id: ${id}`,
      });
    }

    const existing = memoryTickets[index];
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    memoryTickets[index] = updated;
    res.status(200).json({
      success: true,
      message: 'Ticket updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a ticket by ID
// @route   DELETE /api/tickets/:id
// @access  Public
const deleteTicket = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getDBStatus()) {
      const ticket = await Ticket.findByIdAndDelete(id);
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: `Ticket not found with id: ${id}`,
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Ticket deleted successfully',
      });
    }

    const initialLen = memoryTickets.length;
    memoryTickets = memoryTickets.filter((t) => t._id.toString() !== id.toString());

    if (memoryTickets.length === initialLen) {
      return res.status(404).json({
        success: false,
        message: `Ticket not found with id: ${id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Ticket deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add response to ticket
// @route   POST /api/tickets/:id/responses
// @access  Public
const addTicketResponse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message, author, role = 'Support Agent', statusUpdate } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Response message is required',
      });
    }

    if (getDBStatus()) {
      const ticket = await Ticket.findById(id);
      if (!ticket) {
        return res.status(404).json({ success: false, message: `Ticket not found with id: ${id}` });
      }

      ticket.responses.push({ message, author: author || 'Support Agent', role });
      if (statusUpdate) {
        ticket.status = statusUpdate;
      }

      await ticket.save();
      return res.status(201).json({ success: true, message: 'Response posted successfully', data: ticket });
    }

    const ticket = memoryTickets.find((t) => t._id.toString() === id.toString());
    if (!ticket) {
      return res.status(404).json({ success: false, message: `Ticket not found with id: ${id}` });
    }

    const responseObj = {
      _id: 'res-' + Date.now(),
      message,
      author: author || 'Support Agent',
      role,
      createdAt: new Date().toISOString(),
    };

    ticket.responses.push(responseObj);
    if (statusUpdate) {
      ticket.status = statusUpdate;
    }
    ticket.updatedAt = new Date().toISOString();

    res.status(201).json({ success: true, message: 'Response posted successfully', data: ticket });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTickets,
  getTicketStats,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  addTicketResponse,
};
