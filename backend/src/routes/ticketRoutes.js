const express = require('express');
const router = express.Router();
const {
  getTickets,
  getTicketStats,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  addTicketResponse,
} = require('../controllers/ticketController');
const {
  validateTicket,
  validateTicketUpdate,
} = require('../middleware/validate');

// Dashboard metrics
router.get('/stats', getTicketStats);

// Ticket collection routes:
// POST /api/tickets - Create a new ticket with validation
// GET  /api/tickets - List all tickets with search & filtering
router.route('/')
  .get(getTickets)
  .post(validateTicket, createTicket);

// Individual ticket routes:
// GET    /api/tickets/:id - Get ticket by ID
// PUT    /api/tickets/:id - Update ticket by ID with validation
// DELETE /api/tickets/:id - Delete ticket by ID
router.route('/:id')
  .get(getTicketById)
  .put(validateTicketUpdate, updateTicket)
  .delete(deleteTicket);

// POST /api/tickets/:id/responses - Conversation replies
router.post('/:id/responses', addTicketResponse);

module.exports = router;
