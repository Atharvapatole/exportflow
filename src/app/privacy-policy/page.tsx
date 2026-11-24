import React from 'react';
import { Metadata } from 'next';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Privacy Policy — ExportFlow by BENZWELL',
  description: 'Privacy Policy and data protection practices for ExportFlow by BENZWELL under the Information Technology Act 2000 and DPDP Act 2023.',
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      badge="PRIVACY & DATA PROTECTION"
      lastUpdated="November 24, 2026"
    >
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Introduction & Scope</h2>
        <p>
          Welcome to ExportFlow by BENZWELL (&quot;ExportFlow&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), an international business management software platform developed and operated by BENZWELL Technologies, India. We are committed to protecting the privacy, confidentiality, and security of all personal and commercial data entrusted to us by our users (&quot;Customer&quot;, &quot;User&quot;, &quot;Exporter&quot;).
        </p>
        <p>
          This Privacy Policy describes how we collect, store, process, transfer, and safeguard your information in accordance with the <strong>Information Technology Act, 2000</strong>, the <strong>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</strong>, and the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> of India.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Information We Collect</h2>
        <p>When you register, configure, and utilize the ExportFlow platform, we collect the following categories of data:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Account & Organization Information:</strong> Name, business email address, company name, registered business address, country, phone number, and encrypted password credentials.</li>
          <li><strong>Statutory & Commercial Data:</strong> Import Export Code (IEC), GSTIN, Authorized Dealer (AD) Code, Bank Details (Account Number, SWIFT / BIC, IBAN), and Authorized Signatory information.</li>
          <li><strong>Buyer & Consignee Records:</strong> Foreign customer business names, international addresses, tax numbers, contact emails, and delivery port preferences entered into your Buyer CRM.</li>
          <li><strong>Document & Transaction Logs:</strong> Quotations, Proforma Invoices, Commercial Invoices, Packing Lists, product catalog specifications, HS codes, container numbers, and shipment records.</li>
          <li><strong>Payment & Billing Data:</strong> Razorpay transaction IDs, payment statuses, and invoice records. We do NOT store full credit/debit card numbers or CVV on our servers; payments are processed directly by RBI-licensed payment aggregators (Razorpay).</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. How We Use Your Information</h2>
        <p>We process your data strictly for legitimate business and contractual purposes:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Providing, operating, and personalizing the ExportFlow SaaS platform.</li>
          <li>Compiling vector A4 business documents (Quotations, Invoices, Packing Lists) and computing mathematical trade formulas.</li>
          <li>Processing payment transactions, managing document credit wallets, and administering free trial periods.</li>
          <li>Powering the AI Document Assistant via secure server-side API requests to authorized LLM providers (OpenRouter, Groq, Google Gemini) without training public foundation models on your private commercial contracts.</li>
          <li>Complying with statutory audits, taxation mandates, and regulatory obligations under Indian law.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">4. Data Storage & Security Safeguards</h2>
        <p>
          We employ robust administrative, technical, and physical security measures to protect your trade records against unauthorized access, destruction, loss, or alteration. All database communications are secured using TLS 1.3 encryption in transit and AES-256 encryption at rest. Server infrastructure and PostgreSQL databases are hosted in secure enterprise data centers with strict Row Level Security (RLS) ensuring that one organization can never view or modify another organization&apos;s data.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">5. Third-Party Integrations</h2>
        <p>ExportFlow coordinates with trusted enterprise service providers solely to deliver platform functionality:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Supabase:</strong> Managed PostgreSQL database, authentication, and secure file storage.</li>
          <li><strong>Razorpay:</strong> Payment processing gateway operating under Reserve Bank of India (RBI) guidelines.</li>
          <li><strong>OpenRouter / Groq / Google:</strong> AI inference processing strictly through stateless API calls without data retention for model retraining.</li>
          <li><strong>Resend:</strong> Transactional email dispatcher for invoice delivery and system notifications.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">6. Your Data Rights & Deletion</h2>
        <p>
          Under applicable data protection laws, you retain the right to review, rectify, or request the deletion of your personal data stored on ExportFlow. You can export your quotations, invoices, and buyer directory at any time, or submit a formal deletion request via our <a href="/data-deletion" className="text-blue-600 dark:text-blue-400 underline">Data Deletion Portal</a> or by writing to <a href="mailto:info@benzwell.in" className="text-blue-600 dark:text-blue-400 underline">info@benzwell.in</a>.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">7. Grievance Officer & Contact</h2>
        <p>
          In accordance with the Information Technology Act 2000 and DPDP Act 2023, the details of the designated Grievance Officer for BENZWELL Technologies are:
        </p>
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
          <p><strong>Grievance Officer:</strong> Legal & Compliance Officer</p>
          <p><strong>Entity:</strong> BENZWELL Technologies</p>
          <p><strong>Email:</strong> <a href="mailto:info@benzwell.in" className="text-blue-600 dark:text-blue-400">info@benzwell.in</a></p>
          <p><strong>Country:</strong> India</p>
        </div>
      </section>
    </LegalPageLayout>
  );
}
