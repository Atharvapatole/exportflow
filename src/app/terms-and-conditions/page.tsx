import React from 'react';
import { Metadata } from 'next';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Terms and Conditions — ExportFlow by BENZWELL',
  description: 'Terms and Conditions governing the use of ExportFlow by BENZWELL export management platform.',
};

export default function TermsAndConditionsPage() {
  return (
    <LegalPageLayout
      title="Terms and Conditions"
      badge="TERMS OF SERVICE"
      lastUpdated="November 24, 2026"
    >
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Agreement to Terms</h2>
        <p>
          These Terms and Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity (&quot;Customer&quot;, &quot;Exporter&quot;, &quot;You&quot;), and <strong>BENZWELL Technologies</strong> (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), concerning your access to and use of the <strong>ExportFlow by BENZWELL</strong> platform.
        </p>
        <p>
          By creating an account, activating a trial, purchasing credits, or using any feature of ExportFlow, you acknowledge that you have read, understood, and agreed to be bound by all of these Terms and Conditions.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Permitted Commercial Use & License</h2>
        <p>
          ExportFlow grants you a limited, non-exclusive, non-transferable, revocable license to access and use the software for the legitimate preparation of international trade documentation, customer relationship management, shipment planning, and export mathematics for your own business enterprise.
        </p>
        <p>You agree not to:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Reverse engineer, decompile, or disassemble any portion of the platform.</li>
          <li>Resell, sublicense, or rent the SaaS software to third parties without prior written consent from BENZWELL Technologies.</li>
          <li>Use ExportFlow to generate fraudulent commercial invoices, undervalued customs declarations, or trade paperwork for prohibited/sanctioned goods.</li>
          <li>Interfere with security mechanisms, rate limits, or access controls.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Customer Trade Responsibilities & Incoterms</h2>
        <p>
          ExportFlow provides software templates, mathematical calculators, and AI assistance to streamline trade workflows. However, the Customer retains sole and ultimate legal responsibility for:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>The factual accuracy of product descriptions, HS classifications, unit rates, weights, dimensions, and total sums.</li>
          <li>Compliance with Directorate General of Foreign Trade (DGFT) foreign trade policies, Indian Customs regulations (ICEGATE), and destination country import laws.</li>
          <li>Correct selection and interpretation of Incoterms 2020 delivery obligations (FOB, CIF, CFR, EXW, DDP, etc.).</li>
          <li>Verification of buyer credentials, letters of credit (LC), and payment realization in accordance with FEMA/RBI regulations.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">4. 3-Day Growth Free Trial Terms</h2>
        <p>
          Eligible organizations may activate a one-time 3-day Growth free trial (&quot;ExportFlow 3-Day Growth Trial&quot;). The trial grants full access to Growth plan allowances for exactly 72 hours from the moment of activation. No payment details or credit cards are required to claim the trial. Upon trial expiration, the account will automatically revert to the Free plan. No data or documents will be deleted.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">5. Subscriptions, Credit Packs & Payments</h2>
        <p>
          Paid plans and document credit packs are billed in Indian Rupees (INR) via our payment gateway partner, Razorpay. All fees are exclusive of applicable GST unless explicitly stated. Lifetime credit packs do not expire and remain available until utilized. Monthly and annual subscriptions renew automatically until cancelled by the user.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">6. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by applicable law, in no event shall BENZWELL Technologies, its directors, employees, or agents be liable to you or any third party for any indirect, consequential, exemplary, incidental, or punitive damages, including lost export profits, demurrage fees, port storage charges, customs penalties, or shipping delays arising from your use of the platform.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">7. Governing Law & Dispute Resolution</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of <strong>India</strong>. Any legal action or proceeding arising out of or related to these Terms shall be instituted exclusively in the competent courts situated in India.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">8. Contact Information</h2>
        <p>
          For questions or notices regarding these Terms, please contact us at <a href="mailto:info@benzwell.in" className="text-blue-600 dark:text-blue-400 underline">info@benzwell.in</a>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
