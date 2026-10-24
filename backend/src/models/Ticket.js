const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: [true, 'Response message is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
      default: 'Support Agent',
    },
    role: {
      type: String,
      enum: ['Customer', 'Support Agent', 'Admin'],
      default: 'Support Agent',
    },
  },
  { timestamps: true }
);

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Ticket title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Ticket description is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: [
        'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED',
        'Open', 'In Progress', 'Resolved', 'Closed',
      ],
      default: 'OPEN',
    },
    priority: {
      type: String,
      enum: [
        'LOW', 'MEDIUM', 'HIGH', 'URGENT',
        'Low', 'Medium', 'High', 'Urgent',
      ],
      default: 'MEDIUM',
    },
    category: {
      type: String,
      enum: [
        'TECHNICAL', 'BILLING', 'GENERAL', 'BUG REPORT', 'FEATURE REQUEST',
        'Technical', 'Billing', 'General', 'Bug Report', 'Feature Request',
      ],
      default: 'TECHNICAL',
    },
    customerName: {
      type: String,
      default: 'Guest User',
      trim: true,
    },
    customerEmail: {
      type: String,
      default: 'user@example.com',
      trim: true,
    },
    assignedTo: {
      type: String,
      default: 'Unassigned',
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    responses: [responseSchema],
  },
  {
    timestamps: true,
  }
);

// Index for search optimization
ticketSchema.index({ title: 'text', description: 'text', customerName: 'text' });

module.exports = mongoose.model('Ticket', ticketSchema);
