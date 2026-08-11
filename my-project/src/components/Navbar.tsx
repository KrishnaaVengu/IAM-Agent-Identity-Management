import React, { useState, useEffect } from 'react';
import { Shield, ChevronDown, User, Check, Wifi, Battery, Search } from 'lucide-react';

interface NavbarProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRole, onRoleChange }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [timeStr, setTimeStr] = useState('Tue Oct 18  9:41 AM');

  useEffect(() => {
    // Generate clock text
    const updateClock = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      };
      setTimeStr(now.toLocaleString('en-US', options).replace(/,/g, ''));
    };
    updateClock();
    const interval = setInterval(updateClock, 60000);
    return () => clearInterval(interval);
  }, []);

  const roles = [
    { id: 'Admin', name: 'Security Admin', desc: 'Full write & identity access' },
    { id: 'Team Owner', name: 'Team Owner', desc: 'Manage team-scoped agents' },
    { id: 'Viewer', name: 'Compliance Auditor', desc: 'Read-only audit reports' }
  ];

  return (
    <header className="w-full bg-[#000] border-b border-zinc-900 select-none font-sans text-xs">
      
      {/* 1. Mac OS System Menu Bar */}
      <div className="w-full flex items-center justify-between px-4 py-1.5 text-zinc-400 font-medium tracking-tight">
        <div className="flex items-center gap-4">
          <Shield className="w-3.5 h-3.5 text-zinc-100 fill-zinc-100" />
          <span className="font-bold text-zinc-200">AIM Portal</span>
          <span className="hover:text-zinc-200 cursor-pointer">File</span>
          <span className="hover:text-zinc-200 cursor-pointer">Identity</span>
          <span className="hover:text-zinc-200 cursor-pointer">Policy</span>
          <span className="hover:text-zinc-200 cursor-pointer">Audit</span>
          <span className="hover:text-zinc-200 cursor-pointer">Window</span>
          <span className="hover:text-zinc-200 cursor-pointer">Help</span>
        </div>
        
        <div className="flex items-center gap-3">
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-4 h-4 text-zinc-300 fill-zinc-400" />
          <Search className="w-3.5 h-3.5" />
          <span className="font-mono text-[11px] text-zinc-300">{timeStr}</span>
        </div>
      </div>

      {/* 2. Safari Browser Window Top Bar */}
      <div className="w-full bg-[#0f0f0f] border-t border-zinc-950 px-4 py-3 flex items-center justify-between gap-4">
        
        {/* Left: Window Control Dots */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-3 h-3 rounded-full bg-rose-500 border border-rose-600/40 cursor-pointer"></div>
          <div className="w-3 h-3 rounded-full bg-amber-500 border border-amber-600/40 cursor-pointer"></div>
          <div className="w-3 h-3 rounded-full bg-green-500 border border-green-600/40 cursor-pointer"></div>
          
          <div className="flex items-center gap-1 ml-4 text-zinc-600">
            <span className="px-1.5 py-0.5 hover:bg-zinc-800 rounded hover:text-zinc-400 cursor-pointer">‹</span>
            <span className="px-1.5 py-0.5 hover:bg-zinc-800 rounded hover:text-zinc-400 cursor-pointer">›</span>
          </div>
        </div>

        {/* Center: URL bar representation */}
        <div className="flex-1 max-w-lg mx-auto relative flex items-center">
          <div className="w-full bg-zinc-950/80 border border-zinc-850 hover:border-zinc-700/60 rounded-md py-1.5 px-3 flex items-center justify-center gap-1.5 text-zinc-400 font-mono text-[11px] text-center cursor-text transition-all">
            <Shield className="w-3 h-3 text-brand-cyan fill-brand-cyan/20" />
            <span className="text-zinc-500">aim-identity.aivar.security</span>
          </div>
        </div>

        {/* Right: Role Switcher & Persona controls */}
        <div className="shrink-0 flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-850 text-zinc-300 font-medium hover:border-brand-cyan/40 hover:text-white transition-all cursor-pointer"
            >
              <User className="w-3 h-3 text-brand-cyan" />
              <span>Role: <strong className="text-white font-semibold">{currentRole}</strong></span>
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            </button>

            {dropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-60 rounded bg-zinc-950 border border-zinc-850 shadow-2xl py-1 z-50 text-left">
                  <div className="px-3 py-2 border-b border-zinc-900">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Select Demo Role</p>
                  </div>
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => {
                        onRoleChange(role.id);
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-start gap-2.5 px-3 py-2 hover:bg-zinc-900 text-left transition-colors cursor-pointer"
                    >
                      <div className="mt-0.5 flex items-center justify-center w-3.5 h-3.5 rounded-full border border-zinc-800 bg-zinc-900 text-brand-cyan shrink-0">
                        {currentRole === role.id && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-100">{role.name}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{role.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
