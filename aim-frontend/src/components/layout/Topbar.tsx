import React from 'react';
import { useLocation } from 'react-router-dom';
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

export const Topbar: React.FC = () => {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0 sticky top-0 z-30">
      <h1 className="text-base font-semibold text-slate-800 font-sans">
        {pageTitle}
      </h1>
      <div className="flex items-center gap-4">
        <SimClockWidget />
        <RoleSwitcher />
      </div>
    </header>
  );
};

export default Topbar;
