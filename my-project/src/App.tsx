import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FeaturesGrid } from './components/FeaturesGrid';
import { ApiSandbox } from './components/ApiSandbox';
import { ArchitectureFlow } from './components/ArchitectureFlow';
import { Shield, ShieldAlert, ShieldCheck, Lock, FileText, ExternalLink } from 'lucide-react';
import './App.css';

function App() {
  const [currentRole, setCurrentRole] = useState('Admin');

  const scrollToSimulator = () => {
    const el = document.getElementById('simulator');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getRoleCapabilities = () => {
    switch (currentRole) {
      case 'Admin':
        return {
          badge: 'Security Admin',
          desc: 'Full read/write permissions. Authorized to issue credentials, rotate keys, suspend agents, and audit sensitive scopes.',
          color: 'border-brand-cyan/20 text-brand-cyan bg-brand-cyan/5',
          icon: ShieldCheck
        };
      case 'Team Owner':
        return {
          badge: 'Team Owner',
          desc: 'Team-bounded permissions. Authorized to issue or rotate keys for team-scoped agents (e.g. Platform, Data). Cannot decommission global agents.',
          color: 'border-zinc-800 text-zinc-300 bg-zinc-950/40',
          icon: Lock
        };
      case 'Viewer':
      default:
        return {
          badge: 'Auditor',
          desc: 'Read-only access. Permitted to review compliance reports and inspect system-wide audit records. Mutation actions disabled.',
          color: 'border-orange-500/20 text-orange-500 bg-orange-500/5',
          icon: ShieldAlert
        };
    }
  };

  const capabilities = getRoleCapabilities();
  const CapabilityIcon = capabilities.icon;

  return (
    <div className="min-h-screen bg-[#090909] text-zinc-100 flex flex-col antialiased bg-grid pb-24 relative select-none">
      
      {/* Top Browser / Finder Wrapper */}
      <Navbar currentRole={currentRole} onRoleChange={setCurrentRole} />

      {/* Role Capabilities Notifier */}
      <div className="max-w-7xl mx-auto w-full px-6 pt-6 text-left">
        <div className={`p-4 rounded border ${capabilities.color} flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300`}>
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-black border border-zinc-900 rounded shrink-0">
              <CapabilityIcon className="w-4 h-4 text-brand-cyan" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono">Demo Role: {capabilities.badge}</p>
              <p className="text-xs text-zinc-400 mt-1 leading-normal">{capabilities.desc}</p>
            </div>
          </div>
          <div className="shrink-0 flex flex-col text-left sm:text-right font-mono text-[10px] text-zinc-500">
            <span>ENFORCEMENT_GATES</span>
            <span className="text-zinc-400 font-bold font-mono">RBAC_ENFORCED_ON_CALLS</span>
          </div>
        </div>
      </div>

      {/* Main Sections */}
      <main className="flex-1">
        <HeroSection onExploreSimulator={scrollToSimulator} />

        <FeaturesGrid />

        <ApiSandbox />

        <ArchitectureFlow />

        {/* Mock Access Review Compliance Report (FR-4 Preview) */}
        <section id="compliance" className="py-20 px-6 max-w-7xl mx-auto border-x border-zinc-900 bg-[#090909] text-left relative">
          <div className="absolute top-1/4 right-1/4 w-[250px] h-[250px] glow-spot-cyan -z-10 opacity-10"></div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="meta-label font-mono uppercase text-[9px] block">(05. Compliance Attestations)</span>
              <h2 className="text-3xl font-light text-zinc-100 mt-3 tracking-tight">
                Identify stale access nodes and attest directory states
              </h2>
              <p className="text-xs text-zinc-400 mt-4 leading-relaxed font-sans">
                Audit parameters dictate that all unused credentials be systematically flagged. AIM automatically detects identities with no dispatched API requests in 30+ days.
              </p>

              <div className="mt-8 space-y-5">
                <div className="flex gap-3">
                  <span className="text-brand-cyan font-bold text-xs mt-0.5">✦</span>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">Scheduled Sweeps</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">Scans operational call logs daily to enforce staleness limits.</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <span className="text-brand-cyan font-bold text-xs mt-0.5">✦</span>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">Attestation Logs</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">Generates CSV files for team compliance documentation.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CSV Mock Document Card */}
            <div className="p-6 bg-zinc-950 border border-zinc-900 rounded flex flex-col gap-4">
              <div className="flex justify-between items-center pb-3 border-b border-zinc-900">
                <div>
                  <span className="meta-label font-mono text-[9px] uppercase tracking-wider block">(Compliance Report Preview)</span>
                  <span className="text-[11px] font-bold text-zinc-300 font-mono">Q3_AIM_ATTESTATION.csv</span>
                </div>
                <span className="text-[8px] font-bold bg-brand-cyan/5 text-brand-cyan border border-brand-cyan/20 px-2 py-0.5 rounded font-mono">GENERATED</span>
              </div>

              <div className="space-y-3 font-mono text-[9px]">
                <div className="bg-black p-3 rounded border border-zinc-900 space-y-1 text-zinc-500 overflow-x-auto">
                  <p># AIM Audit Report - Generated {new Date().toLocaleDateString()}</p>
                  <p>AgentID,AgentName,Team,LastSeenDays,Status,ComplianceFlag</p>
                  <p className="text-zinc-300">agt_sum_doc,doc-summarizer-bot,Data Eng,40,active,<span className="text-orange-500 font-bold">STALE_REVOKE_WARN</span></p>
                  <p className="text-zinc-300">agt_tkt_tri,ticket-triage-agent,Support,2,active,COMPLIANT</p>
                  <p className="text-zinc-300">agt_bil_rec,billing-reconciler,Finance,28,active,COMPLIANT</p>
                </div>

                <div className="text-[10px] text-zinc-500">
                  Metrics Summary: 3 agents analyzed. 1 flagged stale.
                </div>
              </div>

              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 hover:border-zinc-750 text-xs font-semibold text-zinc-200 transition-all cursor-pointer">
                <FileText className="w-3.5 h-3.5 text-brand-cyan" />
                <span>Export Audit Sheet</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Glass-morphism Navigation Tab (Mockup design) */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full floating-tab flex items-center gap-6 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
        <a href="#features" className="hover:text-brand-cyan transition-colors">Features</a>
        <a href="#simulator" className="hover:text-brand-cyan transition-colors">Simulator</a>
        <a href="#architecture" className="hover:text-brand-cyan transition-colors">Architecture</a>
        <a href="#compliance" className="hover:text-brand-cyan transition-colors">Compliance</a>
      </nav>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-900 bg-black py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-zinc-400 font-mono text-[11px]">
            <Shield className="w-4 h-4 text-brand-cyan fill-brand-cyan/10" />
            <span className="font-bold">AIM SECURITY PLATFORM</span>
          </div>

          <div className="text-[10px] text-zinc-600">
            © {new Date().getFullYear()} Aivar Innovations. Prepared for the Agentic AI Task.
          </div>

          <div className="flex gap-4 text-[10px] text-zinc-500 font-mono">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-zinc-350 flex items-center gap-1">
              <span>GitHub Specs</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
