import Link from 'next/link';
import {
  FileText,
  Calculator,
  Ship,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Globe2,
  Receipt,
  Layers,
} from 'lucide-react';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#172033] flex flex-col">
      {/* Top Navigation */}
      <header className="h-18 bg-white border-b border-[#E5EAF1] px-6 md:px-12 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <BrandLogo size="md" showTagline={false} />
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="secondary" size="sm">
              Free Launch Access
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-16 md:py-24 px-6 md:px-12 max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <span>EXPORTFLOW BY BENZWELL — INITIAL FREE LAUNCH</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-[#10243A] tracking-tight leading-tight max-w-4xl mx-auto">
            Simplify Your Export Business.
          </h1>

          <p className="mt-6 text-base md:text-lg text-[#64748B] max-w-2xl mx-auto leading-relaxed">
            Eliminate Canva, Excel spreadsheets, and scattered Word docs. Generate multi-currency Export Quotations, Proforma Invoices, Commercial Invoices, and Packing Lists in one unified B2B platform.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="px-8 shadow-md">
                Launch Workspace (100% Free)
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-8">
                Sign In to Existing Account
              </Button>
            </Link>
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>No Subscription Fees</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>No Credit Card Required</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Incoterms 2020 Compliant</span>
            </span>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-16 px-6 md:px-12 bg-white border-y border-[#E5EAF1]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-black text-[#10243A]">
                Everything Exporters Need in One Workspace
              </h2>
              <p className="text-sm text-[#64748B] mt-2">
                Designed specifically for international traders, merchant exporters, and manufacturers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl border border-slate-200 bg-[#F7F9FC] hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 mb-4">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#172033] mb-2">
                  Document Studio & PDF Engine
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Generate professional Quotations, Proforma Invoices, Commercial Invoices, and Packing Lists with decimal-safe monetary math, 5 distinct templates, and 1-click document conversions.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200 bg-[#F7F9FC] hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4">
                  <Calculator className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#172033] mb-2">
                  10 Smart Export Calculators
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Accurate GST (intra/inter-state, zero-rated export, LUT/bond), Export Pricing (EXW/FOB/CIF), CBM & 20ft/40ft Container Loading, Currency Conversion, and Landed Cost calculations.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200 bg-[#F7F9FC] hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-600 mb-4">
                  <Ship className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#172033] mb-2">
                  Shipment & Sales Pipeline
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Track container shipments, vessels, ports of loading/discharge, buyer payment milestones, realized export sales, and public quotation acceptance links.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#10243A] text-slate-400 py-8 px-6 md:px-12 border-t border-slate-800 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <BrandLogo theme="dark" showTagline={false} size="sm" />
          <p>© {new Date().getFullYear()} ExportFlow by BENZWELL. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/login" className="hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="hover:text-white transition-colors">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
