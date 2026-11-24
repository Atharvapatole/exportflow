import React from 'react';
import { Metadata } from 'next';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Refund Policy — ExportFlow by BENZWELL',
  description: 'Refund Policy and guidelines for credit packs and subscriptions on ExportFlow by BENZWELL.',
};

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout
      title="Refund Policy"
      badge="BILLING & REFUNDS"
      lastUpdated="November 24, 2026"
    >
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Overview</h2>
        <p>
          At ExportFlow by BENZWELL, we strive to deliver transparent and reliable export management software. We provide both a Free Forever plan (1 quote, 1 PDF/month) and an unrestricted <strong>3-Day Growth Free Trial</strong> so that exporters can thoroughly test our quotation studio, invoice generation, calculators, and PDF engine before making any monetary commitment.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Pay-As-You-Go Lifetime Credit Packs</h2>
        <p>
          Credit packs (Starter Pack ₹499, Business Pack ₹999, Professional Pack ₹1,999) provide digital credits that are deposited immediately into your organization&apos;s wallet upon successful payment authorization:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Unused Credit Packs:</strong> If you purchase a credit pack and have not consumed any document credits, you may request a full refund within <strong>7 days</strong> of the transaction date.</li>
          <li><strong>Partially Used Credit Packs:</strong> Once any document credit (Quotation, PI, CI, or Packing List) from a purchased pack has been consumed, the pack is deemed utilized and non-refundable.</li>
          <li><strong>Lifetime Expiry Guarantee:</strong> Unused credits in your wallet never expire and remain valid for the lifetime of your account.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Monthly and Annual Subscriptions</h2>
        <p>
          For recurring subscriptions (Starter, Growth, Business plans):
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>First-Time Subscription Refund Window:</strong> If you are dissatisfied with a new subscription plan, you may request a refund within <strong>48 hours</strong> of the initial charge, provided fewer than 3 document generations have occurred during that billing cycle.</li>
          <li><strong>Renewal Charges:</strong> Subscription renewals are non-refundable once billed. You may cancel renewal at any time prior to the billing date to prevent future recurring charges.</li>
          <li><strong>Annual Plans:</strong> If you cancel an annual plan within the first 14 days, you may receive a pro-rata refund minus the standard monthly non-discounted rate for the utilized month.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">4. Technical Malfunction or Double Charging</h2>
        <p>
          In the event of duplicate billing, server transaction failure, or gateway discrepancy where payment was captured via Razorpay but credits were not credited to your wallet, our technical team will immediately either allocate the missing credits or issue a 100% full refund upon verification.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">5. Refund Processing Timeline</h2>
        <p>
          Approved refunds are processed through our payment gateway partner (Razorpay) back to the original source payment method (UPI, Net Banking, Credit/Debit Card) within <strong>5 to 7 business days</strong>, depending on your bank&apos;s settlement schedule.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">6. How to Request a Refund</h2>
        <p>
          To request a refund, please email our billing department at <a href="mailto:info@benzwell.in" className="text-blue-600 dark:text-blue-400 underline">info@benzwell.in</a> with:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Your registered business email address</li>
          <li>Razorpay Payment ID / Order ID (e.g., `pay_...` or `order_...`)</li>
          <li>Date of transaction and reason for refund request</li>
        </ul>
      </section>
    </LegalPageLayout>
  );
}
