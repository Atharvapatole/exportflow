'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight, Sparkles } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="h-18 bg-white/95 dark:bg-[#0B0F17]/95 backdrop-blur-md border-b border-[#E5EAF1] dark:border-[#243047] px-6 md:px-12 flex items-center justify-between sticky top-0 z-40 transition-colors">
      {/* Brand Logo */}
      <BrandLogo size="md" showTagline={false} />

      {/* Desktop Navigation Links */}
      <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-600 dark:text-slate-300">
        <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Home
        </Link>
        <Link href="/#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Features
        </Link>
        <Link href="/#documents" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Document Studio
        </Link>
        <Link href="/#calculators" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Export Calculators
        </Link>
        <Link href="/pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Pricing
        </Link>
        <Link href="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Contact
        </Link>
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        <div className="hidden sm:flex items-center gap-2.5">
          <Link href="/login">
            <Button variant="outline" size="sm" className="text-xs">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="secondary" size="sm" className="text-xs gap-1 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Start 3-Day Free Trial</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-18 left-0 w-full bg-white dark:bg-[#0F172A] border-b border-[#E5EAF1] dark:border-[#243047] p-6 shadow-xl space-y-4 animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-blue-600 dark:hover:text-blue-400 py-1"
            >
              Home
            </Link>
            <Link
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-blue-600 dark:hover:text-blue-400 py-1"
            >
              Features
            </Link>
            <Link
              href="/#documents"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-blue-600 dark:hover:text-blue-400 py-1"
            >
              Document Studio
            </Link>
            <Link
              href="/#calculators"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-blue-600 dark:hover:text-blue-400 py-1"
            >
              Export Calculators
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-blue-600 dark:hover:text-blue-400 py-1"
            >
              Pricing & Credit Packs
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-blue-600 dark:hover:text-blue-400 py-1"
            >
              Contact & Support
            </Link>
          </nav>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full text-xs">
                Sign In
              </Button>
            </Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="secondary" className="w-full text-xs gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Start 3-Day Free Trial</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
