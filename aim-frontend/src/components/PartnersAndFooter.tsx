import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
 Globe,
 ArrowUpRight,
 ExternalLink,
 ChevronDown
} from "lucide-react";
import { motion } from "framer-motion";

export const PartnersAndFooter: React.FC = () => {
 const [language, setLanguage] = useState("English (US)");
 const [langMenuOpen, setLangMenuOpen] = useState(false);

 return (
 <div className="font-sans">
 {/* Strategic Partners Section */}
 <section className="bg-slate-50 py-24 px-4 md:px-8 border-b border-slate-200/60">
 <div className="max-w-6xl mx-auto">
 
 <div className="space-y-3">
 <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
 Ecosystem & Integrations
 </div>
 <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
 Strategic partners: Microsoft and AWS
 </h2>
 <p className="text-base text-slate-600 font-normal max-w-2xl leading-relaxed">
 We work with the world&apos;s largest hyperscale platforms to deliver enterprise-grade governance, hardware enclave token security, and native cloud deployments.
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
 
 {/* Card 1: Microsoft */}
 <motion.div
 initial={{ opacity: 0, y: 16 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.4 }}
 className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-8 sm:p-10 shadow-xl overflow-hidden flex flex-col justify-between text-white group"
 >
 <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

 <div>
 <div className="flex items-center justify-between mb-8">
 <div className="flex items-center gap-3">
 <div className="grid grid-cols-2 gap-1 w-7 h-7">
 <div className="bg-[#F25022] w-3 h-3 rounded-xs" />
 <div className="bg-[#7FBA00] w-3 h-3 rounded-xs" />
 <div className="bg-[#00A4EF] w-3 h-3 rounded-xs" />
 <div className="bg-[#FFB900] w-3 h-3 rounded-xs" />
 </div>
 <span className="text-xl font-bold tracking-tight text-white font-sans">Microsoft</span>
 </div>

 <span className="text-[11px] font-mono font-semibold uppercase bg-blue-950 text-blue-400 border border-blue-800 px-2.5 py-1 rounded-full">
 Gold Partner
 </span>
 </div>

 <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
 Microsoft Azure Integration
 </h3>
 <p className="text-sm text-slate-300 font-normal leading-relaxed mb-8">
 Deploy governed agentic AI workflows natively on Azure Kubernetes Service and Azure OpenAI Service with seamless Entra ID (Azure AD) identity federation.
 </p>
 </div>

 <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800/80">
 <Link
 to="/dashboard"
 className="bg-white text-black hover:bg-slate-200 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-md transition-colors flex items-center gap-1.5"
 >
 <span>READ MORE</span>
 <ArrowUpRight className="w-3.5 h-3.5" />
 </Link>

 <Link
 to="/docs/azure"
 className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-md transition-colors flex items-center gap-1.5"
 >
 <span>VIEW INTEGRATION DOCS</span>
 <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
 </Link>
 </div>
 </motion.div>

 {/* Card 2: AWS */}
 <motion.div
 initial={{ opacity: 0, y: 16 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.4, delay: 0.1 }}
 className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-8 sm:p-10 shadow-xl overflow-hidden flex flex-col justify-between text-white group"
 >
 <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

 <div>
 <div className="flex items-center justify-between mb-8">
 <div className="flex items-center gap-2">
 <span className="text-2xl font-black tracking-tighter text-white font-mono">aws</span>
 <span className="text-xs text-amber-400 font-mono tracking-widest uppercase font-bold ml-1">
 PARTNER NETWORK
 </span>
 </div>

 <span className="text-[11px] font-mono font-semibold uppercase bg-amber-950 text-amber-400 border border-amber-800 px-2.5 py-1 rounded-full">
 Advanced Tier
 </span>
 </div>

 <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
 Amazon Web Services Integration
 </h3>
 <p className="text-sm text-slate-300 font-normal leading-relaxed mb-8">
 Seamlessly integrate autonomous AI agents with AWS Bedrock, SageMaker, and KMS for zero-trust token signing and Nitro Enclaves hardware security.
 </p>
 </div>

 <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800/80">
 <Link
 to="/dashboard"
 className="bg-white text-black hover:bg-slate-200 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-md transition-colors flex items-center gap-1.5"
 >
 <span>READ MORE</span>
 <ArrowUpRight className="w-3.5 h-3.5" />
 </Link>

 <Link
 to="/docs/aws"
 className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-md transition-colors flex items-center gap-1.5"
 >
 <span>VIEW INTEGRATION DOCS</span>
 <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
 </Link>
 </div>
 </motion.div>

 </div>

 </div>
 </section>

 {/* Footer Section */}
 <footer className="bg-white border-t border-slate-200 text-slate-900">
 <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
 
 <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
 
 {/* Column 1: Company Logo & Language Dropdown */}
 <div className="col-span-2 md:col-span-1 space-y-6">
 <div>
 <Link to="/" className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center gap-1.5">
 <span className="bg-black text-white px-2 py-0.5 rounded text-sm font-mono tracking-widest">
 AIM
 </span>
 <span className="font-black text-slate-900 tracking-tight">AGENTIC</span>
 </Link>
 <p className="text-xs text-slate-500 mt-2 leading-relaxed">
 Enterprise Agent Identity & Governance Platform.
 </p>
 </div>

 <div className="relative">
 <button
 type="button"
 onClick={() => setLangMenuOpen(!langMenuOpen)}
 className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 hover:border-slate-300 px-3 py-2 rounded-md transition-colors cursor-pointer w-full justify-between"
 >
 <span className="flex items-center gap-1.5">
 <Globe className="w-3.5 h-3.5 text-slate-500" />
 <span>{language}</span>
 </span>
 <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
 </button>

 {langMenuOpen && (
 <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg py-1 z-20 text-xs">
 {["English (US)", "English (UK)", "Deutsch", "Français", "日本語"].map((lang) => (
 <div
 key={lang}
 onClick={() => {
 setLanguage(lang);
 setLangMenuOpen(false);
 }}
 className="px-3 py-1.5 hover:bg-slate-50 text-slate-700 cursor-pointer"
 >
 {lang}
 </div>
 ))}
 </div>
 )}
 </div>

 <div className="text-[11px] text-slate-400 pt-2 font-mono">
 © {new Date().getFullYear()} Agentic AIM, Inc. All rights reserved.
 </div>
 </div>

 {/* Column 2: PLATFORM CAPABILITIES */}
 <div>
 <h4 className="text-xs uppercase tracking-wider text-slate-900 font-bold mb-4">
 PLATFORM CAPABILITIES
 </h4>
 <ul className="space-y-3 text-sm text-slate-500 font-medium">
 <li>
 <Link to="/dashboard" className="hover:text-black transition-colors">
 AIM Governance Engine
 </Link>
 </li>
 <li>
 <Link to="/dashboard" className="hover:text-black transition-colors">
 Credential Vault
 </Link>
 </li>
 <li>
 <Link to="/dashboard" className="hover:text-black transition-colors">
 Scope Manager
 </Link>
 </li>
 <li>
 <Link to="/simulator" className="hover:text-black transition-colors">
 Review Simulator
 </Link>
 </li>
 <li>
 <Link to="/audit" className="hover:text-black transition-colors">
 Audit Logs
 </Link>
 </li>
 </ul>
 </div>

 {/* Column 3: DEVELOPERS */}
 <div>
 <h4 className="text-xs uppercase tracking-wider text-slate-900 font-bold mb-4">
 DEVELOPERS
 </h4>
 <ul className="space-y-3 text-sm text-slate-500 font-medium">
 <li>
 <Link to="/docs" className="hover:text-black transition-colors">
 API Documentation
 </Link>
 </li>
 <li>
 <Link to="/sdks" className="hover:text-black transition-colors">
 SDKs
 </Link>
 </li>
 <li>
 <Link to="/guides/rotation" className="hover:text-black transition-colors">
 Rotation Guides
 </Link>
 </li>
 <li>
 <Link to="/guides/integration" className="hover:text-black transition-colors">
 Integration Tutorials
 </Link>
 </li>
 </ul>
 </div>

 {/* Column 4: RESOURCES */}
 <div>
 <h4 className="text-xs uppercase tracking-wider text-slate-900 font-bold mb-4">
 RESOURCES
 </h4>
 <ul className="space-y-3 text-sm text-slate-500 font-medium">
 <li>
 <Link to="/about" className="hover:text-black transition-colors">
 About AIM Architecture
 </Link>
 </li>
 <li>
 <Link to="/security" className="hover:text-black transition-colors">
 Security Whitepapers
 </Link>
 </li>
 <li>
 <Link to="/compliance" className="hover:text-black transition-colors">
 Compliance Frameworks
 </Link>
 </li>
 <li>
 <Link to="/reports" className="hover:text-black transition-colors">
 Analyst Reports
 </Link>
 </li>
 <li>
 <Link to="/blog" className="hover:text-black transition-colors">
 Blog & Insights
 </Link>
 </li>
 </ul>
 </div>

 {/* Column 5: Let's work together & RFP */}
 <div className="col-span-2 md:col-span-1 space-y-4">
 <h4 className="text-xs uppercase tracking-wider text-slate-900 font-bold mb-2">
 LET&apos;S WORK TOGETHER
 </h4>
 <p className="text-xs text-slate-500 leading-relaxed font-normal">
 Ready to evaluate agentic AI identity controls for your enterprise infrastructure?
 </p>

 <Link
 to="/dashboard"
 className="bg-black text-white uppercase text-xs font-bold tracking-wide px-4 py-2.5 rounded-md hover:bg-slate-800 transition-colors shadow-xs w-full text-center block"
 >
 SUBMIT RFP
 </Link>

 <div className="pt-2 flex items-center gap-4 text-slate-400">
 <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter / X" className="hover:text-black transition-colors">
 <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
 </a>
 <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="hover:text-black transition-colors">
 <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
 </a>
 <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub" className="hover:text-black transition-colors">
 <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>
 </a>
 <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube" className="hover:text-black transition-colors">
 <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
 </a>
 </div>
 </div>

 </div>

 </div>
 </footer>
 </div>
 );
};
