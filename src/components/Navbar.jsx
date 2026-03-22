"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/#doctor-profile' },
    { name: 'Care Services', href: '/#services' },
    { name: 'Timings', href: '/#timings' },
    { name: 'Admin', href: '/login', extra: 'text-xs text-gray-400' },
  ];

  return (
    <nav className="w-full max-w-7xl px-4 md:px-8 py-6 flex items-center justify-between z-50 bg-transparent relative">
      <Link href="/" className="text-2xl font-black tracking-tighter text-slate-900 group">
        Premium<span className="text-indigo-600 group-hover:text-indigo-500 transition-colors">Care</span>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={`${link.extra || 'hover:text-indigo-600'} transition-all duration-300 py-1 relative group`}
          >
            {link.name}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <Link href="/#appointment" className="hidden sm:block bg-indigo-600 text-white px-6 py-2.5 rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:-translate-y-0.5 active:scale-95">
          Consult now
        </Link>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-4 right-4 mt-2 p-6 bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50 md:hidden flex flex-col gap-6 z-[100]"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`text-lg font-bold ${link.name === 'Admin' ? 'text-slate-400 text-sm' : 'text-slate-900'} hover:text-indigo-600 transition-colors`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/#appointment"
              onClick={() => setIsOpen(false)}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl text-center font-bold text-lg shadow-lg shadow-indigo-200"
            >
              Consult now
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}