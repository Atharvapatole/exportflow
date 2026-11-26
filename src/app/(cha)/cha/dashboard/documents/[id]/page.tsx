import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  FileText,
  Printer,
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle,
  PenTool,
} from 'lucide-react';
import { getCurrentContext } from '@/lib/auth';
import { chaDocRepo } from '@/lib/db';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function ViewChaDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getCurrentContext();
  const orgId = ctx?.organization?.id || '';

  const doc = await chaDocRepo.findById(id);
  if (!doc || doc.chaOrgId !== orgId) {
    notFound();
  }

  const brokerFirmName = ctx?.organization?.name || 'Customs Brokerage Firm';
  const brokerLicenseNumber = ctx?.organization?.chaLicenseNumber || 'CHA-LIC-REG10';
  const brokerStation = ctx?.organization?.chaLicenseAuthority || 'Nhava Sheva (INNSA1)';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <Link href="/cha/dashboard/customers">
            <Button size="sm" variant="outline" className="border-slate-800 text-slate-300 hover:bg-slate-800 text-xs">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Customer Hub
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {doc.documentNumber}
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                doc.status === 'finalized'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : doc.status === 'submitted'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {doc.status}
              </span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-1">{doc.documentTitle}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href={`/cha/dashboard/documents/create?clientId=${doc.clientId}`}>
            <Button size="sm" variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800 text-xs">
              + New Doc for {doc.clientName.split(' ')[0]}
            </Button>
          </Link>
          <button
            onClick={() => {}}
            // @ts-ignore
            className="print-trigger hidden"
          />
          <Link href="/cha/dashboard/customers">
            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border-0 text-xs">
              Back to Customers
            </Button>
          </Link>
        </div>
      </div>

      {/* Render Document Document Card */}
      <div className="max-w-4xl mx-auto bg-white text-slate-900 rounded-2xl p-10 shadow-2xl border border-slate-200 min-h-[750px] font-sans print:p-0 print:border-none print:shadow-none print:m-0 print:rounded-none">
        {/* Header */}
        <div className="border-b-2 border-slate-900 pb-4 text-center">
          <div className="text-[10px] uppercase tracking-widest font-bold text-slate-600">
            Indian Customs Regulatory Compliance • CBLR 2018 Regulation 10
          </div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900 mt-1">
            {doc.documentTitle}
          </h1>
          <div className="text-xs text-slate-600 mt-0.5">
            Document No: <strong className="font-mono text-slate-900">{doc.documentNumber}</strong> • Customs Station: {brokerStation}
          </div>
        </div>

        {/* Broker & Client Info */}
        <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-300 text-xs">
          <div>
            <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block">
              Customs Brokerage (CHA)
            </span>
            <div className="font-bold text-slate-900 text-sm">{brokerFirmName}</div>
            <div className="text-[11px] text-slate-600 font-mono">
              CB License: {brokerLicenseNumber}
            </div>
            <div className="text-[11px] text-slate-600">
              Customs Station: {brokerStation}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block">
              Importer / Exporter Client
            </span>
            <div className="font-bold text-slate-900 text-sm">{doc.clientName}</div>
            <div className="text-[11px] font-mono text-slate-700">
              IEC: <strong>{doc.clientIec || 'N/A'}</strong> {doc.clientGstin ? `• GST: ${doc.clientGstin}` : ''}
            </div>
            <div className="text-[11px] text-slate-600">
              Issued Date: {new Date(doc.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Body content based on doc.data */}
        <div className="py-6 space-y-4 text-xs">
          {doc.type === 'boe_worksheet' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 bg-slate-100 p-3 rounded border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[10px]">Assessment Group</span>
                  <strong className="text-slate-800">{doc.data.assessmentGroup}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">CIF Value / Exchange</span>
                  <strong className="text-slate-800 font-mono">
                    ${doc.data.cifInvoiceValue} @ ₹{doc.data.exchangeRate}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px]">Assessable Value (AV)</span>
                  <strong className="text-slate-900 font-mono text-sm">
                    ₹{(doc.totalAmount || 0).toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>

              {doc.data.items && doc.data.items.length > 0 && (
                <table className="w-full text-left text-xs border border-slate-300">
                  <thead className="bg-slate-200 text-slate-700">
                    <tr>
                      <th className="p-2 font-bold">HSN Code</th>
                      <th className="p-2 font-bold">Goods Description</th>
                      <th className="p-2 font-bold text-center">Qty</th>
                      <th className="p-2 font-bold text-right">Value (₹)</th>
                      <th className="p-2 font-bold text-right">BCD</th>
                      <th className="p-2 font-bold text-right">IGST</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {doc.data.items.map((it: any, i: number) => (
                      <tr key={i}>
                        <td className="p-2 font-mono font-bold text-blue-800">{it.hsn}</td>
                        <td className="p-2">{it.desc}</td>
                        <td className="p-2 text-center font-mono">{it.qty} {it.unit}</td>
                        <td className="p-2 text-right font-mono">
                          ₹{((it.qty || 1) * (it.priceInr || 0)).toLocaleString('en-IN')}
                        </td>
                        <td className="p-2 text-right font-mono">{it.bcdRate}%</td>
                        <td className="p-2 text-right font-mono">{it.igstRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {doc.type === 'shipping_bill_checklist' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-100 rounded border border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 block">Export Scheme:</span>
                  <strong className="text-slate-800">{doc.data.sbScheme}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">GST LUT ARN:</span>
                  <strong className="font-mono text-slate-800">{doc.data.gstLutArn}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">FOB Value (INR):</span>
                  <strong className="font-mono text-slate-800 text-sm">
                    ₹{Number(doc.data.fobValueInr || 0).toLocaleString('en-IN')}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Destination:</span>
                  <strong className="text-slate-800">{doc.data.destinationCountry}</strong>
                </div>
              </div>
            </div>
          )}

          {doc.type === 'customs_query_reply' && (
            <div className="space-y-4">
              <div className="bg-slate-100 p-3 rounded border border-slate-200">
                <span className="text-slate-500 block">Query Memo Ref:</span>
                <strong className="font-mono text-slate-900">{doc.data.queryMemoNumber}</strong>
              </div>
              <p className="italic text-slate-700 border-l-2 border-slate-400 pl-3">
                &ldquo;{doc.data.queryText}&rdquo;
              </p>
              <p className="text-slate-900 whitespace-pre-wrap leading-relaxed">
                {doc.data.replyBody}
              </p>
            </div>
          )}

          {doc.type === 'cha_duty_debit_note' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 border border-slate-300 rounded space-y-2">
                <div className="flex justify-between">
                  <span>Customs Duty Paid via ICEGATE ECL:</span>
                  <strong className="font-mono">₹{Number(doc.data.eclDutyAmount || 0).toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between">
                  <span>CFS Destuffing / Handling:</span>
                  <strong className="font-mono">₹{Number(doc.data.cfsCharges || 0).toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Terminal Handling Charges (THC):</span>
                  <strong className="font-mono">₹{Number(doc.data.thcCharges || 0).toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Agency Professional Fee:</span>
                  <strong className="font-mono">₹{Number(doc.data.agencyFee || 0).toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-300 font-bold text-sm">
                  <span>Total Amount Due:</span>
                  <span className="text-emerald-700 font-mono">₹{(doc.totalAmount || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}

          {doc.notes && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600">
              <strong>Clearance Remarks:</strong> {doc.notes}
            </div>
          )}
        </div>

        {/* Footer Signatures */}
        <div className="pt-8 mt-12 border-t-2 border-slate-900 flex items-end justify-between text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
              Official Seal / Verification
            </span>
            {doc.stampUrl ? (
              <img src={doc.stampUrl} alt="Stamp" className="w-20 h-20 object-contain mt-2 mix-blend-multiply" />
            ) : (
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-400 flex items-center justify-center text-[9px] text-slate-400 text-center uppercase p-1 mt-2">
                Verified Broker Seal
              </div>
            )}
          </div>

          <div className="text-right">
            {doc.signatureUrl ? (
              <div className="flex justify-end mb-1">
                <img src={doc.signatureUrl} alt="Signature" className="h-12 object-contain mix-blend-multiply" />
              </div>
            ) : (
              <div className="h-10 border-b border-slate-400 w-36 ml-auto mb-1"></div>
            )}
            <div className="font-bold text-slate-900">Authorized Customs Broker Signatory</div>
            <div className="text-[11px] text-slate-600 font-mono">License: {brokerLicenseNumber}</div>
            <div className="text-[10px] text-slate-500">For and on behalf of {brokerFirmName}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
