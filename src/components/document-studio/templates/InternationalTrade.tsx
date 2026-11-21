import React from 'react';
import { BaseDocument } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export function InternationalTradeTemplate({ doc }: { doc: BaseDocument }) {
  const seller = doc.sellerDetails || {};

  return (
    <div
      id="document-print-area"
      className="bg-white p-8 text-[#172033] shadow-lg rounded-xl max-w-4xl mx-auto border-2 border-slate-800 print:border-none print:shadow-none print:p-0 text-[11px] leading-tight font-sans"
    >
      {/* Customs Boxed Header Grid */}
      <div className="grid grid-cols-2 border-b-2 border-slate-800">
        <div className="p-3 border-r border-slate-800 space-y-1">
          <span className="text-[9px] uppercase font-bold text-slate-500 block">1. Exporter / Shipper</span>
          <div className="font-bold text-xs text-[#10243A]">{seller.legalName || 'Exporter Company'}</div>
          <p>{seller.registeredAddress}</p>
          <p>{seller.city}, {seller.country}</p>
          <p><strong>IEC:</strong> {seller.iec || 'N/A'} | <strong>GSTIN:</strong> {seller.gstin || 'N/A'}</p>
        </div>

        <div className="divide-y divide-slate-800">
          <div className="p-2 flex items-center justify-between">
            <span className="text-[9px] uppercase font-bold text-slate-500">Document No. & Date</span>
            <div className="text-right">
              <span className="font-black text-xs text-[#10243A] block">{doc.documentNumber}</span>
              <span className="text-slate-500">{formatDate(doc.date)}</span>
            </div>
          </div>
          <div className="p-2 flex items-center justify-between">
            <span className="text-[9px] uppercase font-bold text-slate-500">Buyer Reference / PO</span>
            <span className="font-semibold">{doc.referenceNumber || 'N/A'}</span>
          </div>
          <div className="p-2 flex items-center justify-between bg-slate-50">
            <span className="text-[9px] uppercase font-bold text-slate-500">Incoterms 2020</span>
            <span className="font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded">{doc.incoterm}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 border-b-2 border-slate-800">
        <div className="p-3 border-r border-slate-800 space-y-0.5">
          <span className="text-[9px] uppercase font-bold text-slate-500 block">2. Consignee / Importer</span>
          <div className="font-bold text-xs">{doc.buyerCompany}</div>
          <p>{doc.buyerBillingAddress}</p>
          <p>{doc.buyerCountry}</p>
          <p><strong>Tax ID:</strong> {doc.buyerTaxId || 'N/A'}</p>
        </div>

        <div className="p-3 space-y-1">
          <span className="text-[9px] uppercase font-bold text-slate-500 block">3. Country of Origin & Destination</span>
          <p><strong>Country of Origin:</strong> {seller.country || 'India'}</p>
          <p><strong>Final Destination:</strong> {doc.buyerCountry}</p>
          <p><strong>Payment Terms:</strong> {doc.paymentTerms}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 border-b-2 border-slate-800 text-[10px] divide-x divide-slate-800 bg-slate-50 font-medium">
        <div className="p-2">
          <span className="text-[8px] text-slate-400 uppercase block">Port of Loading</span>
          <span className="font-bold text-slate-800">{doc.originPort || 'Indian Seaport'}</span>
        </div>
        <div className="p-2">
          <span className="text-[8px] text-slate-400 uppercase block">Port of Discharge</span>
          <span className="font-bold text-slate-800">{doc.destinationPort || 'Overseas Port'}</span>
        </div>
        <div className="p-2">
          <span className="text-[8px] text-slate-400 uppercase block">Currency</span>
          <span className="font-bold text-slate-800">{doc.currency}</span>
        </div>
        <div className="p-2">
          <span className="text-[8px] text-slate-400 uppercase block">Tax Scheme</span>
          <span className="font-bold text-slate-800">{doc.taxType.toUpperCase()}</span>
        </div>
      </div>

      {/* Cargo Items Table */}
      <table className="w-full text-left text-[10px] border-b-2 border-slate-800 border-collapse">
        <thead>
          <tr className="bg-slate-100 border-b border-slate-800 font-bold uppercase">
            <th className="py-2 px-2 w-8 text-center">Marks</th>
            <th className="py-2 px-2">Description of Goods</th>
            <th className="py-2 px-2">HS Code</th>
            <th className="py-2 px-2 text-right">Quantity</th>
            <th className="py-2 px-2 text-right">Rate ({doc.currency})</th>
            <th className="py-2 px-2 text-right">Amount ({doc.currency})</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {doc.items.map((item, idx) => (
            <tr key={idx}>
              <td className="py-2 px-2 text-center font-mono text-slate-400">{idx + 1}</td>
              <td className="py-2 px-2">
                <span className="font-bold text-slate-900 block">{item.productName}</span>
                {item.description && <span className="text-[9px] text-slate-500">{item.description}</span>}
              </td>
              <td className="py-2 px-2 font-mono text-slate-700">{item.hsCode || '-'}</td>
              <td className="py-2 px-2 text-right font-semibold">{item.quantity} {item.unit}</td>
              <td className="py-2 px-2 text-right">{formatCurrency(item.unitPrice, doc.currency, false)}</td>
              <td className="py-2 px-2 text-right font-bold text-slate-900">
                {formatCurrency(item.lineTotal, doc.currency, false)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total Box */}
      <div className="grid grid-cols-2 border-b-2 border-slate-800">
        <div className="p-3 border-r border-slate-800">
          <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Amount in Words</span>
          <p className="font-bold text-[#10243A] text-xs">{doc.amountInWords}</p>
          {doc.bankDetails && (
            <div className="mt-2 text-[9px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-200">
              <strong>Bank Details:</strong> {doc.bankDetails}
            </div>
          )}
        </div>

        <div className="p-3 space-y-1.5 text-right">
          <div className="flex justify-between text-slate-600">
            <span>FOB / Subtotal:</span>
            <span>{formatCurrency(doc.subtotal, doc.currency)}</span>
          </div>
          {doc.taxTotal > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Taxes:</span>
              <span>{formatCurrency(doc.taxTotal, doc.currency)}</span>
            </div>
          )}
          <div className="flex justify-between font-black text-sm text-[#10243A] pt-1 border-t border-slate-300">
            <span>Total Value ({doc.incoterm}):</span>
            <span>{formatCurrency(doc.grandTotal, doc.currency)}</span>
          </div>
        </div>
      </div>

      {/* Declaration & Signature */}
      <div className="grid grid-cols-2 p-3 text-[9px]">
        <div>
          <span className="font-bold block uppercase mb-1">Declaration:</span>
          <p className="text-slate-500 max-w-sm">
            We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
          </p>
        </div>
        <div className="text-right">
          <span className="font-bold block uppercase mb-8">For {seller.legalName || 'Exporter'}:</span>
          <span className="font-bold text-slate-700 block border-t border-slate-300 pt-1 inline-block min-w-[140px]">
            Authorized Signatory
          </span>
        </div>
      </div>
    </div>
  );
}
