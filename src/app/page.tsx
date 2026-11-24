import React from 'react';
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
  FileSpreadsheet,
  AlertTriangle,
  Layers,
  Zap,
  Package,
  Users,
  Check,
  Building,
  Printer,
  Compass,
  CreditCard,
  Scale,
  DollarSign,
  Boxes,
  HelpCircle,
  Truck,
  Anchor,
  FileCheck2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { PricingCardSection } from '@/components/pricing/PricingCardSection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0B0F17] text-[#172033] dark:text-[#F1F5F9] flex flex-col transition-colors selection:bg-blue-600 selection:text-white">
      {/* 1. Public Header */}
      <PublicHeader />

      <main className="flex-1">
        {/* =========================================================================
            SECTION 1: HERO SECTION
            ========================================================================= */}
        <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 px-6 md:px-12 border-b border-[#E5EAF1] dark:border-[#243047] bg-gradient-to-b from-white via-slate-50/50 to-[#F7F9FC] dark:from-[#0B0F17] dark:via-[#0F172A] dark:to-[#0B0F17]">
          <div className="max-w-6xl mx-auto text-center relative z-10">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold mb-6 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>THE OPERATING SYSTEM FOR MODERN EXPORT BUSINESSES</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#10243A] dark:text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
              Simplify Your Export Business.
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-base sm:text-lg md:text-xl text-[#64748B] dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Eliminate fragmented Canva templates, Excel spreadsheets, and messy Word docs. Generate customs-ready Export Quotations, Proforma Invoices, Commercial Invoices, and Packing Lists in one unified B2B platform.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="px-8 py-3.5 text-sm font-bold shadow-lg shadow-blue-500/20 gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Start 3-Day Free Trial</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link href="#pricing">
                <Button size="lg" variant="outline" className="px-8 py-3.5 text-sm font-semibold border-slate-300 dark:border-slate-700">
                  Explore Pricing & Plans
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>3-Day Growth Free Trial (No Card Needed)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Incoterms 2020 & DGFT Compliant</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Pristine Vector A4 PDF Generation</span>
              </span>
            </div>

            {/* Platform Mockup Showcase */}
            <div className="mt-14 max-w-5xl mx-auto rounded-2xl p-2 bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-900 shadow-2xl">
              <div className="rounded-xl overflow-hidden bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 p-6 md:p-8 text-left">
                {/* Mockup Topbar */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                    <span className="ml-2 text-xs font-mono text-slate-400">ExportFlow Quotation Studio v2.4</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded">
                      Incoterms CIF Hamburg
                    </span>
                    <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                      USD $84,250.00
                    </span>
                  </div>
                </div>

                {/* Mockup Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Consignee & Buyer</span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">Nordic Maritime Trading GmbH</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Am Sandtorkai 48, 20457 Hamburg, Germany</p>
                    <span className="inline-block mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Port of Discharge: Hamburg (DEHAM)</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Exporter of Record</span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">BENZWELL Global Exports Pvt Ltd</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">IEC: 0314059281 • GSTIN: 27AABCB1234D1Z5</p>
                    <span className="inline-block mt-2 text-[10px] text-blue-600 dark:text-blue-400 font-bold">Port of Loading: JNPT Nhava Sheva (INNSA)</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">AI Document Copilot</span>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">
                        &quot;Auto-calculated 2x40ft HC container space (94.2% stuffed). Incoterms insurance clause validated.&quot;
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold">OpenRouter DeepSeek R1 Ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: THE PROBLEM EXPORTERS FACE
            ========================================================================= */}
        <section className="py-20 px-6 md:px-12 bg-white dark:bg-[#0F172A] border-b border-[#E5EAF1] dark:border-[#243047] transition-colors">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                The Cost of Fragmented Software
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#10243A] dark:text-white mt-1">
                Why Excel, Canva & Word Fail Modern Exporters
              </h2>
              <p className="text-sm text-[#64748B] dark:text-slate-400 mt-3">
                Export trade is strict. A single discrepancy between your Commercial Invoice and Packing List holds up cargo at port customs for weeks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Canva Problem */}
              <div className="p-6 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/50">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Canva is Design, Not Trade Software</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Canva has zero understanding of Incoterms, container CBM limits, currency conversions, or GST zero-rated export LUT numbers. You have to manually calculate every rate and copy-paste between separate graphics.
                </p>
              </div>

              {/* Excel Problem */}
              <div className="p-6 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/50">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Excel Formulas Break Silently</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  One accidental formula overwrite changes subtotal amounts. Version chaos between sales teams leads to sending the wrong quotation revision to international buyers, creating disputes during letter of credit presentation.
                </p>
              </div>

              {/* Word Problem */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                  <Printer className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Word Formatting Nightmare</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Tables wrap unpredictably, signatures split onto blank pages, and web-printed PDFs display unsightly header URLs, timestamps, and page cut-offs that look amateurish to foreign buyers and customs clearance officers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: WHAT IS EXPORTFLOW
            ========================================================================= */}
        <section className="py-20 px-6 md:px-12 bg-[#F7F9FC] dark:bg-[#0B0F17] border-b border-[#E5EAF1] dark:border-[#243047] transition-colors">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Built For Global Trade
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-[#10243A] dark:text-white mt-1 leading-tight">
                  One Centralized Operating System for Your Export Company
                </h2>
                <p className="text-sm text-[#64748B] dark:text-slate-300 mt-4 leading-relaxed">
                  ExportFlow eliminates software sprawl by integrating your product catalog, buyer directory, multi-currency pricing, smart export calculators, and trade document workflow into a unified, high-speed SaaS system.
                </p>

                <div className="mt-8 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">End-to-End Trade Lifecycle</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">From initial buyer inquiry & quotation to Proforma Invoice, Commercial Invoice, and Packing List in 1-click conversions.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Multi-Currency & Incoterms 2020 Built-In</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Live exchange rates for USD, EUR, GBP, AED, SAR, SGD, JPY, and 11 official Incoterms with automated responsibility definitions.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Clean, Vector A4 PDF Engine</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Zero website banners, zero browser URL footers, strict margin isolation, and crisp letterheads that international banks and customs accept without friction.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#131B2A] rounded-2xl border border-slate-200 dark:border-slate-800 p-7 shadow-xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Export House Architecture</span>
                  </div>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Active Sync</span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Quotation Studio</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400">Instant PDF + Public Review Link</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Proforma Invoice</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">Bank & LC Presentation Ready</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Commercial Invoice & Packing List</span>
                    <span className="font-mono text-purple-600 dark:text-purple-400">Customs Discrepancy Protected</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">10 Export Calculators</span>
                    <span className="font-mono text-amber-600 dark:text-amber-400">CBM, FOB, Duty Drawback, Stuffing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: EXPORT DOCUMENT STUDIO (12 TRADE DOCUMENTS)
            ========================================================================= */}
        <section id="documents" className="py-20 px-6 md:px-12 bg-white dark:bg-[#0F172A] border-b border-[#E5EAF1] dark:border-[#243047] transition-colors">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Complete Trade Document Suite
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#10243A] dark:text-white mt-1">
                12 International Trade Documents, Perfectly Formatted
              </h2>
              <p className="text-sm text-[#64748B] dark:text-slate-400 mt-3">
                Every trade document adheres strictly to DGFT, Indian Customs ICEGATE, and international chamber of commerce guidelines.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'Export Quotation', desc: 'Bilingual pricing offer with Incoterms 2020, validity periods, multi-currency calculations, and acceptance links.' },
                { title: 'Proforma Invoice (PI)', desc: 'Pre-shipment contract required by foreign banks to issue import permits, letters of credit (LC), and advance wire transfers.' },
                { title: 'Commercial Invoice (CI)', desc: 'Legal commercial document for port customs clearance, duty assessment, and foreign exchange realization under FEMA/RBI.' },
                { title: 'Packing List (PL)', desc: 'Detailed breakdown of net weight, gross weight, carton dimensions, package marks, and total CBM volume.' },
                { title: 'Bill of Lading (B/L) Tracker', desc: 'Maintain carrier vessel numbers, container numbers, container seal numbers, and shipping line master BL references.' },
                { title: 'Certificate of Origin (COO)', desc: 'Prepare country of origin declarations for preferential duty agreements (SAFTA, CEPA, Indo-Australia ECTA).' },
                { title: 'Shipping Bill Checklist', desc: 'Verify HS codes, drawback serial numbers, port of loading codes, and export under LUT or IGST payment.' },
                { title: 'Inspection Certificate Draft', desc: 'Pre-shipment quality and quantity certificate drafts for third-party inspection agencies (SGS, Bureau Veritas).' },
                { title: 'Marine Insurance Tracker', desc: 'Track Institute Cargo Clauses (A, B, or C), coverage values (CIF + 10%), policy numbers, and claim contact agents.' },
                { title: 'Letter of Credit (LC) Advisor', desc: 'Verify documentary terms against UCP 600 standards to prevent discrepancies and bank rejection fees.' },
                { title: 'Mate Receipt Tracker', desc: 'Log port wharf receipts issued by the commanding officer of the vessel acknowledging receipt of cargo on board.' },
                { title: 'Delivery Challan / Gate Pass', desc: 'Factory dispatch and container terminal gate passes for movement from inland container depot (ICD) to port.' },
              ].map((doc, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F7F9FC] dark:bg-[#131B2A] hover:border-blue-400 dark:hover:border-blue-500 transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <FileCheck2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{doc.title}</h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{doc.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 5: AI DOCUMENT ASSISTANT (OPENROUTER / GROQ / GEMINI)
            ========================================================================= */}
        <section className="py-20 px-6 md:px-12 bg-[#F7F9FC] dark:bg-[#0B0F17] border-b border-[#E5EAF1] dark:border-[#243047] transition-colors">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>INTELLIGENT TRADE ASSISTANT</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-[#10243A] dark:text-white leading-tight">
                  Your AI Copilot for International Trade
                </h2>
                <p className="text-sm text-[#64748B] dark:text-slate-300 mt-4 leading-relaxed">
                  ExportFlow combines OpenRouter as primary provider (backed by Groq and Google Gemini) to eliminate trade errors before they reach international buyers or customs officials.
                </p>

                <div className="mt-8 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Smart HS Code & Tariff Discovery</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Describe your product in natural language; AI suggests the corresponding 6-to-8 digit HS Code and export compliance rules.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Automated Commercial Terms Drafting</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Generate airtight payment terms, force majeure clauses, arbitration rules, and Incoterms delivery liabilities with one prompt.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Multi-Lingual Trade Descriptions</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Translate technical product specs and invoice line items into Arabic, Spanish, French, German, or Russian for foreign customs clearance.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Terminal Simulation Card */}
              <div className="bg-[#0A1220] rounded-2xl border border-slate-800 p-6 shadow-2xl text-slate-200 font-mono text-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-purple-400 font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    ExportFlow AI Engine (OpenRouter)
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">Active</span>
                </div>
                <div className="space-y-2 text-slate-300">
                  <p className="text-slate-400">&gt; Prompt: &quot;Prepare payment clause for 30% advance, 70% against Bill of Lading copy, CIF Dubai&quot;</p>
                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-slate-200 leading-relaxed font-sans text-xs">
                    <strong>Generated Clause:</strong> &quot;Payment shall be made 30% by clean Telegraphic Transfer (TT) upon order confirmation, with remaining 70% payable against faxed/scanned copy of Clean On-Board Bill of Lading, Commercial Invoice, and Packing List within 5 business days. Port of Destination: Jebel Ali, UAE (Incoterms 2020 CIF).&quot;
                  </div>
                </div>
                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 font-sans">
                  <span>Provider: OpenRouter Primary</span>
                  <span>Backup: Groq / Gemini</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 6: BUYER CRM & DIRECTORY
            ========================================================================= */}
        <section className="py-20 px-6 md:px-12 bg-white dark:bg-[#0F172A] border-b border-[#E5EAF1] dark:border-[#243047] transition-colors">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 bg-[#F7F9FC] dark:bg-[#131B2A] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">International Buyer Directory</span>
                  </div>
                  <span className="text-xs bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.5 rounded">
                    42 Active Buyers
                  </span>
                </div>

                <div className="space-y-2.5">
                  {[
                    { name: 'Apex Gulf Trading LLC', country: 'United Arab Emirates', status: 'Converted', cur: 'AED' },
                    { name: 'EuroStahl Import GmbH', country: 'Germany', status: 'Negotiating', cur: 'EUR' },
                    { name: 'Pacific Rim Commodities Corp', country: 'United States', status: 'Interested', cur: 'USD' },
                    { name: 'Kyoto Precision Goods Ltd', country: 'Japan', status: 'Converted', cur: 'JPY' },
                  ].map((b, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{b.name}</h4>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{b.country} • Currency: {b.cur}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.status === 'Converted' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Buyer Relationship Management
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-[#10243A] dark:text-white mt-1 leading-tight">
                  Centralize International Buyers and Payment Terms
                </h2>
                <p className="text-sm text-[#64748B] dark:text-slate-300 mt-4 leading-relaxed">
                  Never forget a buyer&apos;s custom packaging requirement, port of discharge, credit terms, or tax ID. ExportFlow gives you a dedicated CRM tailored for global trade.
                </p>
                <ul className="mt-6 space-y-3 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Store foreign VAT, Tax IDs, and company registration certificates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Assign default currencies (USD, EUR, GBP, AED, SAR) per buyer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Track buyer quotation history and accepted sales orders in one click</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 7: PRODUCT CATALOG & HS CODE DATABASE
            ========================================================================= */}
        <section className="py-20 px-6 md:px-12 bg-[#F7F9FC] dark:bg-[#0B0F17] border-b border-[#E5EAF1] dark:border-[#243047] transition-colors">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Catalog & Inventory Specifications
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#10243A] dark:text-white mt-1">
                Centralized Export SKUs with Automated CBM & Weight
              </h2>
              <p className="text-sm text-[#64748B] dark:text-slate-400 mt-3">
                Pre-configure your export product master with dimensions, net/gross weights, HS codes, packaging units, and duty drawback rates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                  <Package className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Dimensional & Weight Specs</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Store exact length, width, height, net weight, and gross weight per carton or pallet. ExportFlow automatically computes total CBM and payload when generating packing lists.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                  <Scale className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">HS Code Master & Duty Drawback</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Attach official Indian ITC-HS 8-digit codes, RoDTEP percentages, and RoSCTL rates so your shipping bills and customs paperwork claim maximum government export incentives.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Multi-Currency Export Price Lists</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Maintain base costs in INR while setting dynamic FOB or CIF export prices in USD, EUR, GBP, or AED with minimum order quantity (MOQ) tiering.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 8: 10 SMART EXPORT CALCULATORS
            ========================================================================= */}
        <section id="calculators" className="py-20 px-6 md:px-12 bg-white dark:bg-[#0F172A] border-b border-[#E5EAF1] dark:border-[#243047] transition-colors">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Precision Trade Mathematics
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#10243A] dark:text-white mt-1">
                10 Built-In Export Calculators
              </h2>
              <p className="text-sm text-[#64748B] dark:text-slate-400 mt-3">
                Stop guessing container space or FOB price margins. Every calculator is built specifically for international logistics and customs rules.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { title: 'Container Stuffing', desc: 'Calculate exact carton fits for 20ft (33 CBM), 40ft (67 CBM), and 40ft HC (76 CBM) containers.', icon: Boxes },
                { title: 'CBM & Volumetric Weight', desc: 'Calculate cubic meters and air freight IATA volumetric chargeable weight (L x W x H / 6000).', icon: Calculator },
                { title: 'FOB / CIF Pricing', desc: 'Step-by-step export price buildup from factory ex-works cost to inland haulage, customs, port THC, freight & insurance.', icon: DollarSign },
                { title: 'Duty Drawback & RoDTEP', desc: 'Calculate refundable export duty benefits under Indian Customs Section 75 and DBK schedules.', icon: Scale },
                { title: 'Currency Conversion', desc: 'Live exchange rates with currency volatility guard to prevent exchange loss on deferred payments.', icon: Globe2 },
                { title: 'Ocean & Air Freight', desc: 'Estimate container freight rates per CBM or metric ton with bunker adjustment factors (BAF/FAF).', icon: Ship },
                { title: 'Marine Insurance', desc: 'Calculate CIF + 10% standard marine transit insurance premiums based on Institute Cargo Clauses.', icon: ShieldCheck },
                { title: 'Pallet & Packaging', desc: 'Optimize wooden Euro & ISO pallet layouts to minimize wasted container space and prevent cargo shifting.', icon: Layers },
                { title: 'Export Margin & Breakeven', desc: 'Determine minimum viable export price after factoring financing interest (Pre/Post-shipment EPC).', icon: Zap },
                { title: 'Landed Cost & Duty', desc: 'Estimate destination landed cost for buyers including foreign import tariffs, port demurrage, and local VAT.', icon: Truck },
              ].map((calc, i) => {
                const Icon = calc.icon;
                return (
                  <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F7F9FC] dark:bg-[#131B2A] flex flex-col justify-between">
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{calc.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{calc.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 9: SHIPMENT & ORDER TRACKING
            ========================================================================= */}
        <section className="py-20 px-6 md:px-12 bg-[#F7F9FC] dark:bg-[#0B0F17] border-b border-[#E5EAF1] dark:border-[#243047] transition-colors">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Logistics & Fulfillment
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-[#10243A] dark:text-white mt-1 leading-tight">
                  Track Shipments from Order Confirmation to Port Delivery
                </h2>
                <p className="text-sm text-[#64748B] dark:text-slate-300 mt-4 leading-relaxed">
                  Monitor the entire post-order execution cycle. Keep your CHA (Customs Broker), shipping lines, factory production heads, and foreign buyers updated on shipping milestones.
                </p>

                <div className="mt-6 space-y-3">
                  {[
                    'Purchase Order (PO) & Advance Payment Confirmation',
                    'Factory Production & Pre-Shipment Quality Inspection',
                    'Container Booking & ICD/Port Gate-In',
                    'Customs LEO (Let Export Order) & Shipping Bill Generation',
                    'Vessel Departure (ETD), Port Arrival (ETA) & BL Surrender',
                    'Final Payment Realization & e-BRC Settlement',
                  ].map((stage, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <span>{stage}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-[#131B2A] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Anchor className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Active Vessel Manifest</span>
                  </div>
                  <span className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded">
                    On Water (ETA 4 Days)
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Vessel & Voyage</span>
                    <span className="font-bold text-slate-900 dark:text-white">MSC OSCAR / V.2401W</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Container & Seal Numbers</span>
                    <span className="font-mono text-slate-900 dark:text-white">MSCU7829104 (Seal: ML-IN-90812)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Port Routing</span>
                    <span className="font-semibold text-slate-900 dark:text-white">INNSA (Nhava Sheva) ➔ DEHAM (Hamburg)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 10: PROFESSIONAL VECTOR PDF ENGINE
            ========================================================================= */}
        <section className="py-20 px-6 md:px-12 bg-white dark:bg-[#0F172A] border-b border-[#E5EAF1] dark:border-[#243047] transition-colors">
          <div className="max-w-6xl mx-auto text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Customs-Grade Output
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#10243A] dark:text-white mt-1">
              Zero Browser Print Artifacts. Only Pure Trade Documents.
            </h2>
            <p className="text-sm text-[#64748B] dark:text-slate-400 max-w-2xl mx-auto mt-3">
              ExportFlow isolates the document canvas before PDF compilation. Never worry about application headers, download buttons, or dashboard sidebars bleeding into your quotes.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12 text-left">
              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F7F9FC] dark:bg-[#131B2A]">
                <ShieldCheck className="w-5 h-5 text-emerald-500 mb-2" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Pure White A4 Canvas</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Even when using ExportFlow in Dark Mode, exported documents render in pure printable white paper with crisp contrast.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F7F9FC] dark:bg-[#131B2A]">
                <Printer className="w-5 h-5 text-blue-500 mb-2" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">No Header/Footer Leak</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  No `localhost:3000` URLs, browser date stamps, or page numbers injected by browser print dialogs.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F7F9FC] dark:bg-[#131B2A]">
                <Layers className="w-5 h-5 text-purple-500 mb-2" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">5 Distinct Templates</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Choose between Classic Corporate, Modern Minimal, Premium International, International Trade, and Compact Business.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F7F9FC] dark:bg-[#131B2A]">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-2" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Signatures & Bank Details</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Full Swift code, IBAN, authorized signatory zones, and company stamp blocks ready for official presentation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 11: HOW IT WORKS (4-STEP WORKFLOW)
            ========================================================================= */}
        <section className="py-20 px-6 md:px-12 bg-[#F7F9FC] dark:bg-[#0B0F17] border-b border-[#E5EAF1] dark:border-[#243047] transition-colors">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Simple 4-Step Process
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#10243A] dark:text-white mt-1">
                From Inquiry to Compliant Document in 60 Seconds
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { step: '01', title: 'Setup Company & Bank Profile', desc: 'Add IEC code, GSTIN, AD Code, Swift/IBAN, and company logo once. It auto-fills every future document.' },
                { step: '02', title: 'Pick Buyer & Add Products', desc: 'Select an existing buyer or create one. Choose products from catalog; quantities and weights calculate dynamically.' },
                { step: '03', title: 'Select Incoterms & Terms', desc: 'Pick your Incoterm (FOB, CIF, CFR) and let the AI assistant draft compliant payment clauses and validity conditions.' },
                { step: '04', title: 'Export Vector A4 PDF', desc: 'Generate crisp, professional trade documents ready to email to international buyers or submit to your bank.' },
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 shadow-2xs relative">
                  <span className="text-3xl font-black text-blue-600/30 dark:text-blue-400/20 block mb-2">{item.step}</span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 12: PRICING & SUBSCRIPTION PLANS
            ========================================================================= */}
        <section id="pricing" className="py-20 px-6 md:px-12 bg-white dark:bg-[#0F172A] border-b border-[#E5EAF1] dark:border-[#243047] transition-colors">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Transparent & Flexible Pricing
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#10243A] dark:text-white mt-1">
                Choose the Right Plan for Your Export Volume
              </h2>
              <p className="text-sm text-[#64748B] dark:text-slate-400 mt-3">
                No surprises. Start with our 3-day Growth free trial, top up anytime with lifetime credit packs, or subscribe for high-volume trade documentation.
              </p>
            </div>

            <PricingCardSection />
          </div>
        </section>

        {/* =========================================================================
            SECTION 13: 3-DAY FREE TRIAL CTA BANNER
            ========================================================================= */}
        <section className="py-20 px-6 md:px-12 bg-gradient-to-r from-[#10243A] via-[#1E3A8A] to-[#10243A] text-white">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>SPECIAL EXPORTER OFFER</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Start Your 3-Day Free Growth Trial Today
            </h2>
            <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Get immediate access to 30 Quotations, 20 Proforma Invoices, Commercial Invoices, Packing Lists, OpenRouter AI Copilot, and 10 export calculators. Zero payment required to begin.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-3.5 text-sm font-bold shadow-xl border-none">
                  Activate 3-Day Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-3.5 text-sm">
                  Contact Sales & Trade Support
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 14: COMPREHENSIVE FAQ
            ========================================================================= */}
        <section className="py-20 px-6 md:px-12 bg-white dark:bg-[#0F172A] border-b border-[#E5EAF1] dark:border-[#243047] transition-colors">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Common Inquiries
              </span>
              <h2 className="text-3xl font-black text-[#10243A] dark:text-white mt-1">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: 'Are ExportFlow documents compliant with DGFT and Indian Customs?',
                  a: 'Yes. Every Quotation, Proforma Invoice, Commercial Invoice, and Packing List includes statutory fields required by Indian Customs (ICEGATE) and international authorities: IEC Code, GSTIN, AD Code, LUT/Bond declaration, Incoterms 2020 rules, HS Code, and net/gross weights.',
                },
                {
                  q: 'How does the 3-day Growth free trial work?',
                  a: 'Every newly registered organization receives the option to activate a 3-day Growth free trial. You do not enter any credit card or payment details. At the end of the 3 days, your account seamlessly transitions to the Free plan with no data loss.',
                },
                {
                  q: 'What is the difference between Credit Packs and Subscriptions?',
                  a: 'Credit packs are pay-as-you-go lifetime credits that never expire. They are ideal if you export occasionally (e.g., 2-5 shipments a month). Subscriptions provide much larger document allowances every month or year for high-volume exporters.',
                },
                {
                  q: 'Can I download PDFs without web browser headers or page numbers?',
                  a: 'Absolutely. ExportFlow has a dedicated vector PDF engine that completely isolates the document from the web dashboard. Your downloaded document looks like a pristine corporate document printed directly on official letterhead.',
                },
                {
                  q: 'How does the AI Document Assistant work?',
                  a: 'ExportFlow connects to OpenRouter as its primary AI provider (with backup redundancy from Groq and Google Gemini). It helps you discover correct 8-digit HS codes, draft international payment clauses, calculate container stuffing, and format terms.',
                },
                {
                  q: 'Can multiple team members use the same company workspace?',
                  a: 'Yes! On the Business plan, you can invite team members with role-based permissions (sales executives, document coordinators, managers).',
                },
              ].map((faq, idx) => (
                <div key={idx} className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F7F9FC] dark:bg-[#131B2A]">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{faq.q}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* 15. SaaS Footer */}
      <PublicFooter />
    </div>
  );
}
