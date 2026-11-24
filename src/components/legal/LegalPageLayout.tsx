'use client';

import React from 'react';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { ShieldCheck, Mail, ArrowLeft } from 'lucide-react';

interface LegalPageLayoutProps {
  title: string;
  badge?: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalPageLayout({
  title,
  badge = 'LEGAL & COMPLIANCE',
  lastUpdated,
  children,
}: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0B0F17] text-[#172033] dark:text-[#F1F5F9] flex flex-col transition-colors">
      <PublicHeader />

      <main className="flex-1 py-12 md:py-16 px-6 md:px-12 max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline mb-4 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[11px] font-bold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{badge}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-[#10243A] dark:text-white tracking-tight">
            {title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
            <span>Last Updated: {lastUpdated}</span>
            <span>•</span>
            <span>Entity: BENZWELL Technologies</span>
            <span>•</span>
            <a href="mailto:info@benzwell.in" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" />
              <span>info@benzwell.in</span>
            </a>
          </div>
        </div>

        {/* Content Box */}
        <div className="bg-white dark:bg-[#131B2A] rounded-2xl border border-slate-200 dark:border-slate-800 p-8 md:p-10 shadow-sm space-y-8 text-sm text-slate-700 dark:text-slate-300 leading-relaxed transition-colors prose-headings:font-bold prose-headings:text-[#10243A] dark:prose-headings:text-white">
          {children}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
