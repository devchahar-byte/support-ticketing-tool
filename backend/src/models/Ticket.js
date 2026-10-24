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
      enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
      default: 'Open',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    category: {
      type: String,
      enum: ['Technical', 'Billing', 'General', 'Bug Report', 'Feature Request'],
      default: 'General',
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerEmail: {
      type: String,
      required: [true, 'Customer email is required'],
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
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
