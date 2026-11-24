import React from 'react';
import { Metadata } from 'next';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { PricingCardSection } from '@/components/pricing/PricingCardSection';
import { ShieldCheck, Zap, HelpCircle, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pricing & Credit Plans — ExportFlow by BENZWELL',
  description:
    'Transparent pricing for exporters. Choose from flexible pay-as-you-go lifetime credit packs or high-volume monthly/annual subscription plans with a 3-day free growth trial.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0B0F17] text-[#172033] dark:text-[#F1F5F9] flex flex-col transition-colors">
      <PublicHeader />

      <main className="flex-1 py-16 px-6 md:px-12 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <span>TRANSPARENT HYBRID PRICING FOR EXPORTERS</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-[#10243A] dark:text-white tracking-tight">
            Simple, Predictable Plans for Global Trade
          </h1>
          <p className="mt-4 text-sm md:text-base text-[#64748B] dark:text-slate-400 leading-relaxed">
            Choose pay-as-you-go credit packs with lifetime validity that never expire, or monthly/annual subscription plans for high-frequency documentation.
          </p>
        </div>

        {/* Pricing Cards Component */}
        <PricingCardSection />

        {/* Pricing FAQ Section */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-center text-[#10243A] dark:text-white mb-8">
            Frequently Asked Billing Questions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131B2A]">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                How does the 3-Day Free Trial work?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Every organization can activate the 3-day Growth trial with zero credit card required. You get 30 quotes, 20 PIs, 20 CIs, 20 packing lists, and AI tools for 72 hours. When it expires, you automatically revert to the Free plan without losing any data.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131B2A]">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                Do Pay-As-You-Go credit packs expire?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                No! Credit packs have lifetime validity. Your purchased document credits remain in your wallet indefinitely until you consume them.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131B2A]">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                Can I switch between monthly and annual plans?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Yes, you can upgrade, downgrade, or switch billing cycles at any time. Annual plans give you ~17% discount (2 months free).
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131B2A]">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                Do you provide GST tax invoices?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Yes. For all Indian businesses, a valid GST invoice with input tax credit eligibility is automatically generated and emailed after payment.
              </p>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
