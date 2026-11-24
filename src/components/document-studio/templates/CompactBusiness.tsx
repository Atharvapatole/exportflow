import React from 'react';
import { BaseDocument } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export function CompactBusinessTemplate({ doc }: { doc: BaseDocument }) {
  const seller = doc.sellerDetails || {};
  const branding = doc.brandingSettings || {};
  const primaryColor = branding.primaryColor || '#10243A';

  const docTitle =
    doc.type === 'quotation'
      ? 'EXPORT QUOTATION'
      : doc.type === 'proforma_invoice'
      ? 'PROFORMA INVOICE'
      : doc.type === 'commercial_invoice'
      ? 'COMMERCIAL INVOICE'
      : doc.type === 'packing_list'
      ? 'PACKING LIST'
      : doc.type.replace(/_/g, ' ').toUpperCase();

  return (
    <div
      id="document-print-area"
      className="bg-white p-6 md:p-8 text-[#172033] shadow-md rounded-xl max-w-4xl mx-auto border border-slate-200 print:border-none print:shadow-none print:p-0 text-[11px] leading-snug font-sans"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: primaryColor }}>
        <div className="flex items-center gap-3">
          {seller.logoUrl && (
            <img src={seller.logoUrl} alt="Logo" className="h-10 w-auto object-contain" />
          )}
          <div>
            <h1 className="text-base font-black uppercase text-[#10243A]">{seller.legalName || 'EXPORTER'}</h1>
            <p className="text-[10px] text-slate-500">
              {seller.registeredAddress} • {seller.city}, {seller.country}
              {seller.iec && ` • IEC: ${seller.iec}`}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-black text-blue-600">{docTitle}</div>
          <p className="font-mono font-bold text-xs">{doc.documentNumber}</p>
          <p className="text-[10px] text-slate-500">Date: {formatDate(doc.date)}</p>
        </div>
      </div>

      {/* Buyer & Shipment Details Grid */}
      <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-slate-50 border border-slate-200 mb-4 text-[10px]">
        <div>
          <span className="font-bold text-slate-500 uppercase block">Buyer / Consignee:</span>
          <div className="font-bold text-xs text-slate-900">{doc.buyerCompany}</div>
          <p className="text-slate-600">{doc.buyerContactPerson} ({doc.buyerEmail})</p>
          <p className="text-slate-600">{doc.buyerBillingAddress}, {doc.buyerCountry}</p>
          {doc.buyerTaxId && <p className="font-mono">Tax ID: {doc.buyerTaxId}</p>}
        </div>
        <div>
          <span className="font-bold text-slate-500 uppercase block">Trade & Shipment Terms:</span>
          <p><strong>Incoterm:</strong> {doc.incoterm} {doc.namedPlace || doc.originPort}</p>
          <p><strong>Port of Loading:</strong> {doc.originPort || 'Indian Port'}</p>
          <p><strong>Port of Discharge:</strong> {doc.destinationPort || 'Named Port'}</p>
          <p><strong>Payment Terms:</strong> {doc.paymentTerms}</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-left text-[10px] mb-4 border-collapse">
        <thead>
          <tr className="bg-slate-800 text-white font-semibold">
            <th className="py-1.5 px-2 w-8 text-center">#</th>
            <th className="py-1.5 px-2">Description</th>
            <th className="py-1.5 px-2">HS Code</th>
            <th className="py-1.5 px-2 text-right">Qty</th>
            <th className="py-1.5 px-2 text-right">Rate</th>
            {doc.discountTotal > 0 && <th className="py-1.5 px-2 text-right">Disc</th>}
            <th className="py-1.5 px-2 text-right">Amount ({doc.currency})</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {doc.items.map((item, idx) => (
            <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/50' : ''}>
              <td className="py-1.5 px-2 text-center text-slate-500">{idx + 1}</td>
              <td className="py-1.5 px-2 font-medium">
                {item.productName}
                {item.specifications && <span className="text-slate-400 block text-[9px]">{item.specifications}</span>}
              </td>
              <td className="py-1.5 px-2 font-mono text-slate-500">{item.hsCode || '-'}</td>
              <td className="py-1.5 px-2 text-right">{item.quantity} {item.unit}</td>
              <td className="py-1.5 px-2 text-right">{formatCurrency(item.unitPrice, doc.currency, false)}</td>
              {doc.discountTotal > 0 && (
                <td className="py-1.5 px-2 text-right text-slate-500">
                  {item.discountPercentage ? `${item.discountPercentage}%` : '-'}
                </td>
              )}
              <td className="py-1.5 px-2 text-right font-bold text-slate-800">
                {formatCurrency(item.lineTotal, doc.currency, false)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals & Notes */}
      <div className="flex justify-between items-start gap-4 mb-4 text-[10px]">
        <div className="flex-1 space-y-1">
          <p><strong>Amount in Words:</strong> {doc.amountInWords}</p>
          {doc.showBankDetails && (seller.bankName || doc.bankDetails) && (
            <p className="text-slate-600">
              <strong>Bank Transfer:</strong> {seller.bankName} • A/C: {seller.accountNumber} • SWIFT: {seller.swiftBic} • Beneficiary: {seller.accountHolderName || seller.legalName}
            </p>
          )}
          {doc.termsAndConditions && (
            <p className="text-slate-500 text-[9px] line-clamp-2">
              <strong>Terms:</strong> {doc.termsAndConditions}
            </p>
          )}
        </div>
        <div className="w-56 space-y-1 text-right">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span>{formatCurrency(doc.subtotal, doc.currency)}</span>
          </div>
          {doc.discountTotal > 0 && (
            <div className="flex justify-between text-rose-600">
              <span>Discount:</span>
              <span>-{formatCurrency(doc.discountTotal, doc.currency)}</span>
            </div>
          )}
          {doc.freightCharges && doc.freightCharges > 0 ? (
            <div className="flex justify-between text-slate-600">
              <span>Freight:</span>
              <span>{formatCurrency(doc.freightCharges, doc.currency)}</span>
            </div>
          ) : null}
          {doc.insuranceCharges && doc.insuranceCharges > 0 ? (
            <div className="flex justify-between text-slate-600">
              <span>Insurance:</span>
              <span>{formatCurrency(doc.insuranceCharges, doc.currency)}</span>
            </div>
          ) : null}
          {doc.taxTotal > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Tax:</span>
              <span>{formatCurrency(doc.taxTotal, doc.currency)}</span>
            </div>
          )}
          <div className="flex justify-between font-black text-xs border-t pt-1 text-slate-900">
            <span>Grand Total:</span>
            <span>{formatCurrency(doc.grandTotal, doc.currency)}</span>
          </div>
        </div>
      </div>

      {/* Signature Bar */}
      <div className="flex justify-between items-end pt-3 border-t text-[10px]">
        <div className="text-slate-400 italic">
          {doc.showBuyerAcceptance ? 'Buyer Acceptance Signature & Stamp' : 'Generated via ExportFlow'}
        </div>
        <div className="text-right">
          <span className="font-bold">For {seller.legalName || 'Exporter'}:</span>
          <p className="text-slate-500 text-[9px]">{doc.authorizedSignatoryName || seller.primaryContactName || 'Authorized Signatory'}</p>
        </div>
      </div>
    </div>
  );
}
