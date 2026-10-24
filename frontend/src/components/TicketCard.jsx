import React from 'react';
import { Clock, MessageSquare, Edit2, Trash2, ArrowUpRight } from 'lucide-react';

export const getStatusBadge = (status) => {
  const s = status ? status.toString().toUpperCase() : '';
  switch (s) {
    case 'OPEN':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'IN_PROGRESS':
    case 'IN PROGRESS':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'RESOLVED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'CLOSED':
      return 'bg-slate-100 text-slate-700 border-slate-300';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

export const getPriorityBadge = (priority) => {
  const p = priority ? priority.toString().toUpperCase() : '';
  switch (p) {
    case 'URGENT':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'HIGH':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'MEDIUM':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'LOW':
      return 'bg-slate-50 text-slate-600 border-slate-200';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const now = new Date();
  const diffHours = Math.round((now - date) / (1000 * 60 * 60));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffHours < 48) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function TicketCard({
  ticket,
  onView,
  onEdit,
  onDelete,
  onQuickStatusChange,
  onQuickPriorityChange,
}) {
  const normalizedStatus = (ticket.status || 'OPEN').toUpperCase().replace(/\s+/g, '_');
  const normalizedPriority = (ticket.priority || 'MEDIUM').toUpperCase();

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Badges & Category */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                ticket.status
              )}`}
            >
              {normalizedStatus}
            </span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(
                ticket.priority
              )}`}
            >
              {normalizedPriority}
            </span>
            <span className="text-[11px] text-slate-500 font-semibold px-2 py-0.5 rounded-md bg-slate-100">
              {ticket.category}
            </span>
          </div>

          <span className="text-[11px] font-medium text-slate-400 flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{formatDate(ticket.createdAt)}</span>
          </span>
        </div>

        {/* Title */}
        <h3
          onClick={() => onView(ticket)}
          className="text-base font-bold text-slate-900 group-hover:text-brand-600 cursor-pointer line-clamp-2 transition mb-2"
        >
          {ticket.title}
        </h3>

        {/* Description snippet */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {ticket.description}
        </p>
      </div>

      <div>
        {/* Customer & Assigned Info */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mb-3">
          <div className="flex items-center space-x-2 truncate">
            <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-[10px] shrink-0">
              {ticket.customerName ? ticket.customerName[0].toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <span className="font-semibold text-slate-800 block truncate">
                {ticket.customerName || 'Guest User'}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                {ticket.customerEmail || 'user@example.com'}
              </span>
            </div>
          </div>

          {ticket.responses && ticket.responses.length > 0 && (
            <div className="flex items-center space-x-1 text-slate-400 shrink-0">
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">{ticket.responses.length}</span>
            </div>
          )}
        </div>

        {/* Card Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
          {/* Quick status dropdown */}
          <select
            value={normalizedStatus}
            onChange={(e) => onQuickStatusChange(ticket._id, e.target.value)}
            className="text-xs py-1 px-2 rounded-md bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold"
            title="Update Status via PUT /api/tickets/:id"
          >
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
          </select>

          {/* Action buttons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onEdit(ticket)}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              title="Edit Ticket"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(ticket)}
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              title="Delete Ticket via DELETE /api/tickets/:id"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onView(ticket)}
              className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-600 hover:text-brand-700 pl-1 py-1"
            >
              <span>View</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
