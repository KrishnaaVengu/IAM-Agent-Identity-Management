import React from 'react';
import { Navbar } from '../components/Navbar';
import { PartnersAndFooter } from '../components/PartnersAndFooter';
import { motion } from 'framer-motion';
import { ShieldCheck, Key, RefreshCw, AlertTriangle, ArrowRight, CheckCircle, Database, Activity, Play } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="px-4 md:px-8 max-w-5xl mx-auto text-center space-y-6 pt-12 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest"
          >
            <ShieldCheck className="w-4 h-4" /> THE ZERO-TRUST AGENT GOVERNANCE ARCHITECTURE
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900"
          >
            How Agent Identity Manager Secures the AI Workforce
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed"
          >
            A comprehensive architectural breakdown of the machine identity lifecycle: from registration and OIDC JWT minting to real-time scope enforcement, active threat mitigation, and automated access reviews.
          </motion.p>
        </section>

        {/* Workflows */}
        <section className="px-4 md:px-8 max-w-6xl mx-auto space-y-12">
          
          {/* Workflow 1 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl pointer-events-none opacity-50" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Workflow 1: Agent Registration & OIDC JWT Minting</h3>
            <p className="text-sm text-slate-600 mb-8 max-w-3xl">Step-by-step breakdown of how requesting team metadata and scopes outputs a cryptographically signed JWT containing sub, exp, and scopes claims.</p>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
              <FlowNode icon={<Key />} title="Registration Form" />
              <FlowArrow />
              <FlowNode icon={<ShieldCheck />} title="Scope & TTL Validation" />
              <FlowArrow />
              <FlowNode icon={<Database />} title="SQLite Persistence" />
              <FlowArrow />
              <FlowNode icon={<RefreshCw />} title="OIDC Claims Minter" />
              <FlowArrow />
              <FlowNode icon={<CheckCircle />} title="Signed JWT Token Issued" highlight />
            </div>
          </div>

          {/* Workflow 2 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-64 h-64 bg-green-50 rounded-full blur-3xl pointer-events-none opacity-50" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Workflow 2: Zero-Trust Scope Enforcement & Simulation</h3>
            <p className="text-sm text-slate-600 mb-8 max-w-3xl">How every tool execution call is intercepted, checked against approved scopes, and logged to the immutable audit trail.</p>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
              <FlowNode icon={<Play />} title="Tool Execution Request" />
              <FlowArrow />
              <FlowNode icon={<Key />} title="JWT Signature & Expiry Check" />
              <FlowArrow />
              <FlowNode icon={<ShieldCheck />} title="Scope Evaluator" />
              <FlowArrow />
              <div className="flex flex-col gap-2">
                 <FlowNode icon={<CheckCircle />} title="[200 OK: Allowed]" highlight />
                 <FlowNode icon={<AlertTriangle />} title="[403: Scope Violation]" error />
              </div>
            </div>
          </div>

          {/* Workflow 3 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl pointer-events-none opacity-50" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Workflow 3: Active Threat Mitigation (Anomaly Lockdown)</h3>
            <p className="text-sm text-slate-600 mb-8 max-w-3xl">Explains how in-memory sliding window counters detect malicious or compromised agent behavior and trigger instant isolation.</p>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
              <FlowNode icon={<AlertTriangle />} title="Unauthorized Scope Attempt" error />
              <FlowArrow />
              <FlowNode icon={<Activity />} title="Sliding Window Tracker (5 Calls / 10s)" />
              <FlowArrow />
              <FlowNode icon={<AlertTriangle />} title="Threshold Exceeded" error />
              <FlowArrow />
              <FlowNode icon={<ShieldCheck />} title="[423 Locked Status]" highlight />
              <FlowArrow />
              <FlowNode icon={<AlertTriangle />} title="Auto-Suspend Agent & Revoke Token" error />
            </div>
          </div>

          {/* Workflow 4 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl pointer-events-none opacity-50" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Workflow 4: Credential Rotation & Stale Access Review</h3>
            <p className="text-sm text-slate-600 mb-8 max-w-3xl">Explains lifecycle governance, token rotation (invalidating old tokens), and automated stale agent cleanup.</p>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
              <FlowNode icon={<RefreshCw />} title="Background Dev-Clock Sweep" />
              <FlowArrow />
              <FlowNode icon={<AlertTriangle />} title="Check Inactivity (>= 30 Days)" />
              <FlowArrow />
              <FlowNode icon={<ShieldCheck />} title="Flag Stale in Review Report" />
              <FlowArrow />
              <FlowNode icon={<Key />} title="Admin Rotation / Decommission" highlight />
            </div>
          </div>

        </section>

        {/* Spec Matrix */}
        <section className="px-4 md:px-8 max-w-6xl mx-auto mt-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900">Technical Stack & Security Spec Matrix</h2>
            <p className="text-slate-600 mt-2">Contrasting Traditional IAM vs. Legacy API Keys vs. AIM Machine Identity Governance</p>
          </div>
          
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-lg">
            <table className="w-full text-left border-collapse bg-white">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm uppercase tracking-wider text-slate-500 font-bold">
                  <th className="p-4">Feature</th>
                  <th className="p-4 border-l border-slate-200">Human IAM</th>
                  <th className="p-4 border-l border-slate-200">Legacy API Keys</th>
                  <th className="p-4 border-l border-slate-200 bg-blue-50 text-blue-900">AIM Governance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                <tr>
                  <td className="p-4 font-bold text-slate-900">Identity Attribution</td>
                  <td className="p-4 border-l border-slate-200 text-slate-600">Personal Email / Employee ID</td>
                  <td className="p-4 border-l border-slate-200 text-slate-600 text-red-600">Developer Key (Over-privileged)</td>
                  <td className="p-4 border-l border-slate-200 font-semibold bg-blue-50/50 text-blue-700">AIM Machine Identity (Agent ID + Team)</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-900">Scope Granularity</td>
                  <td className="p-4 border-l border-slate-200 text-slate-600">Role-Based (RBAC)</td>
                  <td className="p-4 border-l border-slate-200 text-slate-600 text-red-600">Unlimited Account Access</td>
                  <td className="p-4 border-l border-slate-200 font-semibold bg-blue-50/50 text-blue-700">Fine-Grained Tool Scopes (read:tickets)</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-900">Expiration</td>
                  <td className="p-4 border-l border-slate-200 text-slate-600">Until Offboarding</td>
                  <td className="p-4 border-l border-slate-200 text-slate-600 text-red-600">Permanent / Never Expires</td>
                  <td className="p-4 border-l border-slate-200 font-semibold bg-blue-50/50 text-blue-700">Short-Lived Time-Bounded JWTs</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-900">Audit Cadence</td>
                  <td className="p-4 border-l border-slate-200 text-slate-600">Quarterly Audits</td>
                  <td className="p-4 border-l border-slate-200 text-slate-600 text-red-600">None</td>
                  <td className="p-4 border-l border-slate-200 font-semibold bg-blue-50/50 text-blue-700">Automated 30-Day Stale Sweeps & Audits</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <PartnersAndFooter />
    </div>
  );
};

const FlowNode = ({ icon, title, highlight, error }: { icon: React.ReactNode, title: string, highlight?: boolean, error?: boolean }) => {
  let bgClass = "bg-slate-50 border-slate-200 text-slate-800";
  if (highlight) bgClass = "bg-blue-50 border-blue-200 text-blue-800";
  if (error) bgClass = "bg-red-50 border-red-200 text-red-800";

  return (
    <div className={`flex flex-col items-center justify-center p-4 rounded-xl border ${bgClass} shadow-sm w-40 h-32 text-center transition-transform hover:-translate-y-1`}>
      <div className="mb-2 opacity-80">{icon}</div>
      <div className="text-xs font-bold leading-tight">{title}</div>
    </div>
  );
};

const FlowArrow = () => (
  <div className="text-slate-300 hidden md:block">
    <ArrowRight className="w-6 h-6" />
  </div>
);

export default About;
