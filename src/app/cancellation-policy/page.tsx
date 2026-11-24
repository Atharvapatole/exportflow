import React from 'react';
import { Metadata } from 'next';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Cancellation Policy — ExportFlow by BENZWELL',
  description: 'Cancellation policy for subscription plans and accounts on ExportFlow by BENZWELL.',
};

export default function CancellationPolicyPage() {
  return (
    <LegalPageLayout
      title="Cancellation Policy"
      badge="SUBSCRIPTION CANCELLATION"
      lastUpdated="November 24, 2026"
    >
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Self-Service Cancellation</h2>
        <p>
          You have full control over your ExportFlow subscription at all times. You can cancel your recurring monthly or annual subscription directly from your customer dashboard under <strong>Company Settings &gt; Billing & Subscription</strong> or by emailing <a href="mailto:info@benzwell.in" className="text-blue-600 dark:text-blue-400 underline">info@benzwell.in</a> with your cancellation request.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Effect of Cancellation</h2>
        <p>When you cancel a subscription:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Access Until Cycle End:</strong> You retain full access to your subscription tier features and document allowances until the end of your currently paid billing period.</li>
          <li><strong>No Auto-Renewal:</strong> Your credit card, UPI mandate, or payment method will not be charged for the subsequent billing cycle.</li>
          <li><strong>Automatic Transition to Free Plan:</strong> At the conclusion of your billing cycle, your account automatically reverts to the official Free plan (1 Quotation and 1 PDF download per month).</li>
          <li><strong>Data & History Preservation:</strong> Your previously generated quotations, commercial invoices, packing lists, buyer records, and company settings remain permanently preserved and accessible in read/export mode. We do NOT delete your business history upon cancellation.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. 3-Day Free Trial Cancellation</h2>
        <p>
          The <strong>3-Day Growth Free Trial</strong> requires NO payment information and carries NO automatic paid rollover. It expires automatically after 72 hours, transitioning seamlessly to the Free tier without any action required from you. You do not need to cancel the trial to avoid charges.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">4. Account Termination & Closure</h2>
        <p>
          If you wish to permanently terminate and close your entire organization account on ExportFlow, please visit our <a href="/data-deletion" className="text-blue-600 dark:text-blue-400 underline">Data Deletion Request page</a> or email <a href="mailto:info@benzwell.in" className="text-blue-600 dark:text-blue-400 underline">info@benzwell.in</a>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
