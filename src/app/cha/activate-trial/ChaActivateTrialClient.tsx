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
  LogOut,
  Ship,
  FileCheck,
  Building2,
} from 'lucide-react';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { Button } from '@/components/ui/Button';

interface ChaActivateTrialClientProps {
  userName: string;
  userEmail: string;
  organizationName: string;
  licenseNumber: string;
}

const CHA_TRIAL_PLANS = [
  {
    id: 'cha_starter',
    name: 'CHA Starter',
    tagline: 'Best for independent customs brokers',
    features: [
      'Manage up to 5 exporter clients',
      '50 Quotations per month',
      '30 Proforma Invoices per month',
      '100 AI Assistant messages',
      'Standard document templates',
      'BoE & SB basic worksheets',
    ],
  },
  {
    id: 'cha_professional',
    name: 'CHA Professional',
    popular: true,
    tagline: 'Recommended for growing brokerage firms',
    features: [
      'Manage up to 25 exporter clients',
      '200 Quotations per month',
      '150 Proforma Invoices per month',
      '500 AI Assistant messages',
      'Customs query response assistant',
      'e-SANCHIT register & IRN tracking',
      'BoE & SB advanced worksheets',
      'Up to 5 team members with RBAC',
    ],
  },
  {
    id: 'cha_enterprise',
    name: 'CHA Enterprise',
    tagline: 'For large agencies and multi-branch brokers',
    features: [
      'Manage up to 100 exporter clients',
      '600 Quotations per month',
      '500 Proforma Invoices per month',
      '1,500 AI Assistant messages',
      'White-label branding options',
      'Customs broker API access',
      'Up to 15 team members',
      'Priority dedicated support',
    ],
  },
];

export function ChaActivateTrialClient({
  userName,
  userEmail,
  organizationName,
  licenseNumber,
}: ChaActivateTrialClientProps) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string>('cha_professional');
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
        throw new Error(data.error || 'Failed to activate CHA 3-day trial');
      }

      router.push('/cha/dashboard');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong activating your CHA trial.');
      setIsActivating(false);
    }
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
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
            <Ship className="w-3.5 h-3.5 text-indigo-400" />
            <span>CHA BROKERAGE: 3-DAY FREE TRIAL ACTIVATION</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Activate 3-Day CHA Trial to Access Workspace
          </h1>
          <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
            Manage multi-exporter documentation, BoE & SB worksheets, and customs clearance workflows free for 72 hours.
            <strong>Zero upfront payment or credit card required.</strong>
          </p>
        </div>

        {errorMsg && (
          <div className="max-w-md mx-auto p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CHA_TRIAL_PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;

            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`p-6 rounded-2xl bg-slate-900 border-2 cursor-pointer transition-all flex flex-col justify-between relative shadow-sm hover:shadow-md ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-xl'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider shadow-sm">
                    Recommended CHA Trial
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{plan.tagline}</p>
                  </div>

                  <div className="py-2 border-y border-slate-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-white">₹0</span>
                      <span className="text-xs text-slate-400 font-semibold">/ 3 days free</span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-bold block mt-0.5">
                      100% Free • No Card Required
                    </span>
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActivate(plan.id);
                    }}
                    disabled={isActivating}
                    className={`w-full text-xs font-bold py-2.5 shadow-sm ${
                      isSelected
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    {isActivating && selectedPlan === plan.id ? (
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        Activating CHA Trial...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1.5">
                        Start 3-Day CHA Trial
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Guarantees */}
        <div className="pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center gap-2.5 text-xs">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-slate-200">No Credit Card Required</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center gap-2.5 text-xs">
            <Zap className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="font-semibold text-slate-200">Instant Brokerage Access</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center gap-2.5 text-xs">
            <FileCheck className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="font-semibold text-slate-200">Full e-SANCHIT & Worksheets</span>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800 py-4 px-6 text-center text-xs text-slate-500">
        ExportFlow Customs Brokerage Edition &copy; {new Date().getFullYear()}.
      </footer>
    </div>
  );
}
