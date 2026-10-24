import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

export default function TicketFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
  apiErrors = [],
}) {
  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'HIGH',
    status: 'OPEN',
    category: 'TECHNICAL',
    customerName: '',
    customerEmail: '',
    assignedTo: 'Unassigned',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        priority: initialData.priority || 'HIGH',
        status: initialData.status || 'OPEN',
        category: initialData.category || 'TECHNICAL',
        customerName: initialData.customerName || '',
        customerEmail: initialData.customerEmail || '',
        assignedTo: initialData.assignedTo || 'Unassigned',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'HIGH',
        status: 'OPEN',
        category: 'TECHNICAL',
        customerName: '',
        customerEmail: '',
        assignedTo: 'Unassigned',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {isEditing ? 'Edit Support Ticket' : 'Create Support Ticket (POST /api/tickets)'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* API Errors Banner */}
          {apiErrors && apiErrors.length > 0 && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              <div className="flex items-center space-x-1.5 font-bold mb-1">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>API Validation Error</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 pl-1">
                {apiErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Unable to login"
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition ${
                errors.title ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-rose-500 mt-1 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.title}</span>
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Login issue on authentication service"
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition ${
                errors.description ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
            {errors.description && (
              <p className="text-xs text-rose-500 mt-1 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.description}</span>
              </p>
            )}
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              >
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
          </div>

          {/* Category & Assigned To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              >
                <option value="TECHNICAL">TECHNICAL</option>
                <option value="BILLING">BILLING</option>
                <option value="GENERAL">GENERAL</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Assigned Agent
              </label>
              <input
                type="text"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                placeholder="Vikram Singh"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Customer Name & Email (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Customer Name <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="Guest User"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Customer Email <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                placeholder="user@example.com"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm hover:shadow transition disabled:opacity-50 flex items-center space-x-2"
            >
              {isSubmitting && (
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              <span>{isSubmitting ? 'Saving...' : isEditing ? 'Update Ticket' : 'Create Ticket'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
