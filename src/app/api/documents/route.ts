import { NextRequest, NextResponse } from 'next/server';
import { getCurrentContext } from '@/lib/auth';
import { documentRepo, orgRepo, adminRepo } from '@/lib/db';
import { BaseDocument } from '@/types';
import { generateDocNumber, generateToken, numberToWords, roundToTwo } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.organization) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const type = url.searchParams.get('type') || undefined;

  const docs = await documentRepo.listByOrg(ctx.organization.id, type);
  return NextResponse.json(docs);
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getCurrentContext();
    if (!ctx || !ctx.organization) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const profile = await orgRepo.getProfile(ctx.organization.id);

    // Calculate totals safely
    const items = body.items || [];
    let subtotal = 0;
    let discountTotal = 0;
    let taxableAmount = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    let igstTotal = 0;
    let taxTotal = 0;

    const processedItems = items.map((item: any, idx: number) => {
      const qty = Number(item.quantity) || 1;
      const price = Number(item.unitPrice) || 0;
      const discountPct = Number(item.discountPercentage) || 0;
      const baseLine = roundToTwo(qty * price);
      const discAmount = roundToTwo((baseLine * discountPct) / 100);
      const lineTaxable = roundToTwo(baseLine - discAmount);

      const taxRate = Number(item.taxRate) || 0;
      let lineTax = 0;
      let cgst = 0;
      let sgst = 0;
      let igst = 0;

      if (body.taxType === 'domestic_gst') {
        // CGST + SGST or IGST
        if (body.isInterState) {
          igst = roundToTwo((lineTaxable * taxRate) / 100);
          lineTax = igst;
        } else {
          cgst = roundToTwo((lineTaxable * (taxRate / 2)) / 100);
          sgst = roundToTwo((lineTaxable * (taxRate / 2)) / 100);
          lineTax = roundToTwo(cgst + sgst);
        }
      } else if (body.taxType === 'igst_export') {
        igst = roundToTwo((lineTaxable * taxRate) / 100);
        lineTax = igst;
      }
      // zero_rated_export and lut_bond have 0 tax applied

      const lineTotal = roundToTwo(lineTaxable + lineTax);

      subtotal = roundToTwo(subtotal + baseLine);
      discountTotal = roundToTwo(discountTotal + discAmount);
      taxableAmount = roundToTwo(taxableAmount + lineTaxable);
      cgstTotal = roundToTwo(cgstTotal + cgst);
      sgstTotal = roundToTwo(sgstTotal + sgst);
      igstTotal = roundToTwo(igstTotal + igst);
      taxTotal = roundToTwo(taxTotal + lineTax);

      return {
        ...item,
        itemNumber: idx + 1,
        quantity: qty,
        unitPrice: price,
        discountPercentage: discountPct,
        discountAmount: discAmount,
        taxRate,
        cgstAmount: cgst,
        sgstAmount: sgst,
        igstAmount: igst,
        taxAmount: lineTax,
        lineTotal,
      };
    });

    const grandTotal = roundToTwo(taxableAmount + taxTotal);
    const amountInWords = numberToWords(grandTotal, body.currency || 'USD');

    // Auto-generate doc number if not provided
    const prefix =
      body.type === 'quotation'
        ? profile?.documentPrefixes?.quotation || 'QT'
        : body.type === 'proforma_invoice'
        ? profile?.documentPrefixes?.proformaInvoice || 'PI'
        : body.type === 'commercial_invoice'
        ? profile?.documentPrefixes?.commercialInvoice || 'CI'
        : body.type === 'packing_list'
        ? profile?.documentPrefixes?.packingList || 'PL'
        : 'DOC';

    const count = (await documentRepo.listByOrg(ctx.organization.id, body.type)).length + 1;
    const documentNumber = body.documentNumber || generateDocNumber(prefix, count);

    const docData: Omit<BaseDocument, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'> = {
      type: body.type || 'quotation',
      documentNumber,
      referenceNumber: body.referenceNumber || '',
      date: body.date || new Date().toISOString().split('T')[0],
      validityDate: body.validityDate || '',
      buyerId: body.buyerId,
      buyerCompany: body.buyerCompany || '',
      buyerContactPerson: body.buyerContactPerson || '',
      buyerEmail: body.buyerEmail || '',
      buyerPhone: body.buyerPhone || '',
      buyerCountry: body.buyerCountry || '',
      buyerBillingAddress: body.buyerBillingAddress || '',
      buyerShippingAddress: body.buyerShippingAddress || '',
      buyerTaxId: body.buyerTaxId || '',
      sellerDetails: profile || {},
      currency: body.currency || 'USD',
      incoterm: body.incoterm || 'FOB',
      originPort: body.originPort || '',
      destinationPort: body.destinationPort || '',
      items: processedItems,
      subtotal,
      discountTotal,
      taxableAmount,
      taxType: body.taxType || 'zero_rated_export',
      cgstTotal,
      sgstTotal,
      igstTotal,
      taxTotal,
      grandTotal,
      amountInWords,
      paymentTerms: body.paymentTerms || profile?.defaultPaymentTerms || '30% Advance, 70% against BL',
      advancePercentage: body.advancePercentage || 30,
      advanceAmount: roundToTwo((grandTotal * (body.advancePercentage || 30)) / 100),
      balanceAmount: roundToTwo(grandTotal - (grandTotal * (body.advancePercentage || 30)) / 100),
      deliveryTime: body.deliveryTime || 'Within 2-3 weeks from receipt of advance',
      freightTerms: body.freightTerms || 'Ocean Freight Prepaid / Collect as per Incoterm',
      packagingDetails: body.packagingDetails || 'Export standard sea-worthy seaworthy packaging',
      insuranceTerms: body.insuranceTerms || 'Covered by seller/buyer as per Incoterms 2020',
      warrantyTerms: body.warrantyTerms || '12 months quality guarantee as per technical specs',
      bankDetails:
        body.bankDetails ||
        (profile?.bankName
          ? `Bank: ${profile.bankName}, A/C: ${profile.accountNumber}, SWIFT: ${profile.swiftBic}, Beneficiary: ${profile.accountHolderName}`
          : ''),
      notes: body.notes || '',
      termsAndConditions:
        body.termsAndConditions ||
        '1. Goods once sold will be covered strictly as per international trade contract.\n2. Force Majeure applies.\n3. Any dispute shall be subject to jurisdiction of arbitration at origin.',
      templateId: body.templateId || profile?.preferredTemplate || 'classic-corporate',
      status: body.status || 'draft',
      shareToken: generateToken(24),
      convertedFromId: body.convertedFromId,
      convertedFromType: body.convertedFromType,
    };

    const createdDoc = await documentRepo.create(ctx.organization.id, docData);

    await adminRepo.logActivity({
      userId: ctx.user.id,
      userName: ctx.user.name,
      organizationId: ctx.organization.id,
      action: 'DOCUMENT_CREATED',
      entity: 'DOCUMENT',
      entityId: createdDoc.id,
      details: `Generated ${createdDoc.type.toUpperCase()}: ${createdDoc.documentNumber} (${createdDoc.currency} ${createdDoc.grandTotal})`,
    });

    return NextResponse.json(createdDoc, { status: 201 });
  } catch (err: any) {
    console.error('Error creating document:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
