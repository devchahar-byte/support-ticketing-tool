import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import StatsCards from './components/StatsCards';
import FilterBar from './components/FilterBar';
import TicketCard from './components/TicketCard';
import TicketTable from './components/TicketTable';
import TicketFormModal from './components/TicketFormModal';
import TicketDetailModal from './components/TicketDetailModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import Toast from './components/Toast';
import { api } from './services/api';
import { Loader2, Plus, Inbox, AlertTriangle, RefreshCw } from 'lucide-react';

export default function App() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    urgent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [isApiOnline, setIsApiOnline] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Filter & Search states
  const [filters, setFilters] = useState({
    status: 'All',
    priority: 'All',
    category: 'All',
    search: '',
    sortBy: 'createdAt',
    order: 'desc',
  });

  // Modals & Active ticket states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [formApiErrors, setFormApiErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detail view state
  const [detailTicket, setDetailTicket] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Deleting state
  const [deletingTicket, setDeletingTicket] = useState(null);

  // Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Check API health
  const checkHealth = useCallback(async () => {
    try {
      await api.checkHealth();
      setIsApiOnline(true);
    } catch {
      setIsApiOnline(false);
    }
  }, []);

  // Fetch Tickets and Stats (GET /api/tickets, GET /api/tickets/stats)
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setApiError(null);
      const [ticketsRes, statsRes] = await Promise.all([
        api.getTickets(filters),
        api.getStats(),
      ]);

      if (ticketsRes && ticketsRes.data) {
        setTickets(ticketsRes.data);
      }
      if (statsRes && statsRes.data) {
        setStats(statsRes.data);
      }
      setIsApiOnline(true);
    } catch (error) {
      console.warn('API error, check backend server:', error.message);
      setApiError(error.message || 'Failed to fetch tickets from REST API');
      setIsApiOnline(false);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      status: 'All',
      priority: 'All',
      category: 'All',
      search: '',
      sortBy: 'createdAt',
      order: 'desc',
    });
  };

  // View Ticket Details via GET /api/tickets/:id
  const handleViewTicket = async (ticket) => {
    try {
      setIsDetailOpen(true);
      setIsDetailLoading(true);
      setDetailTicket(ticket); // show immediate preview
      const res = await api.getTicketById(ticket._id);
      if (res && res.data) {
        setDetailTicket(res.data);
      }
    } catch (error) {
      showToast(error.message || 'Failed to fetch ticket details', 'error');
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Update Status via PUT /api/tickets/:id
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await api.updateTicket(id, { status: newStatus });
      showToast(`Status updated to ${newStatus}`);
      if (res && res.data) {
        setDetailTicket(res.data);
      }
      fetchData();
    } catch (error) {
      showToast(error.message || 'Failed to update status', 'error');
    }
  };

  // Update Priority via PUT /api/tickets/:id
  const handleUpdatePriority = async (id, newPriority) => {
    try {
      const res = await api.updateTicket(id, { priority: newPriority });
      showToast(`Priority updated to ${newPriority}`);
      if (res && res.data) {
        setDetailTicket(res.data);
      }
      fetchData();
    } catch (error) {
      showToast(error.message || 'Failed to update priority', 'error');
    }
  };

  // Create or Update ticket submit (POST /api/tickets or PUT /api/tickets/:id)
  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      setFormApiErrors([]);
      if (editingTicket) {
        await api.updateTicket(editingTicket._id, formData);
        showToast('Ticket updated successfully!');
      } else {
        await api.createTicket(formData);
        showToast('Ticket created successfully (201 Created)!');
      }
      setIsFormOpen(false);
      setEditingTicket(null);
      fetchData();
    } catch (error) {
      if (error.errors && error.errors.length > 0) {
        setFormApiErrors(error.errors);
      } else {
        showToast(error.message || 'Operation failed', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete ticket via DELETE /api/tickets/:id
  const handleDeleteConfirm = async () => {
    if (!deletingTicket) return;
    try {
      setIsSubmitting(true);
      await api.deleteTicket(deletingTicket._id);
      showToast('Ticket deleted successfully');
      setDeletingTicket(null);
      fetchData();
    } catch (error) {
      showToast(error.message || 'Failed to delete ticket', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add response to ticket thread (POST /api/tickets/:id/responses)
  const handleAddResponse = async (id, responseData) => {
    try {
      const res = await api.addResponse(id, responseData);
      showToast('Response posted successfully!');
      if (res && res.data) {
        setDetailTicket(res.data);
      }
      fetchData();
    } catch (error) {
      showToast(error.message || 'Failed to post reply', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <Navbar
        onOpenNewTicket={() => {
          setEditingTicket(null);
          setFormApiErrors([]);
          setIsFormOpen(true);
        }}
        isApiOnline={isApiOnline}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title & Subtitle */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Support Tickets Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Connected to Express REST API with MongoDB. Manage, prioritize, and resolve issues in real-time.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingTicket(null);
              setFormApiErrors([]);
              setIsFormOpen(true);
            }}
            className="sm:hidden w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Ticket</span>
          </button>
        </div>

        {/* API Error Alert Banner */}
        {apiError && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-rose-800 text-sm">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>
                <strong>API Notice:</strong> {apiError}
              </span>
            </div>
            <button
              onClick={fetchData}
              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Top Summary Cards */}
        <StatsCards
          stats={stats}
          selectedStatus={filters.status}
          onSelectStatus={(status) => handleFilterChange('status', status)}
        />

        {/* Filter & Search Bar */}
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
        />

        {/* Loading State */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            <p className="text-sm font-medium">Loading tickets via GET /api/tickets...</p>
          </div>
        ) : tickets.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tickets.map((ticket) => (
                <TicketCard
                  key={ticket._id}
                  ticket={ticket}
                  onView={handleViewTicket}
                  onEdit={(t) => {
                    setEditingTicket(t);
                    setFormApiErrors([]);
                    setIsFormOpen(true);
                  }}
                  onDelete={(t) => setDeletingTicket(t)}
                  onQuickStatusChange={handleUpdateStatus}
                />
              ))}
            </div>
          ) : (
            <TicketTable
              tickets={tickets}
              onView={handleViewTicket}
              onEdit={(t) => {
                setEditingTicket(t);
                setFormApiErrors([]);
                setIsFormOpen(true);
              }}
              onDelete={(t) => setDeletingTicket(t)}
              onQuickStatusChange={handleUpdateStatus}
            />
          )
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">No Tickets Found</h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              {filters.search || filters.status !== 'All' || filters.priority !== 'All'
                ? 'Try adjusting your filters or search keywords.'
                : 'Get started by creating your first support ticket.'}
            </p>
            <button
              onClick={() => {
                if (filters.search || filters.status !== 'All') {
                  handleResetFilters();
                } else {
                  setEditingTicket(null);
                  setFormApiErrors([]);
                  setIsFormOpen(true);
                }
              }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>
                {filters.search || filters.status !== 'All'
                  ? 'Clear Filters'
                  : 'Create First Ticket'}
              </span>
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} SupportFlow — Support Ticketing Tool Internship Project.</p>
          <div className="flex items-center space-x-4">
            <span>React.js</span>
            <span>•</span>
            <span>Node.js / Express</span>
            <span>•</span>
            <span>MongoDB</span>
            <span>•</span>
            <a
              href="https://github.com/devchahar-byte/support-ticketing-tool"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 hover:underline font-semibold"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>

      {/* Modals & Toasts */}
      <TicketFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTicket(null);
          setFormApiErrors([]);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingTicket}
        isSubmitting={isSubmitting}
        apiErrors={formApiErrors}
      />

      <TicketDetailModal
        isOpen={isDetailOpen}
        ticket={detailTicket}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailTicket(null);
        }}
        onAddResponse={handleAddResponse}
        onUpdateStatus={handleUpdateStatus}
        onUpdatePriority={handleUpdatePriority}
        isLoading={isDetailLoading}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deletingTicket)}
        ticketTitle={deletingTicket?.title}
        onClose={() => setDeletingTicket(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isSubmitting}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
