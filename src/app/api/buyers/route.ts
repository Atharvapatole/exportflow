import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentContext } from '@/lib/auth';
import { buyerRepo, adminRepo } from '@/lib/db';

const buyerSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  contactPerson: z.string().min(2, 'Contact person is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(3, 'Phone is required'),
  country: z.string().min(2, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  billingAddress: z.string().min(2, 'Billing address is required'),
  shippingAddress: z.string().min(2, 'Shipping address is required'),
  website: z.string().optional(),
  taxId: z.string().optional(),
  buyerType: z.string().optional(),
  industry: z.string().optional(),
  status: z.enum(['new', 'contacted', 'interested', 'negotiating', 'converted', 'inactive', 'lost']).default('new'),
  notes: z.string().optional(),
});

export async function GET() {
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.organization) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const buyers = await buyerRepo.listByOrg(ctx.organization.id);
  return NextResponse.json(buyers);
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getCurrentContext();
    if (!ctx || !ctx.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = buyerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: (result.error as any).issues?.[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const buyer = await buyerRepo.create(ctx.organization.id, result.data);

    await adminRepo.logActivity({
      userId: ctx.user.id,
      userName: ctx.user.name,
      organizationId: ctx.organization.id,
      action: 'BUYER_CREATED',
      entity: 'BUYER',
      entityId: buyer.id,
      details: `Added new buyer: ${buyer.companyName} (${buyer.country})`,
    });

    return NextResponse.json(buyer, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
