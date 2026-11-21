import React from 'react';
import { BaseDocument } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export function PremiumProfessionalTemplate({ doc }: { doc: BaseDocument }) {
  const seller = doc.sellerDetails || {};

  return (
    <div
      id="document-print-area"
      className="bg-white p-8 md:p-12 text-[#172033] shadow-lg rounded-xl max-w-4xl mx-auto border border-slate-200 print:border-none print:shadow-none print:p-0 text-xs leading-relaxed font-sans"
    >
      {/* Executive Header Banner */}
      <div className="bg-[#10243A] text-white p-6 rounded-xl flex items-center justify-between mb-8">
        <div>
          <span className="text-[10px] tracking-widest text-emerald-400 font-bold uppercase block mb-1">
            Global Trade Documentation
          </span>
          <h1 className="text-2xl font-black tracking-tight">{doc.type.replace(/_/g, ' ').toUpperCase()}</h1>
          <p className="text-xs text-slate-300 mt-1">Ref: {doc.documentNumber}</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-black tracking-tight text-white">{seller.legalName || 'EXPORTER'}</div>
          <p className="text-xs text-slate-300">{seller.country}</p>
          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
            Incoterms {doc.incoterm}
          </span>
        </div>
      </div>

      {/* Grid Info */}
      <div className="grid grid-cols-2 gap-6 mb-8 text-[11px]">
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Consignee</span>
          <div className="font-bold text-sm text-[#10243A]">{doc.buyerCompany}</div>
          <p className="text-slate-600 mt-1">{doc.buyerBillingAddress}</p>
          <p className="text-slate-600 font-semibold">{doc.buyerCountry}</p>
          <p className="text-slate-500 mt-1">Attn: {doc.buyerContactPerson} ({doc.buyerEmail})</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Transaction Terms</span>
          <div className="flex justify-between"><span className="text-slate-500">Date:</span><span className="font-bold">{formatDate(doc.date)}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Origin Port:</span><span className="font-bold">{doc.originPort || 'FOB Port'}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Destination:</span><span className="font-bold">{doc.destinationPort || 'Named Port'}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Payment:</span><span className="font-bold">{doc.paymentTerms}</span></div>
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-left text-[11px] mb-8 border-collapse">
        <thead>
          <tr className="bg-slate-100 text-[#10243A] font-bold border-y-2 border-slate-300">
            <th className="py-2.5 px-3">Item</th>
            <th className="py-2.5 px-3">HSN</th>
            <th className="py-2.5 px-3 text-right">Qty</th>
            <th className="py-2.5 px-3 text-right">Rate</th>
            <th className="py-2.5 px-3 text-right">Total ({doc.currency})</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {doc.items.map((item, idx) => (
            <tr key={idx} className="hover:bg-slate-50">
              <td className="py-3 px-3">
                <span className="font-bold text-[#10243A] block">{item.productName}</span>
                <span className="text-slate-500 text-[10px]">{item.description}</span>
              </td>
              <td className="py-3 px-3 font-mono text-slate-600">{item.hsCode || '-'}</td>
              <td className="py-3 px-3 text-right font-medium">{item.quantity} {item.unit}</td>
              <td className="py-3 px-3 text-right">{formatCurrency(item.unitPrice, doc.currency, false)}</td>
              <td className="py-3 px-3 text-right font-bold text-[#10243A]">{formatCurrency(item.lineTotal, doc.currency, false)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="flex justify-between items-start mb-8 gap-6">
        <div className="flex-1 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px]">
          <span className="font-bold text-slate-400 uppercase text-[9px] block">Amount in Words</span>
          <p className="font-bold text-[#10243A] mt-0.5">{doc.amountInWords}</p>
        </div>
        <div className="w-64 p-4 rounded-xl bg-[#10243A] text-white space-y-1.5 text-[11px]">
          <div className="flex justify-between text-slate-300"><span>Subtotal:</span><span>{formatCurrency(doc.subtotal, doc.currency)}</span></div>
          {doc.taxTotal > 0 && <div className="flex justify-between text-slate-300"><span>Tax:</span><span>{formatCurrency(doc.taxTotal, doc.currency)}</span></div>}
          <div className="flex justify-between font-black text-sm text-emerald-400 pt-2 border-t border-slate-700">
            <span>Grand Total:</span>
            <span>{formatCurrency(doc.grandTotal, doc.currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CompactBusinessTemplate({ doc }: { doc: BaseDocument }) {
  const seller = doc.sellerDetails || {};

  return (
    <div
      id="document-print-area"
      className="bg-white p-6 text-[#172033] shadow-md rounded-lg max-w-4xl mx-auto border border-slate-300 print:border-none print:shadow-none print:p-0 text-[10px] leading-tight font-sans"
    >
      <div className="flex justify-between border-b border-slate-300 pb-3 mb-3">
        <div>
          <h1 className="text-base font-black text-[#10243A]">{seller.legalName}</h1>
          <p className="text-slate-500">{seller.registeredAddress}, {seller.city}, {seller.country}</p>
          <p className="text-slate-500">IEC: {seller.iec} | GSTIN: {seller.gstin}</p>
        </div>
        <div className="text-right">
          <span className="font-black text-sm text-[#10243A] block uppercase">{doc.type.replace(/_/g, ' ')}</span>
          <span>{doc.documentNumber} • {formatDate(doc.date)}</span>
          <p className="font-bold text-blue-700">{doc.incoterm} ({doc.currency})</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 p-2 bg-slate-50 border border-slate-200 rounded mb-3">
        <div>
          <span className="font-bold text-slate-400 uppercase text-[9px] block">Buyer</span>
          <span className="font-bold">{doc.buyerCompany}</span>
          <p>{doc.buyerBillingAddress}, {doc.buyerCountry}</p>
        </div>
        <div>
          <span className="font-bold text-slate-400 uppercase text-[9px] block">Shipment & Payment</span>
          <p><strong>Port:</strong> {doc.originPort} → {doc.destinationPort}</p>
          <p><strong>Terms:</strong> {doc.paymentTerms}</p>
        </div>
      </div>

      <table className="w-full text-left border-collapse border border-slate-200 mb-3">
        <thead>
          <tr className="bg-slate-100 font-bold border-b border-slate-200">
            <th className="p-1.5 w-6 text-center">#</th>
            <th className="p-1.5">Description</th>
            <th className="p-1.5">HS Code</th>
            <th className="p-1.5 text-right">Qty</th>
            <th className="p-1.5 text-right">Rate</th>
            <th className="p-1.5 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {doc.items.map((it, idx) => (
            <tr key={idx}>
              <td className="p-1.5 text-center text-slate-400">{idx + 1}</td>
              <td className="p-1.5 font-medium">{it.productName}</td>
              <td className="p-1.5 font-mono">{it.hsCode}</td>
              <td className="p-1.5 text-right">{it.quantity} {it.unit}</td>
              <td className="p-1.5 text-right">{formatCurrency(it.unitPrice, doc.currency, false)}</td>
              <td className="p-1.5 text-right font-bold">{formatCurrency(it.lineTotal, doc.currency, false)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-center p-2 bg-slate-50 border border-slate-200 rounded">
        <span className="font-semibold text-slate-600">{doc.amountInWords}</span>
        <span className="font-black text-xs text-[#10243A]">Total: {formatCurrency(doc.grandTotal, doc.currency)}</span>
      </div>
    </div>
  );
}
