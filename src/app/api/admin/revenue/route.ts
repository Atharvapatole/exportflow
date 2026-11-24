import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminContext } from '@/lib/auth';
import { adminRepo } from '@/lib/db';

const revenueSchema = z.object({
  reference: z.string().min(2, 'Reference is required'),
  customerName: z.string().min(2, 'Customer / Company name is required'),
  category: z.enum(['custom_development', 'setup_services', 'consulting', 'custom_integrations', 'other']),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('USD'),
  dateReceived: z.string().min(1, 'Date is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  transactionReference: z.string().min(1, 'Transaction reference is required'),
  description: z.string().default(''),
  status: z.enum(['completed', 'pending', 'refunded']).default('completed'),
});

export async function GET() {
  const ctx = await getAdminContext();
  if (!ctx || !ctx.isSuperAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const list = await adminRepo.getRevenueList();
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getAdminContext();
    if (!ctx || !ctx.isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const result = revenueSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: (result.error as any).issues?.[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const rec = await adminRepo.addRevenueRecord(result.data);

    await adminRepo.logAudit({
      adminId: ctx.user.id,
      adminEmail: ctx.user.email,
      action: 'PLATFORM_REVENUE_LOGGED',
      targetEntity: 'REVENUE',
      targetId: rec.id,
      details: { amount: rec.amount, currency: rec.currency, customer: rec.customerName },
    });

    return NextResponse.json(rec, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
