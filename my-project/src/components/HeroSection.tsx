import React from 'react';
import { Play, Key, FileCode } from 'lucide-react';

interface HeroSectionProps {
  onExploreSimulator: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreSimulator }) => {
  return (
    <section className="relative w-full pt-20 pb-20 px-6 border-b border-zinc-900 overflow-hidden bg-[#090909]">
      
      {/* Background radial highlights */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] glow-spot-cyan -z-10 opacity-40"></div>
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] glow-spot-orange -z-10 opacity-20"></div>

      <div className="max-w-7xl mx-auto flex flex-col items-center">
        
        {/* Parenthesized category tag */}
        <div className="mb-6 flex items-center justify-center">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest bg-zinc-950 px-2.5 py-1 rounded border border-zinc-900">
            (Governance & Security)
          </span>
        </div>

        {/* Kurate-Inspired Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-zinc-100 max-w-5xl leading-[1.15] text-center tracking-tight font-sans">
          Provisioning keys, governing autonomous 
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 mx-2 bg-gradient-to-r from-brand-cyan/20 to-brand-cyan/5 border border-brand-cyan/30 rounded-full align-middle animate-pulse">
            <Key className="w-5 h-5 text-brand-cyan" />
            <span className="text-xs font-bold text-brand-cyan uppercase tracking-widest font-mono">sk_agt</span>
          </span>
          agents, and securing the future of machine workloads as a 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-brand-cyan to-indigo-400 font-normal italic"> dynamic policy engine</span>
        </h1>

        {/* Small subtitle block aligned on the right */}
        <div className="w-full max-w-4xl mt-12 grid md:grid-cols-12 gap-6 items-start text-left">
          <div className="md:col-span-6 flex gap-3 text-xs text-zinc-400 font-medium leading-relaxed">
            <span className="text-brand-cyan font-bold">✦</span>
            <span>
              AIM provisions, scopes, and rotates time-bounded credentials for your machine-to-machine agents. Stop infinite token leakage and verify every compliance lifecycle rule.
            </span>
          </div>
          <div className="md:col-span-6 flex md:justify-end gap-3">
            <button 
              onClick={onExploreSimulator}
              className="flex items-center gap-2 px-5 py-2.5 rounded bg-brand-cyan hover:bg-brand-cyan/90 text-xs font-bold text-black transition-all cursor-pointer shadow-[0_0_20px_rgba(0,163,196,0.2)]"
            >
              <span>Launch Simulator</span>
              <Play className="w-3 h-3 fill-black text-black" />
            </button>
            <a 
              href="#architecture" 
              className="flex items-center gap-2 px-5 py-2.5 rounded bg-zinc-950 border border-zinc-850 hover:border-zinc-750 text-xs font-bold text-zinc-300 transition-all"
            >
              <span>Specs Manual</span>
              <FileCode className="w-3.5 h-3.5 text-zinc-500" />
            </a>
          </div>
        </div>

        {/* Lunar-Inspired Token Lifecycle Visualizer */}
        <div className="mt-24 w-full max-w-5xl py-8 border-y border-zinc-900/60 bg-zinc-950/20">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest mb-8">
              (Lifecycle Status Visualizer)
            </span>
            <div className="w-full grid grid-cols-5 gap-4 max-w-4xl">
              
              {/* 1. Attacked (Ring of Fire) */}
              <div className="lunar-moon-outer">
                <div className="lunar-moon-base lunar-phase-attacked group cursor-help">
                  <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-zinc-300 font-mono">01. Attacked</p>
                  <p className="text-[9px] text-red-500 font-bold uppercase mt-1 tracking-wider">CRITICAL</p>
                </div>
              </div>

              {/* 2. Revoked (Crescent) */}
              <div className="lunar-moon-outer">
                <div className="lunar-moon-base lunar-phase-revoked group cursor-help">
                  <div className="absolute inset-0 bg-zinc-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-zinc-300 font-mono">02. Revoked</p>
                  <p className="text-[9px] text-zinc-500 font-semibold uppercase mt-1 tracking-wider">DEACTIVATED</p>
                </div>
              </div>

              {/* 3. Stale (Half Moon) */}
              <div className="lunar-moon-outer">
                <div className="lunar-moon-base lunar-phase-stale group cursor-help">
                  <div className="absolute inset-0 bg-zinc-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-zinc-300 font-mono">03. Stale</p>
                  <p className="text-[9px] text-yellow-600 font-bold uppercase mt-1 tracking-wider">WARN (DORMANT)</p>
                </div>
              </div>

              {/* 4. Expiring (Gibbous) */}
              <div className="lunar-moon-outer">
                <div className="lunar-moon-base lunar-phase-expiring group cursor-help">
                  <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-zinc-300 font-mono">04. Expiring</p>
                  <p className="text-[9px] text-orange-500 font-bold uppercase mt-1 tracking-wider">ROTATION DUE</p>
                </div>
              </div>

              {/* 5. Active (Full Moon) */}
              <div className="lunar-moon-outer">
                <div className="lunar-moon-base lunar-phase-active group cursor-help">
                  <div className="absolute inset-0 bg-brand-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-zinc-300 font-mono">05. Active</p>
                  <p className="text-[9px] text-brand-cyan font-bold uppercase mt-1 tracking-wider">OPERATIONAL</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Minimal Console Wireframe */}
        <div className="mt-20 w-full max-w-5xl rounded-lg border border-zinc-900 bg-black/40 overflow-hidden shadow-2xl">
          {/* Mock Console Top Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-900 bg-zinc-950/40 text-[10px] text-zinc-500 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-zinc-800"></span>
              <span className="w-2 h-2 rounded-full bg-zinc-800"></span>
              <span className="w-2 h-2 rounded-full bg-zinc-800"></span>
              <span className="ml-2 font-mono text-zinc-500">identity_attestation_summary.log</span>
            </div>
            <span>v1.0.0-PROD</span>
          </div>

          <div className="p-6 text-left grid md:grid-cols-3 gap-8">
            {/* Column 1: Live Registries */}
            <div className="border-r border-zinc-900/60 pr-6">
              <span className="meta-label">(Active Registries)</span>
              <div className="mt-4 space-y-3">
                {[
                  { name: 'doc-summarizer-bot', team: 'Data Eng', tag: 'STALE', cl: 'text-yellow-500/80 border-yellow-500/20 bg-yellow-500/5' },
                  { name: 'ticket-triage-agent', team: 'Support-Ops', tag: 'ACTIVE', cl: 'text-brand-cyan border-brand-cyan/20 bg-brand-cyan/5' },
                  { name: 'billing-reconciler-bot', team: 'Finance-Auto', tag: 'EXPIRING', cl: 'text-orange-500/80 border-orange-500/20 bg-orange-500/5' }
                ].map((a, i) => (
                  <div key={i} className="p-3 bg-zinc-950 border border-zinc-900/85 hover:border-zinc-850 hover:bg-zinc-950/60 transition-all rounded">
                    <div className="flex items-center justify-between">
                      <code className="text-xs font-bold text-zinc-200 font-mono">{a.name}</code>
                      <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border font-mono ${a.cl}`}>
                        {a.tag}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-zinc-500 mt-2 font-mono">
                      <span>Team: {a.team}</span>
                      <span>agt_id_880{i}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2 & 3: Detailed Summary Dashboard */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <span className="meta-label">(Compliance Audit Report)</span>
                <p className="text-xs text-zinc-400 mt-1">Simulated policy scan for quarterly review cycle</p>
              </div>

              {/* Alert Boxes */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-950 border border-zinc-900 hover:border-zinc-850 rounded transition-all">
                  <span className="text-[9px] font-bold text-yellow-500 font-mono">DORMANT_ACCESS_DETECTION</span>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    Agent <code className="text-[10px] text-yellow-400 bg-yellow-950/20 px-1 border border-yellow-950/40">doc-summarizer-bot</code> has not dispatched calls in 40 days. Flagged stale.
                  </p>
                </div>
                
                <div className="p-4 bg-zinc-950 border border-zinc-900 hover:border-zinc-850 rounded transition-all">
                  <span className="text-[9px] font-bold text-orange-500 font-mono">ROTATION_DEADLINE_ALERT</span>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    Credentials for <code className="text-[10px] text-orange-400 bg-orange-950/20 px-1 border border-orange-950/40">billing-reconciler-bot</code> expire in 48 hours. Rotation advised.
                  </p>
                </div>
              </div>

              {/* Micro Console Audit Feed */}
              <div>
                <span className="meta-label">(Policy Logs)</span>
                <div className="mt-3 bg-zinc-950 border border-zinc-900 p-4 rounded font-mono text-[10px] text-zinc-400 space-y-2 leading-relaxed">
                  <div className="flex justify-between items-center text-red-500/85">
                    <span>[WARN_ALERT] DENIED: billing-reconciler-bot requested delete:users</span>
                    <span>403 Forbidden</span>
                  </div>
                  <div className="flex justify-between items-center text-brand-cyan">
                    <span>[INFO_GATE] ALLOWED: ticket-triage-agent requested write:tickets</span>
                    <span>200 OK</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-500">
                    <span>[SYS_CRON] AUTO_REVOKE: billing-reconciler-bot credentials expired</span>
                    <span>agt_revoked</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
