import React from 'react';
import Link from 'next/link';
import {
  FileText,
  FileCheck,
  Calculator,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Printer,
  UploadCloud,
  Plus,
  Clock,
  CheckCircle,
  FilePlus,
  Ship,
} from 'lucide-react';
import { getCurrentContext } from '@/lib/auth';
import { chaDocRepo } from '@/lib/db';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function ChaDocumentsHubPage() {
  const ctx = await getCurrentContext();
  const orgId = ctx?.organization?.id || '';

  const documents = await chaDocRepo.listByOrg(orgId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Customs Documents Studio
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400">Section 46 & 50 Customs Act 1962</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Customs Document Studio & Worksheets
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate, customize, stamp, and export official Indian Customs worksheets, declarations, and agency debit notes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/cha/dashboard/documents/ai-checker">
            <Button size="sm" variant="outline" className="border-slate-700 text-purple-300 hover:bg-slate-800 text-xs px-3.5 py-2">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
              AI Cross-Doc Checker
            </Button>
          </Link>
          <Link href="/cha/dashboard/documents/create">
            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border-0 text-xs px-3.5 py-2 shadow-sm">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Create Customs Document
            </Button>
          </Link>
        </div>
      </div>

      {/* Generated Documents Register */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              Issued Customs Documents & Worksheets ({documents.length})
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              All documents prepared by your brokerage with client IEC and statutory details
            </p>
          </div>

          <Link href="/cha/dashboard/documents/create">
            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] px-3 py-1.5">
              <FilePlus className="w-3.5 h-3.5 mr-1" />
              New Document
            </Button>
          </Link>
        </div>

        {documents.length === 0 ? (
          <div className="p-10 text-center">
            <FileText className="w-10 h-10 text-slate-700 mx-auto mb-2.5" />
            <h3 className="text-xs font-bold text-white">No documents generated yet</h3>
            <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
              Launch the Customs Document Studio to prepare BoE worksheets, Shipping Bill declarations, or GATT forms.
            </p>
            <div className="mt-4">
              <Link href="/cha/dashboard/documents/create">
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Launch Document Creator
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-semibold">Document Number</th>
                  <th className="py-3 px-4 font-semibold">Document Title & Type</th>
                  <th className="py-3 px-4 font-semibold">Customer / Exporter</th>
                  <th className="py-3 px-4 font-semibold">Amount / Value</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Created Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      <Link href={`/cha/dashboard/documents/${doc.id}`} className="hover:underline">
                        {doc.documentNumber}
                      </Link>
                    </td>

                    <td className="py-3 px-4 font-medium text-white">
                      <Link href={`/cha/dashboard/documents/${doc.id}`} className="hover:text-amber-400 block">
                        {doc.documentTitle}
                      </Link>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                        {doc.type.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{doc.clientName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        IEC: {doc.clientIec || 'N/A'}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                      {doc.totalAmount ? `₹${doc.totalAmount.toLocaleString('en-IN')}` : '—'}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        doc.status === 'finalized'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : doc.status === 'submitted'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {doc.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(doc.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/cha/dashboard/documents/${doc.id}`}>
                          <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 text-[11px] px-2.5 py-1 h-7">
                            View
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Grid: Import Tools */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">
            Customs Clearance Generators & Templates
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/cha/dashboard/documents/create?type=boe_worksheet"
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-colors group flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors">
                Bill of Entry (BoE) Preparation Worksheet
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Section 46 duty assessment with HSN line items, BCD, SWS surcharge, and IGST computations before ICEGATE submission.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
              <span>Create BoE Worksheet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/cha/dashboard/documents/create?type=shipping_bill_checklist"
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-colors group flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors">
                Shipping Bill (SB) Checklist & Declaration
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Section 50 export worksheet with LUT ARN, RoDTEP/Drawback claims, AD Code, and FEMA declarations.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
              <span>Create SB Checklist</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/cha/dashboard/documents/create?type=gatt_declaration"
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-colors group flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors">
                GATT Valuation Declaration (Rule 10)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Mandatory Annexure-A questionnaire on related-party valuation, assists, royalties, and sole consideration.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
              <span>Create GATT Form</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
