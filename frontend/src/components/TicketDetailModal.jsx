import React, { useState } from 'react';
import { X, Send, User, MessageSquare, Clock, ShieldCheck, Mail, Tag, Calendar, Loader2 } from 'lucide-react';
import { getStatusBadge, getPriorityBadge, formatDate } from './TicketCard';

export default function TicketDetailModal({
  ticket,
  isOpen,
  onClose,
  onAddResponse,
  onUpdateStatus,
  onUpdatePriority,
  isLoading = false,
}) {
  const [replyMessage, setReplyMessage] = useState('');
  const [authorName, setAuthorName] = useState('Support Agent');
  const [role, setRole] = useState('Support Agent');
  const [statusUpdate, setStatusUpdate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingField, setUpdatingField] = useState(null); // 'status' | 'priority' | null

  if (!isOpen) return null;

  const handlePostReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !ticket) return;

    try {
      setIsSubmitting(true);
      await onAddResponse(ticket._id, {
        message: replyMessage.trim(),
        author: authorName.trim() || 'Support Agent',
        role,
        statusUpdate: statusUpdate || undefined,
      });
      setReplyMessage('');
      setStatusUpdate('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusSelect = async (newStatus) => {
    if (!ticket || newStatus === ticket.status) return;
    try {
      setUpdatingField('status');
      await onUpdateStatus(ticket._id, newStatus);
    } finally {
      setUpdatingField(null);
    }
  };

  const handlePrioritySelect = async (newPriority) => {
    if (!ticket || newPriority === ticket.priority) return;
    try {
      setUpdatingField('priority');
      await onUpdatePriority(ticket._id, newPriority);
    } finally {
      setUpdatingField(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          {isLoading || !ticket ? (
            <div className="flex items-center space-x-2 py-2 text-slate-500 text-sm">
              <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
              <span>Fetching ticket details via GET /api/tickets/:id ...</span>
            </div>
          ) : (
            <div className="space-y-2 pr-4 flex-1">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
                <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  #{ticket._id ? ticket._id.slice(-6).toUpperCase() : 'ID'}
                </span>

                {/* Status Selector */}
                <div className="flex items-center space-x-1">
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusSelect(e.target.value)}
                    disabled={updatingField === 'status'}
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none transition ${getStatusBadge(
                      ticket.status
                    )}`}
                    title="Click to update status via PUT /api/tickets/:id"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                  {updatingField === 'status' && <Loader2 className="w-3 h-3 animate-spin text-brand-600" />}
                </div>

                {/* Priority Selector */}
                <div className="flex items-center space-x-1">
                  <select
                    value={ticket.priority}
                    onChange={(e) => handlePrioritySelect(e.target.value)}
                    disabled={updatingField === 'priority'}
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none transition ${getPriorityBadge(
                      ticket.priority
                    )}`}
                    title="Click to update priority via PUT /api/tickets/:id"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                  {updatingField === 'priority' && <Loader2 className="w-3 h-3 animate-spin text-rose-600" />}
                </div>

                <span className="text-xs text-slate-600 bg-slate-200/70 font-semibold px-2 py-0.5 rounded-md">
                  {ticket.category}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {ticket.title}
              </h2>
            </div>
          )}

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        {isLoading || !ticket ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            <span className="text-sm">Loading ticket data...</span>
          </div>
        ) : (
          <div className="overflow-y-auto p-6 space-y-6 flex-1">
            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
              <div>
                <span className="font-semibold block text-slate-500 uppercase tracking-wider text-[10px]">
                  Customer
                </span>
                <span className="font-bold text-slate-800 text-sm">{ticket.customerName || 'Guest User'}</span>
                <span className="text-slate-500 block truncate">{ticket.customerEmail || 'user@example.com'}</span>
              </div>
              <div>
                <span className="font-semibold block text-slate-500 uppercase tracking-wider text-[10px]">
                  Assigned Agent
                </span>
                <span className="font-bold text-slate-800 text-sm">{ticket.assignedTo || 'Unassigned'}</span>
                <span className="text-slate-400 block">Support Team</span>
              </div>
              <div>
                <span className="font-semibold block text-slate-500 uppercase tracking-wider text-[10px]">
                  Created
                </span>
                <span className="font-bold text-slate-800 text-sm">
                  {new Date(ticket.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span className="text-slate-400 block">{formatDate(ticket.createdAt)}</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Ticket Description
              </h4>
              <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                {ticket.description}
              </div>
            </div>

            {/* Conversation / Responses Thread */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                  <MessageSquare className="w-4 h-4 text-brand-600" />
                  <span>Discussion Thread ({ticket.responses ? ticket.responses.length : 0})</span>
                </h4>
              </div>

              {ticket.responses && ticket.responses.length > 0 ? (
                <div className="space-y-3">
                  {ticket.responses.map((res, index) => {
                    const isAgent = res.role === 'Support Agent' || res.role === 'Admin';
                    return (
                      <div
                        key={res._id || index}
                        className={`p-4 rounded-xl border text-sm ${
                          isAgent
                            ? 'bg-blue-50/40 border-blue-200 ml-3 sm:ml-6'
                            : 'bg-white border-slate-200 mr-3 sm:mr-6'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900 text-xs">{res.author}</span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                isAgent
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {res.role || 'Agent'}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {formatDate(res.createdAt)}
                          </span>
                        </div>
                        <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                          {res.message}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                  No replies posted yet. Add a response below!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reply Box Footer */}
        {ticket && !isLoading && (
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70">
            <form onSubmit={handlePostReply} className="space-y-3">
              <div className="flex items-center space-x-2 text-xs flex-wrap gap-y-2">
                <span className="font-semibold text-slate-600">Reply as:</span>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Your Name"
                  className="px-2 py-1 bg-white border border-slate-200 rounded text-xs w-36"
                />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-medium"
                >
                  <option value="Support Agent">Support Agent</option>
                  <option value="Customer">Customer</option>
                  <option value="Admin">Admin</option>
                </select>

                <select
                  value={statusUpdate}
                  onChange={(e) => setStatusUpdate(e.target.value)}
                  className="ml-auto px-2 py-1 bg-white border border-slate-200 rounded text-xs text-brand-700 font-medium"
                >
                  <option value="">Keep current status ({ticket.status})</option>
                  <option value="OPEN">Change to OPEN</option>
                  <option value="IN_PROGRESS">Change to IN_PROGRESS</option>
                  <option value="RESOLVED">Change to RESOLVED</option>
                  <option value="CLOSED">Change to CLOSED</option>
                </select>
              </div>

              <div className="flex items-end space-x-2">
                <textarea
                  rows={2}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply or progress update..."
                  className="flex-1 p-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !replyMessage.trim()}
                  className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold text-xs sm:text-sm flex items-center space-x-1.5 shadow-sm disabled:opacity-50 transition shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">{isSubmitting ? 'Posting...' : 'Send Reply'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
