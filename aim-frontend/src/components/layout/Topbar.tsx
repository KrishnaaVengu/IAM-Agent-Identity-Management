import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import RoleSwitcher from '../shared/RoleSwitcher';
import SimClockWidget from '../shared/SimClockWidget';

const getPageTitle = (pathname: string): string => {
 if (pathname === '/') return 'Dashboard';
 if (pathname.startsWith('/agents/new')) return 'Register New Agent';
 if (pathname.startsWith('/agents/')) return 'Agent Identity Detail';
 if (pathname.startsWith('/agents')) return 'Agent Registry';
 if (pathname.startsWith('/reviews/')) return 'Access Review Report';
 if (pathname.startsWith('/reviews')) return 'Access Reviews';
 if (pathname.startsWith('/simulator')) return 'API Scope Simulator';
 if (pathname.startsWith('/audit-log')) return 'Global Audit Log';
 return 'Agent Identity Manager';
};

interface TopbarProps {
  onToggleSidebar?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
 const location = useLocation();
 const pageTitle = getPageTitle(location.pathname);

 return (
 <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between flex-shrink-0 sticky top-0 z-30 transition-colors">
 <div className="flex items-center gap-3">
   {onToggleSidebar && (
     <button onClick={onToggleSidebar} className="md:hidden p-1.5 -ml-1.5 text-slate-600 hover:text-slate-900 focus:outline-none rounded-md hover:bg-slate-100 cursor-pointer">
       <Menu className="w-5 h-5" />
     </button>
   )}
   <h1 className="text-base font-semibold text-slate-800 font-sans truncate">
     {pageTitle}
   </h1>
 </div>
 <div className="flex items-center gap-2 sm:gap-4">
 <SimClockWidget />
 <RoleSwitcher />
 </div>
 </header>
 );
};

export default Topbar;
