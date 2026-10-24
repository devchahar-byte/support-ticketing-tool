const Ticket = require('../models/Ticket');
const { getDBStatus } = require('../config/db');

// In-Memory store for when local MongoDB is not running
let memoryTickets = [
  {
    _id: '65f1a1000000000000000001',
    title: 'Payment gateway fails during checkout with 502 error',
    description: 'Customers report getting a 502 Bad Gateway response when attempting Stripe card checkout.',
    status: 'Open',
    priority: 'Urgent',
    category: 'Billing',
    customerName: 'Aarav Sharma',
    customerEmail: 'aarav.sharma@example.com',
    assignedTo: 'Vikram Singh',
    tags: ['stripe', 'checkout', 'p0'],
    responses: [
      {
        _id: 'res-101',
        author: 'Vikram Singh',
        role: 'Support Agent',
        message: 'Investigating API latency spikes with the gateway provider.',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: '65f1a1000000000000000002',
    title: 'Cannot export CSV report from Dashboard analytics',
    description: 'Clicking Export CSV triggers an infinite spinner and no file downloads.',
    status: 'In Progress',
    priority: 'High',
    category: 'Bug Report',
    customerName: 'Priya Patel',
    customerEmail: 'priya.patel@example.com',
    assignedTo: 'Neha Gupta',
    tags: ['export', 'analytics'],
    responses: [
      {
        _id: 'res-102',
        author: 'Neha Gupta',
        role: 'Support Agent',
        message: 'Identified the issue in the streaming worker. Preparing hotfix.',
        createdAt: new Date(Date.now() - 5400000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    updatedAt: new Date(Date.now() - 5400000).toISOString(),
  },
  {
    _id: '65f1a1000000000000000003',
    title: 'Request dark mode theme support for the customer portal',
    description: 'We would love to see a native dark theme toggle in the UI for night shifts.',
    status: 'Open',
    priority: 'Low',
    category: 'Feature Request',
    customerName: 'Rohit Verma',
    customerEmail: 'rohit.v@example.com',
    assignedTo: 'Unassigned',
    tags: ['ui', 'theme'],
    responses: [],
    createdAt: new Date(Date.now() - 28800000).toISOString(),
    updatedAt: new Date(Date.now() - 28800000).toISOString(),
  },
  {
    _id: '65f1a1000000000000000004',
    title: 'Reset password link expired too quickly (within 2 minutes)',
    description: 'User received the reset email but link was already invalid when opened.',
    status: 'Resolved',
    priority: 'Medium',
    category: 'Technical',
    customerName: 'Sunita Rao',
    customerEmail: 'sunita.rao@example.com',
    assignedTo: 'Vikram Singh',
    tags: ['auth', 'security'],
    responses: [
      {
        _id: 'res-103',
        author: 'Vikram Singh',
        role: 'Support Agent',
        message: 'Updated token TTL from 120s to 15 minutes. Tested and verified.',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: '65f1a1000000000000000005',
    title: 'Inquiry regarding Enterprise plan custom SLA terms',
    description: 'Interested in upgrading 50 seats, need details on dedicated support managers and 99.99% SLA.',
    status: 'Closed',
    priority: 'Medium',
    category: 'General',
    customerName: 'Ananya Deshmukh',
    customerEmail: 'ananya.d@enterprise-corp.com',
    assignedTo: 'Neha Gupta',
    tags: ['sales', 'enterprise'],
    responses: [
      {
        _id: 'res-104',
        author: 'Neha Gupta',
        role: 'Support Agent',
        message: 'Enterprise agreement and customized SLA document shared via email.',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
  },
];

// Helper to generate simulated MongoDB ObjectID
const generateId = () => {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random = Math.floor(Math.random() * 0xffffffffffff).toString(16).padStart(16, '0');
  return timestamp + random;
};

// @desc    Get all tickets with search, filtering, and sorting
// @route   GET /api/tickets
// @access  Public
const getTickets = async (req, res, next) => {
  try {
    const { status, priority, category, search, sortBy = 'createdAt', order = 'desc', page = 1, limit = 50 } = req.query;

    if (getDBStatus()) {
      const query = {};

      if (status && status !== 'All') query.status = status;
      if (priority && priority !== 'All') query.priority = priority;
      if (category && category !== 'All') query.category = category;

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
      filtered = filtered.filter((t) => t.status.toLowerCase() === status.toLowerCase());
    }
    if (priority && priority !== 'All') {
      filtered = filtered.filter((t) => t.priority.toLowerCase() === priority.toLowerCase());
    }
    if (category && category !== 'All') {
      filtered = filtered.filter((t) => t.category.toLowerCase() === category.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.customerName.toLowerCase().includes(q) ||
          t.customerEmail.toLowerCase().includes(q)
      );
    }

    // Sorting
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
    const open = tickets.filter((t) => t.status === 'Open').length;
    const inProgress = tickets.filter((t) => t.status === 'In Progress').length;
    const resolved = tickets.filter((t) => t.status === 'Resolved').length;
    const closed = tickets.filter((t) => t.status === 'Closed').length;
    const urgent = tickets.filter((t) => t.priority === 'Urgent').length;

    const byCategory = tickets.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {});

    const byPriority = tickets.reduce((acc, t) => {
      acc[t.priority] = (acc[t.priority] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        total,
        open,
        inProgress,
        resolved,
        closed,
        urgent,
        byCategory,
        byPriority,
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
        return res.status(404).json({ success: false, message: `Ticket not found with id ${id}` });
      }
      return res.status(200).json({ success: true, data: ticket });
    }

    const ticket = memoryTickets.find((t) => t._id.toString() === id.toString());
    if (!ticket) {
      return res.status(404).json({ success: false, message: `Ticket not found with id ${id}` });
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
    const { title, description, priority, category, customerName, customerEmail, assignedTo, tags } = req.body;

    if (!title || !description || !customerName || !customerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, customerName, customerEmail',
      });
    }

    if (getDBStatus()) {
      const ticket = await Ticket.create({
        title,
        description,
        priority: priority || 'Medium',
        category: category || 'General',
        customerName,
        customerEmail,
        assignedTo: assignedTo || 'Unassigned',
        tags: Array.isArray(tags) ? tags : [],
        responses: [],
      });
      return res.status(201).json({ success: true, message: 'Ticket created successfully', data: ticket });
    }

    const newTicket = {
      _id: generateId(),
      title,
      description,
      status: 'Open',
      priority: priority || 'Medium',
      category: category || 'General',
      customerName,
      customerEmail,
      assignedTo: assignedTo || 'Unassigned',
      tags: Array.isArray(tags) ? tags : [],
      responses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    memoryTickets.unshift(newTicket);
    res.status(201).json({ success: true, message: 'Ticket created successfully', data: newTicket });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a ticket
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
        return res.status(404).json({ success: false, message: `Ticket not found with id ${id}` });
      }
      return res.status(200).json({ success: true, message: 'Ticket updated successfully', data: ticket });
    }

    const index = memoryTickets.findIndex((t) => t._id.toString() === id.toString());
    if (index === -1) {
      return res.status(404).json({ success: false, message: `Ticket not found with id ${id}` });
    }

    const existing = memoryTickets[index];
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    memoryTickets[index] = updated;
    res.status(200).json({ success: true, message: 'Ticket updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a ticket
// @route   DELETE /api/tickets/:id
// @access  Public
const deleteTicket = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getDBStatus()) {
      const ticket = await Ticket.findByIdAndDelete(id);
      if (!ticket) {
        return res.status(404).json({ success: false, message: `Ticket not found with id ${id}` });
      }
      return res.status(200).json({ success: true, message: 'Ticket deleted successfully', data: {} });
    }

    const initialLen = memoryTickets.length;
    memoryTickets = memoryTickets.filter((t) => t._id.toString() !== id.toString());

    if (memoryTickets.length === initialLen) {
      return res.status(404).json({ success: false, message: `Ticket not found with id ${id}` });
    }

    res.status(200).json({ success: true, message: 'Ticket deleted successfully', data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a response / comment to a ticket
// @route   POST /api/tickets/:id/responses
// @access  Public
const addTicketResponse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message, author, role = 'Support Agent', statusUpdate } = req.body;

    if (!message || !author) {
      return res.status(400).json({
        success: false,
        message: 'Message and author are required to post a response',
      });
    }

    if (getDBStatus()) {
      const ticket = await Ticket.findById(id);
      if (!ticket) {
        return res.status(404).json({ success: false, message: `Ticket not found with id ${id}` });
      }

      ticket.responses.push({ message, author, role });
      if (statusUpdate && ['Open', 'In Progress', 'Resolved', 'Closed'].includes(statusUpdate)) {
        ticket.status = statusUpdate;
      }

      await ticket.save();
      return res.status(201).json({ success: true, message: 'Response posted successfully', data: ticket });
    }

    const ticket = memoryTickets.find((t) => t._id.toString() === id.toString());
    if (!ticket) {
      return res.status(404).json({ success: false, message: `Ticket not found with id ${id}` });
    }

    const responseObj = {
      _id: 'res-' + Date.now(),
      message,
      author,
      role,
      createdAt: new Date().toISOString(),
    };

    ticket.responses.push(responseObj);
    if (statusUpdate && ['Open', 'In Progress', 'Resolved', 'Closed'].includes(statusUpdate)) {
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
