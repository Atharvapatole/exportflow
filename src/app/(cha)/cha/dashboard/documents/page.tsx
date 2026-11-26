import React from 'react';
import Link from 'next/link';
import {
  FileText,
  FileCheck,
  Calculator,
  ArrowRight,
  ShieldCheck,
  Anchor,
  Sparkles,
  Printer,
  UploadCloud,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function ChaDocumentsHubPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Customs Document Center & Studio</h1>
          <p className="text-xs text-slate-400 mt-1">
            Specialized document preparation tools, duty assessment worksheets, and official Indian Customs templates
          </p>
        </div>

        <Link href="/cha/dashboard/documents/ai-checker">
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold border-0 text-xs px-3.5 py-2">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            AI Cross-Document Checker
          </Button>
        </Link>
      </div>

      {/* Grid: Import Tools */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">
            Import Clearance Worksheets & Tools
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/cha/dashboard/documents/worksheets?tool=boe"
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-colors group flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors">
                Bill of Entry (BoE) Duty Calculator
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Calculate assessable customs value, Basic Customs Duty (BCD), Social Welfare Surcharge (SWS), and IGST amounts before ICEGATE submission.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
              <span>Open BoE Calculator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/cha/dashboard/documents/worksheets?tool=gatt"
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-colors group flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors">
                GATT Valuation Declaration (Rule 10)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate the mandatory GATT declaration form under Customs Valuation Rules 2007 (related party disclosure, royalties, and license fees).
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
              <span>Generate GATT Sheet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/cha/dashboard/esanchit"
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-colors group flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors">
                e-SANCHIT Document Register
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Log and verify IRN numbers for uploaded commercial invoices, packing lists, and bills of lading.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
              <span>View e-SANCHIT Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </div>

      {/* Grid: Export Tools */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">
            Export Clearance & Forwarding Tools
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/cha/dashboard/documents/worksheets?tool=sb"
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-colors group flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors">
                Shipping Bill (SB) Preparation Worksheet
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Prepare export consignment declarations with LUT ARN, RoDTEP/RoSCTL scheme claims, and FOB value calculation.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
              <span>Prepare SB Worksheet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/documents/new?type=commercial_invoice"
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-colors group flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors">
                Export Invoice & Packing List Studio
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate compliant multi-currency Commercial Invoices with Incoterms and detailed package breakdowns.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
              <span>Launch Document Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/cha/dashboard/documents/worksheets?tool=auth"
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-colors group flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors">
                CHA Authorization Letter Template
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Formal authorization letter from Exporter/Importer authorizing your firm to file declarations and attend cargo examinations.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
              <span>Draft Authorization Letter</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
