import React from 'react';
import { BaseDocument } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export function ClassicCorporateTemplate({ doc }: { doc: BaseDocument }) {
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
      ? 'EXPORT PACKING LIST'
      : doc.type.replace(/_/g, ' ').toUpperCase();

  const incotermDisplay = doc.namedPlace
    ? `${doc.incoterm || 'FOB'} ${doc.namedPlace} — ${doc.incotermVersion || 'Incoterms 2020'}`
    : `${doc.incoterm || 'FOB'} — ${doc.incotermVersion || 'Incoterms 2020'}`;

  return (
    <div
      id="document-print-area"
      className="bg-white p-8 md:p-12 text-[#172033] shadow-lg rounded-xl max-w-4xl mx-auto border border-slate-200 print:border-none print:shadow-none print:p-0 text-xs leading-relaxed font-sans"
    >
      {/* Top Header */}
      <div className="flex items-start justify-between border-b-2 pb-6 mb-6" style={{ borderColor: primaryColor }}>
        <div>
          {seller.logoUrl ? (
            <img src={seller.logoUrl} alt="Logo" className="h-12 w-auto mb-2 object-contain" />
          ) : (
            <div className="text-xl font-black tracking-tight mb-1" style={{ color: primaryColor }}>
              {seller.legalName || 'EXPORTER COMPANY'}
            </div>
          )}
          <div className="text-[11px] text-slate-600 max-w-xs space-y-0.5">
            <p>{seller.registeredAddress || 'Registered Office Address'}</p>
            <p>{seller.city ? `${seller.city}, ` : ''}{seller.country || 'India'}</p>
            {seller.factoryAddress && <p className="text-[10px] text-slate-500">Works: {seller.factoryAddress}</p>}
            {doc.showPanGstinIec !== false && (
              <div className="pt-0.5 font-mono text-[10px]">
                {seller.gstin && <p><strong>GSTIN:</strong> {seller.gstin}</p>}
                {seller.iec && <p><strong>IEC Code:</strong> {seller.iec}</p>}
                {seller.pan && <p><strong>PAN:</strong> {seller.pan}</p>}
                {seller.adCode && <p><strong>AD Code:</strong> {seller.adCode}</p>}
              </div>
            )}
            {seller.primaryContactEmail && <p><strong>Email:</strong> {seller.primaryContactEmail}</p>}
          </div>
        </div>

        <div className="text-right">
          <h1 className="text-xl font-black tracking-wider uppercase mb-1" style={{ color: primaryColor }}>
            {docTitle}
          </h1>
          <div className="text-[11px] space-y-0.5">
            <p>
              <strong>Document No:</strong>{' '}
              <span className="font-mono font-bold text-blue-700">{doc.documentNumber}</span>
              {doc.revisionNumber && doc.revisionNumber > 1 && ` (Rev #${doc.revisionNumber})`}
            </p>
            <p><strong>Date:</strong> {formatDate(doc.date)}</p>
            {doc.validityDate && <p><strong>Validity:</strong> {formatDate(doc.validityDate)}</p>}
            {doc.inquiryReference && <p><strong>Inquiry Ref:</strong> {doc.inquiryReference}</p>}
            {doc.buyerPoReference && <p><strong>Buyer PO:</strong> {doc.buyerPoReference}</p>}
            <p>
              <strong>Incoterm:</strong>{' '}
              <span className="bg-slate-100 px-1.5 py-0.5 rounded font-bold text-blue-700">
                {incotermDisplay}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Buyer & Shipment Details Grid */}
      <div className="grid grid-cols-2 gap-6 p-4 rounded-lg bg-slate-50 border border-slate-200 mb-6 text-[11px]">
        <div>
          <span className="font-bold uppercase tracking-wider block mb-1 text-[10px] text-[#10243A]">
            Buyer / Consignee:
          </span>
          <div className="font-bold text-sm text-[#172033]">{doc.buyerCompany || 'Customer Name'}</div>
          <div className="text-slate-600 mt-1 space-y-0.5">
            <p>
              <strong>Attn:</strong> {doc.buyerContactPerson || 'Purchasing Dept'}
              {doc.buyerDesignation && ` (${doc.buyerDesignation})`}
            </p>
            <p>{doc.buyerBillingAddress}</p>
            <p>{[doc.buyerCity, doc.buyerState, doc.buyerCountry].filter(Boolean).join(', ')}</p>
            {doc.buyerTaxId && <p><strong>Tax ID / VAT:</strong> {doc.buyerTaxId}</p>}
            {doc.buyerEmail && <p><strong>Email:</strong> {doc.buyerEmail}</p>}
            {doc.consigneeName && doc.consigneeName !== doc.buyerCompany && (
              <p className="pt-1 text-[10px]">
                <strong>Consignee:</strong> {doc.consigneeName} ({doc.consigneeAddress || 'As above'})
              </p>
            )}
            {doc.notifyParty && (
              <p className="text-[10px]"><strong>Notify Party:</strong> {doc.notifyParty}</p>
            )}
          </div>
        </div>

        <div className="border-l border-slate-200 pl-4 space-y-1">
          <span className="font-bold uppercase tracking-wider block mb-1 text-[10px] text-[#10243A]">
            Shipment Routing:
          </span>
          <p><strong>Port of Loading:</strong> {doc.originPort || 'Indian Port'}</p>
          <p><strong>Port of Discharge:</strong> {doc.destinationPort || 'Named Destination Port'}</p>
          <p><strong>Mode of Transport:</strong> {doc.modeOfTransport || 'Sea'} Freight</p>
          <p><strong>Currency:</strong> {doc.currency}</p>
          <p><strong>Payment Terms:</strong> {doc.paymentTerms}</p>
          <p><strong>Tax Scheme:</strong> {doc.gstTreatment === 'zero_rated_lut' ? 'Zero-Rated LUT Export' : doc.taxType.replace(/_/g, ' ').toUpperCase()}</p>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="border border-slate-200 rounded-lg overflow-hidden mb-6">
        <table className="w-full text-left text-[11px] border-collapse">
          <thead>
            <tr className="text-white font-semibold" style={{ backgroundColor: primaryColor }}>
              <th className="py-2.5 px-3 w-10 text-center">#</th>
              <th className="py-2.5 px-3">Item Description & Specifications</th>
              <th className="py-2.5 px-3">HS Code</th>
              <th className="py-2.5 px-3 text-right">Qty</th>
              <th className="py-2.5 px-3 text-right">Unit Price</th>
              {doc.discountTotal > 0 && <th className="py-2.5 px-3 text-right">Disc %</th>}
              <th className="py-2.5 px-3 text-right">Amount ({doc.currency})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {doc.items.map((item, idx) => (
              <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                <td className="py-2.5 px-3 text-center text-slate-500 font-medium">{idx + 1}</td>
                <td className="py-2.5 px-3">
                  <div className="font-bold text-[#172033]">{item.productName}</div>
                  {item.description && (
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.description}</div>
                  )}
                  {item.specifications && (
                    <div className="text-[10px] text-slate-400 italic mt-0.5">{item.specifications}</div>
                  )}
                </td>
                <td className="py-2.5 px-3 font-mono text-slate-600">{item.hsCode || '-'}</td>
                <td className="py-2.5 px-3 text-right font-medium text-[#172033]">
                  {item.quantity.toLocaleString()} {item.unit}
                </td>
                <td className="py-2.5 px-3 text-right text-slate-700">
                  {formatCurrency(item.unitPrice, doc.currency, false)}
                </td>
                {doc.discountTotal > 0 && (
                  <td className="py-2.5 px-3 text-right text-slate-500">
                    {item.discountPercentage ? `${item.discountPercentage}%` : '-'}
                  </td>
                )}
                <td className="py-2.5 px-3 text-right font-bold text-[#172033]">
                  {formatCurrency(item.lineTotal, doc.currency, false)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Calculations & Summary Section */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-6">
        <div className="flex-1 space-y-2">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px]">
            <span className="font-bold text-[#10243A] uppercase tracking-wider block text-[10px] mb-0.5">
              Total Amount in Words:
            </span>
            <span className="font-bold text-slate-800">{doc.amountInWords}</span>
          </div>

          {/* Sensitive Bank Details (Shown only if enabled) */}
          {doc.showBankDetails && (seller.bankName || doc.bankDetails) && (
            <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200 text-[10px] text-slate-700 space-y-0.5">
              <span className="font-bold text-blue-900 uppercase block mb-1">
                Bank Remittance Details:
              </span>
              {seller.bankName ? (
                <>
                  <p><strong>Bank:</strong> {seller.bankName} | <strong>A/C:</strong> {seller.accountNumber}</p>
                  <p><strong>SWIFT:</strong> {seller.swiftBic} | <strong>IFSC:</strong> {seller.ifscCode}</p>
                  <p><strong>Beneficiary:</strong> {seller.accountHolderName || seller.legalName}</p>
                </>
              ) : (
                <p className="whitespace-pre-line">{doc.bankDetails}</p>
              )}
            </div>
          )}
        </div>

        <div className="w-full sm:w-72 bg-slate-50 p-4 rounded-lg border border-slate-200 text-[11px] space-y-2">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span className="font-medium text-[#172033]">{formatCurrency(doc.subtotal, doc.currency)}</span>
          </div>

          {doc.discountTotal > 0 && (
            <div className="flex justify-between text-rose-600">
              <span>Discounts:</span>
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

          <div className="border-t-2 border-[#10243A] pt-2 flex justify-between font-black text-sm text-[#10243A]">
            <span>Grand Total ({doc.incoterm}):</span>
            <span>{formatCurrency(doc.grandTotal, doc.currency)}</span>
          </div>
        </div>
      </div>

      {/* Commercial Terms & Conditions */}
      {doc.termsAndConditions && (
        <div className="mb-6 pt-3 border-t border-slate-200 text-[10px] text-slate-600">
          <span className="font-bold text-[#10243A] uppercase tracking-wider block mb-1">
            Commercial Terms & Declarations:
          </span>
          <p className="whitespace-pre-line leading-relaxed">{doc.termsAndConditions}</p>
        </div>
      )}

      {/* Signatures & Declarations */}
      <div className="grid grid-cols-2 gap-8 pt-6 border-t-2 border-slate-200 mt-8">
        <div>
          {doc.showBuyerAcceptance ? (
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Buyer Acceptance Signature:
              </span>
              <div className="h-16 border-b border-dashed border-slate-300 flex items-end">
                <span className="text-[10px] text-slate-400 italic">Authorized Signatory & Stamp</span>
              </div>
            </div>
          ) : (
            <span className="text-[10px] text-slate-400 italic">Official Export Quotation</span>
          )}
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            For {seller.legalName || 'Exporter'}:
          </span>
          <div className="h-16 border-b border-dashed border-slate-300 flex items-end justify-end pb-1">
            <span className="text-[10px] text-slate-600 font-bold">
              {doc.authorizedSignatoryName || seller.primaryContactName || 'Authorized Signatory'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
