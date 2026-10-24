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
import { Loader2, Plus, Inbox } from 'lucide-react';

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
  const [detailTicket, setDetailTicket] = useState(null);
  const [deletingTicket, setDeletingTicket] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Fetch Tickets and Stats
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
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

  // Quick Status change from card/table
  const handleQuickStatusChange = async (id, newStatus) => {
    try {
      await api.updateTicket(id, { status: newStatus });
      showToast(`Status updated to ${newStatus}`);
      fetchData();
      if (detailTicket && detailTicket._id === id) {
        setDetailTicket((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      showToast(error.message || 'Failed to update status', 'error');
    }
  };

  // Create or Update ticket submit
  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (editingTicket) {
        await api.updateTicket(editingTicket._id, formData);
        showToast('Ticket updated successfully!');
      } else {
        await api.createTicket(formData);
        showToast('Ticket created successfully!');
      }
      setIsFormOpen(false);
      setEditingTicket(null);
      fetchData();
    } catch (error) {
      showToast(error.message || 'Operation failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete ticket
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

  // Add response to ticket thread
  const handleAddResponse = async (id, responseData) => {
    try {
      const res = await api.addResponse(id, responseData);
      showToast('Response posted!');
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
              Manage, prioritize, and resolve customer support issues in real-time.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingTicket(null);
              setIsFormOpen(true);
            }}
            className="sm:hidden w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Ticket</span>
          </button>
        </div>

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

        {/* Ticket List or Table */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            <p className="text-sm font-medium">Loading tickets...</p>
          </div>
        ) : tickets.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tickets.map((ticket) => (
                <TicketCard
                  key={ticket._id}
                  ticket={ticket}
                  onView={(t) => setDetailTicket(t)}
                  onEdit={(t) => {
                    setEditingTicket(t);
                    setIsFormOpen(true);
                  }}
                  onDelete={(t) => setDeletingTicket(t)}
                  onQuickStatusChange={handleQuickStatusChange}
                />
              ))}
            </div>
          ) : (
            <TicketTable
              tickets={tickets}
              onView={(t) => setDetailTicket(t)}
              onEdit={(t) => {
                setEditingTicket(t);
                setIsFormOpen(true);
              }}
              onDelete={(t) => setDeletingTicket(t)}
              onQuickStatusChange={handleQuickStatusChange}
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
        }}
        onSubmit={handleFormSubmit}
        initialData={editingTicket}
        isSubmitting={isSubmitting}
      />

      <TicketDetailModal
        isOpen={Boolean(detailTicket)}
        ticket={detailTicket}
        onClose={() => setDetailTicket(null)}
        onAddResponse={handleAddResponse}
        onUpdateStatus={handleQuickStatusChange}
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
