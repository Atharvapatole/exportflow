'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Clock, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface TrialStatusData {
  subscription: {
    planId: string;
    status: string;
    hasUsedTrial: boolean;
    trialEndDate?: string;
  };
  trial: {
    isTrialActive: boolean;
    remainingMs: number;
    remainingHours: number;
    trialEndDate?: string;
    hasUsedTrial: boolean;
  };
}

export function TrialBanner() {
  const [data, setData] = useState<TrialStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActivating, setIsActivating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/trial/status');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error('Failed to load trial status', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleActivate = async () => {
    setIsActivating(true);
    setMessage(null);
    try {
      const res = await fetch('/api/trial/activate', { method: 'POST' });
      const json = await res.json();
      if (res.ok) {
        setMessage('3-Day Free Trial activated successfully! Enjoy full access.');
        await fetchStatus();
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } else {
        setMessage(json.error || 'Failed to activate trial.');
      }
    } catch {
      setMessage('Failed to activate trial. Please try again.');
    } finally {
      setIsActivating(false);
    }
  };

  if (loading || !data) return null;

  const { subscription, trial } = data;

  // 1. Trial is currently Active
  if (trial.isTrialActive) {
    const hours = Math.floor(trial.remainingHours);
    const minutes = Math.floor((trial.remainingMs % (1000 * 60 * 60)) / (1000 * 60));

    return (
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>ExportFlow 3-Day Free Trial Active</span>
            </div>
            <h3 className="text-lg font-bold tracking-tight">Full Professional Tier Unlocked</h3>
            <p className="text-xs text-blue-100 max-w-xl">
              You have access to 50 Quotations, 30 PIs, 200 AI Assistant Messages, AI Document Checking & Full CRM.
              No payment is collected at expiry; choose a plan anytime to continue.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 text-center">
              <div className="flex items-center justify-center gap-1.5 text-amber-300 font-mono text-sm font-black">
                <Clock className="w-4 h-4" />
                <span>
                  {hours}h {minutes}m
                </span>
              </div>
              <span className="text-[10px] text-blue-200 uppercase font-semibold tracking-wider block mt-0.5">
                Time Remaining
              </span>
            </div>
            <Link href="/pricing">
              <Button size="sm" className="bg-white text-blue-900 hover:bg-blue-50 font-bold border-none shadow-sm">
                View Plans
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. User has NOT used their 3-day trial yet
  if (!trial.hasUsedTrial) {
    return (
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>3-Day Free Trial Offer</span>
            </div>
            <h3 className="text-lg font-bold tracking-tight">
              Start Your 3-Day Free Trial (₹0)
            </h3>
            <p className="text-xs text-slate-300 max-w-xl">
              Try all Professional features free for 3 days: 50 Quotations, 30 Proforma Invoices, 200 AI Assistant messages, advanced templates, and AI document checking. No credit card required.
            </p>
            {message && (
              <p className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={handleActivate}
              isLoading={isActivating}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold shadow-md gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Activate 3-Day Free Trial</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 3. User is on Free plan (trial already completed)
  if (subscription.planId === 'free') {
    return (
      <div className="bg-white dark:bg-[#131B2A] border border-[#E5EAF1] dark:border-[#243047] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-2.5 text-[#64748B] dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            You are on the <strong className="text-[#172033] dark:text-white">Free Plan</strong> (1 Quote & 1 PDF/mo). Need higher volume? Top up with pay-as-you-go credit packs or activate a subscription.
          </span>
        </div>
        <Link href="/pricing" className="shrink-0">
          <Button size="sm" variant="outline" className="text-xs">
            Upgrade / Add Credits
          </Button>
        </Link>
      </div>
    );
  }

  return null;
}
