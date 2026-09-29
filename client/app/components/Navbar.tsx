"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, X, ArrowRight } from 'lucide-react';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

import { useAuthStatus } from '@/lib/auth';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';
  const { isAuthenticated, appUrl, loading } = useAuthStatus();

  const handleActionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 w-full flex justify-center pointer-events-none px-0 ${isHome ? 'lg:top-4 lg:px-4' : ''}`}>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className={`pointer-events-auto w-full bg-white backdrop-blur-md border-b border-[rgba(18,47,43,0.15)] shadow-sm transition-all duration-300 ${isHome ? 'lg:w-auto lg:max-w-6xl lg:border lg:rounded-full lg:shadow-lg' : ''
          }`}
      >
        {showToast && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-[var(--primarynavy)] text-white pl-6 pr-4 py-3 rounded-full shadow-2xl z-50 flex items-center gap-3 animate-[pulse_0.3s_ease-in-out]">
            <Zap size={18} className="text-[var(--gold)]" fill="currentColor" />
            <span className="font-medium text-[15px] whitespace-nowrap">We will implement this feature soon!</span>
            <button onClick={() => setShowToast(false)} className="ml-2 hover:bg-white/10 p-1.5 rounded-full transition-colors flex items-center justify-center text-white/70 hover:text-white" aria-label="Close">
              <X size={16} />
            </button>
          </div>
        )}
        <nav className="flex justify-between items-center h-[78px] lg:h-[68px] px-4 sm:px-6 lg:px-8 lg:gap-12 max-w-7xl mx-auto w-full" aria-label="Main navigation">
          <a className="flex items-center gap-[10px]  font-bold text-[23px]" href="/" aria-label="YuktiPrep home">
            <img src="/yuktiprep.png" alt="YuktiPrep - AI-Driven Success Platform" className="w-full h-auto max-w-[140px] sm:max-w-[160px] object-contain" />
          </a>

          {/* Desktop Links (Hidden on mobile via CSS) */}
          <div className="hidden lg:flex items-center gap-8 text-[14px] font-semibold text-[var(--primarynavy)]">
            <Link className="hover:text-[var(--teal)] transition-colors" href="/#exams">Exams</Link>
            <Link className="hover:text-[var(--teal)] transition-colors" href="/#features">How it works</Link>
            <Link className="hover:text-[var(--teal)] transition-colors" href="/#mentors">Mentorship</Link>
            <Link className="hover:text-[var(--teal)] transition-colors" href="/current-affairs">Current Affairs</Link>
            <Link className="hover:text-[var(--teal)] transition-colors" href="/pricing">Pricing</Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Desktop Actions */}
            <div className="flex items-center gap-4 text-[14px] font-bold">
              {!loading && isAuthenticated ? (
                <a
                  className="inline-flex items-center justify-center gap-2 bg-[var(--primarynavy)] text-white! rounded-full py-2.5 px-6 font-bold transition-transform duration-200 hover:-translate-y-[2px] hover:bg-[var(--primaryblue)] shadow-sm"
                  href={appUrl}
                >
                  <span>My Dashboard</span>
                  <ArrowRight size={16} />
                </a>
              ) : (
                <>
                  <a
                    className="hidden lg:block text-[var(--primarynavy)] hover:text-[var(--teal)] transition-colors"
                    href={`${appUrl}/login`}
                  >
                    Sign in
                  </a>
                  <a
                    className="hidden lg:block items-center justify-center gap-[18px] bg-[var(--primaryblue)] text-white! rounded-full py-2.5 px-6 font-bold transition-transform duration-200 hover:-translate-y-[2px] hover:bg-[var(--primarynavy)] shadow-sm"
                    href={`${appUrl}/register`}
                  >
                    Start free
                  </a>
                </>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              className="lg:hidden flex flex-col justify-center items-center w-8 h-8 ml-2 focus:outline-none gap-1.5"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              <span className={`bg-[var(--primarynavy)] block transition-all duration-300 ease-out h-[2px] w-6 rounded-sm ${isOpen ? 'rotate-45 translate-y-[8px]' : ''}`}></span>
              <span className={`bg-[var(--primarynavy)] block transition-all duration-300 ease-out h-[2px] w-6 rounded-sm ${isOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`bg-[var(--primarynavy)] block transition-all duration-300 ease-out h-[2px] w-6 rounded-sm ${isOpen ? '-rotate-45 -translate-y-[8px]' : ''}`}></span>
            </button>
          </div>
        </nav>
      </motion.div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`lg:hidden pointer-events-auto absolute top-full left-0 right-0 bg-white border-b border-black/10 shadow-xl transition-all duration-300 ease-in-out overflow-y-auto flex flex-col z-50 ${isOpen ? 'max-h-[85vh] opacity-100 py-4' : 'max-h-0 opacity-0 py-0 pointer-events-none'
          }`}
      >
        <div className="flex flex-col px-6 gap-3">
          <Link href="/#exams" onClick={() => setIsOpen(false)} className="text-[var(--primarynavy)] hover:text-[var(--teal)] font-medium text-lg border-b border-black/5 pb-2.5 transition-colors">Exams</Link>
          <Link href="/#features" onClick={() => setIsOpen(false)} className="text-[var(--primarynavy)] hover:text-[var(--teal)] font-medium text-lg border-b border-black/5 pb-2.5 transition-colors">How it works</Link>
          <Link href="/#mentors" onClick={() => setIsOpen(false)} className="text-[var(--primarynavy)] hover:text-[var(--teal)] font-medium text-lg border-b border-black/5 pb-2.5 transition-colors">Mentorship</Link>
          <Link href="/current-affairs" onClick={() => setIsOpen(false)} className="text-[var(--primarynavy)] hover:text-[var(--teal)] font-medium text-lg border-b border-black/5 pb-2.5 transition-colors">Current Affairs</Link>
          <Link href="/pricing" onClick={() => setIsOpen(false)} className="text-[var(--primarynavy)] hover:text-[var(--teal)] font-medium text-lg border-b border-black/5 pb-2.5 transition-colors">Pricing</Link>
          <Link href="/contact" onClick={() => setIsOpen(false)} className="text-[var(--primarynavy)] hover:text-[var(--teal)] font-medium text-lg border-b border-black/5 pb-2.5 transition-colors">Contact</Link>
          {isAuthenticated ? (
            <a
              href={appUrl}
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-2 text-[var(--primaryblue)] font-bold text-lg pt-2"
            >
              <span>My Dashboard</span>
              <ArrowRight size={18} />
            </a>
          ) : (
            <div className="flex flex-col gap-3 pt-2">
              <a
                href={`${appUrl}/login`}
                onClick={() => setIsOpen(false)}
                className="w-full text-center bg-[#f0f5fa] hover:bg-[#e4edf7] text-[var(--primarynavy)]! font-bold text-base py-3 px-6 rounded-full border border-[rgba(18,47,43,0.12)] transition-colors"
              >
                Sign in
              </a>
              <a
                href={`${appUrl}/register`}
                onClick={() => setIsOpen(false)}
                className="w-full text-center bg-[var(--primaryblue)]! text-white! font-bold text-base py-3 px-6 rounded-full hover:bg-[var(--primarynavy)]! transition-colors shadow-sm"
              >
                Start free
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}