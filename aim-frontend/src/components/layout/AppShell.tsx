import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export const AppShell: React.FC = () => {
 const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

 return (
 <div className="w-full min-h-screen bg-slate-50 text-slate-900 flex font-sans transition-colors relative">
 <Sidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
 
 {/* Overlay for mobile sidebar */}
 {mobileSidebarOpen && (
   <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" onClick={() => setMobileSidebarOpen(false)} />
 )}

 <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
 <Topbar onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
 <main className="flex-1 bg-slate-50 p-4 sm:p-6 overflow-y-auto">
 <Outlet />
 </main>
 </div>
 </div>
 );
};

export default AppShell;
