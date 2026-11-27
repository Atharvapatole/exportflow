'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Check,
  Shield,
  Zap,
  ArrowRight,
  Clock,
  Lock,
  LogOut,
  Building2,
  FileCheck,
} from 'lucide-react';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { Button } from '@/components/ui/Button';

interface ActivateTrialClientProps {
  userName: string;
  userEmail: string;
  organizationName: string;
}

const TRIAL_PLANS = [
  {
    id: 'starter',
    name: 'Starter Plan',
    tagline: 'Best for small exporters starting out',
    features: [
      '15 Quotations per month',
      '10 Proforma Invoices per month',
      '50 AI Assistant messages',
      'Standard & premium templates',
      'Custom company logo',
      'PDF downloads',
    ],
  },
  {
    id: 'professional',
    name: 'Professional Plan',
    popular: true,
    tagline: 'Most popular for regular exporters',
    features: [
      '50 Quotations per month',
      '30 Proforma Invoices per month',
      '200 AI Assistant messages',
      'AI-powered document checking',
      'Document history & audit logs',
      'Priority email support',
    ],
  },
  {
    id: 'business',
    name: 'Business Plan',
    tagline: 'For high-volume export businesses',
    features: [
      '150 Quotations per month',
      '100 Proforma Invoices per month',
      '600 AI Assistant messages',
      'Advanced AI document checking',
      'Developer API access',
      'Up to 5 team members',
    ],
  },
];

export function ActivateTrialClient({
  userName,
  userEmail,
  organizationName,
}: ActivateTrialClientProps) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string>('professional');
  const [isActivating, setIsActivating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleActivate = async (planIdToActivate?: string) => {
    const plan = planIdToActivate || selectedPlan;
    setIsActivating(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/trial/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to activate 3-day trial');
      }

      // Success: forward to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong activating your trial.');
      setIsActivating(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#070C14] text-[#172033] dark:text-slate-100 flex flex-col justify-between">
      {/* Top Navigation */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1524] px-6 py-4 flex items-center justify-between">
        <BrandLogo showTagline={false} size="sm" />

        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">{organizationName}</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{userEmail}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 py-12 px-6 max-w-5xl mx-auto w-full space-y-8">
        {/* Banner */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold">
            <Clock className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>STEP 1: ACTIVATE YOUR 3-DAY FREE TRIAL</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Activate 3-Day Free Trial to Access Dashboard
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Every exporter gets full, unrestricted access to ExportFlow for 72 hours.
            Choose which plan features you want to test drive. <strong>No credit card or payment required.</strong>
          </p>
        </div>

        {errorMsg && (
          <div className="max-w-md mx-auto p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TRIAL_PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;

            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`p-6 rounded-2xl bg-white dark:bg-[#111827] border-2 cursor-pointer transition-all flex flex-col justify-between relative shadow-sm hover:shadow-md ${
                  isSelected
                    ? 'border-blue-600 dark:border-blue-500 ring-2 ring-blue-500/20 shadow-lg'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider shadow-sm">
                    Recommended Trial
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{plan.tagline}</p>
                  </div>

                  <div className="py-2 border-y border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900 dark:text-white">₹0</span>
                      <span className="text-xs text-slate-500 font-semibold">/ 3 days free</span>
                    </div>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
                      100% Free • No Payment Required
                    </span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActivate(plan.id);
                    }}
                    disabled={isActivating}
                    className={`w-full text-xs font-bold py-2.5 shadow-sm ${
                      isSelected
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white'
                    }`}
                  >
                    {isActivating && selectedPlan === plan.id ? (
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        Activating Trial...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1.5">
                        Start 3-Day Free Trial
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Guarantees Footnote */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2.5 text-xs">
            <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">No Credit Card Required</span>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2.5 text-xs">
            <Zap className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">Instant Workspace Access</span>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2.5 text-xs">
            <FileCheck className="w-4 h-4 text-purple-500 shrink-0" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">Full Vector PDF Exports</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-400">
        ExportFlow by BENZWELL &copy; {new Date().getFullYear()}. All rights reserved.
      </footer>
    </div>
  );
}
