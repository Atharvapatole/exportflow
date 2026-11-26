'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  Save,
  Printer,
  Sparkles,
  CheckCircle,
  Building2,
  Calendar,
  DollarSign,
  Ship,
  HelpCircle,
  ArrowLeft,
  PenTool,
  Download,
  AlertCircle,
  Plus,
  Trash2,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ChaDocumentType, ChaDocument, SignatureAsset } from '@/types';

interface ClientOption {
  id: string;
  companyName: string;
  iecNumber: string;
  gstin?: string;
  pan?: string;
  address?: string;
  city?: string;
  state?: string;
  contactPerson?: string;
  email?: string;
}

interface JobOption {
  id: string;
  jobNumber: string;
  clientId: string;
  portCode?: string;
  jobType: 'import' | 'export';
  blAwbNumber?: string;
}

interface ChaDocumentCreatorProps {
  clients: ClientOption[];
  jobs: JobOption[];
  signatures: SignatureAsset[];
  initialClientId?: string;
  brokerFirmName: string;
  brokerLicenseNumber: string;
  brokerStation?: string;
  existingDoc?: ChaDocument;
}

const DOCUMENT_TYPES: Array<{
  type: ChaDocumentType;
  title: string;
  shortDesc: string;
  badge: string;
}> = [
  {
    type: 'boe_worksheet',
    title: 'Bill of Entry (BoE) Preparation Worksheet',
    shortDesc: 'Sec 46 Customs Act duty computation with BCD, SWS & IGST itemized breakdowns',
    badge: 'Import Clearance',
  },
  {
    type: 'shipping_bill_checklist',
    title: 'Shipping Bill (SB) Checklist & Declaration',
    shortDesc: 'Sec 50 Customs Act export filing worksheet with RoDTEP & Drawback claims',
    badge: 'Export Clearance',
  },
  {
    type: 'gatt_declaration',
    title: 'GATT Valuation Declaration (Rule 10)',
    shortDesc: 'Mandatory Annexure-A buyer-seller relationship & pricing influence disclosure',
    badge: 'Valuation Compliance',
  },
  {
    type: 'cha_authorization',
    title: 'CHA Authorization Letter (Section 146)',
    shortDesc: 'Formal appointment letter under CBLR 2018 appointing broker before Customs',
    badge: 'Legal Mandate',
  },
  {
    type: 'customs_query_reply',
    title: 'Customs Query Reply Letter',
    shortDesc: 'Formal written reply to Appraising Group / Superintendent query memo',
    badge: 'Assessment Adjudication',
  },
  {
    type: 'delivery_order_memo',
    title: 'Delivery Order & OOC Cargo Gate Pass',
    shortDesc: 'CFS & Port terminal container release memorandum post Out-of-Charge',
    badge: 'Cargo Handover',
  },
  {
    type: 'cha_duty_debit_note',
    title: 'Customs Duty Debit Note & Agency Bill',
    shortDesc: 'Direct ICEGATE ECL customs duty reimbursement statement + agency handling',
    badge: 'Billing & Accounting',
  },
  {
    type: 'customs_kyc_form',
    title: 'Importer/Exporter KYC Verification Form',
    shortDesc: 'CBIC Circular 9/2010 verified identity records and director authorization',
    badge: 'Statutory KYC',
  },
];

export function ChaDocumentCreator({
  clients,
  jobs,
  signatures,
  initialClientId,
  brokerFirmName,
  brokerLicenseNumber,
  brokerStation = 'Nhava Sheva (INNSA1)',
  existingDoc,
}: ChaDocumentCreatorProps) {
  const router = useRouter();

  // Selected document type
  const [docType, setDocType] = useState<ChaDocumentType>(existingDoc?.type || 'boe_worksheet');
  
  // Selected client
  const [selectedClientId, setSelectedClientId] = useState<string>(
    existingDoc?.clientId || initialClientId || (clients[0]?.id || '')
  );

  // Selected job
  const [selectedJobId, setSelectedJobId] = useState<string>(existingDoc?.jobId || '');

  // Core metadata
  const [docDate, setDocDate] = useState<string>(
    existingDoc?.date || new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>(existingDoc?.notes || '');
  const [signatureUrl, setSignatureUrl] = useState<string>(
    existingDoc?.signatureUrl ||
      signatures.find((s) => s.assetType === 'signature' || s.assetType === 'both')?.imageUrl ||
      signatures[0]?.processedPngUrl ||
      ''
  );
  const [stampUrl, setStampUrl] = useState<string>(
    existingDoc?.stampUrl ||
      signatures.find((s) => s.assetType === 'company_stamp' || s.assetType === 'both')?.stampImageUrl ||
      signatures.find((s) => s.assetType === 'company_stamp')?.imageUrl ||
      ''
  );
  const [includeSignature, setIncludeSignature] = useState<boolean>(true);
  const [includeStamp, setIncludeStamp] = useState<boolean>(true);

  // Active client object
  const currentClient = useMemo(() => {
    return clients.find((c) => c.id === selectedClientId) || null;
  }, [clients, selectedClientId]);

  // Active job object
  const currentJob = useMemo(() => {
    return jobs.find((j) => j.id === selectedJobId) || null;
  }, [jobs, selectedJobId]);

  // Filter jobs for selected client
  const availableJobs = useMemo(() => {
    if (!selectedClientId) return jobs;
    return jobs.filter((j) => j.clientId === selectedClientId);
  }, [jobs, selectedClientId]);

  // Form State for different document types
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    if (existingDoc?.data) return existingDoc.data;

    return {
      // Common / BoE
      portCode: 'INNSA1',
      assessmentGroup: 'Group 5A (Machinery & Mechanical)',
      beType: 'Regular Bill of Entry (Home Consumption)',
      invoiceNumber: 'INV-2026/8892',
      invoiceCurrency: 'USD',
      exchangeRate: 86.85,
      cifInvoiceValue: 24500,
      freightInr: 45000,
      insuranceInr: 3500,
      items: [
        {
          hsn: '84713010',
          desc: 'Industrial Automation Controller Units with Processor Modules',
          qty: 25,
          unit: 'NOS',
          priceInr: 85000,
          bcdRate: 7.5,
          swsRate: 10,
          igstRate: 18,
        },
      ],

      // Shipping Bill Checklist
      portOfLoading: 'Nhava Sheva (INNSA1)',
      portOfDischarge: 'Jebel Ali (AEJEA)',
      destinationCountry: 'United Arab Emirates',
      sbScheme: 'RoDTEP (Scheme Code 60)',
      gstLutArn: 'AD270425001234F',
      lutDate: '2026-04-01',
      adCode: '0293847',
      fobValueInr: 1850000,
      rodtepRate: 1.8,

      // GATT Declaration
      sellerName: 'Global Precision Engineering Ltd, Frankfurt, Germany',
      relationshipDeclared: 'Unrelated (Rule 2(2) Customs Valuation Rules)',
      priceInfluence: 'Price is sole consideration; not influenced by relationship',
      rule10Additions: 'Nil royalties or license fees',

      // Query Reply
      queryMemoNumber: 'QM-INNSA1-GR5-2026-0041',
      queryDate: new Date().toISOString().split('T')[0],
      queryText: 'Please clarify HSN classification under 8471 vs 8537 and furnish technical catalogue.',
      replyBody: 'With reference to the query raised by the Appraising Officer, we submit that the imported items are dedicated digital processing units specifically classified under HSN 84713010. Technical catalogue and manufacturer test report are enclosed herewith.',

      // Delivery Order
      shippingLineName: 'Maersk Line India Pvt Ltd',
      doNumber: 'DO-MAEU-9928172',
      containerNumber: 'MSKU-8273619 (40ft High Cube)',
      sealNumber: 'ML-IN-88273',
      transporterName: 'Om Freight Carriers Logistics',
      truckNumber: 'MH-46-BB-2981',
      driverPhone: '+91 98201 12345',
      oocNumber: 'OOC/INNSA1/2026/49102',

      // Duty Debit Note
      eclDutyAmount: 284500,
      cfsCharges: 14500,
      thcCharges: 8500,
      agencyFee: 9500,
      agencyGstRate: 18,
    };
  });

  // Calculate live BoE duty totals
  const boeTotals = useMemo(() => {
    const exchange = Number(formData.exchangeRate) || 86.85;
    const cifInr = (Number(formData.cifInvoiceValue) || 0) * exchange;
    const assessableValue = cifInr + (Number(formData.freightInr) || 0) + (Number(formData.insuranceInr) || 0);

    let totalBcd = 0;
    let totalSws = 0;
    let totalIgst = 0;

    const items = formData.items || [];
    items.forEach((item: any) => {
      const itemVal = (Number(item.qty) || 1) * (Number(item.priceInr) || 0);
      const bcd = (itemVal * (Number(item.bcdRate) || 0)) / 100;
      const sws = (bcd * (Number(item.swsRate) || 10)) / 100;
      const igstBase = itemVal + bcd + sws;
      const igst = (igstBase * (Number(item.igstRate) || 18)) / 100;

      totalBcd += bcd;
      totalSws += sws;
      totalIgst += igst;
    });

    const totalDuty = totalBcd + totalSws + totalIgst;
    return {
      assessableValue: Math.round(assessableValue),
      totalBcd: Math.round(totalBcd),
      totalSws: Math.round(totalSws),
      totalIgst: Math.round(totalIgst),
      totalDuty: Math.round(totalDuty),
    };
  }, [formData]);

  // Calculate Debit note totals
  const debitNoteTotals = useMemo(() => {
    const ecl = Number(formData.eclDutyAmount) || 0;
    const cfs = Number(formData.cfsCharges) || 0;
    const thc = Number(formData.thcCharges) || 0;
    const agency = Number(formData.agencyFee) || 0;
    const gst = (agency * (Number(formData.agencyGstRate) || 18)) / 100;
    const grandTotal = ecl + cfs + thc + agency + gst;
    return {
      ecl,
      cfs,
      thc,
      agency,
      gst: Math.round(gst),
      grandTotal: Math.round(grandTotal),
    };
  }, [formData]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFieldChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleItemChange = (index: number, field: string, val: any) => {
    setFormData((prev) => {
      const updated = [...(prev.items || [])];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, items: updated };
    });
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...(prev.items || []),
        {
          hsn: '84713010',
          desc: 'New Electronic / Mechanical Component Line Item',
          qty: 1,
          unit: 'NOS',
          priceInr: 10000,
          bcdRate: 7.5,
          swsRate: 10,
          igstRate: 18,
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    setFormData((prev) => {
      const updated = [...(prev.items || [])];
      updated.splice(index, 1);
      return { ...prev, items: updated };
    });
  };

  const selectedDocConfig = DOCUMENT_TYPES.find((d) => d.type === docType)!;

  const handleSave = async (status: 'draft' | 'finalized') => {
    if (!currentClient) {
      setErrorMsg('Please select a customer/client first');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const totalAmt =
        docType === 'boe_worksheet'
          ? boeTotals.totalDuty
          : docType === 'cha_duty_debit_note'
          ? debitNoteTotals.grandTotal
          : Number(formData.fobValueInr) || 0;

      const payload = {
        clientId: currentClient.id,
        clientName: currentClient.companyName,
        clientIec: currentClient.iecNumber,
        clientGstin: currentClient.gstin,
        clientPan: currentClient.pan,
        jobId: currentJob?.id || undefined,
        jobNumber: currentJob?.jobNumber || undefined,
        type: docType,
        documentTitle: selectedDocConfig.title,
        date: docDate,
        status,
        data: formData,
        totalAmount: totalAmt,
        currency: 'INR',
        notes,
        signatureUrl: includeSignature ? signatureUrl : undefined,
        stampUrl: includeStamp ? stampUrl : undefined,
      };

      const res = await fetch('/api/cha/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save document');
      }

      setSuccessMsg(`Document ${data.document.documentNumber} saved successfully as ${status}!`);
      setTimeout(() => {
        router.push(`/cha/dashboard/documents/${data.document.id}`);
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <Link href="/cha/dashboard/customers">
            <Button size="sm" variant="outline" className="border-slate-800 text-slate-300 hover:bg-slate-800 h-9 px-3 text-xs">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Customer Hub
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                CHA Document Studio
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400 font-mono">CBLR 2018 Regulation 10</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-0.5">
              Customs Document Generator & Duty Engine
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePrint}
            className="border-slate-700 text-slate-200 hover:bg-slate-800 text-xs px-3 py-2"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
            Print / PDF
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => handleSave('draft')}
            className="border-slate-700 text-slate-200 hover:bg-slate-800 text-xs px-3 py-2"
          >
            <Save className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            Save Draft
          </Button>
          <Button
            size="sm"
            disabled={isSubmitting}
            onClick={() => handleSave('finalized')}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border-0 text-xs px-3.5 py-2 shadow-sm"
          >
            <Check className="w-3.5 h-3.5 mr-1.5" />
            Finalize & Save
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 no-print">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 no-print">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Document Type Selector Carousel / Grid */}
      <div className="no-print">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          1. Select Customs Document Type
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {DOCUMENT_TYPES.map((dt) => {
            const isSelected = docType === dt.type;
            return (
              <button
                key={dt.type}
                type="button"
                onClick={() => setDocType(dt.type)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500 text-white shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {dt.badge}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <div className="font-bold text-xs mt-2 text-white line-clamp-1">{dt.title}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{dt.shortDesc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Customer & Job Link Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            2. Customer / Exporter Firm *
          </label>
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="">-- Choose Client --</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName} (IEC: {c.iecNumber})
              </option>
            ))}
          </select>
          {currentClient && (
            <p className="text-[10px] text-slate-500 mt-1 font-mono">
              PAN: {currentClient.pan || 'N/A'} • GST: {currentClient.gstin || 'N/A'}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            3. Link to Clearance Job (Optional)
          </label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="">-- Standalone Document (No Job) --</option>
            {availableJobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.jobNumber} • {j.jobType.toUpperCase()} ({j.portCode || 'Port'})
              </option>
            ))}
          </select>
          <p className="text-[10px] text-slate-500 mt-1">
            Links document directly to the job timeline and e-SANCHIT dossier.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            4. Document Date & Port Station
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={docDate}
              onChange={(e) => setDocDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            />
            <input
              type="text"
              value={formData.portCode || 'INNSA1'}
              onChange={(e) => handleFieldChange('portCode', e.target.value)}
              placeholder="Port Code"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Main Split Layout: Editor (Left) & Official Live Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Editor Controls (6 cols) */}
        <div className="lg:col-span-5 space-y-5 no-print">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                Document Specifications
              </h2>
              <span className="text-[11px] text-amber-400 font-mono font-bold">
                {selectedDocConfig.badge}
              </span>
            </div>

            {/* Document Specific Fields */}
            {docType === 'boe_worksheet' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Assessment Group
                    </label>
                    <input
                      type="text"
                      value={formData.assessmentGroup || ''}
                      onChange={(e) => handleFieldChange('assessmentGroup', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      BoE Type
                    </label>
                    <select
                      value={formData.beType || ''}
                      onChange={(e) => handleFieldChange('beType', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    >
                      <option value="Home Consumption (Regular)">Home Consumption (White)</option>
                      <option value="In-Bond (Into Warehouse)">Into-Bond (Yellow)</option>
                      <option value="Ex-Bond (Green)">Ex-Bond (Green)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                      Invoice Value ($)
                    </label>
                    <input
                      type="number"
                      value={formData.cifInvoiceValue || 0}
                      onChange={(e) => handleFieldChange('cifInvoiceValue', parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                      Exchange Rate (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.exchangeRate || 86.85}
                      onChange={(e) => handleFieldChange('exchangeRate', parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                      Freight INR
                    </label>
                    <input
                      type="number"
                      value={formData.freightInr || 0}
                      onChange={(e) => handleFieldChange('freightInr', parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Invoice Items ({formData.items?.length || 0})</span>
                    <button
                      type="button"
                      onClick={addItem}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Item
                    </button>
                  </div>

                  {(formData.items || []).map((item: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          placeholder="HSN Code (8 digits)"
                          value={item.hsn}
                          onChange={(e) => handleItemChange(idx, 'hsn', e.target.value)}
                          className="w-32 px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[11px] text-amber-400 font-mono font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="text-slate-500 hover:text-red-400 p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="Item Description"
                        value={item.desc}
                        onChange={(e) => handleItemChange(idx, 'desc', e.target.value)}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                      />

                      <div className="grid grid-cols-4 gap-1.5 text-[10px]">
                        <div>
                          <span className="text-slate-500">Qty</span>
                          <input
                            type="number"
                            value={item.qty}
                            onChange={(e) => handleItemChange(idx, 'qty', parseFloat(e.target.value) || 0)}
                            className="w-full px-1.5 py-1 bg-slate-900 border border-slate-800 rounded text-white"
                          />
                        </div>
                        <div>
                          <span className="text-slate-500">Price (₹)</span>
                          <input
                            type="number"
                            value={item.priceInr}
                            onChange={(e) => handleItemChange(idx, 'priceInr', parseFloat(e.target.value) || 0)}
                            className="w-full px-1.5 py-1 bg-slate-900 border border-slate-800 rounded text-white"
                          />
                        </div>
                        <div>
                          <span className="text-slate-500">BCD %</span>
                          <input
                            type="number"
                            value={item.bcdRate}
                            onChange={(e) => handleItemChange(idx, 'bcdRate', parseFloat(e.target.value) || 0)}
                            className="w-full px-1.5 py-1 bg-slate-900 border border-slate-800 rounded text-white"
                          />
                        </div>
                        <div>
                          <span className="text-slate-500">IGST %</span>
                          <input
                            type="number"
                            value={item.igstRate}
                            onChange={(e) => handleItemChange(idx, 'igstRate', parseFloat(e.target.value) || 0)}
                            className="w-full px-1.5 py-1 bg-slate-900 border border-slate-800 rounded text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {docType === 'shipping_bill_checklist' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Export Scheme
                    </label>
                    <select
                      value={formData.sbScheme || ''}
                      onChange={(e) => handleFieldChange('sbScheme', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    >
                      <option value="RoDTEP (Scheme Code 60)">RoDTEP (Code 60)</option>
                      <option value="Duty Drawback (Code 19)">Duty Drawback (Code 19)</option>
                      <option value="RoSCTL (Code 61)">RoSCTL (Code 61)</option>
                      <option value="Advance Authorization (Code 01)">Advance Authorization (Code 01)</option>
                      <option value="Free Shipping Bill (Code 00)">Free Shipping Bill (Code 00)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      FOB Value (INR)
                    </label>
                    <input
                      type="number"
                      value={formData.fobValueInr || 0}
                      onChange={(e) => handleFieldChange('fobValueInr', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      GST LUT ARN
                    </label>
                    <input
                      type="text"
                      value={formData.gstLutArn || ''}
                      onChange={(e) => handleFieldChange('gstLutArn', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Destination Country & Port
                    </label>
                    <input
                      type="text"
                      value={formData.destinationCountry || ''}
                      onChange={(e) => handleFieldChange('destinationCountry', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {docType === 'customs_query_reply' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Customs Query Memo Number
                  </label>
                  <input
                    type="text"
                    value={formData.queryMemoNumber || ''}
                    onChange={(e) => handleFieldChange('queryMemoNumber', e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Appraiser Query Raised
                  </label>
                  <textarea
                    rows={2}
                    value={formData.queryText || ''}
                    onChange={(e) => handleFieldChange('queryText', e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    CHA Official Clarification & Reply
                  </label>
                  <textarea
                    rows={4}
                    value={formData.replyBody || ''}
                    onChange={(e) => handleFieldChange('replyBody', e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>
            )}

            {docType === 'cha_duty_debit_note' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Customs Duty Paid (ICEGATE ECL)
                    </label>
                    <input
                      type="number"
                      value={formData.eclDutyAmount || 0}
                      onChange={(e) => handleFieldChange('eclDutyAmount', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Agency Service Fee
                    </label>
                    <input
                      type="number"
                      value={formData.agencyFee || 0}
                      onChange={(e) => handleFieldChange('agencyFee', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      CFS Destuffing / Ground Rent
                    </label>
                    <input
                      type="number"
                      value={formData.cfsCharges || 0}
                      onChange={(e) => handleFieldChange('cfsCharges', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Terminal Handling (THC)
                    </label>
                    <input
                      type="number"
                      value={formData.thcCharges || 0}
                      onChange={(e) => handleFieldChange('thcCharges', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {docType === 'delivery_order_memo' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Shipping Line / Carrier
                    </label>
                    <input
                      type="text"
                      value={formData.shippingLineName || ''}
                      onChange={(e) => handleFieldChange('shippingLineName', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Delivery Order (DO) Ref
                    </label>
                    <input
                      type="text"
                      value={formData.doNumber || ''}
                      onChange={(e) => handleFieldChange('doNumber', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Container & Seal Number
                    </label>
                    <input
                      type="text"
                      value={formData.containerNumber || ''}
                      onChange={(e) => handleFieldChange('containerNumber', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Truck Vehicle Reg Number
                    </label>
                    <input
                      type="text"
                      value={formData.truckNumber || ''}
                      onChange={(e) => handleFieldChange('truckNumber', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Signature & Stamp Controls */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-amber-400" />
                Signatures & Stamp Endorsements
              </span>

              <div className="flex items-center gap-4 text-xs text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeSignature}
                    onChange={(e) => setIncludeSignature(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-0"
                  />
                  <span>Affix CHA Digital Signature</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeStamp}
                    onChange={(e) => setIncludeStamp(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-0"
                  />
                  <span>Affix Agency Seal / Stamp</span>
                </label>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Internal Notes / Clearance Remarks
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Remarks for ICEGATE records or client dossier..."
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Live A4 Document Preview (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white text-slate-900 rounded-2xl p-8 shadow-2xl border border-slate-200 min-h-[750px] relative font-serif print:p-0 print:border-none print:shadow-none print:m-0 print:rounded-none">
            {/* Government / CBIC Official Header */}
            <div className="border-b-2 border-slate-900 pb-4 text-center">
              <div className="text-[10px] uppercase tracking-widest font-sans font-bold text-slate-600">
                Indian Customs Regulatory Compliance • CBLR 2018 Regulation 10
              </div>
              <h1 className="text-lg font-bold uppercase tracking-tight text-slate-900 font-sans mt-1">
                {selectedDocConfig.title}
              </h1>
              <div className="text-xs text-slate-600 font-sans mt-0.5">
                Customs Station: <strong>{formData.portCode || brokerStation}</strong> • ICEGATE Electronic Worksheet
              </div>
            </div>

            {/* Brokerage & Client Details Bar */}
            <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-300 font-sans text-xs">
              <div>
                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block">
                  Customs Brokerage (CHA)
                </span>
                <div className="font-bold text-slate-900">{brokerFirmName}</div>
                <div className="text-[11px] text-slate-600 font-mono">
                  CB License: {brokerLicenseNumber}
                </div>
                <div className="text-[11px] text-slate-600">
                  Customs Jurisdiction: {brokerStation}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block">
                  Importer / Exporter Client
                </span>
                <div className="font-bold text-slate-900">
                  {currentClient?.companyName || 'Sample Exporter Private Limited'}
                </div>
                <div className="text-[11px] font-mono text-slate-700">
                  IEC: <strong>{currentClient?.iecNumber || '0394827101'}</strong> • GST: {currentClient?.gstin || '27AABCU9603R1ZM'}
                </div>
                <div className="text-[11px] text-slate-600">
                  Date: {new Date(docDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Document Specific Body */}
            <div className="py-5 font-sans space-y-4 text-xs">
              {docType === 'boe_worksheet' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 bg-slate-100 p-2.5 rounded border border-slate-200 text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Assessment Group</span>
                      <strong className="text-slate-800">{formData.assessmentGroup}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">CIF Value / Exchange</span>
                      <strong className="text-slate-800">
                        ${formData.cifInvoiceValue} @ ₹{formData.exchangeRate}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block text-[10px]">Assessable Value (AV)</span>
                      <strong className="text-slate-900 font-mono text-xs">
                        ₹{boeTotals.assessableValue.toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>

                  {/* Items Table */}
                  <table className="w-full text-left text-[11px] border border-slate-300">
                    <thead className="bg-slate-200 border-b border-slate-300 text-slate-700">
                      <tr>
                        <th className="p-1.5 font-bold">HSN Code</th>
                        <th className="p-1.5 font-bold">Goods Description</th>
                        <th className="p-1.5 font-bold text-center">Qty</th>
                        <th className="p-1.5 font-bold text-right">Value (₹)</th>
                        <th className="p-1.5 font-bold text-right">BCD</th>
                        <th className="p-1.5 font-bold text-right">IGST</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {(formData.items || []).map((it: any, i: number) => (
                        <tr key={i}>
                          <td className="p-1.5 font-mono font-bold text-blue-800">{it.hsn}</td>
                          <td className="p-1.5">{it.desc}</td>
                          <td className="p-1.5 text-center font-mono">
                            {it.qty} {it.unit}
                          </td>
                          <td className="p-1.5 text-right font-mono">
                            ₹{((it.qty || 1) * (it.priceInr || 0)).toLocaleString('en-IN')}
                          </td>
                          <td className="p-1.5 text-right font-mono">{it.bcdRate}%</td>
                          <td className="p-1.5 text-right font-mono">{it.igstRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Duty Computations */}
                  <div className="border border-slate-300 rounded p-3 bg-slate-50 space-y-1 text-xs font-mono">
                    <div className="flex justify-between text-slate-700">
                      <span>Basic Customs Duty (BCD):</span>
                      <span>₹{boeTotals.totalBcd.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Social Welfare Surcharge (SWS 10% on BCD):</span>
                      <span>₹{boeTotals.totalSws.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Integrated GST (IGST 18%):</span>
                      <span>₹{boeTotals.totalIgst.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-300 font-bold text-sm text-slate-900">
                      <span>Total Estimated Customs Duty Payable:</span>
                      <span className="text-emerald-700">₹{boeTotals.totalDuty.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              )}

              {docType === 'shipping_bill_checklist' && (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-100 rounded border border-slate-200 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 block">Export Scheme:</span>
                        <strong className="text-slate-800">{formData.sbScheme}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">GST LUT ARN:</span>
                        <strong className="font-mono text-slate-800">{formData.gstLutArn}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">FOB Value (INR):</span>
                        <strong className="font-mono text-slate-800 text-sm">
                          ₹{Number(formData.fobValueInr).toLocaleString('en-IN')}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Discharge & Country:</span>
                        <strong className="text-slate-800">{formData.destinationCountry}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 border border-slate-200 rounded text-slate-700 leading-relaxed text-[11px]">
                    <strong>Statutory Exporter Declaration:</strong> We declare that the particulars given above are true and correct. We undertake to abide by the provisions of Foreign Exchange Management Act (FEMA) 1999 and Customs Act 1962.
                  </div>
                </div>
              )}

              {docType === 'customs_query_reply' && (
                <div className="space-y-3">
                  <div className="bg-slate-100 p-2.5 rounded border border-slate-200 text-xs">
                    <span className="text-slate-500 block">Reference Query Memo:</span>
                    <strong className="font-mono text-slate-900">{formData.queryMemoNumber}</strong>
                  </div>
                  <div className="text-xs text-slate-700 font-bold uppercase tracking-wider">
                    To: The Appraising Officer / Assistant Commissioner of Customs
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed italic border-l-2 border-slate-400 pl-3">
                    &ldquo;{formData.queryText}&rdquo;
                  </p>
                  <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {formData.replyBody}
                  </p>
                </div>
              )}

              {docType === 'cha_duty_debit_note' && (
                <div className="space-y-4">
                  <table className="w-full text-left text-xs border border-slate-300">
                    <thead className="bg-slate-200 text-slate-700">
                      <tr>
                        <th className="p-2 font-bold">Particulars / Disbursements</th>
                        <th className="p-2 font-bold text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      <tr>
                        <td className="p-2">Customs Duty Paid via ICEGATE ECL (Reimbursement)</td>
                        <td className="p-2 text-right">₹{debitNoteTotals.ecl.toLocaleString('en-IN')}</td>
                      </tr>
                      <tr>
                        <td className="p-2">CFS Ground Rent & Destuffing Handling</td>
                        <td className="p-2 text-right">₹{debitNoteTotals.cfs.toLocaleString('en-IN')}</td>
                      </tr>
                      <tr>
                        <td className="p-2">Terminal Handling Charges (THC)</td>
                        <td className="p-2 text-right">₹{debitNoteTotals.thc.toLocaleString('en-IN')}</td>
                      </tr>
                      <tr>
                        <td className="p-2">CHA Agency Professional Documentation Fee</td>
                        <td className="p-2 text-right">₹{debitNoteTotals.agency.toLocaleString('en-IN')}</td>
                      </tr>
                      <tr>
                        <td className="p-2">GST on Agency Service Fee (18%)</td>
                        <td className="p-2 text-right">₹{debitNoteTotals.gst.toLocaleString('en-IN')}</td>
                      </tr>
                      <tr className="bg-slate-100 font-bold text-sm text-slate-900">
                        <td className="p-2">Total Payable to Customs Broker:</td>
                        <td className="p-2 text-right text-emerald-800">
                          ₹{debitNoteTotals.grandTotal.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {docType === 'delivery_order_memo' && (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3 bg-slate-100 p-3 rounded border border-slate-200">
                    <div>
                      <span className="text-slate-500 block">Shipping Line DO #:</span>
                      <strong className="font-mono text-slate-900">{formData.doNumber}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Container & Seal:</span>
                      <strong className="font-mono text-slate-900">{formData.containerNumber}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Transporter:</span>
                      <strong className="text-slate-900">{formData.transporterName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Vehicle Reg #:</span>
                      <strong className="font-mono text-slate-900">{formData.truckNumber}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Signature & Stamp Endorsements */}
            <div className="pt-8 mt-12 border-t-2 border-slate-900 flex items-end justify-between font-sans text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                  Customs Station Out-of-Charge Verification
                </span>
                <div className="text-[11px] font-mono text-slate-600">
                  Electronic Seal ID: ES-CBIC-{Date.now().toString().slice(-8)}
                </div>
                {includeStamp && stampUrl ? (
                  <div className="mt-2">
                    <img
                      src={stampUrl}
                      alt="Agency Stamp"
                      className="w-20 h-20 object-contain opacity-90 mix-blend-multiply"
                    />
                  </div>
                ) : (
                  includeStamp && (
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-400 flex items-center justify-center text-[9px] text-slate-400 text-center uppercase p-1">
                      Broker Stamp Here
                    </div>
                  )
                )}
              </div>

              <div className="text-right space-y-1">
                {includeSignature && signatureUrl ? (
                  <div className="flex justify-end mb-1">
                    <img
                      src={signatureUrl}
                      alt="Authorized Signature"
                      className="h-12 object-contain mix-blend-multiply"
                    />
                  </div>
                ) : (
                  includeSignature && (
                    <div className="h-10 border-b border-slate-400 w-36 ml-auto mb-1"></div>
                  )
                )}
                <div className="font-bold text-slate-900">Authorized Customs Broker Signatory</div>
                <div className="text-[11px] text-slate-600 font-mono">
                  License: {brokerLicenseNumber}
                </div>
                <div className="text-[10px] text-slate-500">
                  For and on behalf of {brokerFirmName}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
