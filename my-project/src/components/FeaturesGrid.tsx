import React from 'react';
import { KeyRound, ShieldAlert, CalendarDays, History, RefreshCw, Lock } from 'lucide-react';

export const FeaturesGrid: React.FC = () => {
  const features = [
    {
      num: '01',
      title: 'Least-Privilege Scoping',
      description: 'Restrict agents to specific capabilities (e.g., read:documents) instead of static, all-powerful keys.',
      icon: KeyRound,
      label: '(Privilege Scopes)'
    },
    {
      num: '02',
      title: 'Automated Revocation',
      description: 'System-driven expiration sweeps immediately invalidate credentials, mitigating the impact of token leaks.',
      icon: ShieldAlert,
      label: '(Lifecycle Sweeps)'
    },
    {
      num: '03',
      title: 'Quarterly Access Reviews',
      description: 'Flag stale agent identities dormant for ≥30 days. Attest compliance logs and revoke access dynamically.',
      icon: CalendarDays,
      label: '(Compliance Auditing)'
    },
    {
      num: '04',
      title: 'Immutable Audit Log',
      description: 'Every authorization decision, credential rotation, and registration is preserved in a secure audit store.',
      icon: History,
      label: '(Security Trails)'
    },
    {
      num: '05',
      title: 'On-Demand Key Rotation',
      description: 'Instantly revoke active keys and reissue new cryptographically secure credentials with zero downtime.',
      icon: RefreshCw,
      label: '(Key Management)'
    },
    {
      num: '06',
      title: 'Isolate Sensitive Gates',
      description: 'Flag sensitive scopes (e.g. deploy:infra) that trigger policy reviews prior to credential deployment.',
      icon: Lock,
      label: '(Sensitive Approvals)'
    }
  ];

  return (
    <section id="features" className="bg-[#090909] border-b border-zinc-900 relative">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 border-x border-zinc-900">
        
        {/* Top summary row - stretches across the top of features */}
        <div className="md:col-span-3 p-12 border-b border-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
          <div className="max-w-xl">
            <span className="meta-label">(Core Deliverables)</span>
            <h2 className="text-3xl font-light text-zinc-100 tracking-tight mt-3">
              Governance for autonomous systems, engineered for zero-trust perimeters
            </h2>
          </div>
          <div className="text-xs text-zinc-500 max-w-xs leading-relaxed">
            ✦ AIM resolves the governance gaps between human employee account lifecycle audits and autonomous AI agent operations.
          </div>
        </div>

        {/* Feature grid blocks */}
        {features.map((f, idx) => (
          <div 
            key={idx} 
            className={`p-10 text-left flex flex-col justify-between min-h-[280px] hover:bg-[#0c0c0c] transition-all duration-300 group relative border-zinc-900 ${
              idx % 3 !== 2 ? 'md:border-r' : ''
            } ${
              idx < 3 ? 'border-b' : 'border-b md:border-b-0'
            }`}
          >
            {/* Header: Number and label */}
            <div className="flex items-center justify-between">
              <span className="text-3xl font-light text-zinc-800 font-mono tracking-tighter group-hover:text-zinc-500 transition-colors">
                {f.num}
              </span>
              <span className="meta-label font-mono text-[9px] uppercase tracking-wider bg-zinc-950 px-2 py-0.5 rounded border border-zinc-900">
                {f.label}
              </span>
            </div>

            {/* Content: Title & Description */}
            <div className="mt-8 flex-1 flex flex-col justify-end">
              <h3 className="text-base font-bold text-zinc-200 group-hover:text-brand-cyan transition-colors flex items-center gap-2">
                <f.icon className="w-4 h-4 text-zinc-500 group-hover:text-brand-cyan transition-colors" />
                <span>{f.title}</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed font-sans">
                {f.description}
              </p>
            </div>

            {/* Bottom link annotation */}
            <div className="mt-8 pt-4 border-t border-zinc-950 flex items-center justify-between text-[10px] text-zinc-600 font-mono group-hover:text-zinc-400 transition-all duration-300">
              <span>TECHNICAL SPECIFICATION</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </div>
          </div>
        ))}

      </div>
    </section>
  );
};
