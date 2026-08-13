import React from "react";
import { Lock, Zap, Cpu, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

interface FeatureCardProps {
 title: string;
 description: string;
 icon: React.ElementType;
 badge?: string;
 delay?: number;
}

const features: FeatureCardProps[] = [
 {
 title: "Scoped, Time-Bounded Credentials",
 description: "Issue secure API tokens with precise tool scopes and strict expiration dates to enforce the principle of least privilege.",
 icon: Lock,
 badge: "Security",
 delay: 0.1,
 },
 {
 title: "Automated Lifecycle & Rotation",
 description: "Enable agents to request and seamlessly rotate credentials before expiry, instantly revoking deprecated keys.",
 icon: Zap,
 badge: "Lifecycle",
 delay: 0.2,
 },
 {
 title: "Continuous Access Reviews",
 description: "Automatically flag agents that remain inactive for 30+ days and generate comprehensive governance reports for owning teams.",
 icon: Cpu,
 badge: "Governance",
 delay: 0.3,
 },
];

export const FeaturesGrid: React.FC = () => {
 return (
 <section className="max-w-5xl mx-auto mt-8 pb-16 px-4 font-sans">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 {features.map((card) => {
 const Icon = card.icon;
 return (
 <motion.div
 key={card.title}
 initial={{ opacity: 0, y: 16 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.4, delay: card.delay }}
 className="group relative bg-white border border-slate-100 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 shadow-2xs flex flex-col justify-between"
 >
 <div>
 <div className="flex items-center justify-between mb-5">
 <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 group-hover:bg-black group-hover:text-white transition-colors duration-300">
 <Icon className="w-5 h-5" />
 </div>
 
 {card.badge && (
 <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full group-hover:text-slate-600 transition-colors">
 {card.badge}
 </span>
 )}
 </div>

 <h3 className="text-lg font-semibold text-slate-900 mb-2.5 flex items-center justify-between">
 <span>{card.title}</span>
 <ArrowUpRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-black transition-all duration-300 -translate-x-1 group-hover:translate-x-0" />
 </h3>

 <p className="text-sm text-slate-600 leading-relaxed font-normal">
 {card.description}
 </p>
 </div>
 </motion.div>
 );
 })}
 </div>
 </section>
 );
};
