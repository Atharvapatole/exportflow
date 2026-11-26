import React from 'react';
import { getCurrentContext } from '@/lib/auth';
import { Check, ShieldCheck, Zap, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function ChaBillingPage() {
  const ctx = await getCurrentContext();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5" />
          <span>Customs Brokerage Expansion Plans</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">CHA Workspace Plans & Add-on Packs</h1>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Scale your clearance operations with multi-station job tracking, team collaboration, and automated white-label exporter portals
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tier 1 */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Starter Broker</h3>
              <p className="text-xs text-slate-400 mt-1">For independent customs clearance agents</p>
            </div>

            <div>
              <span className="text-3xl font-bold text-white font-mono">₹1,999</span>
              <span className="text-xs text-slate-400"> / month</span>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Up to 25 Active Customs Jobs</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Single Customs Station Base</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>BoE & SB Calculation Worksheets</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>e-SANCHIT IRN Tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Transparent Signature & Stamp Studio</span>
              </li>
            </ul>
          </div>

          <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5">
            Choose Starter Plan
          </Button>
        </div>

        {/* Tier 2 (Highlighted) */}
        <div className="p-6 rounded-2xl bg-slate-900 border-2 border-amber-500 relative flex flex-col justify-between space-y-6 shadow-2xl shadow-amber-500/10">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-[10px] uppercase tracking-wider">
            Most Popular for CHAs
          </span>

          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Professional Forwarder</h3>
              <p className="text-xs text-slate-400 mt-1">For expanding customs brokerage firms</p>
            </div>

            <div>
              <span className="text-3xl font-bold text-white font-mono">₹4,999</span>
              <span className="text-xs text-slate-400"> / month</span>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span><strong>Unlimited</strong> Active Customs Jobs</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Multi-Port / ICD Station Coverage</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>5 Team Member Seats with RBAC</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>AI Cross-Document Discrepancy Checker</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Automated Exporter Email Workflows</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Priority Appraising Query Tracking</span>
              </li>
            </ul>
          </div>

          <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs py-2.5 border-0">
            Upgrade to Professional
          </Button>
        </div>

        {/* Tier 3 */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Enterprise Logistics</h3>
              <p className="text-xs text-slate-400 mt-1">National freight forwarders & 3PL networks</p>
            </div>

            <div>
              <span className="text-3xl font-bold text-white font-mono">₹9,999</span>
              <span className="text-xs text-slate-400"> / month</span>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Everything in Professional Plan</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Full White-Label Exporter Client Portal</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Custom Domain Mapping (portal.yourfirm.com)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Developer REST API Access & Webhooks</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>20 Team Member Seats</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Dedicated Compliance Account Manager</span>
              </li>
            </ul>
          </div>

          <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5">
            Contact Enterprise Sales
          </Button>
        </div>
      </div>

      {/* Add-on Packs */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">
          Operational Add-On Packs
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-white block">+5 Team Member Seats</span>
            <span className="font-mono text-amber-400 font-bold text-base">₹999 / mo</span>
            <p className="text-[11px] text-slate-400">Add extra field executive and clerk logins</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-white block">AI Document Inspector Pack</span>
            <span className="font-mono text-amber-400 font-bold text-base">₹1,499 / 500 checks</span>
            <p className="text-[11px] text-slate-400">High-volume automated cross-document audit</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-white block">Custom White-Label Domain</span>
            <span className="font-mono text-amber-400 font-bold text-base">₹2,499 / mo</span>
            <p className="text-[11px] text-slate-400">Host client portal on your own domain with SSL</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-white block">Developer API Bundle</span>
            <span className="font-mono text-amber-400 font-bold text-base">₹2,999 / mo</span>
            <p className="text-[11px] text-slate-400">100,000 API requests/month with webhooks</p>
          </div>
        </div>
      </div>
    </div>
  );
}
