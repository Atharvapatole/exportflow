import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentContext } from '@/lib/auth';
import { shipmentRepo, adminRepo } from '@/lib/db';

const shipmentSchema = z.object({
  shipmentReference: z.string().min(2, 'Shipment reference is required'),
  buyerId: z.string().optional(),
  buyerCompany: z.string().min(1, 'Buyer company is required'),
  orderReference: z.string().optional(),
  invoiceReference: z.string().optional(),
  originPort: z.string().min(2, 'Origin port is required'),
  destinationPort: z.string().min(2, 'Destination port is required'),
  shippingLine: z.string().default('Maersk Line / MSC'),
  vesselName: z.string().default(''),
  containerNumber: z.string().default(''),
  containerType: z.enum(['20ft', '40ft', '40ft_hc', 'lcl', 'air']).default('20ft'),
  etd: z.string().min(1, 'ETD is required'),
  eta: z.string().min(1, 'ETA is required'),
  status: z.enum(['preparing', 'ready_for_dispatch', 'booked', 'in_transit', 'arrived', 'delivered', 'delayed', 'cancelled']).default('preparing'),
  freightDetails: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET() {
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.organization) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const shipments = await shipmentRepo.listByOrg(ctx.organization.id);
  return NextResponse.json(shipments);
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getCurrentContext();
    if (!ctx || !ctx.organization) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const result = shipmentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: (result.error as any).issues?.[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const shipment = await shipmentRepo.create(ctx.organization.id, result.data);

    await adminRepo.logActivity({
      userId: ctx.user.id,
      userName: ctx.user.name,
      organizationId: ctx.organization.id,
      action: 'SHIPMENT_CREATED',
      entity: 'SHIPMENT',
      entityId: shipment.id,
      details: `Created shipment ${shipment.shipmentReference} (${shipment.originPort} → ${shipment.destinationPort})`,
    });

    return NextResponse.json(shipment, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
