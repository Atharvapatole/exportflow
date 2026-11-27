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
  Ship,
  Sparkles,
  HelpCircle,
  Building2,
} from 'lucide-react';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { Button } from '@/components/ui/Button';
import { PRICING_CATALOG } from '@/config/constants';

interface ChaTrialExpiredClientProps {
  userName: string;
  userEmail: string;
  organizationName: string;
  licenseNumber: string;
}

export function ChaTrialExpiredClient({
  userName,
  userEmail,
  organizationName,
  licenseNumber,
}: ChaTrialExpiredClientProps) {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const handleChoosePlan = (planId: string) => {
    router.push(`/checkout?plan=${planId}&interval=${billingCycle}`);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/cha/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrandLogo theme="dark" showTagline={false} size="sm" />
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            CHA Workspace
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <span className="text-xs font-bold text-white block">{organizationName}</span>
            <span className="text-[11px] text-amber-400 font-mono block">License: {licenseNumber}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12 px-6 max-w-5xl mx-auto w-full space-y-8">
        {/* Banner */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>CHA BROKERAGE TRIAL COMPLETED — UPGRADE REQUIRED</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Your 3-Day CHA Trial Has Ended
          </h1>
          <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
            All your client records, import/export clearance jobs, BoE worksheets, and e-SANCHIT data are securely preserved.
            Select a CHA plan below to unlock your workspace and resume brokerage operations.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="flex items-center justify-center gap-3 pt-3">
            <span
              className={`text-xs font-semibold ${
                billingCycle === 'monthly' ? 'text-white' : 'text-slate-500'
              }`}
            >
              Monthly Billing
            </span>
            <button
              type="button"
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              aria-label="Toggle annual billing"
              className="w-12 h-6 bg-slate-800 rounded-full p-0.5 transition-colors relative cursor-pointer"
            >
              <div
                className={`w-5 h-5 bg-indigo-600 rounded-full transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold ${
                  billingCycle === 'annual' ? 'text-white' : 'text-slate-500'
                }`}
              >
                Annual Billing
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-700 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                2 Months Free
              </span>
            </div>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRICING_CATALOG.chaPlans.slice(0, 3).map((plan) => {
            const price = billingCycle === 'annual' ? (plan as any).annualPriceInr : (plan as any).monthlyPriceInr;
            const periodLabel = billingCycle === 'annual' ? '/ year' : '/ month';

            return (
              <div
                key={plan.id}
                className={`p-6 rounded-2xl bg-slate-900 border-2 flex flex-col justify-between relative shadow-sm hover:shadow-md transition-all ${
                  plan.popular
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-xl'
                    : 'border-slate-800'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider shadow-sm">
                    Recommended for CHAs
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{plan.tagline}</p>
                  </div>

                  <div className="py-2 border-y border-slate-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-white">
                        ₹{(price || 0).toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">{periodLabel}</span>
                    </div>
                    {billingCycle === 'annual' && plan.annualSavings && (
                      <span className="text-[11px] text-emerald-400 font-bold block mt-0.5">
                        {plan.annualSavings}
                      </span>
                    )}
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4">
                  <Button
                    onClick={() => handleChoosePlan(plan.id)}
                    className="w-full text-xs font-bold py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm gap-1.5"
                  >
                    <span>Choose Plan & Make Payment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Plan Box */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Need More Than 100 Exporter Clients?</p>
              <p className="text-[11px] text-slate-400">Custom quotas, bespoke API integrations, and dedicated SLA support.</p>
            </div>
          </div>

          <Link href="/contact?subject=CHA+Custom+Plan+Inquiry">
            <Button variant="outline" size="sm" className="text-xs font-semibold shrink-0 border-slate-700 text-slate-200 hover:bg-slate-800">
              Contact Sales
            </Button>
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Secure 256-bit encrypted Razorpay checkout</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-indigo-400" />
            <span>Instant CHA workspace unlocking upon payment</span>
          </span>
          <span className="flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-purple-400" />
            <span>GST tax invoice with input credit</span>
          </span>
        </div>
      </main>

      <footer className="border-t border-slate-800 py-4 px-6 text-center text-xs text-slate-500">
        ExportFlow Customs Brokerage Edition &copy; {new Date().getFullYear()}.
      </footer>
    </div>
  );
}
