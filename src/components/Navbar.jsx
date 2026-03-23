"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/#doctor-profile' },
    { name: 'Care Services', href: '/#services' },
    { name: 'Timings', href: '/#timings' },
    { name: 'Login', href: '/login', extra: 'text-xs text-slate-400 font-medium' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-500 ${scrolled
      ? 'py-4 bg-white/95 backdrop-blur-xl shadow-lg border-b border-slate-100'
      : 'py-5 bg-white/80 backdrop-blur-md'
      }`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black tracking-tighter text-secondary group flex items-center gap-2.5">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white text-lg shadow-lg shadow-primary-200">P</div>
          Premium<span className="text-primary-600 group-hover:text-primary-500 transition-colors">Care</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10 text-base font-semibold text-slate-700">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`${link.extra || 'hover:text-primary-600'} transition-all duration-300 py-2 px-1 relative group`}
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link href="/#appointment" className="hidden sm:inline-flex bg-primary-600 text-white px-7 py-3 rounded-xl text-base font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 hover:-translate-y-0.5 active:scale-95">
            Book Now
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2.5 text-secondary hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>

        {/* Mobile Navigation Overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute top-full left-4 right-4 mt-4 p-8 glass rounded-[2.5rem] shadow-2xl md:hidden flex flex-col gap-6 z-[100] border border-white/40"
            >
              <div className="flex flex-col gap-4">
                {navLinks.map((link, idx) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`text-xl font-bold ${link.name === 'Login' ? 'text-slate-400 text-base mt-4' : 'text-secondary'} hover:text-primary-600 transition-colors flex items-center justify-between`}
                    >
                      {link.name}
                      {link.name !== 'Login' && <X className="w-5 h-5 opacity-0 group-hover:opacity-100 -rotate-45" />}
                    </Link>
                  </motion.div>
                ))}
              </div>
              <Link
                href="/#appointment"
                onClick={() => setIsOpen(false)}
                className="w-full bg-primary-600 text-white py-4 rounded-2xl text-center font-bold text-lg shadow-lg shadow-primary-200 active:scale-[0.98] transition-transform"
              >
                Consult now
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}