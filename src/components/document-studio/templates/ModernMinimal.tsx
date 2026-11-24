import React from 'react';
import { BaseDocument } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export function ModernMinimalTemplate({ doc }: { doc: BaseDocument }) {
  const seller = doc.sellerDetails || {};
  const branding = doc.brandingSettings || {};

  const docTitle =
    doc.type === 'quotation'
      ? 'EXPORT QUOTATION'
      : doc.type === 'proforma_invoice'
      ? 'PROFORMA INVOICE'
      : doc.type === 'commercial_invoice'
      ? 'COMMERCIAL INVOICE'
      : doc.type === 'packing_list'
      ? 'EXPORT PACKING LIST'
      : doc.type.replace(/_/g, ' ').toUpperCase();

  const incotermDisplay = doc.namedPlace
    ? `${doc.incoterm || 'FOB'} ${doc.namedPlace} (${doc.incotermVersion || 'Incoterms 2020'})`
    : `${doc.incoterm || 'FOB'} (${doc.incotermVersion || 'Incoterms 2020'})`;

  return (
    <div
      id="document-print-area"
      className="bg-white p-8 md:p-12 text-[#172033] shadow-lg rounded-xl max-w-4xl mx-auto border border-slate-200 print:border-none print:shadow-none print:p-0 text-xs leading-relaxed font-sans"
    >
      {/* Top Header */}
      <div className="flex items-start justify-between mb-8 pb-6 border-b border-slate-100">
        <div>
          {seller.logoUrl ? (
            <img src={seller.logoUrl} alt="Logo" className="h-10 w-auto mb-2 object-contain" />
          ) : (
            <span className="text-[10px] tracking-widest uppercase font-mono text-blue-600 block mb-1">
              {seller.tradingName || seller.legalName || 'EXPORT CO.'}
            </span>
          )}
          <h1 className="text-2xl font-light text-[#10243A] tracking-tight">
            {docTitle}
          </h1>
          <p className="font-mono text-sm text-slate-700 font-semibold mt-1">{doc.documentNumber}</p>
          <div className="text-slate-400 text-[11px] mt-1 space-x-3">
            <span>Date: {formatDate(doc.date)}</span>
            {doc.validityDate && <span>Valid Until: {formatDate(doc.validityDate)}</span>}
            {doc.revisionNumber && <span>Rev: #{doc.revisionNumber}</span>}
          </div>
        </div>

        <div className="text-right max-w-xs">
          <div className="text-base font-bold text-[#10243A]">{seller.legalName}</div>
          <p className="text-slate-500 text-[11px]">{seller.registeredAddress}</p>
          <p className="text-slate-500 text-[11px]">{seller.city ? `${seller.city}, ` : ''}{seller.country || 'India'}</p>
          {doc.showPanGstinIec !== false && (
            <p className="text-slate-400 text-[10px] font-mono mt-0.5">
              {[seller.gstin && `GSTIN: ${seller.gstin}`, seller.iec && `IEC: ${seller.iec}`].filter(Boolean).join(' | ')}
            </p>
          )}
          <p className="text-slate-400 text-[10px] mt-0.5">{seller.primaryContactEmail}</p>
        </div>
      </div>

      {/* Minimal Buyer & Shipping Info Line */}
      <div className="grid grid-cols-2 gap-8 py-4 border-b border-slate-100 mb-8 text-[11px]">
        <div>
          <span className="text-slate-400 text-[10px] uppercase tracking-wider block mb-1">Billed To</span>
          <span className="font-bold text-[#172033] text-sm block">{doc.buyerCompany}</span>
          {doc.buyerContactPerson && <p className="text-slate-600 font-medium">{doc.buyerContactPerson}</p>}
          <p className="text-slate-500">{doc.buyerBillingAddress}</p>
          <p className="text-slate-500">{doc.buyerCountry}</p>
          {doc.buyerTaxId && <p className="text-slate-400 text-[10px] font-mono">Tax ID: {doc.buyerTaxId}</p>}
        </div>

        <div>
          <span className="text-slate-400 text-[10px] uppercase tracking-wider block mb-1">Trade & Logistics</span>
          <p><strong className="text-slate-700">Terms:</strong> <span className="font-semibold text-blue-600">{incotermDisplay}</span></p>
          <p><strong className="text-slate-700">Mode:</strong> {doc.modeOfTransport || 'Sea'}</p>
          {doc.originPort && <p><strong className="text-slate-700">Loading Port:</strong> {doc.originPort}</p>}
          {doc.destinationPort && <p><strong className="text-slate-700">Discharge Port:</strong> {doc.destinationPort}</p>}
          {doc.paymentTerms && <p><strong className="text-slate-700">Payment:</strong> {doc.paymentTerms}</p>}
        </div>
      </div>

      {/* Clean Table */}
      <table className="w-full text-left text-[11px] mb-8 border-collapse">
        <thead>
          <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase tracking-wider">
            <th className="py-2.5">Item & Technical Spec</th>
            <th className="py-2.5">HS Code</th>
            <th className="py-2.5 text-right">Quantity</th>
            <th className="py-2.5 text-right">Unit Price</th>
            <th className="py-2.5 text-right">Total ({doc.currency})</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {doc.items.map((item, idx) => (
            <tr key={idx} className="hover:bg-slate-50/50">
              <td className="py-3 pr-2">
                <span className="font-semibold text-[#172033] block">{item.productName}</span>
                {item.specifications && <span className="text-slate-500 text-[10px] block leading-tight">{item.specifications}</span>}
                {item.description && !item.specifications && <span className="text-slate-400 text-[10px] block">{item.description}</span>}
                {item.notes && <span className="text-slate-400 text-[9px] italic block">{item.notes}</span>}
              </td>
              <td className="py-3 font-mono text-slate-500 whitespace-nowrap">{item.hsCode || '-'}</td>
              <td className="py-3 text-right text-slate-700 whitespace-nowrap">{item.quantity} {item.unit}</td>
              <td className="py-3 text-right text-slate-700 whitespace-nowrap">{formatCurrency(item.unitPrice, doc.currency, false)}</td>
              <td className="py-3 text-right font-semibold text-[#172033] whitespace-nowrap">{formatCurrency(item.lineTotal, doc.currency, false)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Minimalist Summary */}
      <div className="flex justify-between items-start mb-8 gap-8">
        <div className="flex-1 space-y-2 text-[11px] text-slate-600">
          <p><strong className="text-slate-800">Amount in Words:</strong> {doc.amountInWords}</p>
          {doc.termsAndConditions && (
            <div>
              <strong className="text-slate-800 block text-[10px] uppercase tracking-wider mb-0.5">Commercial Terms:</strong>
              <p className="text-[10px] text-slate-500 whitespace-pre-line leading-relaxed">{doc.termsAndConditions}</p>
            </div>
          )}
        </div>

        <div className="w-72 space-y-1.5 text-[11px]">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span>{formatCurrency(doc.subtotal, doc.currency)}</span>
          </div>
          {Number(doc.overallDiscountAmount || 0) > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Discount</span>
              <span>-{formatCurrency(Number(doc.overallDiscountAmount), doc.currency)}</span>
            </div>
          )}
          {Number(doc.freightCharges || 0) > 0 && (
            <div className="flex justify-between text-slate-500">
              <span>Freight Charges</span>
              <span>{formatCurrency(Number(doc.freightCharges), doc.currency)}</span>
            </div>
          )}
          {Number(doc.insuranceCharges || 0) > 0 && (
            <div className="flex justify-between text-slate-500">
              <span>Insurance</span>
              <span>{formatCurrency(Number(doc.insuranceCharges), doc.currency)}</span>
            </div>
          )}
          {Number(doc.otherCharges || 0) > 0 && (
            <div className="flex justify-between text-slate-500">
              <span>Other Charges</span>
              <span>{formatCurrency(Number(doc.otherCharges), doc.currency)}</span>
            </div>
          )}
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

      {/* Bank & Signature Grid */}
      <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-100 text-[10px] text-slate-600">
        <div>
          {doc.showBankDetails !== false && (seller.bankName || doc.bankDetails) && (
            <div className="space-y-0.5 bg-slate-50/70 p-3 rounded-lg border border-slate-100">
              <strong className="text-slate-800 uppercase tracking-wider block mb-1">Banking Instructions</strong>
              <p><strong>Bank:</strong> {seller.bankName}</p>
              {seller.accountNumber && <p><strong>A/C No:</strong> {seller.accountNumber}</p>}
              {seller.swiftBic && <p><strong>SWIFT / BIC:</strong> {seller.swiftBic}</p>}
              {seller.ifscCode && <p><strong>IFSC:</strong> {seller.ifscCode}</p>}
              {doc.bankDetails && !seller.bankName && <p>{doc.bankDetails}</p>}
            </div>
          )}
        </div>

        <div className="text-right flex flex-col justify-end items-end">
          <p className="text-slate-400 text-[10px] mb-8">For {seller.legalName || 'Exporter'}</p>
          {doc.showSignature !== false && (doc.authorizedSignatureUrl || seller.authorizedSignatureUrl) ? (
            <img src={doc.authorizedSignatureUrl || seller.authorizedSignatureUrl} alt="Signature" className="h-10 w-auto mb-1 object-contain" />
          ) : (
            <div className="h-8"></div>
          )}
          <div className="border-t border-slate-200 pt-1 min-w-[160px]">
            <p className="font-bold text-slate-800">
              {doc.authorizedSignatoryName || seller.primaryContactName || 'Authorized Signatory'}
            </p>
            {(doc.signatoryDesignation || seller.designation) && (
              <p className="text-slate-400 text-[9px]">{doc.signatoryDesignation || seller.designation}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
