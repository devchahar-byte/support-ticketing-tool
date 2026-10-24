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
      throw new Error(data.message || `Request failed with status ${res.status}`);
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

  // Get tickets with search and filters
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

  // Get single ticket by ID
  getTicketById: (id) => request(`/tickets/${id}`),

  // Create new ticket
  createTicket: (ticketData) =>
    request('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    }),

  // Update existing ticket
  updateTicket: (id, updates) =>
    request(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  // Delete ticket
  deleteTicket: (id) =>
    request(`/tickets/${id}`, {
      method: 'DELETE',
    }),

  // Add response / comment
  addResponse: (id, responseData) =>
    request(`/tickets/${id}/responses`, {
      method: 'POST',
      body: JSON.stringify(responseData),
    }),
};
