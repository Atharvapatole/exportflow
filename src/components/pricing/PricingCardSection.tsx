'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Check,
  Sparkles,
  Shield,
  Zap,
  ArrowRight,
  Layers,
  HelpCircle,
  Building2,
  Ship,
  Briefcase,
  Headphones,
  CheckCircle2,
} from 'lucide-react';
import { PRICING_CATALOG } from '@/config/constants';
import { Button } from '@/components/ui/Button';

export function PricingCardSection() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [activeTab, setActiveTab] = useState<'exporter' | 'cha' | 'packs'>('exporter');
  const [activatingTrial, setActivatingTrial] = useState(false);

  const handleClaimTrial = async (targetType: 'exporter' | 'cha') => {
    try {
      setActivatingTrial(true);
      const res = await fetch('/api/trial/activate', { method: 'POST' });
      const data = await res.json();
      if (res.status === 401) {
        router.push(targetType === 'cha' ? '/cha/register?trial=3days' : '/register?trial=3days');
        return;
      }
      if (res.ok) {
        alert(
          targetType === 'cha'
            ? 'Congratulations! Your 3-Day CHA Professional Trial has been activated.'
            : 'Congratulations! Your 3-Day Exporter Professional Trial has been activated.'
        );
        router.push(targetType === 'cha' ? '/cha/dashboard' : '/dashboard');
        router.refresh();
      } else {
        alert(data.error || 'Trial activation failed. If you already used your trial, please choose a plan.');
      }
    } catch {
      router.push(targetType === 'cha' ? '/cha/register?trial=3days' : '/register?trial=3days');
    } finally {
      setActivatingTrial(false);
    }
  };

  const handleChoosePlan = (planId: string) => {
    router.push(`/checkout?plan=${planId}&interval=${billingCycle}`);
  };

  const handleChoosePack = (packId: string) => {
    router.push(`/checkout?pack=${packId}`);
  };

  return (
    <div className="w-full space-y-12">
      {/* Category Tabs: Exporter vs CHA Agent vs Pay-As-You-Go */}
      <div className="flex flex-col items-center justify-center gap-6">
        <div className="inline-flex p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('exporter')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'exporter'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Exporter Plans
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cha')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'cha'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Ship className="w-4 h-4" />
            CHA Agent Plans
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('packs')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'packs'
                ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            Pay-As-You-Go Packs
          </button>
        </div>

        {/* Monthly vs Annual Toggle (Only for Exporter & CHA subscription tabs) */}
        {activeTab !== 'packs' && (
          <div className="flex items-center gap-3">
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
        )}
      </div>

      {/* 1. EXPORTER PLANS TAB */}
      {activeTab === 'exporter' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Free Trial Card */}
          <div className="bg-white dark:bg-[#131B2A] rounded-2xl border-2 border-blue-400 dark:border-blue-700 p-6 flex flex-col justify-between shadow-md relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider shadow-sm">
              3 Days Free Access
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[11px] font-bold mb-3 mt-2">
                <span>Free Trial</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Free Trial</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Try all Professional Plan features free for 3 days. No credit card required.
              </p>
              <div className="mt-4 mb-6">
                <span className="text-3xl font-black text-slate-900 dark:text-white">₹0</span>
                <span className="text-xs text-slate-500 ml-1">/ 3 days</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Access to Professional features</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Generate quotations & PIs</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Access to AI Assistant</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Explore document templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Test document management</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 space-y-2">
              <Button
                className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold"
                onClick={() => handleClaimTrial('exporter')}
                disabled={activatingTrial}
              >
                1: Claim 3 Days Free Trial
              </Button>
            </div>
          </div>

          {/* Exporter Starter, Professional, Business */}
          {PRICING_CATALOG.exporterPlans.map((plan) => {
            const price = billingCycle === 'annual' ? plan.annualPriceInr : plan.monthlyPriceInr;
            const periodLabel = billingCycle === 'annual' ? '/ year' : '/ month';

            return (
              <div
                key={plan.id}
                className={`bg-white dark:bg-[#131B2A] rounded-2xl border p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative ${
                  plan.popular
                    ? 'border-2 border-blue-600 dark:border-blue-500 shadow-lg'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                    Most Popular
                  </div>
                )}
                <div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold mb-3">
                    <span>{plan.name}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{plan.tagline}</p>
                  <div className="mt-4 mb-2">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">
                      ₹{price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">{periodLabel}</span>
                  </div>
                  {billingCycle === 'annual' && plan.annualSavings && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mb-4">
                      {plan.annualSavings}
                    </p>
                  )}
                  {billingCycle === 'monthly' && <div className="mb-4" />}
                  <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full text-xs font-semibold border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                    onClick={() => handleClaimTrial('exporter')}
                    disabled={activatingTrial}
                  >
                    1: Claim 3 Days Free Trial
                  </Button>
                  <Button
                    className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    onClick={() => handleChoosePlan(plan.id)}
                  >
                    2: Choose Plan
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. CHA AGENT SPECIAL PLANS TAB */}
      {activeTab === 'cha' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* CHA Free Trial Card */}
          <div className="bg-white dark:bg-[#131B2A] rounded-2xl border-2 border-indigo-400 dark:border-indigo-700 p-6 flex flex-col justify-between shadow-md relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider shadow-sm">
              CHA 3 Days Free
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold mb-3 mt-2">
                <span>Customs Broker Trial</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">CHA Free Trial</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Full CHA Professional features free for 3 days. Manage up to 25 exporter clients.
              </p>
              <div className="mt-4 mb-6">
                <span className="text-3xl font-black text-slate-900 dark:text-white">₹0</span>
                <span className="text-xs text-slate-500 ml-1">/ 3 days</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Up to 25 Exporter Clients</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>200 Quotations + 150 PIs</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>500 AI Customs Assistant messages</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>BoE & SB Worksheets + e-SANCHIT</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Customs Query response builder</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 space-y-2">
              <Button
                className="w-full text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                onClick={() => handleClaimTrial('cha')}
                disabled={activatingTrial}
              >
                1: Claim 3 Days Free Trial
              </Button>
            </div>
          </div>

          {/* CHA Starter, Professional, Enterprise */}
          {PRICING_CATALOG.chaPlans.slice(0, 3).map((plan) => {
            const price = (billingCycle === 'annual' ? (plan as any).annualPriceInr : (plan as any).monthlyPriceInr) || 0;
            const periodLabel = billingCycle === 'annual' ? '/ year' : '/ month';

            return (
              <div
                key={plan.id}
                className={`bg-white dark:bg-[#131B2A] rounded-2xl border p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative ${
                  plan.popular
                    ? 'border-2 border-indigo-600 dark:border-indigo-500 shadow-lg'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                    Recommended for CHAs
                  </div>
                )}
                <div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold mb-3">
                    <span>{plan.name}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{plan.tagline}</p>
                  <div className="mt-4 mb-2">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">
                      ₹{price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">{periodLabel}</span>
                  </div>
                  {billingCycle === 'annual' && plan.annualSavings && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mb-4">
                      {plan.annualSavings}
                    </p>
                  )}
                  {billingCycle === 'monthly' && <div className="mb-4" />}
                  <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full text-xs font-semibold border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                    onClick={() => handleClaimTrial('cha')}
                    disabled={activatingTrial}
                  >
                    1: Claim 3 Days Free Trial
                  </Button>
                  <Button
                    className="w-full text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                    onClick={() => handleChoosePlan(plan.id)}
                  >
                    2: Choose Plan
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. PAY-AS-YOU-GO PACKS TAB */}
      {activeTab === 'packs' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {PRICING_CATALOG.creditPacks.map((pack) => (
            <div
              key={pack.id}
              className={`bg-white dark:bg-[#131B2A] rounded-2xl border p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative ${
                pack.popular
                  ? 'border-2 border-blue-500 shadow-lg'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {pack.popular && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                  Popular Value
                </div>
              )}
              <div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold mb-3">
                  <span>12 Months Validity</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{pack.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">One-time prepaid credit pack</p>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    ₹{pack.priceInr.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">one-time</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  {pack.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                  <li className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold">
                    <Shield className="w-4 h-4 shrink-0" />
                    <span>Unused credits roll over with top-up</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <Button
                  className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  onClick={() => handleChoosePack(pack.id)}
                >
                  Choose Plan
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. ADDITIONAL PAID FEATURES / ADD-ONS TABLE */}
      <div className="mt-16 max-w-5xl mx-auto p-6 md:p-8 rounded-2xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Additional Paid Features & Add-ons</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Customize your plan with specialized capabilities and capacity</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Available on all active plans
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRICING_CATALOG.addons.map((add) => (
            <div
              key={add.id}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-3 text-xs"
            >
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{add.name}</p>
                <p className="text-[11px] text-slate-500 capitalize">{add.billing} billing</p>
              </div>
              <span className="font-bold text-blue-600 dark:text-blue-400 text-sm shrink-0">
                ₹{add.priceInr.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. IMPORTANT CREDIT RULES SECTION */}
      <div className="mt-12 max-w-5xl mx-auto p-6 md:p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-blue-600" />
          Important Credit & Consumption Rules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
          {PRICING_CATALOG.creditRules.map((rule, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="font-bold text-blue-600 dark:text-blue-400 text-[11px] shrink-0 mt-0.5">•</span>
              <span>{rule}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trust & Compliance Footnote */}
      <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400 max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4">
        <span className="flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span>Secure Razorpay 256-bit encrypted checkout</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-blue-500" />
          <span>Instant credit allocation & activation</span>
        </span>
        <span className="flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-purple-500" />
          <span>GST tax invoice provided automatically</span>
        </span>
      </div>
    </div>
  );
}
