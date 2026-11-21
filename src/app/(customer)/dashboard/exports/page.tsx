import React from 'react';
import {
  FileCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  Ship,
  HelpCircle,
  Clock,
  Landmark,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ExportDocumentationCenterPage() {
  const checklists = [
    {
      stage: 'Pre-Shipment Documentation',
      items: [
        { name: 'Export Quotation & Buyer Approval', required: true, status: 'Completed in ExportFlow' },
        { name: 'Proforma Invoice with Bank Swift details', required: true, status: 'Completed in ExportFlow' },
        { name: 'Advance Payment Proof or Confirmed Letter of Credit (L/C)', required: true, status: 'Verified' },
        { name: 'FCI / DGFT Active IEC (Import Export Code)', required: true, status: 'Verified' },
        { name: 'LUT (Letter of Undertaking) for 0% GST Export', required: true, status: 'Submitted on GST Portal' },
      ],
    },
    {
      stage: 'Customs & Port Handover',
      items: [
        { name: 'Commercial Invoice (Triplicate)', required: true, status: 'Generated' },
        { name: 'Export Packing List with Carton CBM & Weights', required: true, status: 'Generated' },
        { name: 'Shipping Instructions to Freight Forwarder', required: true, status: 'Ready' },
        { name: 'Shipping Bill (Filed via ICEGATE customs broker)', required: true, status: 'Assigned to CHA' },
        { name: 'Factory Stuffing / Inspection Certificate', required: false, status: 'Optional' },
      ],
    },
    {
      stage: 'Post-Shipment & Bank Realization',
      items: [
        { name: 'Original Bill of Lading (3 Original + 3 Non-Negotiable)', required: true, status: 'Awaiting Ocean Carrier' },
        { name: 'Certificate of Origin (Non-Preferential / Preferential)', required: true, status: 'Chamber of Commerce' },
        { name: 'Marine Cargo Insurance Policy Certificate', required: true, status: 'Insured' },
        { name: 'Document Dispatch to Importer Bank (DP/DA/LC)', required: true, status: 'Pending Vessel Sailing' },
        { name: 'eBRC / EDPMS Inward Remittance Realization', required: true, status: 'Pending Remittance' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with Important Regulatory Disclaimer */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#172033]">Export Documentation Center & Checklist</h1>
            <p className="text-xs text-slate-500">
              Track statutory shipping documents, customs filings, B/L drafts, and post-shipment compliance
            </p>
          </div>
        </div>

        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>Statutory Compliance Notice:</strong> ExportFlow is an exporter documentation & management system. Official government documents (such as customs Shipping Bills, ICEGATE filings, government Certificates of Origin, and carrier-signed Bills of Lading) are issued by respective authorized authorities, shipping lines, and banks. ExportFlow prepares the accurate data sheets and tracks your compliance pipeline.
          </p>
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {checklists.map((sec, idx) => (
          <Card key={idx} className="flex flex-col">
            <CardHeader className="pb-3 border-b border-slate-100">
              <span className="text-[10px] uppercase font-bold text-blue-600 block">Stage {idx + 1}</span>
              <CardTitle className="text-sm font-bold text-[#172033]">{sec.stage}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 space-y-3">
              {sec.items.map((item, i) => (
                <div key={i} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-[#172033] leading-snug">{item.name}</span>
                    {item.required && (
                      <span className="text-[9px] bg-rose-50 text-rose-600 px-1.5 py-0.2 rounded font-bold shrink-0">
                        Mandatory
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Status: <strong>{item.status}</strong></span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
