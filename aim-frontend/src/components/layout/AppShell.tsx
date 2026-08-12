import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export const AppShell: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 flex font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        <Topbar />
        <main className="flex-1 bg-slate-50 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppShell;
