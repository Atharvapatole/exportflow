import React from 'react';
import { Metadata } from 'next';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import Link from 'next/link';
import { Trash2, ShieldCheck, Mail, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Data Deletion Request — ExportFlow by BENZWELL',
  description: 'How to request complete organization and personal data deletion from ExportFlow by BENZWELL under the DPDP Act 2023.',
};

export default function DataDeletionPage() {
  return (
    <LegalPageLayout
      title="Data Deletion & Privacy Rights"
      badge="USER PRIVACY & COMPLIANCE"
      lastUpdated="November 24, 2026"
    >
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Your Right to Data Erasure</h2>
        <p>
          At ExportFlow by BENZWELL, we respect your ownership of your company&apos;s commercial data. In accordance with the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> and global privacy standards, you have the right to request the complete deletion of your account, organization profile, and associated business records from our systems.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. What Data Is Deleted</h2>
        <p>Upon processing an approved account deletion request, the following records are permanently expunged:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>User Profiles:</strong> Name, email address, password hashes, and user settings.</li>
          <li><strong>Organization Records:</strong> Company name, address, IEC code, GSTIN, AD code, and bank account numbers.</li>
          <li><strong>Trade Documents:</strong> All draft and finalized Quotations, Proforma Invoices, Commercial Invoices, and Packing Lists stored in your database tenancy.</li>
          <li><strong>Catalog & Buyer Records:</strong> Product master catalog, HS codes, and foreign customer contacts.</li>
          <li><strong>Uploaded Files:</strong> Company logos, signature stamps, and vector PDF assets hosted in our Supabase storage buckets.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Statutory Retention Exceptions</h2>
        <p>
          Please note that certain financial and tax records may be retained for statutory audit periods mandated by Indian law:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Tax invoices and Razorpay transaction IDs must be retained for up to 6 years pursuant to the Central Goods and Services Tax Act (CGST Act) and Indian Income Tax regulations.</li>
          <li>Aggregated, anonymized system telemetry logs that cannot be linked back to any identifiable organization.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">4. Pre-Deletion Recommendation: Export Your Data</h2>
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-2">
          <p className="font-bold flex items-center gap-1.5">
            <Trash2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Deletion is Permanent and Irreversible</span>
          </p>
          <p>
            Before submitting a deletion request, we strongly advise downloading all your finalized Quotation and Commercial Invoice PDFs from your dashboard. Once deleted, documents cannot be recovered by our engineering team.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">5. How to Submit a Deletion Request</h2>
        <p>You can submit a data deletion request through either of the following methods:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
            <h4 className="font-bold text-xs uppercase text-slate-900 dark:text-white mb-2">Option A: Via Direct Email</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
              Send an email from your registered business email address to our Data Protection Officer:
            </p>
            <a
              href="mailto:info@benzwell.in?subject=ExportFlow%20Data%20Deletion%20Request"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <Mail className="w-4 h-4" />
              <span>info@benzwell.in</span>
            </a>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
            <h4 className="font-bold text-xs uppercase text-slate-900 dark:text-white mb-2">Option B: Via Contact Form</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
              Submit an official ticket selecting the &quot;Support&quot; or &quot;General&quot; category on our contact page:
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>Open Contact Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">6. Verification & Fulfillment Timeline</h2>
        <p>
          To prevent unauthorized deletion of valuable trade records, our compliance team will send a verification confirmation link to your registered primary email address. Once verified, all requested records will be securely purged within <strong>14 business days</strong>, and a formal deletion certificate will be provided.
        </p>
      </section>
    </LegalPageLayout>
  );
}
