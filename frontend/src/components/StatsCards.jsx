import React from 'react';
import { Inbox, Clock, CheckCircle, Flame, Layers } from 'lucide-react';

export default function StatsCards({ stats, selectedStatus, onSelectStatus }) {
  const cards = [
    {
      id: 'All',
      label: 'Total Tickets',
      value: stats.total || 0,
      icon: Layers,
      bgColor: 'bg-slate-50',
      iconColor: 'text-slate-700 bg-slate-100',
      borderColor: 'border-slate-200',
      activeRing: 'ring-2 ring-slate-400',
    },
    {
      id: 'Open',
      label: 'Open',
      value: stats.open || 0,
      icon: Inbox,
      bgColor: 'bg-blue-50/60',
      iconColor: 'text-blue-600 bg-blue-100',
      borderColor: 'border-blue-200',
      activeRing: 'ring-2 ring-blue-500',
    },
    {
      id: 'In Progress',
      label: 'In Progress',
      value: stats.inProgress || 0,
      icon: Clock,
      bgColor: 'bg-amber-50/60',
      iconColor: 'text-amber-600 bg-amber-100',
      borderColor: 'border-amber-200',
      activeRing: 'ring-2 ring-amber-500',
    },
    {
      id: 'Resolved',
      label: 'Resolved',
      value: stats.resolved || 0,
      icon: CheckCircle,
      bgColor: 'bg-emerald-50/60',
      iconColor: 'text-emerald-600 bg-emerald-100',
      borderColor: 'border-emerald-200',
      activeRing: 'ring-2 ring-emerald-500',
    },
    {
      id: 'Urgent',
      label: 'Urgent Priority',
      value: stats.urgent || 0,
      icon: Flame,
      bgColor: 'bg-rose-50/60',
      iconColor: 'text-rose-600 bg-rose-100',
      borderColor: 'border-rose-200',
      activeRing: 'ring-2 ring-rose-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive =
          card.id === 'Urgent'
            ? false // Urgent is priority, not status
            : selectedStatus === card.id;

        return (
          <button
            key={card.label}
            onClick={() => {
              if (card.id !== 'Urgent') {
                onSelectStatus(card.id);
              }
            }}
            className={`p-4 rounded-xl border ${card.borderColor} ${card.bgColor} text-left transition-all hover:shadow-sm ${
              isActive ? card.activeRing + ' shadow-sm bg-white' : 'hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {card.label}
              </span>
              <div className={`p-1.5 rounded-lg ${card.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {card.value}
            </div>
          </button>
        );
      })}
    </div>
  );
}
