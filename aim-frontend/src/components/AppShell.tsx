import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Terminal,
  ScrollText,
  ArrowLeft,
  Clock,
  UserCheck
} from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Agent Registry', path: '/agents', icon: Users },
    { label: 'Access Reviews', path: '/reviews', icon: ClipboardCheck },
    { label: 'API Simulator', path: '/simulator', icon: Terminal },
    { label: 'Audit Log', path: '/audit-log', icon: ScrollText },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/90 flex flex-col justify-between p-4 sticky top-0 h-screen">
        <div>
          {/* Logo Header */}
          <div className="flex items-center gap-3 px-3 py-4 border-b border-slate-800 mb-6">
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-mono font-bold text-lg">
              AIM
            </div>
            <div>
              <div className="font-mono font-bold text-sm text-white tracking-wide">AIM Console</div>
              <div className="text-[11px] text-slate-400 font-mono">Agent Identity Manager</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Back to Home Link */}
        <div className="pt-4 border-t border-slate-800">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>← Back to Home</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-white font-sans">
              Identity Management Dashboard
            </h1>
            <span className="bg-blue-950/80 text-blue-400 border border-blue-800/60 px-2.5 py-0.5 rounded text-xs font-mono">
              Demo Environment
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Simulation Clock Indicator */}
            <div className="flex items-center gap-2 bg-amber-950/40 border border-amber-800/50 px-3 py-1 rounded-full text-xs font-mono text-amber-300">
              <Clock className="w-3.5 h-3.5" />
              <span>Sim Clock: Active</span>
            </div>

            {/* Role Switcher Demo */}
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 px-3 py-1 rounded-lg text-xs font-mono text-slate-300">
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Role: Admin</span>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="p-6 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
