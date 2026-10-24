const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Ticket = require('./models/Ticket');

dotenv.config();

const initialTickets = [
  {
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
        author: 'Vikram Singh',
        role: 'Support Agent',
        message: 'Investigating API latency spikes with the gateway provider.',
      },
    ],
  },
  {
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
        author: 'Neha Gupta',
        role: 'Support Agent',
        message: 'Identified the issue in the streaming worker. Preparing hotfix.',
      },
    ],
  },
  {
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
  },
  {
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
        author: 'Vikram Singh',
        role: 'Support Agent',
        message: 'Updated token TTL from 120s to 15 minutes. Tested and verified.',
      },
    ],
  },
  {
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
        author: 'Neha Gupta',
        role: 'Support Agent',
        message: 'Enterprise agreement and customized SLA document shared via email.',
      },
    ],
  },
];

const seedDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/ticketing_db';
    await mongoose.connect(uri);
    console.log('[Seed] Connected to MongoDB...');

    await Ticket.deleteMany();
    console.log('[Seed] Cleared existing tickets.');

    await Ticket.insertMany(initialTickets);
    console.log(`[Seed] Successfully seeded ${initialTickets.length} tickets!`);

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedDB();
