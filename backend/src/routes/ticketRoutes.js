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

// Ticket statistics & dashboard metrics
router.get('/stats', getTicketStats);

// Main collection endpoints
router.route('/')
  .get(getTickets)
  .post(createTicket);

// Single ticket endpoints
router.route('/:id')
  .get(getTicketById)
  .put(updateTicket)
  .delete(deleteTicket);

// Ticket responses / conversation thread
router.post('/:id/responses', addTicketResponse);

module.exports = router;
