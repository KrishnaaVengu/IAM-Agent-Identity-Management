import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export const HeroSection: React.FC = () => {
 return (
 <section className="relative bg-gradient-to-b from-slate-50 via-white to-slate-50 py-20 md:py-28 px-4 md:px-8 overflow-hidden font-sans">
 
 {/* Centered Text Area */}
 <div className="max-w-4xl mx-auto text-center space-y-6">
 
 <motion.div
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4 }}
 className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold px-4 py-1.5 rounded-full shadow-2xs"
 >
 <Sparkles className="w-3.5 h-3.5 text-blue-600" />
 <span>The AIM Governance Platform</span>
 </motion.div>

 {/* Main Headline */}
 <motion.h1
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5, delay: 0.1 }}
 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center text-slate-900 max-w-3xl mx-auto leading-[1.12] tracking-tight"
 >
 Identity and Access Management for the AI Workforce.
 </motion.h1>

 {/* Subtitle */}
 <motion.p
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5, delay: 0.2 }}
 className="text-base sm:text-lg text-slate-600 text-center max-w-xl mx-auto font-normal leading-relaxed"
 >
 Provision, manage, and govern machine identities for your AI agents with enterprise-grade security and zero-trust access controls.
 </motion.p>

 {/* CTA Buttons */}
 <motion.div
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5, delay: 0.3 }}
 className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
 >
 <Link
 to="/dashboard"
 className="w-full sm:w-auto bg-black text-white hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-white focus:outline-none uppercase text-xs font-bold tracking-wide px-5 py-3 rounded-md transition-colors shadow-sm text-center"
 >
 GET A DEMO
 </Link>

 <Link
 to="/reports"
 className="w-full sm:w-auto bg-transparent border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-black text-xs font-bold tracking-wide px-5 py-3 rounded-md uppercase transition-colors text-center"
 >
 ANALYST REPORTS &gt;
 </Link>
 </motion.div>
 </div>

 {/* Floating Glassmorphism Card Container */}
 <div className="relative max-w-5xl mx-auto mt-16 md:mt-24 px-2 sm:px-4">
 
 {/* Background Element: Glowing Orb */}
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] sm:w-[550px] h-[280px] sm:h-[360px] bg-gradient-to-tr from-cyan-500 via-blue-600 to-emerald-400 rounded-full blur-3xl opacity-50 pointer-events-none -z-10 animate-pulse duration-3000" />

 {/* Foreground Element: The Dark Card */}
 <motion.div
 initial={{ opacity: 0, y: 24, scale: 0.98 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 transition={{ duration: 0.6, delay: 0.4 }}
 className="relative bg-black/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12 md:p-14 shadow-2xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-8 overflow-hidden group"
 >
 {/* Ambient Interior Glow */}
 <div className="absolute -top-24 -left-24 w-72 h-72 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

 {/* Left Text Block */}
 <div className="space-y-4 max-w-2xl relative z-10">
 <div className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
 THE AIM GOVERNANCE PLATFORM
 </div>

 <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
 Meet {"{ "} <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300">Agent IAM</span> {" }"}
 </h2>

 <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-xl">
 A centralized control plane to issue time-bounded credentials, enforce strict role-based tool scopes, and automatically revoke stale access for autonomous multi-agent systems.
 </p>
 </div>

 {/* Right Action Button */}
 <div className="relative z-10 self-end md:self-center flex-shrink-0">
 <Link
 to="/dashboard"
 className="w-14 h-14 sm:w-16 sm:h-16 bg-white text-black hover:bg-slate-200 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg group-hover:shadow-cyan-500/20 cursor-pointer"
 aria-label="Meet Artemis"
 >
 <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5] transition-transform duration-300 group-hover:translate-x-1" />
 </Link>
 </div>

 </motion.div>
 </div>

 </section>
 );
};
