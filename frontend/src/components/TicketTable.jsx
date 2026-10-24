import React from 'react';
import { getStatusBadge, getPriorityBadge, formatDate } from './TicketCard';
import { Edit2, Trash2, ArrowUpRight, MessageSquare } from 'lucide-react';

export default function TicketTable({
  tickets,
  onView,
  onEdit,
  onDelete,
  onQuickStatusChange,
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500 tracking-wider">
            <tr>
              <th className="py-3 px-4">Ticket</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Created</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.map((ticket) => (
              <tr key={ticket._id} className="hover:bg-slate-50/70 transition">
                {/* Title */}
                <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                  <div className="flex items-center space-x-2">
                    <span
                      onClick={() => onView(ticket)}
                      className="font-bold text-slate-900 hover:text-brand-600 cursor-pointer line-clamp-1"
                    >
                      {ticket.title}
                    </span>
                    {ticket.responses && ticket.responses.length > 0 && (
                      <span className="flex items-center text-[10px] text-slate-400 font-semibold space-x-0.5">
                        <MessageSquare className="w-3 h-3" />
                        <span>{ticket.responses.length}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    {ticket.description}
                  </p>
                </td>

                {/* Status */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <select
                    value={ticket.status}
                    onChange={(e) => onQuickStatusChange(ticket._id, e.target.value)}
                    className={`text-xs font-semibold py-1 px-2 rounded-full border focus:outline-none ${getStatusBadge(
                      ticket.status
                    )}`}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </td>

                {/* Priority */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getPriorityBadge(
                      ticket.priority
                    )}`}
                  >
                    {ticket.priority}
                  </span>
                </td>

                {/* Category */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                    {ticket.category}
                  </span>
                </td>

                {/* Customer */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="text-xs">
                    <span className="font-semibold text-slate-800 block">
                      {ticket.customerName}
                    </span>
                    <span className="text-slate-400">{ticket.customerEmail}</span>
                  </div>
                </td>

                {/* Created Date */}
                <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500">
                  {formatDate(ticket.createdAt)}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <button
                      onClick={() => onView(ticket)}
                      className="p-1.5 rounded-md text-brand-600 hover:bg-brand-50"
                      title="View Details"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(ticket)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(ticket)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
