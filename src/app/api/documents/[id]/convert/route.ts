import { NextRequest, NextResponse } from 'next/server';
import { getCurrentContext } from '@/lib/auth';
import { documentRepo, orgRepo, adminRepo } from '@/lib/db';
import { generateDocNumber, generateToken } from '@/lib/utils';
import { DocumentType } from '@/types';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ctx = await getCurrentContext();
    if (!ctx || !ctx.organization) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const sourceDoc = await documentRepo.findById(ctx.organization.id, id);
    if (!sourceDoc) return NextResponse.json({ error: 'Source document not found' }, { status: 404 });

    const body = await req.json();
    const targetType: DocumentType = body.targetType || 'proforma_invoice';

    const profile = await orgRepo.getProfile(ctx.organization.id);
    const prefix =
      targetType === 'proforma_invoice'
        ? profile?.documentPrefixes?.proformaInvoice || 'PI'
        : targetType === 'commercial_invoice'
        ? profile?.documentPrefixes?.commercialInvoice || 'CI'
        : targetType === 'packing_list'
        ? profile?.documentPrefixes?.packingList || 'PL'
        : targetType === 'sales_order'
        ? profile?.documentPrefixes?.salesOrder || 'SO'
        : 'DOC';

    const count = (await documentRepo.listByOrg(ctx.organization.id, targetType)).length + 1;
    const newDocNumber = generateDocNumber(prefix, count);

    // Calculate packaging if converting to packing list
    let totalCartons = 0;
    let totalUnits = 0;
    let totalNetWeight = 0;
    let totalGrossWeight = 0;
    let totalCbm = 0;

    sourceDoc.items.forEach((it) => {
      totalUnits += it.quantity || 0;
      totalCartons += it.packageCount || Math.ceil((it.quantity || 1) / 10);
      totalNetWeight += (it.netWeight || 1) * (it.quantity || 1);
      totalGrossWeight += (it.grossWeight || 1.1) * (it.quantity || 1);
      totalCbm += (it.cbm || 0.05) * (it.quantity || 1);
    });

    const newDoc = await documentRepo.create(ctx.organization.id, {
      ...sourceDoc,
      type: targetType,
      documentNumber: newDocNumber,
      referenceNumber: `Ref: ${sourceDoc.documentNumber}`,
      date: new Date().toISOString().split('T')[0],
      convertedFromId: sourceDoc.id,
      convertedFromType: sourceDoc.type,
      status: targetType === 'commercial_invoice' ? 'draft' : 'draft',
      shareToken: generateToken(24),
    });

    // Mark original quotation as converted or accepted if applicable
    if (sourceDoc.type === 'quotation') {
      await documentRepo.update(ctx.organization.id, sourceDoc.id, {
        status: 'accepted',
      });
    }

    await adminRepo.logActivity({
      userId: ctx.user.id,
      userName: ctx.user.name,
      organizationId: ctx.organization.id,
      action: 'DOCUMENT_CONVERTED',
      entity: 'DOCUMENT',
      entityId: newDoc.id,
      details: `Converted ${sourceDoc.type.toUpperCase()} (${sourceDoc.documentNumber}) into ${targetType.toUpperCase()} (${newDoc.documentNumber})`,
    });

    return NextResponse.json(newDoc, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
