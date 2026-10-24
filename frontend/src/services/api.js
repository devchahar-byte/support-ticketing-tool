const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Common fetch helper with unified JSON error handling
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const error = new Error(data.message || `Request failed with status ${res.status}`);
      error.status = res.status;
      error.errors = data.errors || [];
      throw error;
    }
    return data;
  } catch (error) {
    console.error(`API Error on ${options.method || 'GET'} ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // Check API health
  checkHealth: () => request('/health'),

  // Get metrics / stats
  getStats: () => request('/tickets/stats'),

  // GET /api/tickets - Fetch tickets with search and filters
  getTickets: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'All') {
        query.append(key, value);
      }
    });
    const queryString = query.toString();
    return request(`/tickets${queryString ? `?${queryString}` : ''}`);
  },

  // GET /api/tickets/:id - Fetch single ticket by ID
  getTicketById: (id) => request(`/tickets/${id}`),

  // POST /api/tickets - Create new ticket
  createTicket: (ticketData) =>
    request('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    }),

  // PUT /api/tickets/:id - Update existing ticket status/priority/details
  updateTicket: (id, updates) =>
    request(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  // DELETE /api/tickets/:id - Delete ticket by ID
  deleteTicket: (id) =>
    request(`/tickets/${id}`, {
      method: 'DELETE',
    }),

  // POST /api/tickets/:id/responses - Add response / comment
  addResponse: (id, responseData) =>
    request(`/tickets/${id}/responses`, {
      method: 'POST',
      body: JSON.stringify(responseData),
    }),
};
