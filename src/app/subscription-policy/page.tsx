import React from 'react';
import { Metadata } from 'next';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Subscription Policy — ExportFlow by BENZWELL',
  description: 'Subscription billing terms, credit mechanics, and plan structures on ExportFlow by BENZWELL.',
};

export default function SubscriptionPolicyPage() {
  return (
    <LegalPageLayout
      title="Subscription & Billing Policy"
      badge="BILLING SPECIFICATIONS"
      lastUpdated="November 24, 2026"
    >
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Dual Billing Architecture</h2>
        <p>
          ExportFlow offers a hybrid pricing model designed to cater to both intermittent seasonal exporters and high-volume commercial export houses:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Pay-As-You-Go Lifetime Credit Packs</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              One-time upfront purchase of document generation credits. Credits have <strong>lifetime validity</strong>, do not expire at the end of the month, and can be consumed on demand.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Recurring Monthly / Annual Subscriptions</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Fixed recurring allowance of quotations, proforma invoices, commercial invoices, and packing lists refreshed at every billing cycle, including advanced features (AI Copilot, multi-user).
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Plan Catalog & Allowances</h2>
        <p>Current official tiers supported on the platform:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Free Plan:</strong> ₹0/month. 1 Quotation and 1 PDF download per month. Basic templates.</li>
          <li><strong>Starter Subscription:</strong> ₹499/month (or ₹4,990/year). 10 Quotes, 5 PIs, 5 CIs, 5 Packing Lists per cycle.</li>
          <li><strong>Growth Subscription:</strong> ₹999/month (or ₹9,990/year). 30 Quotes, 20 PIs, 20 CIs, 20 Packing Lists per cycle, AI Document Assistant, 10 Export Calculators. Eligible for 3-Day Free Trial.</li>
          <li><strong>Business Subscription:</strong> ₹2,499/month (or ₹24,990/year). 100 Quotes, 75 PIs, 75 CIs, 75 Packing Lists per cycle, team multi-user seats, shipment tracker, priority AI.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Annual Billing Discount</h2>
        <p>
          Choosing an annual subscription provides a significant discount equivalent to 2 months free (~17% savings). Annual plans are billed as a single lump-sum upfront payment for 12 continuous months of service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">4. Credit Priority & Wallet Consumption</h2>
        <p>
          When you generate a document, ExportFlow automatically deducts allowance from your active monthly subscription first. If your monthly subscription allowance is exhausted, the system seamlessly draws from any available lifetime credit packs in your wallet.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">5. Taxes & GST Invoices</h2>
        <p>
          Payments processed in India are subject to statutory Goods and Services Tax (GST) at the prevailing rate (18% for SaaS IT services). Indian registered businesses can provide their GSTIN during checkout or in company settings to receive an automated B2B GST tax invoice eligible for Input Tax Credit (ITC).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">6. Inquiries & Custom Enterprise Tiers</h2>
        <p>
          For export houses generating more than 500 documents per month or requiring custom API and ERP integrations, please contact our enterprise team at <a href="mailto:info@benzwell.in" className="text-blue-600 dark:text-blue-400 underline">info@benzwell.in</a>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
