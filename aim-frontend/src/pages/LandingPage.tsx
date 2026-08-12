import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  RefreshCw,
  ClipboardCheck,
  ScrollText,
  CheckCircle,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0A0F1E] text-[#F9FAFB] font-sans selection:bg-blue-500 selection:text-white">
      {/* Sticky Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0A0F1E]/85 border-b border-[#1F2937]">
        <div className="max-w-[1100px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-baseline">
            <span className="font-mono font-bold text-white text-xl tracking-tight">AIM</span>
            <span className="text-slate-500 text-xs ml-2 font-mono">Agent Identity Manager</span>
          </div>
          <nav className="flex items-center gap-8">
            <a href="#features" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
              How It Works
            </a>
            <Link
              to="/dashboard"
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/20"
            >
              Open Console <ArrowRight className="w-4 h-4" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Section 1 — Hero */}
      <section className="max-w-[1100px] mx-auto px-6 py-24 min-h-[calc(100vh-64px)] flex flex-col items-center justify-center text-center">
        {/* Top Warning Badge */}
        <div className="bg-amber-900/40 text-amber-400 border border-amber-700/50 text-xs font-mono px-3 py-1 rounded-full inline-flex items-center gap-1.5 mb-8">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>⚠ UNMANAGED AGENT CREDENTIALS ARE A SUPPLY CHAIN RISK</span>
        </div>

        {/* Headline */}
        <h1 className="font-mono text-3xl sm:text-4xl md:text-[48px] leading-[1.15] font-bold text-white mb-6 tracking-tight">
          When did you last review<br />
          what your AI agents<br />
          can actually access?
        </h1>

        {/* Subheadline */}
        <p className="font-sans text-[20px] text-slate-400 max-w-[540px] mx-auto mb-8 leading-relaxed">
          AIM provisions and governs machine identities for AI agents — scoped credentials, automatic expiry, quarterly reviews, and a full audit trail.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
          <Link
            to="/dashboard"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
          >
            <ArrowRight className="w-5 h-5" /> Open Console
          </Link>
          <a
            href="#"
            className="border border-slate-700 hover:border-slate-500 text-white font-medium px-6 py-3 rounded-lg text-base transition-colors flex items-center justify-center"
          >
            View API Docs
          </a>
        </div>

        {/* Live Terminal Block */}
        <div className="w-full max-w-[800px] text-left rounded-xl border border-slate-800 bg-[#111827] shadow-2xl overflow-hidden animate-fade-in-up">
          <div className="bg-slate-800 px-4 py-2.5 border-b border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block"></span>
            </div>
            <div className="text-slate-400 text-xs font-mono text-center flex-1 pr-12">
              aim-api — POST /api/agents
            </div>
          </div>
          <div className="p-6 font-mono text-sm leading-relaxed overflow-x-auto text-slate-300 bg-slate-950/80">
            <div className="text-slate-500 mb-2">// Register a new AI agent identity</div>
            <div className="text-slate-300">&#123;</div>
            <div className="pl-4">
              <span className="text-blue-300">"name"</span>: <span className="text-green-400">"billing-reconciler-bot"</span>,
            </div>
            <div className="pl-4">
              <span className="text-blue-300">"owningTeam"</span>: <span className="text-green-400">"Finance-Automation"</span>,
            </div>
            <div className="pl-4">
              <span className="text-blue-300">"requestedScopes"</span>: [<span className="text-green-400">"read:financial_records"</span>],
            </div>
            <div className="pl-4">
              <span className="text-blue-300">"requestedLifetimeDays"</span>: <span className="text-amber-400">30</span>
            </div>
            <div className="text-slate-300 mb-4">&#125;</div>

            <div className="my-3">
              <span className="bg-green-900/50 text-green-400 px-2 py-0.5 rounded text-xs font-mono inline-flex items-center gap-1 border border-green-700/50">
                ✅ 201 Created
              </span>
            </div>

            <div className="text-slate-300">&#123;</div>
            <div className="pl-4">
              <span className="text-blue-300">"agentId"</span>: <span className="text-green-400">"agt_billingrecon01"</span>,
            </div>
            <div className="pl-4">
              <span className="text-blue-300">"status"</span>: <span className="text-green-400">"active"</span>,
            </div>
            <div className="pl-4">
              <span className="text-blue-300">"expiresAt"</span>: <span className="text-green-400">"2026-09-11T10:00:00Z"</span>,
            </div>
            <div className="pl-4">
              <span className="text-blue-300">"credential"</span>: &#123;
            </div>
            <div className="pl-8">
              <span className="text-blue-300">"fullToken"</span>: <span className="text-amber-400 font-semibold">"sk_agt_a1b2c3d4••••••••"</span>,
            </div>
            <div className="pl-8">
              <span className="text-blue-300">"scopes"</span>: [<span className="text-green-400">"read:financial_records"</span>]
            </div>
            <div className="pl-4">&#125;</div>
            <div className="text-slate-300">&#125;</div>
          </div>
        </div>
      </section>

      {/* Section 2 — The Problem */}
      <section className="max-w-[1100px] mx-auto px-6 py-24 border-t border-slate-800/60">
        <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">
          THE PROBLEM
        </div>
        <h2 className="text-[32px] font-bold text-white font-sans mb-12 tracking-tight">
          AI agents are deployed like scripts, not like employees.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-red-900/30 border border-red-800/40 text-red-400 flex items-center justify-center text-xl">
              🔑
            </div>
            <h3 className="text-white font-semibold text-lg mt-4">
              Overprivileged by default.
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mt-2">
              Agents inherit the permissions of the developer who created them.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-red-900/30 border border-red-800/40 text-red-400 flex items-center justify-center text-xl">
              ♾
            </div>
            <h3 className="text-white font-semibold text-lg mt-4">
              Credentials that never expire.
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mt-2">
              An API key created in 2024 is still active. Nobody knows.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-red-900/30 border border-red-800/40 text-red-400 flex items-center justify-center text-xl">
              👻
            </div>
            <h3 className="text-white font-semibold text-lg mt-4">
              No access review. Ever.
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mt-2">
              That summarizer bot you deployed for Q3 still has write access. It's Q2.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 — The Solution (Feature Highlights) */}
      <section id="features" className="max-w-[1100px] mx-auto px-6 py-24 border-t border-slate-800/60">
        <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">
          HOW AIM FIXES IT
        </div>
        <h2 className="text-[32px] font-bold text-white mb-16 tracking-tight">
          Treat AI agents like the privileged users they are.
        </h2>

        <div className="space-y-20">
          {/* Row 1 — Scoped, Time-Bounded Credentials (icon left) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* Left: Text */}
            <div>
              <div className="w-12 h-12 rounded-full bg-blue-900/40 border border-blue-700/40 text-blue-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Every agent gets exactly the access it needs — nothing more.
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Register an agent with a named scope list and a credential lifetime. The system issues a scoped token, stores only a preview, and tracks expiry automatically.
              </p>
            </div>
            {/* Right: Visual callout */}
            <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 flex flex-wrap items-center gap-3 shadow-xl">
              <span className="bg-green-900/40 text-green-400 border border-green-700/50 px-3 py-1.5 rounded-full text-xs font-mono flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-green-400" /> read:documents
              </span>
              <span className="bg-green-900/40 text-green-400 border border-green-700/50 px-3 py-1.5 rounded-full text-xs font-mono flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-green-400" /> read:tickets
              </span>
              <span className="bg-red-900/40 text-red-400 border border-red-700/50 px-3 py-1.5 rounded-full text-xs font-mono flex items-center gap-1.5 line-through opacity-80">
                <span>✗</span> write:financial_records
              </span>
            </div>
          </div>

          {/* Row 2 — Automatic Expiry & Rotation (icon right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* Left: Visual callout */}
            <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 shadow-xl">
              <div className="text-slate-400 text-xs font-mono mb-2 flex justify-between">
                <span>Credential Lifetime (30 Days)</span>
                <span className="text-amber-400">93% Elapsed</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700/50">
                <div className="bg-amber-500 h-full rounded-full w-[93%]"></div>
              </div>
              <div className="text-xs font-mono text-amber-400 flex items-center gap-1.5 mt-3">
                <AlertTriangle className="w-3.5 h-3.5" /> ⚠ Expires in 2 days — rotate now
              </div>
            </div>
            {/* Right: Text */}
            <div>
              <div className="w-12 h-12 rounded-full bg-amber-900/40 border border-amber-700/40 text-amber-400 flex items-center justify-center mb-4">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Credentials expire. Rotation is one click.
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Set a lifetime of 7, 30, or 90 days. When a credential expires without renewal, the agent is automatically decommissioned — no lingering access.
              </p>
            </div>
          </div>

          {/* Row 3 — Quarterly Access Reviews (icon left) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* Left: Text */}
            <div>
              <div className="w-12 h-12 rounded-full bg-purple-900/40 border border-purple-700/40 text-purple-400 flex items-center justify-center mb-4">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Automatically surface agents that have gone quiet.
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Agents that haven't made an API call in 30 days are flagged as stale. Each team gets a breakdown with inline actions to suspend or decommission.
              </p>
            </div>
            {/* Right: Visual callout */}
            <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-amber-400 text-xs font-mono font-semibold flex items-center gap-1.5">
                  ⚠ doc-summarizer-bot
                </span>
                <span className="text-slate-400 text-xs">last active 40 days ago</span>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <span className="text-xs bg-amber-900/40 text-amber-300 border border-amber-700/50 px-2.5 py-1 rounded hover:bg-amber-800/40 cursor-pointer transition-colors font-medium">
                  Suspend
                </span>
                <span className="text-xs bg-red-900/40 text-red-300 border border-red-700/50 px-2.5 py-1 rounded hover:bg-red-800/40 cursor-pointer transition-colors font-medium">
                  Decommission
                </span>
              </div>
            </div>
          </div>

          {/* Row 4 — Complete Audit Trail (icon right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* Left: Visual callout */}
            <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 shadow-xl space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between bg-slate-900/90 p-2.5 rounded border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="bg-green-900/50 text-green-400 px-2 py-0.5 rounded text-[11px] font-semibold border border-green-700/40">
                    AGENT_REGISTERED
                  </span>
                  <span className="text-slate-300">by Admin</span>
                </div>
                <span className="text-slate-500">Aug 1, 10:00</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900/90 p-2.5 rounded border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="bg-red-900/50 text-red-400 px-2 py-0.5 rounded text-[11px] font-semibold border border-red-700/40">
                    SCOPE_CALL_DENIED
                  </span>
                  <span className="text-slate-300">INSUFFICIENT_SCOPE: delete:users</span>
                </div>
                <span className="text-slate-500">Aug 12, 14:22</span>
              </div>
            </div>
            {/* Right: Text */}
            <div>
              <div className="w-12 h-12 rounded-full bg-green-900/40 border border-green-700/40 text-green-400 flex items-center justify-center mb-4">
                <ScrollText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Every action, every call — recorded.
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                AGENT_REGISTERED, CREDENTIAL_ROTATED, AUTO_REVOKED, SCOPE_CALL_DENIED — every event logged with a timestamp, actor, and summary. Export to CSV for compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 — Scope Enforcement Demo */}
      <section className="max-w-[1100px] mx-auto px-6 py-24 border-t border-slate-800/60">
        <h2 className="text-[32px] font-bold text-white mb-12 text-center tracking-tight">
          Scope enforcement on every call. Not configurable — enforced.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative items-stretch">
          {/* VS Badge */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-800 border border-slate-700 items-center justify-center text-xs font-mono font-bold text-slate-400 z-10 shadow-lg">
            VS
          </div>

          {/* Left Panel — ALLOWED */}
          <div className="flex flex-col">
            <div className="bg-green-900/50 text-green-400 border border-green-700/50 px-4 py-3 rounded-t-xl font-mono text-sm font-semibold flex items-center gap-2">
              ✅ 200 ALLOWED
            </div>
            <div className="bg-[#111827] border-x border-b border-[#1F2937] p-6 rounded-b-xl font-mono text-sm flex-1 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 uppercase text-xs">Agent</span>
                <span className="col-span-2 text-slate-200">ticket-triage-agent</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 uppercase text-xs">Called</span>
                <span className="col-span-2 text-slate-200">GET /tickets</span>
              </div>
              <div className="grid grid-cols-3 gap-2 items-center">
                <span className="text-slate-500 uppercase text-xs">Scope</span>
                <span className="col-span-2 text-slate-200 flex items-center gap-1.5">
                  read:tickets <span className="text-green-400 font-bold">✓</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Panel — DENIED */}
          <div className="flex flex-col">
            <div className="bg-red-900/50 text-red-400 border border-red-700/50 px-4 py-3 rounded-t-xl font-mono text-sm font-semibold flex items-center gap-2">
              ❌ 403 DENIED
            </div>
            <div className="bg-[#111827] border-x border-b border-[#1F2937] p-6 rounded-b-xl font-mono text-sm flex-1 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 uppercase text-xs">Agent</span>
                <span className="col-span-2 text-slate-200">doc-summarizer-bot</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 uppercase text-xs">Called</span>
                <span className="col-span-2 text-slate-200">POST /documents</span>
              </div>
              <div className="grid grid-cols-3 gap-2 items-center">
                <span className="text-slate-500 uppercase text-xs">Scope</span>
                <span className="col-span-2 text-slate-200 flex items-center gap-1.5">
                  write:documents <span className="text-red-400 font-bold">✗</span>
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 items-center pt-1 border-t border-slate-800">
                <span className="text-slate-500 uppercase text-xs">Reason</span>
                <span className="col-span-2">
                  <span className="text-red-400 bg-red-950/60 border border-red-800/60 px-2 py-0.5 rounded text-xs">
                    INSUFFICIENT_SCOPE
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-slate-400 text-sm mt-6 text-center font-sans">
          Read-only agents cannot write. The scope check runs on every simulated call.
        </p>
      </section>

      {/* Section 5 — Identity Record Anatomy */}
      <section id="how-it-works" className="max-w-[1100px] mx-auto px-6 py-24 border-t border-slate-800/60">
        <h2 className="text-[32px] font-bold text-white mb-12 text-center tracking-tight">
          One identity record per agent. Everything in one place.
        </h2>

        <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-8 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Left Column — Identity Fields */}
            <div>
              <dl className="space-y-4">
                <div>
                  <dt className="text-slate-500 text-xs uppercase tracking-wide font-mono">Agent ID</dt>
                  <dd className="text-slate-200 text-sm mt-0.5 font-mono">agt_billingrecon01</dd>
                </div>
                <div>
                  <dt className="text-slate-500 text-xs uppercase tracking-wide font-mono">Name</dt>
                  <dd className="text-slate-200 text-sm mt-0.5 font-medium">billing-reconciler-bot</dd>
                </div>
                <div>
                  <dt className="text-slate-500 text-xs uppercase tracking-wide font-mono">Owning Team</dt>
                  <dd className="text-slate-200 text-sm mt-0.5">Finance-Automation</dd>
                </div>
                <div>
                  <dt className="text-slate-500 text-xs uppercase tracking-wide font-mono">Purpose</dt>
                  <dd className="text-slate-200 text-sm mt-0.5">Reads and reconciles financial records</dd>
                </div>
                <div>
                  <dt className="text-slate-500 text-xs uppercase tracking-wide font-mono">Status</dt>
                  <dd className="text-slate-200 text-sm mt-0.5 flex items-center">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                    <span className="text-green-400 font-medium">Active</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 text-xs uppercase tracking-wide font-mono">Registered by</dt>
                  <dd className="text-slate-200 text-sm mt-0.5">Admin</dd>
                </div>
                <div>
                  <dt className="text-slate-500 text-xs uppercase tracking-wide font-mono">Created</dt>
                  <dd className="text-slate-200 text-sm mt-0.5">Aug 1, 2026</dd>
                </div>
                <div>
                  <dt className="text-slate-500 text-xs uppercase tracking-wide font-mono">Expires</dt>
                  <dd className="text-slate-200 text-sm mt-0.5 flex items-center gap-2">
                    <span>Aug 14, 2026</span>
                    <span className="text-amber-400 text-xs font-mono bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                      ⚠ in 2 days
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 text-xs uppercase tracking-wide font-mono">Scopes</dt>
                  <dd className="text-slate-200 text-sm mt-1 flex flex-wrap items-center gap-2">
                    <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-0.5 rounded text-xs font-mono">
                      [read:financial_records]
                    </span>
                    <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-0.5 rounded text-xs font-mono">
                      [write:financial_records]
                    </span>
                    <span className="text-amber-400 text-xs font-mono bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                      ⚠ Sensitive
                    </span>
                  </dd>
                </div>
              </dl>
            </div>

            {/* Right Column — Audit Timeline */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700/80">
              {/* Event 1 */}
              <div className="relative">
                <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-green-500 border-2 border-[#111827]"></div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-500 font-mono">Aug 1</span>
                  <span className="bg-green-900/50 text-green-400 border border-green-700/50 px-2 py-0.5 rounded font-mono font-semibold">
                    AGENT_REGISTERED
                  </span>
                  <span className="text-slate-400">by Admin</span>
                </div>
              </div>

              {/* Event 2 */}
              <div className="relative">
                <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-green-500 border-2 border-[#111827]"></div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-500 font-mono">Aug 1</span>
                  <span className="bg-green-900/50 text-green-400 border border-green-700/50 px-2 py-0.5 rounded font-mono font-semibold">
                    CREDENTIAL_ISSUED
                  </span>
                  <span className="text-slate-400">by System</span>
                </div>
              </div>

              {/* Event 3 */}
              <div className="relative">
                <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-green-500 border-2 border-[#111827]"></div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-500 font-mono">Aug 8</span>
                  <span className="bg-green-900/50 text-green-400 border border-green-700/50 px-2 py-0.5 rounded font-mono font-semibold">
                    SCOPE_CALL_ALLOWED
                  </span>
                  <span className="text-slate-400">GET /financial-records</span>
                </div>
              </div>

              {/* Event 4 */}
              <div className="relative">
                <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-amber-500 border-2 border-[#111827]"></div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-500 font-mono">Aug 10</span>
                  <span className="bg-amber-900/50 text-amber-400 border border-amber-700/50 px-2 py-0.5 rounded font-mono font-semibold">
                    CREDENTIAL_ROTATED
                  </span>
                  <span className="text-slate-400">by Admin</span>
                </div>
              </div>

              {/* Event 5 */}
              <div className="relative">
                <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-red-500 border-2 border-[#111827]"></div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-500 font-mono">Aug 12</span>
                  <span className="bg-red-900/50 text-red-400 border border-red-700/50 px-2 py-0.5 rounded font-mono font-semibold">
                    SCOPE_CALL_DENIED
                  </span>
                  <span className="text-slate-400">INSUFFICIENT_SCOPE: delete:users</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6 — CTA Footer */}
      <footer className="max-w-[1100px] mx-auto px-6 py-32 text-center border-t border-slate-800/60">
        <h2 className="text-[36px] font-bold text-white mb-4 font-sans tracking-tight">
          Your AI agents have access. Do you know what they can do?
        </h2>
        <p className="text-slate-400 text-lg max-w-[480px] mx-auto mb-10 leading-relaxed">
          AIM gives you the same rigour for machine identities that your IAM provider gives you for human users.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
          <Link
            to="/dashboard"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all inline-flex items-center gap-2 shadow-xl shadow-blue-600/25 hover:shadow-blue-600/40"
          >
            <ArrowRight className="w-5 h-5" /> Open the Console
          </Link>
          <a
            href="#"
            className="border border-slate-700 hover:border-slate-500 text-slate-300 font-medium px-8 py-4 rounded-xl text-lg transition-colors inline-flex items-center gap-2"
          >
            View on GitHub
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 text-slate-400 text-sm font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>Scoped credentials — no overprivileged tokens</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>Auto-expiry — no zombie agents</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>Full audit log — every action recorded</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
