import React from 'react';
import { BaseDocument } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export function PremiumInternationalTemplate({ doc }: { doc: BaseDocument }) {
  const seller = doc.sellerDetails || {};
  const branding = doc.brandingSettings || {};
  const primaryColor = branding.primaryColor || '#10243A';
  const secondaryColor = branding.secondaryColor || '#2563EB';
  const logoPosition = branding.logoPosition || 'left';

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
      {/* Executive Header Banner */}
      <div
        className="text-white p-6 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
        style={{ backgroundColor: primaryColor }}
      >
        <div className={`flex items-center gap-4 ${logoPosition === 'right' ? 'order-2' : ''}`}>
          {seller.logoUrl && (
            <img
              src={seller.logoUrl}
              alt="Company Logo"
              className="h-14 w-auto object-contain bg-white/10 p-1.5 rounded-lg"
            />
          )}
          <div>
            <span className="text-[10px] tracking-widest text-emerald-400 font-bold uppercase block mb-0.5">
              Official International Trade Document
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">{docTitle}</h1>
            <p className="text-xs text-slate-300 font-mono mt-0.5">
              Ref: <strong className="text-white">{doc.documentNumber}</strong>
              {doc.revisionNumber && doc.revisionNumber > 1 && ` (Rev #${doc.revisionNumber})`}
            </p>
          </div>
        </div>

        <div className={`text-left sm:text-right ${logoPosition === 'right' ? 'order-1' : ''}`}>
          <div className="text-lg font-black tracking-tight text-white uppercase">
            {seller.legalName || seller.tradingName || 'EXPORTER COMPANY'}
          </div>
          <p className="text-xs text-slate-300">{seller.city ? `${seller.city}, ` : ''}{seller.country || 'India'}</p>
          <div className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-white text-[10px] font-bold border border-white/20">
            {incotermDisplay}
          </div>
        </div>
      </div>

      {/* Exporter & Buyer 2-Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-[11px]">
        {/* Exporter Card */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Exporter / Seller Details
          </span>
          <div className="font-bold text-sm text-[#10243A]">{seller.legalName || 'Exporter'}</div>
          {seller.registeredAddress && <p className="text-slate-600">{seller.registeredAddress}</p>}
          {seller.factoryAddress && (
            <p className="text-slate-500 text-[10px]">
              <strong>Works/Factory:</strong> {seller.factoryAddress}
            </p>
          )}

          {doc.showPanGstinIec !== false && (
            <div className="pt-1 text-[10px] text-slate-600 space-y-0.5 font-mono">
              {seller.iec && <div><strong>IEC:</strong> {seller.iec}</div>}
              {seller.gstin && <div><strong>GSTIN:</strong> {seller.gstin}</div>}
              {seller.pan && <div><strong>PAN:</strong> {seller.pan}</div>}
              {seller.cin && <div><strong>CIN:</strong> {seller.cin}</div>}
              {seller.adCode && <div><strong>AD Code:</strong> {seller.adCode}</div>}
            </div>
          )}

          <div className="pt-1 text-[10px] text-slate-500">
            {seller.primaryContactEmail && <span>Email: {seller.primaryContactEmail} </span>}
            {seller.primaryContactPhone && <span>• Tel: {seller.primaryContactPhone}</span>}
          </div>
        </div>

        {/* Consignee / Buyer Card */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Buyer / Importer / Consignee
          </span>
          <div className="font-bold text-sm text-[#10243A]">{doc.buyerCompany || 'Consignee Company'}</div>
          {doc.buyerContactPerson && (
            <p className="text-slate-600">
              <strong>Attn:</strong> {doc.buyerContactPerson}
              {doc.buyerDesignation && ` (${doc.buyerDesignation})`}
            </p>
          )}
          {doc.buyerBillingAddress && <p className="text-slate-600">{doc.buyerBillingAddress}</p>}
          <p className="text-slate-600 font-semibold">
            {[doc.buyerCity, doc.buyerState, doc.buyerCountry].filter(Boolean).join(', ')}
          </p>
          {doc.buyerTaxId && (
            <p className="text-slate-500 font-mono text-[10px]">
              <strong>Tax ID / VAT:</strong> {doc.buyerTaxId}
            </p>
          )}
          {doc.consigneeName && doc.consigneeName !== doc.buyerCompany && (
            <div className="pt-1 border-t border-slate-200 text-[10px] text-slate-600">
              <strong>Consignee:</strong> {doc.consigneeName} ({doc.consigneeAddress || 'Same as Buyer'})
            </div>
          )}
          {doc.notifyParty && (
            <div className="text-[10px] text-slate-600">
              <strong>Notify Party:</strong> {doc.notifyParty}
            </div>
          )}
        </div>
      </div>

      {/* Key Commercial & Shipment Metadata Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-100/80 border border-slate-200 mb-6 text-[11px]">
        <div>
          <span className="text-[9px] uppercase font-bold text-slate-400 block">Quotation Date</span>
          <span className="font-bold text-slate-800">{formatDate(doc.date)}</span>
        </div>
        <div>
          <span className="text-[9px] uppercase font-bold text-slate-400 block">Validity Date</span>
          <span className="font-bold text-slate-800">{doc.validityDate ? formatDate(doc.validityDate) : '30 Days'}</span>
        </div>
        <div>
          <span className="text-[9px] uppercase font-bold text-slate-400 block">Port of Loading</span>
          <span className="font-bold text-slate-800">{doc.originPort || 'Indian Port'}</span>
        </div>
        <div>
          <span className="text-[9px] uppercase font-bold text-slate-400 block">Port of Discharge</span>
          <span className="font-bold text-slate-800">{doc.destinationPort || 'Named Destination Port'}</span>
        </div>
      </div>

      {/* Trade & Routing Details */}
      {(doc.modeOfTransport || doc.shipmentPeriod || doc.inquiryReference || doc.buyerPoReference) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 mb-6 text-[10px] text-slate-600">
          {doc.modeOfTransport && (
            <div><strong>Mode:</strong> {doc.modeOfTransport} Freight</div>
          )}
          {doc.shipmentPeriod && (
            <div><strong>Shipment:</strong> {doc.shipmentPeriod}</div>
          )}
          {doc.inquiryReference && (
            <div><strong>Inquiry Ref:</strong> {doc.inquiryReference}</div>
          )}
          {doc.partialShipment !== undefined && (
            <div><strong>Partial Ship:</strong> {doc.partialShipment ? 'Allowed' : 'Not Allowed'}</div>
          )}
        </div>
      )}

      {/* Products Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
        <table className="w-full text-left text-[11px] border-collapse">
          <thead>
            <tr className="text-white font-semibold" style={{ backgroundColor: primaryColor }}>
              <th className="py-2.5 px-3 w-10 text-center">#</th>
              <th className="py-2.5 px-3">Description of Goods & Specifications</th>
              <th className="py-2.5 px-3">HS Code</th>
              <th className="py-2.5 px-3 text-right">Quantity</th>
              <th className="py-2.5 px-3 text-right">Unit Rate ({doc.currency})</th>
              {doc.discountTotal > 0 && <th className="py-2.5 px-3 text-right">Disc</th>}
              <th className="py-2.5 px-3 text-right">Total ({doc.currency})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {doc.items.map((item, idx) => (
              <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}>
                <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[10px]">{idx + 1}</td>
                <td className="py-2.5 px-3">
                  <div className="font-bold text-[#172033]">{item.productName}</div>
                  {item.description && (
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.description}</div>
                  )}
                  {item.specifications && (
                    <div className="text-[10px] text-slate-400 italic mt-0.5">Specs: {item.specifications}</div>
                  )}
                  {item.sku && (
                    <span className="text-[9px] font-mono text-blue-600 bg-blue-50 px-1 py-0.2 rounded mr-1">
                      SKU: {item.sku}
                    </span>
                  )}
                  {item.packageCount && (
                    <span className="text-[9px] text-slate-500">
                      • {item.packageCount} {item.packageType || 'Pkgs'}
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-3 font-mono text-slate-600 text-[10px]">{item.hsCode || '-'}</td>
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

      {/* Pricing Breakdown & Calculations Summary */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-6">
        {/* Left: Amount in Words, Bank & Payment Instructions */}
        <div className="flex-1 space-y-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px]">
            <span className="font-bold uppercase tracking-wider block text-[10px] text-slate-500 mb-0.5">
              Total Amount in Words:
            </span>
            <span className="font-bold text-slate-900">{doc.amountInWords}</span>
          </div>

          {/* Payment Terms */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1">
            <span className="font-bold uppercase tracking-wider block text-[10px] text-slate-500">
              Payment Terms & Routing:
            </span>
            <p className="font-semibold text-slate-800">{doc.paymentTerms || '100% Advance TT'}</p>
            {doc.bankChargesResponsibility && (
              <p className="text-[10px] text-slate-500">
                Banking Charges: <strong>{doc.bankChargesResponsibility.toUpperCase()}</strong> responsibility
              </p>
            )}
          </div>

          {/* Sensitive Bank Details (Only shown when configured) */}
          {doc.showBankDetails && (seller.bankName || doc.bankDetails) && (
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-[10px] text-slate-700 space-y-1">
              <span className="font-bold text-blue-900 uppercase block tracking-wider text-[10px]">
                Direct Wire Transfer (TT) Bank Details:
              </span>
              {seller.bankName ? (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono">
                  <div><strong>Bank:</strong> {seller.bankName}</div>
                  <div><strong>Account No:</strong> {seller.accountNumber}</div>
                  <div><strong>SWIFT / BIC:</strong> {seller.swiftBic || 'N/A'}</div>
                  <div><strong>IFSC Code:</strong> {seller.ifscCode || 'N/A'}</div>
                  <div className="col-span-2">
                    <strong>Beneficiary:</strong> {seller.accountHolderName || seller.legalName}
                  </div>
                </div>
              ) : (
                <p className="whitespace-pre-line">{doc.bankDetails}</p>
              )}
            </div>
          )}
        </div>

        {/* Right: Detailed Commercial Price Breakdown */}
        <div className="w-full sm:w-80 bg-slate-50 p-4 rounded-xl border border-slate-200 text-[11px] space-y-1.5">
          <div className="flex justify-between text-slate-600">
            <span>Product Subtotal:</span>
            <span className="font-medium text-[#172033]">{formatCurrency(doc.subtotal, doc.currency)}</span>
          </div>

          {doc.discountTotal > 0 && (
            <div className="flex justify-between text-rose-600">
              <span>Discounts:</span>
              <span>-{formatCurrency(doc.discountTotal, doc.currency)}</span>
            </div>
          )}

          {doc.packingCharges && doc.packingCharges > 0 ? (
            <div className="flex justify-between text-slate-600">
              <span>Packing & Palletization:</span>
              <span>{formatCurrency(doc.packingCharges, doc.currency)}</span>
            </div>
          ) : null}

          {doc.inlandTransportCharges && doc.inlandTransportCharges > 0 ? (
            <div className="flex justify-between text-slate-600">
              <span>Inland Haulage / Cartage:</span>
              <span>{formatCurrency(doc.inlandTransportCharges, doc.currency)}</span>
            </div>
          ) : null}

          {doc.freightCharges && doc.freightCharges > 0 ? (
            <div className="flex justify-between text-slate-600">
              <span>Ocean / Air Freight:</span>
              <span>{formatCurrency(doc.freightCharges, doc.currency)}</span>
            </div>
          ) : null}

          {doc.insuranceCharges && doc.insuranceCharges > 0 ? (
            <div className="flex justify-between text-slate-600">
              <span>Marine / Transit Insurance:</span>
              <span>{formatCurrency(doc.insuranceCharges, doc.currency)}</span>
            </div>
          ) : null}

          {doc.inspectionCharges && doc.inspectionCharges > 0 ? (
            <div className="flex justify-between text-slate-600">
              <span>SGS / Pre-Shipment Inspection:</span>
              <span>{formatCurrency(doc.inspectionCharges, doc.currency)}</span>
            </div>
          ) : null}

          {doc.otherCharges && doc.otherCharges > 0 ? (
            <div className="flex justify-between text-slate-600">
              <span>Handling & Terminal Fees:</span>
              <span>{formatCurrency(doc.otherCharges, doc.currency)}</span>
            </div>
          ) : null}

          {doc.taxTotal > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Tax ({doc.gstTreatment === 'zero_rated_lut' ? 'Zero-Rated LUT 0%' : 'GST'}):</span>
              <span>{formatCurrency(doc.taxTotal, doc.currency)}</span>
            </div>
          )}

          <div
            className="border-t-2 pt-2 flex justify-between font-black text-sm"
            style={{ color: primaryColor, borderColor: primaryColor }}
          >
            <span>Grand Total ({doc.incoterm}):</span>
            <span>{formatCurrency(doc.grandTotal, doc.currency)}</span>
          </div>
        </div>
      </div>

      {/* Commercial Terms & International Trade Declarations */}
      {doc.termsAndConditions && (
        <div className="mb-6 pt-3 border-t border-slate-200 text-[10px] text-slate-600">
          <span className="font-bold text-[#10243A] uppercase tracking-wider block mb-1">
            Standard Commercial Terms, Quality & Force Majeure:
          </span>
          <p className="whitespace-pre-line leading-relaxed">{doc.termsAndConditions}</p>
        </div>
      )}

      {/* Signatures & Execution Section */}
      <div className="grid grid-cols-2 gap-8 pt-6 border-t-2 border-slate-200 mt-6">
        {/* Buyer Acceptance (Toggleable) */}
        <div>
          {doc.showBuyerAcceptance ? (
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Buyer Acceptance & Confirmation:
              </span>
              <p className="text-[9px] text-slate-400 mb-2">
                We accept the terms and pricing detailed in this quotation.
              </p>
              <div className="h-14 border-b border-dashed border-slate-300 flex items-end">
                <span className="text-[10px] text-slate-400 italic">Authorized Signature & Seal</span>
              </div>
              <div className="text-[9px] text-slate-500 mt-1">Date: ________________________</div>
            </div>
          ) : (
            <div className="text-[10px] text-slate-400 italic pt-6">
              This quotation is issued for commercial consideration and is valid until the specified date.
            </div>
          )}
        </div>

        {/* Exporter Signature & Stamp */}
        <div className="text-right flex flex-col items-end">
          <span className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
            For {(seller.legalName || 'Exporter Company').toUpperCase()}:
          </span>

          <div className="h-16 w-48 flex items-center justify-center relative my-1">
            {doc.showCompanyStamp !== false && seller.companyStampUrl && (
              <img
                src={seller.companyStampUrl}
                alt="Stamp"
                className="h-14 w-auto object-contain absolute opacity-80"
              />
            )}
            {doc.showSignature !== false && seller.authorizedSignatureUrl && (
              <img
                src={seller.authorizedSignatureUrl}
                alt="Signature"
                className="h-12 w-auto object-contain z-10"
              />
            )}
            {!seller.authorizedSignatureUrl && (
              <div className="w-full h-full border-b border-dashed border-slate-300 flex items-end justify-end">
                <span className="text-[10px] text-slate-400 italic pb-1">Authorized Signatory</span>
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-700 font-bold">
            {doc.authorizedSignatoryName || seller.primaryContactName || 'Authorized Signatory'}
          </div>
          <div className="text-[9px] text-slate-500">
            {doc.signatoryDesignation || seller.designation || 'Director / Export Manager'}
          </div>
        </div>
      </div>
    </div>
  );
}
