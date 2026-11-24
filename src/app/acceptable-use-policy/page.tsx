import React from 'react';
import { Metadata } from 'next';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Acceptable Use Policy — ExportFlow by BENZWELL',
  description: 'Acceptable Use Policy for international trade document generation on ExportFlow by BENZWELL.',
};

export default function AcceptableUsePolicyPage() {
  return (
    <LegalPageLayout
      title="Acceptable Use Policy"
      badge="TRADE COMPLIANCE & USAGE"
      lastUpdated="November 24, 2026"
    >
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Purpose & Standards</h2>
        <p>
          ExportFlow by BENZWELL is built to serve legitimate international exporters, merchant exporters, manufacturers, and trading houses. To safeguard our platform integrity and ensure compliance with global trade regulations, all users must abide by this Acceptable Use Policy.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Prohibited Trade Activities</h2>
        <p>You may NOT use ExportFlow to create quotations, invoices, or packing lists for:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Sanctioned Entities & Destinations:</strong> Individuals, entities, or sovereign jurisdictions subject to international trade sanctions, UN Security Council sanctions, or Indian Ministry of Commerce restrictions.</li>
          <li><strong>Prohibited & Illicit Goods:</strong> Narcotics, illicit pharmaceuticals, counterfeit trademarks, contraband, military weaponry, or endangered wildlife parts prohibited under the Wildlife Protection Act or CITES.</li>
          <li><strong>Customs Fraud & Trade Misinvoicing:</strong> Artificially inflating or deflating invoice values (under-invoicing or over-invoicing) for the purpose of customs duty evasion, illicit capital flight, or money laundering under the Prevention of Money Laundering Act (PMLA).</li>
          <li><strong>Fictitious IEC or GSTIN Spoofing:</strong> Utilizing unregistered, fraudulent, or impersonated Import Export Codes or GST identification numbers belonging to third parties.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. System & Network Abuse</h2>
        <p>Users shall not:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Deploy automated scrapers, web spiders, or brute-force scripts to harvest platform data or flood API endpoints.</li>
          <li>Attempt to bypass tenant isolation or access documents belonging to other organizations.</li>
          <li>Abuse AI Document Assistant tokens or circumvent billing limits through unauthorized multi-account rotations.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">4. Enforcement & Account Termination</h2>
        <p>
          BENZWELL Technologies reserves the right to immediately suspend or permanently terminate any account found in willful violation of this policy. Where required by law, fraudulent commercial records may be reported to appropriate regulatory and law enforcement authorities, including the Directorate General of Foreign Trade (DGFT) and the Directorate of Revenue Intelligence (DRI).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">5. Reporting Violations</h2>
        <p>
          To report suspected fraudulent use or compliance violations, please email <a href="mailto:info@benzwell.in" className="text-blue-600 dark:text-blue-400 underline">info@benzwell.in</a>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
