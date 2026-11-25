'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Sparkles, Shield, Zap, ArrowRight, Layers, HelpCircle } from 'lucide-react';
import { PRICING_CATALOG } from '@/config/constants';
import { Button } from '@/components/ui/Button';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function PricingCardSection() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'packs'>('subscriptions');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleClaimTrial = async () => {
    try {
      const res = await fetch('/api/trial/activate', { method: 'POST' });
      const data = await res.json();
      if (res.status === 401) {
        router.push('/register?trial=3days');
        return;
      }
      if (res.ok) {
        alert('Congratulations! Your 3-Day Free Growth Trial has been activated.');
        router.push('/dashboard');
        router.refresh();
      } else {
        alert(data.error || 'Trial activation failed. If you already used your trial, please choose a plan.');
      }
    } catch {
      router.push('/register?trial=3days');
    }
  };

  const handleChoosePlan = (planId: string) => {
    router.push(`/checkout?plan=${planId}&interval=${billingCycle}`);
  };

  const handleChoosePack = (packId: string) => {
    router.push(`/checkout?pack=${packId}`);
  };

  return (
    <div className="w-full">
      {errorMsg && (
        <div className="max-w-md mx-auto mb-8 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 text-center font-medium">
          {errorMsg}
        </div>
      )}

      {/* Tabs: Subscriptions vs Credit Packs */}
      <div className="flex flex-col items-center justify-center gap-6 mb-12">
        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('subscriptions')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'subscriptions'
                ? 'bg-white dark:bg-[#10243A] text-[#172033] dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Monthly & Annual Subscriptions
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('packs')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'packs'
                ? 'bg-white dark:bg-[#10243A] text-[#172033] dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Pay-As-You-Go Packs (Never Expire)
          </button>
        </div>

        {/* Monthly vs Annual Toggle (Only for Subscriptions) */}
        {activeTab === 'subscriptions' && (
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
              className="w-12 h-6 bg-slate-300 dark:bg-slate-700 rounded-full p-0.5 transition-colors relative"
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
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                2 Months Free (~17% Off)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Subscriptions Grid */}
      {activeTab === 'subscriptions' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Free Forever Plan */}
          <div className="bg-white dark:bg-[#131B2A] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow">
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold mb-3">
                <span>Free Forever</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Free Plan</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                For solo exporters starting out or trying the platform.
              </p>
              <div className="mt-4 mb-6">
                <span className="text-3xl font-black text-slate-900 dark:text-white">₹0</span>
                <span className="text-xs text-slate-500 ml-1">/ month</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>1 Quotation per month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>1 PDF Download / month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Buyer Management (Up to 3)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Standard Corporate Template</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 space-y-2">
              <Button
                variant="outline"
                className="w-full text-xs border-blue-500/30 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                onClick={handleClaimTrial}
              >
                Claim 3 Days Free Trial
              </Button>
              <Link href="/register" className="block w-full">
                <Button variant="secondary" className="w-full text-xs">
                  Choose Plan
                </Button>
              </Link>
            </div>
          </div>

          {/* Starter Subscription */}
          <div className="bg-white dark:bg-[#131B2A] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow">
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[11px] font-bold mb-3">
                <span>Active Exporter</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Starter</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                For emerging merchant exporters issuing regular quotes.
              </p>
              <div className="mt-4 mb-6">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  ₹{billingCycle === 'annual' ? '4,990' : '499'}
                </span>
                <span className="text-xs text-slate-500 ml-1">
                  / {billingCycle === 'annual' ? 'year' : 'month'}
                </span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span><strong>10 Quotations</strong> per cycle</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span><strong>5 Proforma Invoices</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span><strong>5 Commercial Invoices</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span><strong>5 Packing Lists</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>All 5 Vector PDF Templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Buyer CRM & Product Catalog</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 space-y-2">
              <Button
                variant="outline"
                className="w-full text-xs border-blue-500/30 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                onClick={handleClaimTrial}
              >
                Claim 3 Days Free Trial
              </Button>
              <Button
                className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold"
                onClick={() => handleChoosePlan('starter')}
              >
                Choose Plan
              </Button>
            </div>
          </div>

          {/* Growth Plan (Popular + 3-Day Free Trial) */}
          <div className="bg-gradient-to-b from-[#0F2035] to-[#132A46] text-white rounded-2xl border-2 border-blue-500 p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-500 to-indigo-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
              Most Popular • 3-Day Trial
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[11px] font-bold mb-3 border border-blue-400/30">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Growth Tier</span>
              </div>
              <h3 className="text-xl font-bold text-white">Growth</h3>
              <p className="text-xs text-blue-200 mt-1">
                For established export businesses scaling international shipments.
              </p>
              <div className="mt-4 mb-6">
                <span className="text-3xl font-black text-white">
                  ₹{billingCycle === 'annual' ? '9,990' : '999'}
                </span>
                <span className="text-xs text-blue-300 ml-1">
                  / {billingCycle === 'annual' ? 'year' : 'month'}
                </span>
              </div>
              <ul className="space-y-2.5 text-xs text-blue-100">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>30 Quotations</strong> per cycle</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>20 Proforma Invoices</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>20 Commercial Invoices</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>20 Packing Lists</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>AI Document Assistant</strong> (OpenRouter)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>10 Smart Export Calculators</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Revision Snapshots & Audit Trail</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 space-y-2">
              <Button
                variant="outline"
                className="w-full text-xs border-blue-400/40 text-blue-200 hover:bg-blue-900/40"
                onClick={handleClaimTrial}
              >
                Claim 3 Days Free Trial
              </Button>
              <Button
                className="w-full text-xs bg-blue-500 hover:bg-blue-600 text-white font-bold shadow-md"
                onClick={() => handleChoosePlan('growth')}
              >
                Choose Plan
              </Button>
            </div>
          </div>

          {/* Business Subscription */}
          <div className="bg-white dark:bg-[#131B2A] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow">
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[11px] font-bold mb-3">
                <span>Export House</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Business</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                For manufacturing exporters & multi-member trading houses.
              </p>
              <div className="mt-4 mb-6">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  ₹{billingCycle === 'annual' ? '24,990' : '2,499'}
                </span>
                <span className="text-xs text-slate-500 ml-1">
                  / {billingCycle === 'annual' ? 'year' : 'month'}
                </span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span><strong>100 Quotations</strong> per cycle</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span><strong>75 Proforma Invoices</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span><strong>75 Commercial Invoices</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span><strong>75 Packing Lists</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Multi-User Team Collaboration</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Shipment & Vessel Tracking Hub</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Priority AI & Dedicated Support</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 space-y-2">
              <Button
                variant="outline"
                className="w-full text-xs border-blue-500/30 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                onClick={handleClaimTrial}
              >
                Claim 3 Days Free Trial
              </Button>
              <Button
                className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold"
                onClick={() => handleChoosePlan('business')}
              >
                Choose Plan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Pay-As-You-Go Credit Packs Grid */}
      {activeTab === 'packs' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PRICING_CATALOG.creditPacks.map((pack) => (
            <div
              key={pack.id}
              className={`bg-white dark:bg-[#131B2A] rounded-2xl border p-6 flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow relative ${
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
                  <span>Lifetime Validity</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{pack.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{pack.description}</p>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    ₹{pack.priceInr.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">one-time payment</span>
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
                    <span>Credits never expire</span>
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

      {/* Trust & Compliance Footnote */}
      <div className="mt-12 text-center text-xs text-slate-500 dark:text-slate-400 max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4">
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
          <span>GST invoice provided for business credit</span>
        </span>
      </div>
    </div>
  );
}
