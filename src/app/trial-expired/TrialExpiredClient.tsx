'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  Check,
  Shield,
  Zap,
  ArrowRight,
  LogOut,
  Layers,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { Button } from '@/components/ui/Button';
import { PRICING_CATALOG } from '@/config/constants';

interface TrialExpiredClientProps {
  userName: string;
  userEmail: string;
  organizationName: string;
}

export function TrialExpiredClient({
  userName,
  userEmail,
  organizationName,
}: TrialExpiredClientProps) {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const handleChoosePlan = (planId: string) => {
    router.push(`/checkout?plan=${planId}&interval=${billingCycle}`);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#070C14] text-[#172033] dark:text-slate-100 flex flex-col justify-between">
      {/* Top Header */}
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>3-DAY TRIAL COMPLETED — UPGRADE REQUIRED</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Your 3-Day Free Trial Has Ended
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Your company profile, quotations, buyer directory, and settings are safely preserved.
            To unlock your dashboard and continue generating export documents, choose a plan below and complete payment.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="flex items-center justify-center gap-3 pt-3">
            <span
              className={`text-xs font-semibold ${
                billingCycle === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-500'
              }`}
            >
              Monthly Billing
            </span>
            <button
              type="button"
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              aria-label="Toggle annual billing"
              className="w-12 h-6 bg-slate-300 dark:bg-slate-700 rounded-full p-0.5 transition-colors relative cursor-pointer"
            >
              <div
                className={`w-5 h-5 bg-blue-600 rounded-full transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold ${
                  billingCycle === 'annual' ? 'text-slate-900 dark:text-white' : 'text-slate-500'
                }`}
              >
                Annual Billing
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                2 Months Free
              </span>
            </div>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRICING_CATALOG.exporterPlans.map((plan) => {
            const price = billingCycle === 'annual' ? plan.annualPriceInr : plan.monthlyPriceInr;
            const periodLabel = billingCycle === 'annual' ? '/ year' : '/ month';

            return (
              <div
                key={plan.id}
                className={`p-6 rounded-2xl bg-white dark:bg-[#111827] border-2 flex flex-col justify-between relative shadow-sm hover:shadow-md transition-all ${
                  plan.popular
                    ? 'border-blue-600 dark:border-blue-500 ring-2 ring-blue-500/20 shadow-xl'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider shadow-sm">
                    Most Popular
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{plan.tagline}</p>
                  </div>

                  <div className="py-2 border-y border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900 dark:text-white">
                        ₹{price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">{periodLabel}</span>
                    </div>
                    {billingCycle === 'annual' && plan.annualSavings && (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
                        {plan.annualSavings}
                      </span>
                    )}
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
                    onClick={() => handleChoosePlan(plan.id)}
                    className="w-full text-xs font-bold py-2.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm gap-1.5"
                  >
                    <span>Choose Plan & Make Payment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Alternative: Pay as you go */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Prefer Pay-As-You-Go Credits Instead?</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Buy one-time credit packs with 12 months validity starting from ₹199.</p>
            </div>
          </div>

          <Link href="/pricing">
            <Button variant="outline" size="sm" className="text-xs font-semibold shrink-0">
              View Credit Packs
            </Button>
          </Link>
        </div>

        {/* Security badges */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Secure 256-bit encrypted Razorpay checkout</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-blue-500" />
            <span>Instant workspace unlocking upon payment</span>
          </span>
          <span className="flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-purple-500" />
            <span>GST tax invoice included automatically</span>
          </span>
        </div>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-400">
        ExportFlow by BENZWELL &copy; {new Date().getFullYear()}. All rights reserved.
      </footer>
    </div>
  );
}
