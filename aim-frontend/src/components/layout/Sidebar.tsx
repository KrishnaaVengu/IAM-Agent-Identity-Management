import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  ClipboardCheck,
  FlaskConical,
  ScrollText,
  ArrowLeft
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Agents', path: '/agents', icon: Bot },
  { label: 'Reviews', path: '/reviews', icon: ClipboardCheck },
  { label: 'Simulator', path: '/simulator', icon: FlaskConical },
  { label: 'Audit Log', path: '/audit-log', icon: ScrollText },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-60 bg-slate-900 text-slate-100 h-screen sticky top-0 flex flex-col justify-between p-4 flex-shrink-0 border-r border-slate-800">
      <div>
        {/* Top Branding */}
        <div className="mb-6 px-2 pt-2">
          <Link to="/" className="block">
            <div className="font-mono font-bold text-white text-2xl tracking-tight hover:text-blue-400 transition-colors">AIM</div>
            <div className="text-slate-400 text-xs font-mono mt-0.5">Agent Identity Manager</div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => {
                  return `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-700 text-white border-l-2 border-blue-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`;
                }}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Back to Home Link */}
      <div className="pt-4 border-t border-slate-800">
        <Link
          to="/landing"
          className="flex items-center gap-2 px-2 text-slate-500 hover:text-slate-300 text-xs font-mono transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Back to Home</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
