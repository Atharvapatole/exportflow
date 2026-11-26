import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentContext } from '@/lib/auth';
import { chaDocRepo, chaClientRepo } from '@/lib/db';
import { ChaDocumentType } from '@/types';

export const dynamic = 'force-dynamic';

const documentSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  clientName: z.string().min(1, 'Client name is required'),
  clientIec: z.string().optional(),
  clientGstin: z.string().optional(),
  clientPan: z.string().optional(),
  jobId: z.string().optional(),
  jobNumber: z.string().optional(),
  type: z.enum([
    'boe_worksheet',
    'shipping_bill_checklist',
    'gatt_declaration',
    'cha_authorization',
    'customs_query_reply',
    'delivery_order_memo',
    'cha_duty_debit_note',
    'customs_kyc_form',
  ]),
  documentTitle: z.string().min(2, 'Document title is required'),
  documentNumber: z.string().optional(),
  date: z.string().optional(),
  status: z.enum(['draft', 'finalized', 'submitted', 'printed']).default('draft'),
  data: z.record(z.string(), z.any()),
  totalAmount: z.number().optional(),
  currency: z.string().optional(),
  notes: z.string().optional(),
  signatureUrl: z.string().optional(),
  stampUrl: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const ctx = await getCurrentContext();
    if (!ctx || !ctx.organization?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId') || undefined;

    const docs = await chaDocRepo.listByOrg(ctx.organization.id, clientId);
    return NextResponse.json({ documents: docs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getCurrentContext();
    if (!ctx || !ctx.organization?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = documentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: (result.error as any).issues?.[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const val = result.data;
    const docNumber = val.documentNumber || (await chaDocRepo.getNextDocNumber(ctx.organization.id, val.type as ChaDocumentType));

    const doc = await chaDocRepo.create({
      chaOrgId: ctx.organization.id,
      clientId: val.clientId,
      clientName: val.clientName,
      clientIec: val.clientIec,
      clientGstin: val.clientGstin,
      clientPan: val.clientPan,
      jobId: val.jobId,
      jobNumber: val.jobNumber,
      type: val.type as ChaDocumentType,
      documentTitle: val.documentTitle,
      documentNumber: docNumber,
      date: val.date || new Date().toISOString().split('T')[0],
      status: val.status,
      data: val.data,
      totalAmount: val.totalAmount,
      currency: val.currency || 'INR',
      notes: val.notes,
      signatureUrl: val.signatureUrl,
      stampUrl: val.stampUrl,
    });

    return NextResponse.json({ success: true, document: doc }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
