'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileCheck,
  FileText,
  Ship,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CustomsJob, AiDocumentReview } from '@/types';

interface AiCheckerConsoleProps {
  jobs: CustomsJob[];
}

export function AiCheckerConsole({ jobs }: AiCheckerConsoleProps) {
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id || '');
  const [isLoading, setIsLoading] = useState(false);
  const [review, setReview] = useState<AiDocumentReview | null>(null);

  const [ciData, setCiData] = useState({
    invoiceNumber: 'EXP/2026/089',
    buyerName: 'Al-Mansoor Trading LLC (Dubai, UAE)',
    totalQuantity: 500,
    currency: 'USD',
    totalAmount: 48500,
    incoterm: 'CIF Jebel Ali',
    hsCodes: '8481.80.30',
  });

  const [plData, setPlData] = useState({
    packingListNumber: 'PL/2026/089',
    totalQuantity: 500,
    totalPackages: 25,
    grossWeightKg: 1450,
    netWeightKg: 1380,
  });

  const [blData, setBlData] = useState({
    blNumber: 'MAEU890123456',
    consignee: 'Al-Mansoor Trading LLC (Dubai, UAE)',
    grossWeightKg: 1450,
    portOfLoading: 'Nhava Sheva (INNSA1)',
    portOfDischarge: 'Jebel Ali (AEJEA)',
  });

  const [poData, setPoData] = useState({
    poNumber: 'PO-UAE-9921',
    buyerName: 'Al-Mansoor Trading LLC',
    currency: 'USD',
    poAmount: 48500,
  });

  const handleRunCheck = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/document-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: selectedJobId,
          commercialInvoice: ciData,
          packingList: plData,
          billOfLading: blData,
          purchaseOrder: poData,
        }),
      });
      const data = await res.json();
      if (res.ok && data.review) {
        setReview(data.review);
      }
    } catch {} finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/cha/dashboard/documents"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">AI Cross-Document Discrepancy Checker</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" /> OpenRouter • Groq • Gemini
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Cross-references CI, Packing List, Bill of Lading, and Purchase Order before filing with ICEGATE
            </p>
          </div>
        </div>

        <Button
          onClick={handleRunCheck}
          isLoading={isLoading}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold border-0 text-xs px-5 py-2.5 shadow-lg shadow-purple-500/20"
        >
          <Sparkles className="w-4 h-4 mr-1.5" />
          Run Cross-Document Inspection
        </Button>
      </div>

      {/* Input Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Commercial Invoice */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase">
            <FileText className="w-4 h-4" /> Commercial Invoice
          </div>
          <Input
            label="Invoice No."
            value={ciData.invoiceNumber}
            onChange={(e) => setCiData({ ...ciData, invoiceNumber: e.target.value })}
            className="bg-slate-950 border-slate-800 text-white text-xs"
          />
          <Input
            label="Buyer / Consignee"
            value={ciData.buyerName}
            onChange={(e) => setCiData({ ...ciData, buyerName: e.target.value })}
            className="bg-slate-950 border-slate-800 text-white text-xs"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Quantity"
              type="number"
              value={ciData.totalQuantity}
              onChange={(e) => setCiData({ ...ciData, totalQuantity: parseInt(e.target.value, 10) || 0 })}
              className="bg-slate-950 border-slate-800 text-white text-xs"
            />
            <Input
              label="Currency"
              value={ciData.currency}
              onChange={(e) => setCiData({ ...ciData, currency: e.target.value })}
              className="bg-slate-950 border-slate-800 text-white text-xs uppercase"
            />
          </div>
          <Input
            label="Invoice Total Amount"
            type="number"
            value={ciData.totalAmount}
            onChange={(e) => setCiData({ ...ciData, totalAmount: parseFloat(e.target.value) || 0 })}
            className="bg-slate-950 border-slate-800 text-white text-xs font-mono"
          />
        </div>

        {/* Packing List */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase">
            <FileCheck className="w-4 h-4" /> Packing List
          </div>
          <Input
            label="PL Reference No."
            value={plData.packingListNumber}
            onChange={(e) => setPlData({ ...plData, packingListNumber: e.target.value })}
            className="bg-slate-950 border-slate-800 text-white text-xs"
          />
          <Input
            label="Total Piece Count"
            type="number"
            value={plData.totalQuantity}
            onChange={(e) => setPlData({ ...plData, totalQuantity: parseInt(e.target.value, 10) || 0 })}
            className="bg-slate-950 border-slate-800 text-white text-xs"
          />
          <Input
            label="Packages / Cartons"
            type="number"
            value={plData.totalPackages}
            onChange={(e) => setPlData({ ...plData, totalPackages: parseInt(e.target.value, 10) || 0 })}
            className="bg-slate-950 border-slate-800 text-white text-xs"
          />
          <Input
            label="Gross Weight (KG)"
            type="number"
            value={plData.grossWeightKg}
            onChange={(e) => setPlData({ ...plData, grossWeightKg: parseFloat(e.target.value) || 0 })}
            className="bg-slate-950 border-slate-800 text-white text-xs font-mono"
          />
        </div>

        {/* Bill of Lading */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase">
            <Ship className="w-4 h-4" /> Bill of Lading / AWB
          </div>
          <Input
            label="BL / AWB Number"
            value={blData.blNumber}
            onChange={(e) => setBlData({ ...blData, blNumber: e.target.value })}
            className="bg-slate-950 border-slate-800 text-white text-xs font-mono"
          />
          <Input
            label="Consignee on BL"
            value={blData.consignee}
            onChange={(e) => setBlData({ ...blData, consignee: e.target.value })}
            className="bg-slate-950 border-slate-800 text-white text-xs"
          />
          <Input
            label="Manifest Gross Weight (KG)"
            type="number"
            value={blData.grossWeightKg}
            onChange={(e) => setBlData({ ...blData, grossWeightKg: parseFloat(e.target.value) || 0 })}
            className="bg-slate-950 border-slate-800 text-white text-xs font-mono"
          />
          <Input
            label="Port of Discharge"
            value={blData.portOfDischarge}
            onChange={(e) => setBlData({ ...blData, portOfDischarge: e.target.value })}
            className="bg-slate-950 border-slate-800 text-white text-xs"
          />
        </div>

        {/* Purchase Order */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase">
            <FileText className="w-4 h-4" /> Purchase Order (PO)
          </div>
          <Input
            label="PO Contract No."
            value={poData.poNumber}
            onChange={(e) => setPoData({ ...poData, poNumber: e.target.value })}
            className="bg-slate-950 border-slate-800 text-white text-xs"
          />
          <Input
            label="Buyer Contract Entity"
            value={poData.buyerName}
            onChange={(e) => setPoData({ ...poData, buyerName: e.target.value })}
            className="bg-slate-950 border-slate-800 text-white text-xs"
          />
          <Input
            label="PO Contract Currency"
            value={poData.currency}
            onChange={(e) => setPoData({ ...poData, currency: e.target.value })}
            className="bg-slate-950 border-slate-800 text-white text-xs uppercase"
          />
          <Input
            label="Contract Order Value"
            type="number"
            value={poData.poAmount}
            onChange={(e) => setPoData({ ...poData, poAmount: parseFloat(e.target.value) || 0 })}
            className="bg-slate-950 border-slate-800 text-white text-xs font-mono"
          />
        </div>
      </div>

      {/* Review Output */}
      {review && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                AI Cross-Examination Report
              </span>
              <h2 className="text-lg font-bold text-white">{review.summary}</h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">Consistency Score</span>
                <span
                  className={`text-2xl font-bold font-mono ${
                    (review.consistencyScore ?? review.score ?? 0) >= 80 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {review.consistencyScore ?? review.score ?? 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Inspected Field</th>
                  <th className="py-3 px-4 font-semibold">Doc 1 Value</th>
                  <th className="py-3 px-4 font-semibold">Doc 2 Value</th>
                  <th className="py-3 px-4 font-semibold">Severity</th>
                  <th className="py-3 px-4 font-semibold">Finding & Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {review.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-850/50">
                    <td className="py-3.5 px-4 font-semibold text-white">{item.field}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-400 block text-[10px]">{item.doc1Name}</span>
                      <span className="font-mono text-slate-200">{item.doc1Value}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-400 block text-[10px]">{item.doc2Name}</span>
                      <span className="font-mono text-slate-200">{item.doc2Value}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          item.severity === 'critical'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : item.severity === 'major'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : item.severity === 'minor'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {item.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-slate-300">{item.explanation}</p>
                      <p className="text-[11px] text-amber-400/90 mt-0.5 font-medium">
                        Action: {item.recommendation}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
