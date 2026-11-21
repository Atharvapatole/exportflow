import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentContext } from '@/lib/auth';
import { paymentRepo, adminRepo, notificationRepo } from '@/lib/db';

const paymentSchema = z.object({
  buyerId: z.string().optional(),
  buyerCompany: z.string().min(1, 'Buyer company name is required'),
  invoiceReference: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('USD'),
  paymentDate: z.string().min(1, 'Payment date is required'),
  paymentMethod: z.enum(['wire_transfer', 'lc', 'advance', 'card', 'cheque', 'other']).default('wire_transfer'),
  transactionReference: z.string().min(1, 'Transaction reference is required'),
  status: z.enum(['pending', 'partially_paid', 'paid', 'overdue', 'cancelled']).default('paid'),
  notes: z.string().optional(),
});

export async function GET() {
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.organization) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payments = await paymentRepo.listByOrg(ctx.organization.id);
  return NextResponse.json(payments);
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getCurrentContext();
    if (!ctx || !ctx.organization) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const result = paymentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: (result.error as any).issues?.[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const payment = await paymentRepo.create(ctx.organization.id, result.data);

    await notificationRepo.create(ctx.organization.id, {
      title: 'Payment Received Logged',
      message: `Received ${payment.currency} ${payment.amount.toLocaleString()} from ${payment.buyerCompany} (Ref: ${payment.transactionReference})`,
      type: 'success',
      link: '/dashboard/payments',
    });

    await adminRepo.logActivity({
      userId: ctx.user.id,
      userName: ctx.user.name,
      organizationId: ctx.organization.id,
      action: 'PAYMENT_RECORDED',
      entity: 'PAYMENT',
      entityId: payment.id,
      details: `Recorded payment: ${payment.currency} ${payment.amount} from ${payment.buyerCompany}`,
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
