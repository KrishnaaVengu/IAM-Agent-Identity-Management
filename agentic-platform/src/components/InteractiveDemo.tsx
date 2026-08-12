"use client";

import React, { useState } from "react";
import {
  Bot,
  Terminal,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Code2,
  Play,
  Cpu,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type IndustryKey = "BANKING" | "HEALTHCARE" | "RETAIL" | "TELECOM + MEDIA" | "BUSINESS";

interface AppType {
  id: string;
  title: string;
  subtitle: string;
  chatMessages: { sender: "user" | "agent"; text: string; time: string; badge?: string }[];
  codeSnippet: string;
}

const industryData: Record<IndustryKey, AppType[]> = {
  BANKING: [
    {
      id: "bank-1",
      title: "Banking Automation",
      subtitle: "Automate high-volume account queries and balance reconciliations.",
      chatMessages: [
        { sender: "user", text: "Check pending wire transfers over $50,000 for Account #8892.", time: "10:42 AM" },
        { sender: "agent", text: "I identified 2 pending wire transfers totaling $125,000. Scope grant `read:ledger` validated. SWIFT confirmation pending approval.", time: "10:42 AM", badge: "Scope Verified" },
      ],
      codeSnippet: `// Agent Identity Policy Check
const result = await aim.evaluateCall({
  agentId: "agt_swift_wire_bot_01",
  endpoint: "POST /v1/ledger/reconcile",
  requestedScope: "write:ledger",
  context: { amountUSD: 125000, riskScore: 0.02 }
});
// Response: 200 OK (Allowed: Token expires in 7200s)`,
    },
    {
      id: "bank-2",
      title: "KYC & Onboarding",
      subtitle: "Autonomous document verification and sanction screening.",
      chatMessages: [
        { sender: "user", text: "Process passport scan and proof of address for User #44102.", time: "11:05 AM" },
        { sender: "agent", text: "Document verification completed in 820ms. OFAC sanctions screening returned 0 matches. Onboarding approved.", time: "11:05 AM", badge: "Identity OK" },
      ],
      codeSnippet: `// KYC Verification Webhook
POST /api/v2/kyc/verify HTTP/1.1
Host: api.agentic-banking.com
Authorization: Bearer agt_kyc_token_x99

{
  "status": "APPROVED",
  "passportValid": true,
  "confidenceScore": 0.998
}`,
    },
  ],
  HEALTHCARE: [
    {
      id: "health-1",
      title: "Patient Intake & Triage",
      subtitle: "HIPAA-compliant symptom intake and appointment routing.",
      chatMessages: [
        { sender: "user", text: "Schedule urgent cardiology follow-up for Patient ID #HC-9921.", time: "09:15 AM" },
        { sender: "agent", text: "Checked slot availability at Metro General. Slot reserved for tomorrow 9:30 AM with Dr. Vance. BAA HIPAA protocol active.", time: "09:15 AM", badge: "HIPAA Secure" },
      ],
      codeSnippet: `// EHR Authorization Check
const auth = await ehrAgent.requestAccess({
  scope: "read:patient_records",
  patientId: "HC-9921",
  auditId: "aud_99812_hipaa"
});
// Audit log record created: ID aud_99812_hipaa`,
    },
    {
      id: "health-2",
      title: "Claims Authorization",
      subtitle: "Prior authorization checks and ICD-10 medical code matching.",
      chatMessages: [
        { sender: "user", text: "Submit prior authorization request for MRI Lumbar Spine.", time: "02:30 PM" },
        { sender: "agent", text: "Claim pre-approved under Policy Plan #99-B. Auth code: `PA-2026-8819`. Provider notified.", time: "02:30 PM", badge: "Claim Pre-approved" },
      ],
      codeSnippet: `{
  "claimId": "CLM-99201",
  "icd10": "M54.5",
  "approvalStatus": "PRE_APPROVED",
  "copayAmountUSD": 45.00
}`,
    },
  ],
  RETAIL: [
    {
      id: "retail-1",
      title: "Autonomous Customer Care",
      subtitle: "24/7 omni-channel order resolution and refund processing.",
      chatMessages: [
        { sender: "user", text: "Initiate return for Order #RT-55104 (Damaged item).", time: "01:20 PM" },
        { sender: "agent", text: "Return shipping label generated (`1Z9981283`). Refund of $89.50 initiated to original card.", time: "01:20 PM", badge: "Refund Processed" },
      ],
      codeSnippet: `POST /api/v1/orders/return
{
  "orderId": "RT-55104",
  "refundAmount": 89.50,
  "agentScope": "write:refunds"
}`,
    },
  ],
  "TELECOM + MEDIA": [
    {
      id: "telecom-1",
      title: "Network Diagnostic Agent",
      subtitle: "Automated fiber line diagnostics and outage mitigation.",
      chatMessages: [
        { sender: "user", text: "Run diagnostic on Router Node #TEL-TX-402.", time: "04:10 PM" },
        { sender: "agent", text: "Latency test passed (12ms). Bandwidth restored via secondary gateway trunk. Ticket closed.", time: "04:10 PM", badge: "Node Restored" },
      ],
      codeSnippet: `// Network Automation Script
await networkAgent.rerouteTrunk({
  targetNode: "TEL-TX-402",
  primaryGateway: "GW-A1",
  fallbackGateway: "GW-B2"
});`,
    },
  ],
  BUSINESS: [
    {
      id: "biz-1",
      title: "Enterprise HR & Ops",
      subtitle: "Employee onboarding, PTO requests, and IT device dispatch.",
      chatMessages: [
        { sender: "user", text: "Provision M3 MacBook Pro for new engineer Sarah Connor (Growth Team).", time: "08:45 AM" },
        { sender: "agent", text: "Hardware dispatch ticket #IT-8829 created in ServiceNow. Okta identity created with `dev:write` role.", time: "08:45 AM", badge: "Identity Provisioned" },
      ],
      codeSnippet: `// Okta & IAM Automation Payload
{
  "user": "sarah.connor@enterprise.com",
  "team": "Growth",
  "assignedHardware": "M3-MBP-16",
  "role": "Software Engineer"
}`,
    },
  ],
};

const TABS: IndustryKey[] = ["BANKING", "HEALTHCARE", "RETAIL", "TELECOM + MEDIA", "BUSINESS"];

export default function InteractiveDemo() {
  const [activeTab, setActiveTab] = useState<IndustryKey>("BANKING");
  const [selectedAppId, setSelectedAppId] = useState<string>("bank-1");
  const [viewMode, setViewMode] = useState<"chat" | "code">("chat");

  const currentApps = industryData[activeTab] || [];
  const currentApp = currentApps.find((a) => a.id === selectedAppId) || currentApps[0] || industryData.BANKING[0];

  const handleTabChange = (tab: IndustryKey) => {
    setActiveTab(tab);
    const newApps = industryData[tab] || [];
    if (newApps.length > 0) {
      setSelectedAppId(newApps[0].id);
    }
  };

  return (
    <section className="bg-slate-50 py-20 md:py-28 px-4 md:px-8 border-t border-b border-slate-200/60">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header & Tabs */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Left Title */}
          <div className="max-w-md">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
              We&apos;ve built our business by serving global enterprises
            </h2>
          </div>

          {/* Right Tabs */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleTabChange(tab)}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all cursor-pointer ${
                    isActive
                      ? "bg-black text-white shadow-xs"
                      : "bg-white text-slate-700 hover:text-black border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

        </div>

        {/* Dynamic Content Area: 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (col-span-5): Vertical list of app types */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
              Select Enterprise Solution
            </div>

            {currentApps.map((app) => {
              const isSelected = app.id === currentApp.id;
              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedAppId(app.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-black text-white border-black shadow-lg"
                      : "bg-white text-slate-900 border-slate-200/80 hover:border-slate-300 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className={`font-bold text-base ${isSelected ? "text-white" : "text-slate-900"}`}>
                      {app.title}
                    </h3>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        isSelected ? "text-cyan-400 translate-x-1" : "text-slate-400"
                      }`}
                    />
                  </div>

                  <p className={`text-xs mt-1.5 leading-relaxed ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                    {app.subtitle}
                  </p>
                </div>
              );
            })}

            {/* Platform Feature Highlight Card */}
            <div className="p-5 bg-white border border-slate-200/80 rounded-2xl space-y-2 mt-6">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Enterprise Governance Standard</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                All agentic operations enforce strict RBAC token rotation and real-time audit logging.
              </p>
            </div>
          </div>

          {/* Right Column (col-span-7): Mock UI Window */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              
              {/* Top Bar Mimicking Browser / App Window */}
              <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-slate-400">
                
                {/* Traffic light dots */}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="ml-2 font-mono text-xs text-slate-400 hidden sm:inline">
                    aim.enterprise.internal / {currentApp.title.toLowerCase().replace(/\s+/g, "-")}
                  </span>
                </div>

                {/* Switcher tabs (Chat vs Code) */}
                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setViewMode("chat")}
                    className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      viewMode === "chat" ? "bg-black text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Agent Chat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode("code")}
                    className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      viewMode === "code" ? "bg-black text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>API / Policy</span>
                  </button>
                </div>

              </div>

              {/* Inside Content Window */}
              <div className="p-6 bg-slate-950 text-slate-100 min-h-[340px] flex flex-col justify-between font-sans">
                
                <AnimatePresence mode="wait">
                  {viewMode === "chat" ? (
                    <motion.div
                      key={`chat-${currentApp.id}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {currentApp.chatMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono text-slate-500">{msg.sender === "user" ? "Operator" : "Artemis Bot"}</span>
                            <span className="text-[10px] text-slate-600">• {msg.time}</span>
                            {msg.badge && (
                              <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/80 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" /> {msg.badge}
                              </span>
                            )}
                          </div>

                          <div
                            className={`p-3.5 rounded-xl text-xs max-w-md leading-relaxed ${
                              msg.sender === "user"
                                ? "bg-blue-600 text-white rounded-tr-none"
                                : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none font-mono"
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key={`code-${currentApp.id}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-400 font-mono border-b border-slate-800 pb-2">
                        <span className="flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                          <span>policy_inspector.ts</span>
                        </span>
                        <span className="text-emerald-400">● 200 OK</span>
                      </div>

                      <pre className="p-4 bg-slate-900 rounded-xl border border-slate-800/80 font-mono text-xs text-cyan-300 leading-relaxed overflow-x-auto">
                        <code>{currentApp.codeSnippet}</code>
                      </pre>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Console Footer */}
                <div className="mt-6 pt-4 border-t border-slate-900 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Agent Runtime: Active (v2.4.1)</span>
                  </div>
                  <span>Latency: 14ms</span>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
