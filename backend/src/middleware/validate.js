const VALID_STATUSES = ['OPEN', 'IN_PROGRESS', 'IN PROGRESS', 'RESOLVED', 'CLOSED', 'Open', 'In Progress', 'Resolved', 'Closed'];
const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'Low', 'Medium', 'High', 'Urgent'];
const VALID_CATEGORIES = ['TECHNICAL', 'BILLING', 'GENERAL', 'BUG REPORT', 'FEATURE REQUEST', 'Technical', 'Billing', 'General', 'Bug Report', 'Feature Request'];

const validateTicket = (req, res, next) => {
  const { title, description, priority, status, category } = req.body;
  const errors = [];

  // Title validation
  if (!title || typeof title !== 'string' || !title.trim()) {
    errors.push('Title is required and cannot be empty');
  } else if (title.trim().length > 120) {
    errors.push('Title must not exceed 120 characters');
  }

  // Description validation
  if (!description || typeof description !== 'string' || !description.trim()) {
    errors.push('Description is required and cannot be empty');
  }

  // Priority validation
  if (priority && !VALID_PRIORITIES.includes(priority)) {
    errors.push(`Invalid priority. Allowed values: ${['LOW', 'MEDIUM', 'HIGH', 'URGENT'].join(', ')}`);
  }

  // Status validation
  if (status && !VALID_STATUSES.includes(status)) {
    errors.push(`Invalid status. Allowed values: ${['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].join(', ')}`);
  }

  // Category validation
  if (category && !VALID_CATEGORIES.includes(category)) {
    errors.push(`Invalid category. Allowed values: ${['TECHNICAL', 'BILLING', 'GENERAL'].join(', ')}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

const validateTicketUpdate = (req, res, next) => {
  const { title, description, priority, status, category } = req.body;
  const errors = [];

  if (title !== undefined && (!title || typeof title !== 'string' || !title.trim())) {
    errors.push('Title cannot be empty');
  }

  if (description !== undefined && (!description || typeof description !== 'string' || !description.trim())) {
    errors.push('Description cannot be empty');
  }

  if (priority && !VALID_PRIORITIES.includes(priority)) {
    errors.push(`Invalid priority. Allowed values: ${['LOW', 'MEDIUM', 'HIGH', 'URGENT'].join(', ')}`);
  }

  if (status && !VALID_STATUSES.includes(status)) {
    errors.push(`Invalid status. Allowed values: ${['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].join(', ')}`);
  }

  if (category && !VALID_CATEGORIES.includes(category)) {
    errors.push(`Invalid category. Allowed values: ${['TECHNICAL', 'BILLING', 'GENERAL'].join(', ')}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

module.exports = {
  validateTicket,
  validateTicketUpdate,
  VALID_STATUSES,
  VALID_PRIORITIES,
  VALID_CATEGORIES,
};
