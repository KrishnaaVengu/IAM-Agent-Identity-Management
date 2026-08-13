import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
 LayoutDashboard,
 Bot,
 ClipboardCheck,
 FlaskConical,
 ScrollText,
 ArrowLeft,
 Map,
 X
} from 'lucide-react';

const navItems = [
 { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
 { label: 'Agents', path: '/agents', icon: Bot },
 { label: 'Reviews', path: '/reviews', icon: ClipboardCheck },
 { label: 'Simulator', path: '/simulator', icon: FlaskConical },
 { label: 'Audit Log', path: '/audit-log', icon: ScrollText },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
 return (
 <aside className={`w-60 bg-white text-slate-900 h-screen sticky top-0 flex flex-col justify-between p-4 flex-shrink-0 border-r border-slate-200 z-50 transition-transform transform ${isOpen ? 'translate-x-0 fixed inset-y-0 left-0' : '-translate-x-full fixed md:translate-x-0 md:static'}`}>
 <div>
 {/* Top Branding */}
 <div className="mb-6 px-2 pt-2 flex items-center justify-between">
 <Link to="/" className="block" onClick={onClose}>
 <div className="text-slate-900 font-extrabold text-xl tracking-tight">AIM</div>
 <div className="text-slate-400 text-xs font-medium mt-0.5">Agent Identity Manager</div>
 </Link>
 {onClose && (
   <button onClick={onClose} className="md:hidden p-1 text-slate-500 hover:text-slate-900 bg-slate-100 rounded-md cursor-pointer">
     <X className="w-4 h-4" />
   </button>
 )}
 </div>

 {/* Navigation Links */}
 <nav id="tour-sidebar" className="space-y-1">
 {navItems.map((item) => {
 const Icon = item.icon;
 return (
 <NavLink
 key={item.path}
 to={item.path}
 onClick={onClose}
 className={({ isActive }) => {
 return `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
 isActive
 ? 'bg-slate-900 text-white font-semibold shadow-sm'
 : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
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
 <div className="pt-4 border-t border-slate-100">
 <button
   onClick={() => {
     if (onClose) onClose();
     window.dispatchEvent(new Event('start-tour'));
   }}
   className="flex items-center justify-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors w-full mb-2 cursor-pointer"
 >
   <Map className="w-3.5 h-3.5" />
   <span>Take Tour</span>
 </button>
 <Link
 to="/landing"
 className="flex items-center justify-center gap-2 px-2 py-2 text-slate-500 hover:text-slate-900 text-xs transition-colors bg-white hover:bg-slate-50 rounded-lg border border-slate-200"
 >
 <ArrowLeft className="w-3.5 h-3.5" />
 <span>Back to Home</span>
 </Link>
 </div>
 </aside>
 );
};

export default Sidebar;
