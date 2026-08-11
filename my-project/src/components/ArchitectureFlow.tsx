import React, { useState } from 'react';
import { Cpu, Server, ShieldCheck, Database, ArrowRight } from 'lucide-react';

interface NodeInfo {
  title: string;
  subtitle: string;
  description: string;
  srsMapping: string;
  bullets: string[];
}

export const ArchitectureFlow: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<'agent' | 'gateway' | 'engine' | 'resource'>('agent');

  const nodes: Record<'agent' | 'gateway' | 'engine' | 'resource', NodeInfo> = {
    agent: {
      title: 'AI Agent & Credentials',
      subtitle: 'Machine-to-Machine identity client',
      description: 'An autonomous agent or tool runner. Instead of static long-lived credentials, agents are provisioned with time-bounded tokens generated during registration.',
      srsMapping: 'FR-1: Agent Registration & FR-3: Rotation',
      bullets: [
        'Tokens carry the prefix sk_agt_ for clear identification.',
        'Tokens are revealed once upon registration, then strictly redacted.',
        'Credentials enforce a custom lease (7, 30, or 90 days).'
      ]
    },
    gateway: {
      title: 'API Gateway Interceptor',
      subtitle: 'Enforcement boundary for requests',
      description: 'A thin middleware proxy that intercepts incoming requests directed at internal tools. It extracts authorization keys and requests authorization states.',
      srsMapping: 'FR-6: Scope Enforcement Gate',
      bullets: [
        'Parses Authorization Bearer header for token validation.',
        'Forwards caller metadata and target API method to Policy Engine.',
        'Rejects requests immediately if the token is malformed.'
      ]
    },
    engine: {
      title: 'AIM Policy Engine',
      subtitle: 'Decoupled identity provider database',
      description: 'The core governing brain. It tracks agent statuses, resolves credential expiries against the simulation clock, and enforces tool permission scopes.',
      srsMapping: 'FR-2: Identity Registry & FR-5: Auto-Revocation',
      bullets: [
        'Instantly blocks calls from suspended or decommissioned agents.',
        'Compares credential expiresAt against active sim clock thresholds.',
        'Ensures the token holds the exact required action scope badge.'
      ]
    },
    resource: {
      title: 'Protected Services',
      subtitle: 'Target databases, APIs, and tools',
      description: 'The end-destination tools or services. These resources remain stateless and rely entirely on the gateway policy evaluations to permit actions.',
      srsMapping: 'FR-6.2: Protected Endpoint Execution',
      bullets: [
        'Keeps internal resources isolated from direct token validation logic.',
        'Prevents read-only agents from accessing write/delete endpoints.',
        'Updates agent lastApiCallAt records to feed staleness audits.'
      ]
    }
  };

  const activeNode = nodes[selectedNode];

  return (
    <section id="architecture" className="py-20 px-6 max-w-7xl mx-auto border-x border-zinc-900 bg-[#090909] text-left relative">
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] glow-spot-cyan -z-10 opacity-15"></div>
      
      <div className="max-w-3xl mx-auto mb-16 text-center">
        <span className="meta-label">(System Pipeline)</span>
        <h2 className="text-3xl font-light text-zinc-100 mt-3 tracking-tight">
          Decoupled Authorization Architecture
        </h2>
        <p className="mt-3 text-xs text-zinc-500 max-w-lg mx-auto leading-relaxed">
          AIM operates as a secure identity provider. Select any node in the request pathway to inspect specification mappings.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-10 items-stretch">
        
        {/* Left: Flow chart */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="p-8 bg-zinc-950 border border-zinc-900 rounded flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden h-full min-h-[220px]">
            
            {/* 1. Agent */}
            <button
              onClick={() => setSelectedNode('agent')}
              className={`w-full md:w-36 flex flex-col items-center p-5 rounded border text-center transition-all cursor-pointer ${
                selectedNode === 'agent'
                  ? 'border-brand-cyan bg-brand-cyan/5 shadow-[0_0_15px_rgba(0,163,196,0.15)]'
                  : 'border-zinc-900 bg-black/40 hover:border-zinc-800'
              }`}
            >
              <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-400">
                <Cpu className="w-4 h-4" />
              </div>
              <h4 className="text-[11px] font-bold text-zinc-200 mt-3 font-mono">01. Agent Client</h4>
              <span className="text-[9px] text-zinc-500 font-mono mt-1">sk_agt_ token</span>
            </button>

            {/* Dotted Arrow */}
            <div className="hidden md:flex flex-col items-center text-zinc-700 animate-pulse">
              <ArrowRight className="w-3.5 h-3.5" />
              <span className="text-[8px] font-mono mt-1">DISPATCH</span>
            </div>

            {/* 2. Gateway */}
            <button
              onClick={() => setSelectedNode('gateway')}
              className={`w-full md:w-36 flex flex-col items-center p-5 rounded border text-center transition-all cursor-pointer ${
                selectedNode === 'gateway'
                  ? 'border-brand-cyan bg-brand-cyan/5 shadow-[0_0_15px_rgba(0,163,196,0.15)]'
                  : 'border-zinc-900 bg-black/40 hover:border-zinc-800'
              }`}
            >
              <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-400">
                <Server className="w-4 h-4" />
              </div>
              <h4 className="text-[11px] font-bold text-zinc-200 mt-3 font-mono">02. API Gateway</h4>
              <span className="text-[9px] text-zinc-500 font-mono mt-1">Interceptor Gate</span>
            </button>

            {/* Dotted Arrow */}
            <div className="hidden md:flex flex-col items-center text-zinc-700 animate-pulse">
              <ArrowRight className="w-3.5 h-3.5" />
              <span className="text-[8px] font-mono mt-1">RESOLVE</span>
            </div>

            {/* 3. Engine */}
            <button
              onClick={() => setSelectedNode('engine')}
              className={`w-full md:w-36 flex flex-col items-center p-5 rounded border text-center transition-all cursor-pointer ${
                selectedNode === 'engine'
                  ? 'border-brand-cyan bg-brand-cyan/5 shadow-[0_0_15px_rgba(0,163,196,0.15)]'
                  : 'border-zinc-900 bg-black/40 hover:border-zinc-800'
              }`}
            >
              <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-[11px] font-bold text-zinc-200 mt-3 font-mono">03. Policy Engine</h4>
              <span className="text-[9px] text-zinc-500 font-mono mt-1">Auth Authority</span>
            </button>

            {/* Dotted Arrow */}
            <div className="hidden md:flex flex-col items-center text-zinc-700 animate-pulse">
              <ArrowRight className="w-3.5 h-3.5" />
              <span className="text-[8px] font-mono mt-1">MUTATE</span>
            </div>

            {/* 4. Resource */}
            <button
              onClick={() => setSelectedNode('resource')}
              className={`w-full md:w-36 flex flex-col items-center p-5 rounded border text-center transition-all cursor-pointer ${
                selectedNode === 'resource'
                  ? 'border-brand-cyan bg-brand-cyan/5 shadow-[0_0_15px_rgba(0,163,196,0.15)]'
                  : 'border-zinc-900 bg-black/40 hover:border-zinc-800'
              }`}
            >
              <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-400">
                <Database className="w-4 h-4" />
              </div>
              <h4 className="text-[11px] font-bold text-zinc-200 mt-3 font-mono">04. Protected</h4>
              <span className="text-[9px] text-zinc-500 font-mono mt-1">Target Endpoint</span>
            </button>
          </div>
        </div>

        {/* Right: Spec description card */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="p-6 bg-zinc-950 border border-zinc-900 rounded flex flex-col justify-between h-full relative">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
                <span className="meta-label font-mono uppercase text-[9px]">(Specification Audit)</span>
                <span className="text-[9px] font-mono text-zinc-500 bg-black px-2 py-0.5 rounded border border-zinc-900">
                  {activeNode.srsMapping.split(':')[0]}
                </span>
              </div>

              <h3 className="text-lg font-bold text-zinc-100 mt-5 font-sans">{activeNode.title}</h3>
              <p className="text-[10px] text-zinc-500 mt-1 font-mono">{activeNode.subtitle}</p>
              
              <p className="text-xs text-zinc-400 mt-4 leading-relaxed font-sans">
                {activeNode.description}
              </p>

              <div className="mt-6 space-y-2">
                <span className="meta-label font-mono uppercase text-[9px] block">(Operational Logic)</span>
                <ul className="space-y-1.5 text-xs text-zinc-400">
                  {activeNode.bullets.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-brand-cyan font-bold mt-0.5 shrink-0">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-zinc-900 text-[10px] text-zinc-600 font-mono flex items-center justify-between">
              <span>REFERENCE REQUIREMENT</span>
              <span className="text-zinc-500 font-mono text-[9px]">{activeNode.srsMapping}</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
