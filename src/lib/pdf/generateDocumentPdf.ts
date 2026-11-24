import { jsPDF } from 'jspdf';
import { BaseDocument } from '@/types';
import { formatCurrency, formatDate, numberToWords } from '@/lib/utils';

export const DOCUMENT_TITLES: Record<string, string> = {
  quotation: 'EXPORT QUOTATION',
  proforma_invoice: 'PROFORMA INVOICE',
  commercial_invoice: 'COMMERCIAL INVOICE',
  packing_list: 'EXPORT PACKING LIST',
  purchase_order: 'PURCHASE ORDER',
  sales_order: 'SALES ORDER',
  order_confirmation: 'ORDER CONFIRMATION',
  delivery_note: 'DELIVERY NOTE',
  debit_note: 'DEBIT NOTE',
  credit_note: 'CREDIT NOTE',
  sales_contract: 'SALES CONTRACT',
  shipping_instructions: 'SHIPPING INSTRUCTIONS',
};

/**
 * World-Class International Export Vector PDF Generator
 * Renders an isolated, multi-page, publication-grade A4 business document
 * containing strictly the trade document — zero browser headers, zero URLs, zero dashboard chrome.
 */
export function generateDocumentPdf(doc: BaseDocument): Uint8Array {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm
  const seller = doc.sellerDetails || {};
  const isPackingList = doc.type === 'packing_list';

  // Branding preferences
  const branding = doc.brandingSettings || {};
  const primaryColorHex = branding.primaryColor || '#10243A';

  // Helper RGB from hex
  const hexToRgb = (hex: string) => {
    const c = hex.replace('#', '');
    const num = parseInt(c.length === 3 ? c.split('').map((x) => x + x).join('') : c, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  };
  const primaryRgb = hexToRgb(primaryColorHex);

  const docTitle = DOCUMENT_TITLES[doc.type] || doc.type.replace(/_/g, ' ').toUpperCase();
  const incotermDisplay = doc.namedPlace
    ? `${doc.incoterm || 'FOB'} ${doc.namedPlace} — ${doc.incotermVersion || 'Incoterms 2020'}`
    : `${doc.incoterm || 'FOB'} — ${doc.incotermVersion || 'Incoterms 2020'}`;

  let currentY = 18;

  // ---------------------------------------------------------------------------
  // HELPER: Header Render (First Page vs Subsequent Pages)
  // ---------------------------------------------------------------------------
  const renderHeader = (isFirstPage: boolean) => {
    if (!isFirstPage) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text(
        `${(seller.legalName || 'EXPORTER').toUpperCase()} • ${docTitle} ${doc.documentNumber}${doc.revisionNumber && doc.revisionNumber > 1 ? ` (Rev #${doc.revisionNumber})` : ''}`,
        margin,
        12
      );
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.3);
      pdf.line(margin, 14, pageWidth - margin, 14);
      return 18;
    }

    // Top Brand & Exporter Identity
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    const sellerTitle = (seller.legalName || seller.tradingName || 'EXPORTER COMPANY').toUpperCase();
    pdf.text(sellerTitle, margin, currentY);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(100, 116, 139);

    let sellerY = currentY + 4.5;
    if (seller.registeredAddress) {
      pdf.text(seller.registeredAddress, margin, sellerY);
      sellerY += 3.5;
    }
    const cityCountry = [seller.city, seller.state, seller.country].filter(Boolean).join(', ');
    if (cityCountry) {
      pdf.text(cityCountry, margin, sellerY);
      sellerY += 3.5;
    }
    if (seller.factoryAddress) {
      pdf.text(`Works: ${seller.factoryAddress}`, margin, sellerY);
      sellerY += 3.5;
    }

    // Exporter Statutory Codes (IEC, GSTIN, PAN, CIN, AD Code)
    if (doc.showPanGstinIec !== false) {
      const regDetails = [
        seller.iec ? `IEC: ${seller.iec}` : null,
        seller.gstin ? `GSTIN: ${seller.gstin}` : null,
        seller.pan ? `PAN: ${seller.pan}` : null,
        seller.cin ? `CIN: ${seller.cin}` : null,
        seller.adCode ? `AD Code: ${seller.adCode}` : null,
      ].filter(Boolean).join(' | ');
      if (regDetails) {
        pdf.text(regDetails, margin, sellerY);
        sellerY += 3.5;
      }
    }

    const contactDetails = [
      seller.primaryContactEmail ? `Email: ${seller.primaryContactEmail}` : null,
      seller.primaryContactPhone ? `Tel: ${seller.primaryContactPhone}` : null,
      seller.website ? `Web: ${seller.website}` : null,
    ].filter(Boolean).join(' | ');
    if (contactDetails) {
      pdf.text(contactDetails, margin, sellerY);
      sellerY += 3.5;
    }

    // Right Side: Document Title & Metadata
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(15);
    pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    pdf.text(docTitle, pageWidth - margin, currentY, { align: 'right' });

    pdf.setFontSize(9);
    pdf.setTextColor(37, 99, 235); // #2563EB
    const quoteNumText = doc.documentNumber + (doc.revisionNumber && doc.revisionNumber > 1 ? ` (Rev #${doc.revisionNumber})` : '');
    pdf.text(quoteNumText, pageWidth - margin, currentY + 5, { align: 'right' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(71, 85, 105);

    let docMetaY = currentY + 9;
    pdf.text(`Date: ${formatDate(doc.date)}`, pageWidth - margin, docMetaY, { align: 'right' });
    docMetaY += 3.5;

    if (doc.validityDate) {
      pdf.text(`Valid Until: ${formatDate(doc.validityDate)}`, pageWidth - margin, docMetaY, { align: 'right' });
      docMetaY += 3.5;
    }

    if (doc.inquiryReference) {
      pdf.text(`Inquiry Ref: ${doc.inquiryReference}`, pageWidth - margin, docMetaY, { align: 'right' });
      docMetaY += 3.5;
    } else if (doc.referenceNumber) {
      pdf.text(`Ref / PO: ${doc.referenceNumber}`, pageWidth - margin, docMetaY, { align: 'right' });
      docMetaY += 3.5;
    }

    if (doc.buyerPoReference) {
      pdf.text(`Buyer PO: ${doc.buyerPoReference}`, pageWidth - margin, docMetaY, { align: 'right' });
      docMetaY += 3.5;
    }

    // Incoterm display badge
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(37, 99, 235);
    pdf.text(incotermDisplay, pageWidth - margin, docMetaY, { align: 'right' });
    docMetaY += 3.5;

    currentY = Math.max(sellerY, docMetaY) + 3;

    // Bold Divider Line
    pdf.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    pdf.setLineWidth(0.8);
    pdf.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 4;

    return currentY;
  };

  currentY = renderHeader(true);

  // ---------------------------------------------------------------------------
  // SECTION C & D: BUYER / CONSIGNEE & SHIPMENT GRID
  // ---------------------------------------------------------------------------
  const boxHeight = 32;
  pdf.setFillColor(248, 250, 252);
  pdf.rect(margin, currentY, contentWidth, boxHeight, 'F');
  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.3);
  pdf.rect(margin, currentY, contentWidth, boxHeight, 'S');

  // Left: Consignee / Buyer
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text('BILL TO / CONSIGNEE / BUYER:', margin + 4, currentY + 5);

  pdf.setFontSize(9);
  pdf.setTextColor(23, 32, 51);
  pdf.text(doc.buyerCompany || 'Consignee Company', margin + 4, currentY + 10);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(71, 85, 105);
  pdf.text(doc.buyerBillingAddress || doc.buyerShippingAddress || 'Billing Address', margin + 4, currentY + 14);
  const buyerLocation = [doc.buyerCity, doc.buyerState, doc.buyerCountry].filter(Boolean).join(', ');
  pdf.text(`${buyerLocation} ${doc.buyerTaxId ? `• Tax/VAT: ${doc.buyerTaxId}` : ''}`, margin + 4, currentY + 18);
  pdf.text(`Attn: ${doc.buyerContactPerson || 'Purchasing Department'}${doc.buyerDesignation ? ` (${doc.buyerDesignation})` : ''} • Email: ${doc.buyerEmail || 'N/A'}`, margin + 4, currentY + 22);

  if (doc.consigneeName && doc.consigneeName !== doc.buyerCompany) {
    pdf.text(`Ship To / Consignee: ${doc.consigneeName} (${doc.consigneeAddress || 'As Above'})`, margin + 4, currentY + 26);
  } else if (doc.notifyParty) {
    pdf.text(`Notify Party: ${doc.notifyParty}`, margin + 4, currentY + 26);
  }

  // Vertical Separator
  pdf.setDrawColor(226, 232, 240);
  pdf.line(margin + 98, currentY, margin + 98, currentY + boxHeight);

  // Right: Shipment & Trade Details
  const rightColX = margin + 102;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text('SHIPMENT & TRANSACTION TERMS:', rightColX, currentY + 5);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(71, 85, 105);

  pdf.text(`Port of Loading: ${doc.originPort || 'FOB Loading Port'}`, rightColX, currentY + 10);
  pdf.text(`Port of Discharge: ${doc.destinationPort || 'Named Destination Port'}`, rightColX, currentY + 14);
  pdf.text(`Mode of Transport: ${doc.modeOfTransport || 'Sea'} Freight | Currency: ${doc.currency}`, rightColX, currentY + 18);
  pdf.text(`Payment: ${doc.paymentTerms || '30% Advance TT, 70% against BL copy'}`, rightColX, currentY + 22);

  const shipExtra = [
    doc.shipmentPeriod ? `Ship: ${doc.shipmentPeriod}` : null,
    doc.partialShipment !== undefined ? `Partial: ${doc.partialShipment ? 'Allowed' : 'Not Allowed'}` : null,
  ].filter(Boolean).join(' | ');
  if (shipExtra) {
    pdf.text(shipExtra, rightColX, currentY + 26);
  }

  currentY += boxHeight + 5;

  // ---------------------------------------------------------------------------
  // SECTION E: PRODUCTS / GOODS LINE ITEMS TABLE
  // ---------------------------------------------------------------------------
  const renderTableHeader = (y: number) => {
    pdf.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    pdf.rect(margin, y, contentWidth, 7, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(255, 255, 255);

    if (isPackingList) {
      pdf.text('#', margin + 3, y + 4.8);
      pdf.text('Description of Goods', margin + 10, y + 4.8);
      pdf.text('HS Code', margin + 80, y + 4.8);
      pdf.text('Quantity', margin + 105, y + 4.8);
      pdf.text('Pkgs', margin + 130, y + 4.8);
      pdf.text('Net Wt (Kg)', margin + 150, y + 4.8);
      pdf.text('Gross Wt (Kg)', pageWidth - margin - 3, y + 4.8, { align: 'right' });
    } else {
      pdf.text('#', margin + 3, y + 4.8);
      pdf.text('Description of Goods & Specifications', margin + 12, y + 4.8);
      pdf.text('HS Code', margin + 85, y + 4.8);
      pdf.text('Quantity', margin + 110, y + 4.8);
      pdf.text(`Unit Rate (${doc.currency})`, margin + 140, y + 4.8);
      pdf.text(`Amount (${doc.currency})`, pageWidth - margin - 3, y + 4.8, { align: 'right' });
    }

    return y + 7;
  };

  currentY = renderTableHeader(currentY);

  const items = doc.items || [];
  let itemIndex = 1;

  for (const item of items) {
    // Check page overflow
    if (currentY > pageHeight - 55) {
      pdf.addPage();
      currentY = renderHeader(false);
      currentY = renderTableHeader(currentY);
    }

    const rowHeight = item.specifications ? 9 : 7;

    // Zebra striping
    if (itemIndex % 2 === 0) {
      pdf.setFillColor(250, 252, 254);
      pdf.rect(margin, currentY, contentWidth, rowHeight, 'F');
    }

    pdf.setDrawColor(241, 245, 249);
    pdf.setLineWidth(0.2);
    pdf.line(margin, currentY + rowHeight, pageWidth - margin, currentY + rowHeight);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(23, 32, 51);

    if (isPackingList) {
      pdf.text(String(item.itemNumber || itemIndex), margin + 3, currentY + 4.8);
      pdf.text(String(item.productName || 'Export Item').substring(0, 40), margin + 10, currentY + 4.8);
      pdf.text(String(item.hsCode || '-'), margin + 80, currentY + 4.8);
      pdf.text(`${item.quantity} ${item.unit || 'PCS'}`, margin + 105, currentY + 4.8);
      pdf.text(String(item.packageCount || 1), margin + 130, currentY + 4.8);
      pdf.text(String(item.netWeight || '-'), margin + 150, currentY + 4.8);
      pdf.text(String(item.grossWeight || '-'), pageWidth - margin - 3, currentY + 4.8, { align: 'right' });
    } else {
      pdf.text(String(item.itemNumber || itemIndex), margin + 3, currentY + 4.8);
      pdf.setFont('helvetica', 'bold');
      pdf.text(String(item.productName || 'Export Product').substring(0, 42), margin + 12, currentY + 4.8);

      if (item.specifications) {
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(6.5);
        pdf.setTextColor(100, 116, 139);
        pdf.text(String(item.specifications).substring(0, 50), margin + 12, currentY + 8);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
        pdf.setTextColor(23, 32, 51);
      }

      pdf.setFont('helvetica', 'normal');
      pdf.text(String(item.hsCode || '-'), margin + 85, currentY + 4.8);
      pdf.text(`${item.quantity} ${item.unit || 'PCS'}`, margin + 110, currentY + 4.8);
      pdf.text(formatCurrency(item.unitPrice, doc.currency), margin + 140, currentY + 4.8);
      pdf.setFont('helvetica', 'bold');
      pdf.text(formatCurrency(item.lineTotal, doc.currency), pageWidth - margin - 3, currentY + 4.8, { align: 'right' });
    }

    currentY += rowHeight;
    itemIndex++;
  }

  currentY += 4;

  // ---------------------------------------------------------------------------
  // SECTION F: DETAILED PRICING BREAKDOWN & COST ALLOCATION
  // ---------------------------------------------------------------------------
  if (currentY > pageHeight - 75) {
    pdf.addPage();
    currentY = renderHeader(false);
  }

  const totalsBoxWidth = 84;
  const totalsX = pageWidth - margin - totalsBoxWidth;

  if (!isPackingList) {
    // Calculate total extra charges count
    const extraCharges = [
      { label: 'Discount:', val: doc.discountTotal ? -doc.discountTotal : 0 },
      { label: 'Packing Charges:', val: doc.packingCharges || 0 },
      { label: 'Inland Transport:', val: doc.inlandTransportCharges || 0 },
      { label: 'Freight Charges:', val: doc.freightCharges || 0 },
      { label: 'Insurance Charges:', val: doc.insuranceCharges || 0 },
      { label: 'Inspection / SGS:', val: doc.inspectionCharges || 0 },
      { label: 'Other Handling:', val: doc.otherCharges || 0 },
    ].filter((c) => c.val !== 0);

    const calcBoxH = 26 + extraCharges.length * 4;
    pdf.setFillColor(248, 250, 252);
    pdf.rect(totalsX, currentY, totalsBoxWidth, calcBoxH, 'F');
    pdf.setDrawColor(226, 232, 240);
    pdf.rect(totalsX, currentY, totalsBoxWidth, calcBoxH, 'S');

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(100, 116, 139);

    let totY = currentY + 5;
    pdf.text('Product Subtotal:', totalsX + 4, totY);
    pdf.text(formatCurrency(doc.subtotal || doc.grandTotal, doc.currency), pageWidth - margin - 4, totY, { align: 'right' });
    totY += 4.5;

    for (const ec of extraCharges) {
      pdf.text(ec.label, totalsX + 4, totY);
      pdf.text(formatCurrency(ec.val, doc.currency), pageWidth - margin - 4, totY, { align: 'right' });
      totY += 4;
    }

    if (doc.taxTotal && doc.taxTotal > 0) {
      const isLut = doc.gstTreatment === 'zero_rated_lut' || doc.taxType === 'lut_bond' || doc.taxType === 'zero_rated_export';
      pdf.text(`Tax (${isLut ? 'LUT Under Bond 0%' : 'GST'}):`, totalsX + 4, totY);
      pdf.text(formatCurrency(doc.taxTotal, doc.currency), pageWidth - margin - 4, totY, { align: 'right' });
      totY += 4.5;
    }

    // Grand Total Bar
    pdf.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    pdf.rect(totalsX, totY - 1, totalsBoxWidth, 7, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(255, 255, 255);
    pdf.text(`GRAND TOTAL (${doc.incoterm || 'FOB'}):`, totalsX + 4, totY + 3.8);
    pdf.text(formatCurrency(doc.grandTotal, doc.currency), pageWidth - margin - 4, totY + 3.8, { align: 'right' });
  }

  // Left Side: Total in Words, Payment Terms, Bank Details
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text('TOTAL AMOUNT IN WORDS:', margin, currentY + 5);

  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(7.5);
  pdf.setTextColor(23, 32, 51);
  const words = doc.amountInWords || `${doc.currency} ${numberToWords(Math.round(doc.grandTotal))} Only`;
  pdf.text(words.substring(0, 56), margin, currentY + 9.5);

  // Bank wire details (Shown only if configured)
  let bankOffset = currentY + 16;
  if (doc.showBankDetails && seller.bankName) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text('BANK WIRE TRANSFER (TT) DETAILS:', margin, bankOffset);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(71, 85, 105);
    pdf.text(`Bank: ${seller.bankName} | A/C: ${seller.accountNumber || 'N/A'}`, margin, bankOffset + 4);
    pdf.text(
      `SWIFT / BIC: ${seller.swiftBic || 'N/A'} | IFSC: ${seller.ifscCode || 'N/A'} | Beneficiary: ${seller.accountHolderName || seller.legalName || 'N/A'}`,
      margin,
      bankOffset + 7.5
    );
  } else if (doc.bankDetails) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text('PAYMENT INSTRUCTIONS:', margin, bankOffset);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(71, 85, 105);
    pdf.text(doc.bankDetails.substring(0, 75), margin, bankOffset + 4);
  }

  currentY += 34;

  // ---------------------------------------------------------------------------
  // SECTION I: COMMERCIAL TERMS, FORCE MAJEURE & ARBITRATION
  // ---------------------------------------------------------------------------
  if (currentY > pageHeight - 50) {
    pdf.addPage();
    currentY = renderHeader(false);
  }

  if (doc.termsAndConditions) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(100, 116, 139);
    pdf.text('COMMERCIAL TERMS, QUALITY & JURISDICTION:', margin, currentY + 2);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    pdf.setTextColor(71, 85, 105);
    pdf.text(doc.termsAndConditions.substring(0, 220), margin, currentY + 6);
    currentY += 14;
  }

  // ---------------------------------------------------------------------------
  // SECTION J: DECLARATION & SIGNATURES
  // ---------------------------------------------------------------------------
  if (currentY > pageHeight - 35) {
    pdf.addPage();
    currentY = renderHeader(false);
  }

  // Left: Buyer Acceptance (if enabled)
  if (doc.showBuyerAcceptance) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(100, 116, 139);
    pdf.text('BUYER ACCEPTANCE & CONFIRMATION:', margin, currentY + 2);

    pdf.setDrawColor(203, 213, 225);
    pdf.setLineWidth(0.3);
    pdf.line(margin, currentY + 18, margin + 65, currentY + 18);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text('Authorized Signatory & Company Stamp', margin, currentY + 21);
  } else {
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(6.5);
    pdf.setTextColor(148, 163, 184);
    pdf.text('This quotation is an official commercial offer subject to final order confirmation.', margin, currentY + 8);
  }

  // Right: Exporter Signatory & Stamp
  const sigX = pageWidth - margin - 60;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  pdf.text(`For ${(seller.legalName || 'Exporter Company').toUpperCase()}`, sigX, currentY + 2);

  pdf.setDrawColor(203, 213, 225);
  pdf.setLineWidth(0.3);
  pdf.line(sigX, currentY + 18, pageWidth - margin, currentY + 18);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 116, 139);
  pdf.text(doc.authorizedSignatoryName || seller.primaryContactName || 'Authorized Signatory', sigX, currentY + 21);
  pdf.setFontSize(6);
  pdf.text(doc.signatoryDesignation || seller.designation || 'Export Director / Authorized Signatory', sigX, currentY + 24);

  // ---------------------------------------------------------------------------
  // PROFESSIONAL FOOTER ON EVERY PAGE (NO BROWSER DATE, NO LOCALHOST URL)
  // ---------------------------------------------------------------------------
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);

    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.3);
    pdf.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    pdf.setTextColor(148, 163, 184);

    pdf.text(
      'ExportFlow by BENZWELL — International Trade Management Platform',
      margin,
      pageHeight - 8
    );

    pdf.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - 8,
      { align: 'right' }
    );
  }

  return new Uint8Array(pdf.output('arraybuffer'));
}
