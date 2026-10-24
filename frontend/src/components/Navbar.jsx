import React from 'react';
import { LifeBuoy, Plus, CheckCircle2, AlertCircle, Github } from 'lucide-react';

export default function Navbar({ onOpenNewTicket, isApiOnline }) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <LifeBuoy className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Support<span className="text-brand-600">Flow</span>
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 hidden sm:inline-block">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Full-Stack Support Ticketing Tool</p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* API Health indicator */}
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isApiOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
              title={isApiOnline ? 'Backend API connected' : 'Connecting to API'}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isApiOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="hidden md:inline">{isApiOnline ? 'API Connected' : 'Checking API'}</span>
            </div>

            {/* GitHub Repo Link */}
            <a
              href="https://github.com/devchahar-byte/support-ticketing-tool"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              title="View on GitHub"
            >
              <Github className="w-5 h-5" />
            </a>

            {/* Create Ticket Button */}
            <button
              onClick={onOpenNewTicket}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow transition focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Ticket</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
