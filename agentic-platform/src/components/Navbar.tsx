"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X, Bot, Sparkles, Store, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
  dropdownItems?: { label: string; description: string; href: string; icon?: React.ElementType }[];
}

const navItems: NavItem[] = [
  {
    label: "Agent Platform",
    href: "/platform",
    hasDropdown: true,
    dropdownItems: [
      { label: "Identity & Access", description: "IAM governance for machine agents", href: "/platform/identity", icon: Bot },
      { label: "Execution Engine", description: "Distributed agent runtime and sandbox", href: "/platform/execution", icon: Layers },
      { label: "Policy Engine", description: "Real-time RBAC policy enforcement", href: "/platform/policy", icon: Sparkles },
    ],
  },
  {
    label: "Agentic AI Apps",
    href: "/apps",
    hasDropdown: true,
    dropdownItems: [
      { label: "Enterprise Workflow Bot", description: "Automated ticket triage & finance", href: "/apps/workflow", icon: Sparkles },
      { label: "Doc Summarizer Pro", description: "Document analysis pipeline", href: "/apps/summarizer", icon: Bot },
    ],
  },
  {
    label: "Agent Marketplace",
    href: "/marketplace",
    hasDropdown: false,
  },
  {
    label: "More",
    href: "#",
    hasDropdown: true,
    dropdownItems: [
      { label: "Documentation", description: "API references & integration guides", href: "/docs" },
      { label: "Security & Governance", description: "SOC2 & ISO compliance standards", href: "/security" },
      { label: "Blog & Research", description: "Latest in agentic AI architecture", href: "/blog" },
    ],
  },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleDropdown = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 h-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Bold text logo placeholder */}
        <div className="flex items-center">
          <Link href="/" className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center gap-1.5 group">
            <span className="bg-black text-white px-2 py-0.5 rounded text-sm font-mono tracking-widest group-hover:bg-slate-800 transition-colors">
              AIM
            </span>
            <span className="font-black text-slate-900 tracking-tight">AGENTIC</span>
          </Link>
        </div>

        {/* Center: Navigation links */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="relative group"
              onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.label)}
              onMouseLeave={() => item.hasDropdown && setActiveDropdown(null)}
            >
              <Link
                href={item.href}
                className="text-sm font-medium text-slate-700 hover:text-black flex items-center gap-1 py-5 transition-colors"
              >
                <span>{item.label}</span>
                {item.hasDropdown && (
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 group-hover:text-black transition-transform duration-200 ${
                      activeDropdown === item.label ? "rotate-180 text-black" : ""
                    }`}
                  />
                )}
              </Link>

              {/* Desktop Dropdown Menu */}
              <AnimatePresence>
                {item.hasDropdown && activeDropdown === item.label && item.dropdownItems && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute top-full left-0 w-64 bg-white border border-gray-100 rounded-xl shadow-lg p-2 z-50"
                  >
                    {item.dropdownItems.map((subItem) => {
                      const Icon = subItem.icon;
                      return (
                        <Link
                          key={subItem.label}
                          href={subItem.href}
                          className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          {Icon && <Icon className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />}
                          <div>
                            <div className="text-xs font-semibold text-slate-900">{subItem.label}</div>
                            <div className="text-[11px] text-slate-500">{subItem.description}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        {/* Right: Sign In link & GET IN TOUCH button */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/signin"
            className="text-sm font-medium text-slate-700 hover:text-black transition-colors"
          >
            Sign In
          </Link>
          
          <Link
            href="/contact"
            className="bg-black text-white uppercase text-xs font-bold tracking-wide px-4 py-2 rounded-md hover:bg-slate-800 transition-colors shadow-xs"
          >
            GET IN TOUCH
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-black focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-b border-gray-100 px-4 pt-3 pb-6 space-y-4 shadow-xl"
          >
            <div className="space-y-2">
              {navItems.map((item) => (
                <div key={item.label} className="border-b border-slate-50 pb-2">
                  <div
                    onClick={() => item.hasDropdown && toggleDropdown(item.label)}
                    className="flex items-center justify-between py-2 text-sm font-medium text-slate-700 hover:text-black cursor-pointer"
                  >
                    <Link href={item.href} onClick={() => !item.hasDropdown && setMobileMenuOpen(false)}>
                      {item.label}
                    </Link>
                    {item.hasDropdown && (
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          activeDropdown === item.label ? "rotate-180 text-black" : ""
                        }`}
                      />
                    )}
                  </div>

                  {item.hasDropdown && activeDropdown === item.label && item.dropdownItems && (
                    <div className="pl-4 space-y-2 mt-1">
                      {item.dropdownItems.map((sub) => (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block text-xs text-slate-600 hover:text-black py-1"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <Link
                href="/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-sm font-medium text-slate-700 hover:text-black py-2 border border-slate-200 rounded-md"
              >
                Sign In
              </Link>

              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center bg-black text-white uppercase text-xs font-bold tracking-wide px-4 py-2.5 rounded-md hover:bg-slate-800 transition-colors"
              >
                GET IN TOUCH
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
