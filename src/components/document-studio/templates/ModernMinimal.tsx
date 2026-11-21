import React from 'react';
import { BaseDocument } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export function ModernMinimalTemplate({ doc }: { doc: BaseDocument }) {
  const seller = doc.sellerDetails || {};

  return (
    <div
      id="document-print-area"
      className="bg-white p-8 md:p-12 text-[#172033] shadow-lg rounded-xl max-w-4xl mx-auto border border-slate-200 print:border-none print:shadow-none print:p-0 text-xs leading-relaxed font-sans"
    >
      {/* Top Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <span className="text-[10px] tracking-widest uppercase font-mono text-blue-600 block mb-1">
            {doc.type.replace(/_/g, ' ')}
          </span>
          <h1 className="text-2xl font-light text-[#10243A] tracking-tight">
            {doc.documentNumber}
          </h1>
          <p className="text-slate-400 text-[11px] mt-1">Issued: {formatDate(doc.date)}</p>
        </div>

        <div className="text-right">
          <div className="text-lg font-bold text-[#10243A]">{seller.tradingName || seller.legalName}</div>
          <p className="text-slate-500 text-[11px]">{seller.city}, {seller.country}</p>
          <p className="text-slate-400 text-[10px]">{seller.primaryContactEmail}</p>
        </div>
      </div>

      {/* Minimal Buyer Line */}
      <div className="py-4 border-y border-slate-100 flex items-start justify-between mb-8 text-[11px]">
        <div>
          <span className="text-slate-400 text-[10px] uppercase tracking-wider block mb-0.5">Billed To</span>
          <span className="font-bold text-[#172033] text-sm block">{doc.buyerCompany}</span>
          <span className="text-slate-500">{doc.buyerContactPerson} • {doc.buyerCountry}</span>
        </div>
        <div className="text-right">
          <span className="text-slate-400 text-[10px] uppercase tracking-wider block mb-0.5">Delivery Term</span>
          <span className="font-mono font-bold text-blue-600 text-sm block">{doc.incoterm}</span>
          <span className="text-slate-500">{doc.destinationPort || 'Named Port'}</span>
        </div>
      </div>

      {/* Clean Table */}
      <table className="w-full text-left text-[11px] mb-8 border-collapse">
        <thead>
          <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase tracking-wider">
            <th className="py-2">Item</th>
            <th className="py-2">HS Code</th>
            <th className="py-2 text-right">Quantity</th>
            <th className="py-2 text-right">Unit Price</th>
            <th className="py-2 text-right">Total ({doc.currency})</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {doc.items.map((item, idx) => (
            <tr key={idx} className="hover:bg-slate-50/50">
              <td className="py-3">
                <span className="font-semibold text-[#172033] block">{item.productName}</span>
                {item.description && <span className="text-slate-400 text-[10px]">{item.description}</span>}
              </td>
              <td className="py-3 font-mono text-slate-500">{item.hsCode || '-'}</td>
              <td className="py-3 text-right text-slate-700">{item.quantity} {item.unit}</td>
              <td className="py-3 text-right text-slate-700">{formatCurrency(item.unitPrice, doc.currency, false)}</td>
              <td className="py-3 text-right font-semibold text-[#172033]">{formatCurrency(item.lineTotal, doc.currency, false)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Minimalist Summary */}
      <div className="flex justify-end mb-8">
        <div className="w-64 space-y-1.5 text-[11px]">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span>{formatCurrency(doc.subtotal, doc.currency)}</span>
          </div>
          {doc.taxTotal > 0 && (
            <div className="flex justify-between text-slate-500">
              <span>Taxes</span>
              <span>{formatCurrency(doc.taxTotal, doc.currency)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-sm text-[#10243A]">
            <span>Total ({doc.currency})</span>
            <span>{formatCurrency(doc.grandTotal, doc.currency)}</span>
          </div>
        </div>
      </div>

      {/* Footer Notes */}
      <div className="p-4 rounded-xl bg-slate-50 text-[10px] text-slate-500 space-y-1">
        <p><strong>Payment Terms:</strong> {doc.paymentTerms}</p>
        <p><strong>Amount in Words:</strong> {doc.amountInWords}</p>
        {doc.bankDetails && <p><strong>Bank:</strong> {doc.bankDetails}</p>}
      </div>
    </div>
  );
}
