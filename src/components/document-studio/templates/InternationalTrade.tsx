import React from 'react';
import { BaseDocument } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export function InternationalTradeTemplate({ doc }: { doc: BaseDocument }) {
  const seller = doc.sellerDetails || {};

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
    ? `${doc.incoterm || 'FOB'} ${doc.namedPlace} — ${doc.incotermVersion || 'Incoterms 2020'}`
    : `${doc.incoterm || 'FOB'} — ${doc.incotermVersion || 'Incoterms 2020'}`;

  return (
    <div
      id="document-print-area"
      className="bg-white p-8 text-[#172033] shadow-lg rounded-xl max-w-4xl mx-auto border-2 border-slate-800 print:border-none print:shadow-none print:p-0 text-[11px] leading-tight font-sans"
    >
      {/* Customs Boxed Header Grid */}
      <div className="grid grid-cols-2 border-b-2 border-slate-800">
        <div className="p-3 border-r border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase font-bold text-slate-500">1. Exporter / Shipper</span>
            {seller.logoUrl && (
              <img src={seller.logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
            )}
          </div>
          <div className="font-bold text-xs text-[#10243A]">{seller.legalName || 'Exporter Company'}</div>
          <p>{seller.registeredAddress}</p>
          <p>{seller.city ? `${seller.city}, ` : ''}{seller.country || 'India'}</p>
          {doc.showPanGstinIec !== false && (
            <p className="font-mono text-[9px] text-slate-700">
              <strong>IEC:</strong> {seller.iec || 'N/A'} | <strong>GSTIN:</strong> {seller.gstin || 'N/A'}
              {seller.pan ? ` | PAN: ${seller.pan}` : ''}
            </p>
          )}
          {seller.primaryContactEmail && <p className="text-[10px]">Email: {seller.primaryContactEmail}</p>}
        </div>

        <div className="divide-y divide-slate-800">
          <div className="p-2 flex items-center justify-between">
            <span className="text-[9px] uppercase font-bold text-slate-500">{docTitle} No. & Date</span>
            <div className="text-right">
              <span className="font-black text-xs text-[#10243A] block">{doc.documentNumber}</span>
              <span className="text-slate-600 font-medium">Date: {formatDate(doc.date)}</span>
              {doc.validityDate && <span className="text-slate-500 block text-[9px]">Valid Until: {formatDate(doc.validityDate)}</span>}
            </div>
          </div>
          <div className="p-2 flex items-center justify-between">
            <span className="text-[9px] uppercase font-bold text-slate-500">Buyer Ref / Inquiry</span>
            <span className="font-semibold">{doc.referenceNumber || doc.inquiryReference || 'N/A'}</span>
          </div>
          <div className="p-2 flex items-center justify-between bg-slate-50">
            <span className="text-[9px] uppercase font-bold text-slate-500">Incoterms</span>
            <span className="font-black text-blue-800 bg-blue-100 px-2 py-0.5 rounded text-[10px]">{incotermDisplay}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 border-b-2 border-slate-800">
        <div className="p-3 border-r border-slate-800 space-y-0.5">
          <span className="text-[9px] uppercase font-bold text-slate-500 block">2. Consignee / Importer</span>
          <div className="font-bold text-xs">{doc.buyerCompany}</div>
          {doc.buyerContactPerson && <p className="font-medium text-slate-700">Attn: {doc.buyerContactPerson}</p>}
          <p>{doc.buyerBillingAddress}</p>
          <p>{doc.buyerCountry}</p>
          {doc.buyerTaxId && <p className="font-mono text-[9px]">Tax ID: {doc.buyerTaxId}</p>}
        </div>

        <div className="p-3 space-y-1">
          <span className="text-[9px] uppercase font-bold text-slate-500 block">3. Origin & Shipment Terms</span>
          <p><strong>Country of Origin:</strong> {doc.countryOfOrigin || seller.country || 'India'}</p>
          <p><strong>Country of Final Destination:</strong> {doc.countryOfFinalDestination || doc.buyerCountry}</p>
          <p><strong>Payment Terms:</strong> {doc.paymentTerms}</p>
          {doc.shipmentPeriod && <p><strong>Shipment Period:</strong> {doc.shipmentPeriod}</p>}
        </div>
      </div>

      <div className="grid grid-cols-4 border-b-2 border-slate-800 text-[10px] divide-x divide-slate-800 bg-slate-50 font-medium">
        <div className="p-2">
          <span className="text-[8px] text-slate-400 uppercase block">Port of Loading</span>
          <span className="font-bold text-slate-800">{doc.originPort || 'Indian Port'}</span>
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
          <span className="text-[8px] text-slate-400 uppercase block">Transport Mode</span>
          <span className="font-bold text-slate-800">{doc.modeOfTransport || 'Sea'}</span>
        </div>
      </div>

      {/* Cargo Items Table */}
      <table className="w-full text-left text-[10px] border-b-2 border-slate-800 border-collapse">
        <thead>
          <tr className="bg-slate-100 border-b border-slate-800 font-bold uppercase">
            <th className="py-2 px-2 w-8 text-center">No.</th>
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
                {item.specifications && <span className="text-[9px] text-slate-600 block leading-tight">{item.specifications}</span>}
                {item.description && !item.specifications && <span className="text-[9px] text-slate-500 block">{item.description}</span>}
              </td>
              <td className="py-2 px-2 font-mono text-slate-700 whitespace-nowrap">{item.hsCode || '-'}</td>
              <td className="py-2 px-2 text-right font-semibold whitespace-nowrap">{item.quantity} {item.unit}</td>
              <td className="py-2 px-2 text-right whitespace-nowrap">{formatCurrency(item.unitPrice, doc.currency, false)}</td>
              <td className="py-2 px-2 text-right font-bold text-slate-900 whitespace-nowrap">
                {formatCurrency(item.lineTotal, doc.currency, false)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total Box */}
      <div className="grid grid-cols-2 border-b-2 border-slate-800">
        <div className="p-3 border-r border-slate-800 space-y-1">
          <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Amount in Words</span>
          <p className="font-bold text-[#10243A] text-xs">{doc.amountInWords}</p>
          
          {doc.showBankDetails !== false && (seller.bankName || doc.bankDetails) && (
            <div className="mt-2 text-[9px] text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 space-y-0.5">
              <strong className="block font-bold uppercase text-slate-800">Bank Details for Wire Transfer:</strong>
              <p>Bank: {seller.bankName} | A/C: {seller.accountNumber}</p>
              {seller.swiftBic && <p>SWIFT/BIC: {seller.swiftBic} | IFSC: {seller.ifscCode}</p>}
              {doc.bankDetails && !seller.bankName && <p>{doc.bankDetails}</p>}
            </div>
          )}
        </div>

        <div className="p-3 space-y-1 text-right text-[10px]">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span>{formatCurrency(doc.subtotal, doc.currency)}</span>
          </div>
          {Number(doc.overallDiscountAmount || 0) > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Discount:</span>
              <span>-{formatCurrency(Number(doc.overallDiscountAmount), doc.currency)}</span>
            </div>
          )}
          {Number(doc.freightCharges || 0) > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Freight Charges:</span>
              <span>{formatCurrency(Number(doc.freightCharges), doc.currency)}</span>
            </div>
          )}
          {Number(doc.insuranceCharges || 0) > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Insurance Charges:</span>
              <span>{formatCurrency(Number(doc.insuranceCharges), doc.currency)}</span>
            </div>
          )}
          {Number(doc.otherCharges || 0) > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Other Charges:</span>
              <span>{formatCurrency(Number(doc.otherCharges), doc.currency)}</span>
            </div>
          )}
          {doc.taxTotal > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Taxes:</span>
              <span>{formatCurrency(doc.taxTotal, doc.currency)}</span>
            </div>
          )}
          <div className="flex justify-between font-black text-xs text-[#10243A] pt-1.5 border-t border-slate-300">
            <span>Total Value ({doc.incoterm || 'FOB'}):</span>
            <span>{formatCurrency(doc.grandTotal, doc.currency)}</span>
          </div>
        </div>
      </div>

      {/* Commercial Terms / Conditions */}
      {doc.termsAndConditions && (
        <div className="p-3 border-b-2 border-slate-800 text-[9px] text-slate-600 bg-slate-50/50">
          <strong className="block uppercase text-slate-800 mb-0.5">Commercial Terms & Conditions:</strong>
          <p className="whitespace-pre-line leading-relaxed">{doc.termsAndConditions}</p>
        </div>
      )}

      {/* Declaration & Signature */}
      <div className="grid grid-cols-2 p-3 text-[9px]">
        <div>
          <span className="font-bold block uppercase mb-1">Declaration:</span>
          <p className="text-slate-500 max-w-sm">
            {doc.exporterDeclaration || 'We declare that this quotation shows the actual price of the goods described and that all particulars are true and correct.'}
          </p>
        </div>
        <div className="text-right flex flex-col items-end">
          <span className="font-bold block uppercase mb-2">For {seller.legalName || 'Exporter'}:</span>
          {doc.showSignature !== false && (doc.authorizedSignatureUrl || seller.authorizedSignatureUrl) ? (
            <img src={doc.authorizedSignatureUrl || seller.authorizedSignatureUrl} alt="Signature" className="h-10 w-auto mb-1 object-contain" />
          ) : (
            <div className="h-10"></div>
          )}
          <span className="font-bold text-slate-700 block border-t border-slate-400 pt-1 min-w-[150px]">
            {doc.authorizedSignatoryName || seller.primaryContactName || 'Authorized Signatory'}
          </span>
          {(doc.signatoryDesignation || seller.designation) && (
            <span className="text-[8px] text-slate-500 block">{doc.signatoryDesignation || seller.designation}</span>
          )}
        </div>
      </div>
    </div>
  );
}
