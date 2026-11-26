import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentContext } from '@/lib/auth';
import { chaClientRepo, adminRepo } from '@/lib/db';

const clientSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  iecNumber: z.string().min(5, 'IEC Number is required'),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  contactPerson: z.string().min(2, 'Contact person name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  creditTerms: z.string().optional(),
  notes: z.string().optional(),
});

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const ctx = await getCurrentContext();
    if (!ctx || !ctx.organization?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clients = await chaClientRepo.listByOrg(ctx.organization.id);
    return NextResponse.json({ clients });
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
    const result = clientSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: (result.error as any).issues?.[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const client = await chaClientRepo.create({
      chaOrgId: ctx.organization.id,
      companyName: result.data.companyName,
      iecNumber: result.data.iecNumber.toUpperCase(),
      gstin: result.data.gstin?.toUpperCase(),
      pan: result.data.pan?.toUpperCase(),
      contactPerson: result.data.contactPerson,
      email: result.data.email.toLowerCase(),
      phone: result.data.phone,
      address: result.data.address,
      city: result.data.city,
      state: result.data.state,
      pincode: result.data.pincode,
      country: 'India',
      kycStatus: 'verified',
      creditTerms: result.data.creditTerms || 'Net 15 Days',
      notes: result.data.notes,
    });

    await adminRepo.logActivity({
      userId: ctx.user.id,
      userName: ctx.user.name,
      organizationId: ctx.organization.id,
      action: 'CHA_CLIENT_CREATED',
      entity: 'CHA_CLIENT',
      entityId: client.id,
      details: `Added new client: ${client.companyName} (IEC: ${client.iecNumber})`,
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
