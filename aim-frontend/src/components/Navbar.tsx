import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleMouseEnter = (menuName: string) => {
    setActiveDropdown(menuName);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-100 font-sans">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Left: Bold text logo placeholder */}
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            <span className="bg-black text-white px-2 py-0.5 rounded text-sm font-mono tracking-widest">
              AIM
            </span>
            <span className="font-black text-slate-900 tracking-tight">AGENTIC</span>
          </Link>
        </div>

        {/* Center: Navigation links with dropdowns */}
        <nav className="hidden md:flex items-center gap-8">
          
          {/* Agent Platform */}
          <div
            className="relative py-4"
            onMouseEnter={() => handleMouseEnter("platform")}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-black transition-colors cursor-pointer"
            >
              <span>Agent Platform</span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>

            <AnimatePresence>
              {activeDropdown === "platform" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 w-64 bg-white border border-gray-100 rounded-xl shadow-lg p-3 z-50 space-y-1"
                >
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    Identity Console
                    <span className="block text-[11px] font-normal text-slate-500">Manage credentials & permissions</span>
                  </Link>
                  <Link
                    to="/simulator"
                    className="block px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    API Policy Simulator
                    <span className="block text-[11px] font-normal text-slate-500">Test token access scopes live</span>
                  </Link>
                  <Link
                    to="/audit"
                    className="block px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    Audit Trail & Logs
                    <span className="block text-[11px] font-normal text-slate-500">Zero-trust activity tracking</span>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Agentic AI Apps */}
          <div
            className="relative py-4"
            onMouseEnter={() => handleMouseEnter("apps")}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-black transition-colors cursor-pointer"
            >
              <span>Agentic AI Apps</span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>

            <AnimatePresence>
              {activeDropdown === "apps" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 w-64 bg-white border border-gray-100 rounded-xl shadow-lg p-3 z-50 space-y-1"
                >
                  <div className="px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 rounded-lg cursor-pointer">
                    Banking & Finance Bots
                  </div>
                  <div className="px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 rounded-lg cursor-pointer">
                    Healthcare Triage Agents
                  </div>
                  <div className="px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 rounded-lg cursor-pointer">
                    Enterprise Operations
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Agent Marketplace */}
          <Link
            to="/marketplace"
            className="text-sm font-medium text-slate-700 hover:text-black transition-colors"
          >
            Agent Marketplace
          </Link>

          {/* More */}
          <div
            className="relative py-4"
            onMouseEnter={() => handleMouseEnter("more")}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-black transition-colors cursor-pointer"
            >
              <span>More</span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>

            <AnimatePresence>
              {activeDropdown === "more" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 w-48 bg-white border border-gray-100 rounded-xl shadow-lg p-3 z-50 space-y-1"
                >
                  <Link
                    to="/docs"
                    className="block px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    Documentation
                  </Link>
                  <Link
                    to="/security"
                    className="block px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    Security Whitepaper
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </nav>

        {/* Right: Sign In + GET IN TOUCH */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/dashboard"
            className="text-sm font-medium text-slate-700 hover:text-black transition-colors"
          >
            Sign In
          </Link>

          <Link
            to="/contact"
            className="bg-black text-white uppercase text-xs font-bold tracking-wide px-4 py-2 rounded-md hover:bg-slate-800 transition-colors shadow-xs"
          >
            GET IN TOUCH
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden items-center">
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

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-b border-gray-100 px-4 pt-2 pb-6 space-y-4 overflow-hidden shadow-lg"
          >
            <div className="flex flex-col gap-3 font-medium text-slate-700 text-sm">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-black py-1"
              >
                Agent Platform Console
              </Link>
              <Link
                to="/simulator"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-black py-1"
              >
                API Policy Simulator
              </Link>
              <Link
                to="/marketplace"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-black py-1"
              >
                Agent Marketplace
              </Link>
              <Link
                to="/docs"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-black py-1"
              >
                Documentation
              </Link>
            </div>

            <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 hover:text-black"
              >
                Sign In
              </Link>

              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="bg-black text-white text-center uppercase text-xs font-bold tracking-wide px-4 py-2.5 rounded-md hover:bg-slate-800 transition-colors shadow-xs"
              >
                GET IN TOUCH
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
};
