import React from 'react';
import Link from 'next/link';
import { getCurrentContext } from '@/lib/auth';
import { subscriptionRepo, walletRepo } from '@/lib/db';
import { PRICING_CATALOG } from '@/config/constants';
import { Check, ShieldCheck, Zap, Sparkles, ArrowRight, Layers, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function ExporterBillingPage() {
  const ctx = await getCurrentContext();
  const orgId = ctx?.organization?.id;
  const [sub, wallet] = await Promise.all([
    orgId ? subscriptionRepo.findByOrg(orgId) : null,
    orgId ? walletRepo.getOrCreateWallet(orgId) : null,
  ]);

  const activePlanId = sub?.planId || 'free';
  const isTrial = sub?.status === 'trial';

  const totalQuotes = (wallet?.subscriptionCredits?.quotations ?? 0) + (wallet?.lifetimeCredits?.quotations ?? 0);
  const totalPIs = (wallet?.subscriptionCredits?.proformaInvoices ?? 0) + (wallet?.lifetimeCredits?.proformaInvoices ?? 0);
  const totalAi = (wallet?.subscriptionCredits?.aiMessages ?? 0) + (wallet?.lifetimeCredits?.aiMessages ?? 0);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Current Active Plan Status Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Current Subscription</span>
            {isTrial && (
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/40 text-[10px] font-bold">
                3-Day Trial Active
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
            {sub?.planId?.replace(/_/g, ' ') || 'Free Plan'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Billing status: <span className="font-semibold text-emerald-600 dark:text-emerald-400 capitalize">{sub?.status || 'active'}</span>
            {sub?.currentPeriodEnd && ` • Renews / expires: ${new Date(sub.currentPeriodEnd).toLocaleDateString()}`}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Quotation Credits</span>
            <span className="text-base font-bold text-slate-900 dark:text-white font-mono">{totalQuotes}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">PI Credits</span>
            <span className="text-base font-bold text-slate-900 dark:text-white font-mono">{totalPIs}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">AI Messages</span>
            <span className="text-base font-bold text-blue-600 dark:text-blue-400 font-mono">
              {totalAi}
            </span>
          </div>
        </div>
      </div>

      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5" />
          <span>Exporter Subscription Plans</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Upgrade or Manage Your Plan</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          Choose a monthly plan, annual discounted subscription, or top up with one-time credit packs
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PRICING_CATALOG.exporterPlans.map((plan) => {
          const isCurrent = activePlanId === plan.id;
          return (
            <div
              key={plan.id}
              className={`p-6 rounded-2xl bg-white dark:bg-[#131B2A] border flex flex-col justify-between space-y-6 ${
                plan.popular
                  ? 'border-2 border-blue-600 dark:border-blue-500 shadow-xl shadow-blue-500/10 relative'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider">
                  Most Popular
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{plan.tagline}</p>
                </div>

                <div>
                  <span className="text-3xl font-bold text-slate-900 dark:text-white font-mono">
                    ₹{plan.monthlyPriceInr.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400"> / month</span>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                    Annual: ₹{plan.annualPriceInr.toLocaleString('en-IN')}/yr (2 months free)
                  </p>
                </div>

                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 pt-4">
                <Link href={`/checkout?plan=${plan.id}&interval=monthly`} className="block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5">
                    {isCurrent ? 'Current Plan (Extend / Renew)' : 'Choose Monthly Plan'}
                  </Button>
                </Link>
                <Link href={`/checkout?plan=${plan.id}&interval=annual`} className="block">
                  <Button variant="outline" className="w-full border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs py-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                    Switch to Annual (Save ₹{((plan.monthlyPriceInr * 12) - plan.annualPriceInr).toLocaleString('en-IN')})
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pay-as-you-go link */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800">
            <Layers className="w-3.5 h-3.5" />
            <span>Prepaid Credits</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Need one-time document credits instead?</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
            Purchase flexible Mini, Business, Growth, or Enterprise credit packs that never expire.
          </p>
        </div>
        <Link href="/pricing">
          <Button className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shrink-0 gap-1.5">
            View All Credit Packs
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
