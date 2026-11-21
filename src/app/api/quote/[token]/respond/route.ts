import { NextRequest, NextResponse } from 'next/server';
import { documentRepo, notificationRepo, adminRepo } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const doc = await documentRepo.findByShareToken(token);
    if (!doc) {
      return NextResponse.json({ error: 'Quotation link not found or expired' }, { status: 404 });
    }

    const body = await req.json();
    const action = body.action; // 'accept' | 'revise' | 'message'
    const buyerMessage = body.message || '';

    if (action === 'accept') {
      await documentRepo.update(doc.organizationId, doc.id, {
        status: 'accepted',
      });

      await notificationRepo.create(doc.organizationId, {
        title: 'Quotation Accepted by Buyer! 🎉',
        message: `${doc.buyerCompany} has accepted quotation ${doc.documentNumber} (${doc.currency} ${doc.grandTotal.toLocaleString()}). You can now convert it to a Proforma Invoice.`,
        type: 'success',
        link: `/dashboard/quotations/${doc.id}`,
      });
    } else if (action === 'revise') {
      await documentRepo.update(doc.organizationId, doc.id, {
        status: 'revised',
        notes: doc.notes ? `${doc.notes}\n[Buyer Revision Request]: ${buyerMessage}` : `[Buyer Revision Request]: ${buyerMessage}`,
      });

      await notificationRepo.create(doc.organizationId, {
        title: 'Quotation Revision Requested',
        message: `${doc.buyerCompany} requested changes on ${doc.documentNumber}: "${buyerMessage}"`,
        type: 'warning',
        link: `/dashboard/quotations/${doc.id}`,
      });
    } else if (action === 'message') {
      await notificationRepo.create(doc.organizationId, {
        title: 'New Message from Buyer',
        message: `Message from ${doc.buyerCompany} on ${doc.documentNumber}: "${buyerMessage}"`,
        type: 'info',
        link: `/dashboard/quotations/${doc.id}`,
      });
    }

    await adminRepo.logActivity({
      organizationId: doc.organizationId,
      action: `BUYER_QUOTATION_${action.toUpperCase()}`,
      entity: 'DOCUMENT',
      entityId: doc.id,
      details: `Buyer ${doc.buyerCompany} responded: ${action}`,
    });

    return NextResponse.json({ success: true, action });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
