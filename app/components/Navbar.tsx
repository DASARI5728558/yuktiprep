"use client";
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="nav-shell relative z-50">
      <nav className="nav flex justify-between items-center" aria-label="Main navigation">
        <a className="brand logo-brand flex items-center" href="/#top" aria-label="YuktiPrep home">
          <img src="/yuktiprep.png" alt="YuktiPrep - AI-Driven Success Platform" className="w-full h-auto max-w-[150px] sm:max-w-[180px] object-contain" />
        </a>

        {/* Desktop Links (Hidden on mobile via CSS) */}
        <div className="nav-links">
          <a href="/#exams">Exams</a><a href="/#features">How it works</a><a href="/#mentors">Mentorship</a><a href="/#pricing">Pricing</a><a href="/contact">Contact</a>
        </div>

        <div className="flex items-center gap-4">
          {/* Desktop Actions */}
          <div className="nav-actions flex items-center">
            <a className="text-link hidden sm:block" href="/dashboard">Sign in</a>
            <a className="button small" href="/dashboard">Start free</a>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 ml-2 focus:outline-none gap-1.5"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <span className={`bg-[#165449] block transition-all duration-300 ease-out h-[2px] w-6 rounded-sm ${isOpen ? 'rotate-45 translate-y-[8px]' : ''}`}></span>
            <span className={`bg-[#165449] block transition-all duration-300 ease-out h-[2px] w-6 rounded-sm ${isOpen ? 'opacity-0' : 'opacity-100'}`}></span>
            <span className={`bg-[#165449] block transition-all duration-300 ease-out h-[2px] w-6 rounded-sm ${isOpen ? '-rotate-45 -translate-y-[8px]' : ''}`}></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-[#fbf8ef] border-b border-[#165449]/10 shadow-md transition-all duration-300 ease-in-out overflow-hidden flex flex-col ${isOpen ? 'max-h-[400px] opacity-100 py-4' : 'max-h-0 opacity-0 py-0'}`}
      >
        <div className="flex flex-col px-6 gap-4">
          <a href="/#exams" onClick={() => setIsOpen(false)} className="text-[#165449] font-medium text-lg border-b border-[#165449]/10 pb-2">Exams</a>
          <a href="/#features" onClick={() => setIsOpen(false)} className="text-[#165449] font-medium text-lg border-b border-[#165449]/10 pb-2">How it works</a>
          <a href="/#mentors" onClick={() => setIsOpen(false)} className="text-[#165449] font-medium text-lg border-b border-[#165449]/10 pb-2">Mentorship</a>
          <a href="/#pricing" onClick={() => setIsOpen(false)} className="text-[#165449] font-medium text-lg border-b border-[#165449]/10 pb-2">Pricing</a>
          <a href="/contact" onClick={() => setIsOpen(false)} className="text-[#165449] font-medium text-lg border-b border-[#165449]/10 pb-2">Contact</a>
          <a href="/dashboard" onClick={() => setIsOpen(false)} className="text-[#165449] font-medium text-lg border-b border-[#165449]/10 pb-2">Sign in</a>
        </div>
      </div>
    </header>
  );
}
