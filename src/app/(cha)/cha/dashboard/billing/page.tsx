import React from 'react';
import Link from 'next/link';
import { getCurrentContext } from '@/lib/auth';
import { subscriptionRepo, walletRepo } from '@/lib/db';
import { PRICING_CATALOG } from '@/config/constants';
import { Check, ShieldCheck, Zap, Sparkles, ArrowRight, Building2, Layers, Key } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function ChaBillingPage() {
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
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Current Subscription</span>
            {isTrial && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                3-Day Trial Active
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold text-white capitalize">
            {sub?.planId?.replace(/_/g, ' ') || 'CHA Free Plan'}
          </h2>
          <p className="text-xs text-slate-400">
            Billing status: <span className="font-semibold text-emerald-400 capitalize">{sub?.status || 'active'}</span>
            {sub?.currentPeriodEnd && ` • Renews / expires: ${new Date(sub.currentPeriodEnd).toLocaleDateString()}`}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Quotation Credits</span>
            <span className="text-base font-bold text-white font-mono">{totalQuotes}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">PI Credits</span>
            <span className="text-base font-bold text-white font-mono">{totalPIs}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">AI Messages</span>
            <span className="text-base font-bold text-emerald-400 font-mono">
              {totalAi}
            </span>
          </div>
        </div>
      </div>

      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5" />
          <span>Official CHA Agent Subscription Matrix</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Customs House Agent Plans & Features</h1>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Specially designed for CHAs who manage multiple exporter clients, customs clearance jobs, and statutory documentation
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PRICING_CATALOG.chaPlans.slice(0, 3).map((plan) => {
          const isCurrent = activePlanId === plan.id;
          return (
            <div
              key={plan.id}
              className={`p-6 rounded-2xl bg-slate-900 border flex flex-col justify-between space-y-6 ${
                plan.popular
                  ? 'border-2 border-amber-500 shadow-xl shadow-amber-500/10 relative'
                  : 'border-slate-800'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-[10px] uppercase tracking-wider">
                  Recommended for CHAs
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{plan.tagline}</p>
                </div>

                <div>
                  <span className="text-3xl font-bold text-white font-mono">
                    ₹{((plan as any).monthlyPriceInr || 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-400"> / month</span>
                  <p className="text-[11px] text-emerald-400 font-medium mt-1">
                    Annual: ₹{((plan as any).annualPriceInr || 0).toLocaleString('en-IN')}/yr (2 months free)
                  </p>
                </div>

                <ul className="space-y-2 text-xs text-slate-300">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 pt-4">
                <Link href={`/checkout?plan=${plan.id}&interval=monthly`} className="block">
                  <Button className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2.5">
                    {isCurrent ? 'Current Plan (Renew / Extend)' : 'Choose Plan'}
                  </Button>
                </Link>
                <Link href={`/checkout?plan=${plan.id}&interval=annual`} className="block">
                  <Button variant="outline" className="w-full border-slate-700 text-slate-300 text-xs py-2 hover:bg-slate-800">
                    Switch to Annual (Save ₹{((((plan as any).monthlyPriceInr || 0) * 12) - ((plan as any).annualPriceInr || 0)).toLocaleString('en-IN')})
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* CHA Custom Plan Box */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-400 text-[11px] font-bold border border-purple-500/30">
            <Building2 className="w-3.5 h-3.5" />
            <span>High Volume Enterprise</span>
          </div>
          <h3 className="text-lg font-bold text-white">CHA Custom Plan — More Than 100 Exporter Clients</h3>
          <p className="text-xs text-slate-400 max-w-xl">
            Custom client limits, bespoke document quotas, custom API integration, white-label broker portal, and dedicated account manager.
          </p>
        </div>
        <Link href="/contact?subject=CHA+Custom+Plan+Inquiry">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shrink-0 gap-1.5">
            Contact Enterprise Sales
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* Add-ons table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white">CHA Add-on Features & Extra Capacity</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PRICING_CATALOG.addons.map((add) => (
            <div key={add.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-white">{add.name}</p>
                <p className="text-[11px] text-slate-500 capitalize">{add.billing}</p>
              </div>
              <span className="font-bold text-amber-400 font-mono">₹{add.priceInr}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
