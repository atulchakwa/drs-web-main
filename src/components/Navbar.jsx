import React from 'react';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="w-full max-w-7xl px-4 md:px-8 py-6 flex items-center justify-between z-50 bg-transparent">
      <Link href="/" className="text-2xl font-medium tracking-tight text-[#111]">Premium Care</Link>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
        <Link href="/" className="text-black border-b border-black transition py-1">Home</Link>
        <Link href="/#doctor-profile" className="hover:text-black transition py-1">About</Link>
        <Link href="/#services" className="hover:text-black transition flex items-center gap-1 py-1">
          Care Services
        </Link>
        <Link href="/#timings" className="hover:text-black transition py-1">Timings</Link>
        <Link href="/login" className="text-gray-400 hover:text-black transition py-1 text-xs">Admin</Link>
      </div>

      <Link href="/#appointment" className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition shadow-sm hover:-translate-y-0.5 transform duration-200">
        Consult now
      </Link>
    </nav>
  );
}