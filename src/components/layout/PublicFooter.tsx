'use client';

import React from 'react';
import Link from 'next/link';
import { BrandLogo } from './BrandLogo';
import { Mail, Shield, Globe, FileText, CheckCircle2 } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="bg-[#0B1524] text-slate-300 border-t border-slate-800 transition-colors">
      {/* Top Footer Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Column 1: Brand & Identity */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo theme="dark" showTagline={true} size="md" />
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mt-3">
              ExportFlow by BENZWELL is the dedicated operating system for international exporters, merchant exporters, and trading houses. Build compliant trade documents, automate export pricing, manage global buyers, and accelerate cross-border commerce.
            </p>
            <div className="pt-2 space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <a href="mailto:info@benzwell.in" className="hover:text-white transition-colors">
                  info@benzwell.in
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Headquarters: India • Serving Global Trade</span>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>DGFT & GST Compliant • Incoterms 2020 Ready</span>
            </div>
          </div>

          {/* Column 2: Document Studio */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider mb-4">
              Document Studio
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/#documents" className="hover:text-white transition-colors">
                  Export Quotation Studio
                </Link>
              </li>
              <li>
                <Link href="/#documents" className="hover:text-white transition-colors">
                  Proforma Invoice Generator
                </Link>
              </li>
              <li>
                <Link href="/#documents" className="hover:text-white transition-colors">
                  Commercial Invoice (CI)
                </Link>
              </li>
              <li>
                <Link href="/#documents" className="hover:text-white transition-colors">
                  Packing List (PL)
                </Link>
              </li>
              <li>
                <Link href="/#documents" className="hover:text-white transition-colors">
                  Bill of Lading Tracker
                </Link>
              </li>
              <li>
                <Link href="/#documents" className="hover:text-white transition-colors">
                  Certificate of Origin (COO)
                </Link>
              </li>
              <li>
                <Link href="/#documents" className="hover:text-white transition-colors">
                  Shipping Bill Checklist
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Tools & Features */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider mb-4">
              Export Platform
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/#calculators" className="hover:text-white transition-colors">
                  10 Export Calculators
                </Link>
              </li>
              <li>
                <Link href="/#calculators" className="hover:text-white transition-colors">
                  Container Stuffing & CBM
                </Link>
              </li>
              <li>
                <Link href="/#calculators" className="hover:text-white transition-colors">
                  FOB / CIF Pricing Calculator
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-white transition-colors">
                  AI Document Assistant
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-white transition-colors">
                  Buyer CRM & Directory
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-white transition-colors">
                  Product Catalog & HS Codes
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Pricing & Credit Packs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Policies */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider mb-4">
              Legal & Trust
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-white transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/cancellation-policy" className="hover:text-white transition-colors">
                  Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/subscription-policy" className="hover:text-white transition-colors">
                  Subscription Policy
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/acceptable-use-policy" className="hover:text-white transition-colors">
                  Acceptable Use Policy
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-white transition-colors">
                  Trade Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/data-deletion" className="hover:text-white transition-colors">
                  Data Deletion Request
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact & Support
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800 bg-[#080E18] py-6 px-6 md:px-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} BENZWELL. All rights reserved. ExportFlow is a product of BENZWELL.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="hover:text-slate-300 transition-colors">
              Privacy
            </Link>
            <Link href="/terms-and-conditions" className="hover:text-slate-300 transition-colors">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
