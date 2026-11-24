import React from 'react';
import { Metadata } from 'next';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Cookie Policy — ExportFlow by BENZWELL',
  description: 'Cookie policy and local storage usage on ExportFlow by BENZWELL.',
};

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout
      title="Cookie & Tracking Policy"
      badge="COOKIES & STORAGE"
      lastUpdated="November 24, 2026"
    >
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. What are Cookies and Local Storage?</h2>
        <p>
          Cookies are small text files placed on your device by websites you visit. Similar technologies include web storage (`localStorage` and `sessionStorage`) which allow web applications to store persistent user preferences locally in your browser.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. How ExportFlow Uses Cookies & Storage</h2>
        <p>
          ExportFlow uses cookies and local browser storage strictly for essential and functional purposes. <strong>We do NOT use invasive third-party cross-site advertising cookies or sell user telemetry data to advertising networks.</strong>
        </p>
        <div className="space-y-3 mt-3">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-xs uppercase text-slate-900 dark:text-white mb-1">Essential Authentication Cookies</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Encrypted session cookies issued by Supabase Auth and our authentication server to maintain your secure logged-in session, prevent Cross-Site Request Forgery (CSRF), and verify organization tenancy.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-xs uppercase text-slate-900 dark:text-white mb-1">Functional UI Preference Storage</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              `exportflow-theme` stored in your browser&apos;s `localStorage` to remember your Dark Mode / Light Mode preference across page reloads and prevent visual theme flickering.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-xs uppercase text-slate-900 dark:text-white mb-1">Payment Session Cookies (Razorpay)</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Temporary fraud-prevention and transaction validation tokens loaded exclusively when initiating a Razorpay payment checkout modal.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Managing and Disabling Cookies</h2>
        <p>
          Most modern web browsers allow you to control or clear cookies through browser settings. However, disabling essential authentication cookies will prevent you from signing in to your ExportFlow dashboard and accessing your trade documents.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">4. Inquiries</h2>
        <p>
          If you have questions regarding our cookie practices, please contact us at <a href="mailto:info@benzwell.in" className="text-blue-600 dark:text-blue-400 underline">info@benzwell.in</a>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
