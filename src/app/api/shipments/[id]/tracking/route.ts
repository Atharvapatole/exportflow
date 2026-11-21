import { NextRequest, NextResponse } from 'next/server';
import { getCurrentContext } from '@/lib/auth';
import { shipmentRepo, notificationRepo } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ctx = await getCurrentContext();
    if (!ctx || !ctx.organization) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const updated = await shipmentRepo.addTrackingUpdate(ctx.organization.id, id, {
      status: body.status,
      location: body.location || 'Current Transit Hub',
      comment: body.comment || 'Milestone update logged',
    });

    if (!updated) return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });

    await notificationRepo.create(ctx.organization.id, {
      title: `Shipment Status Updated: ${updated.shipmentReference}`,
      message: `Status changed to ${body.status.replace(/_/g, ' ').toUpperCase()} at ${body.location}`,
      type: 'info',
      link: '/dashboard/shipments',
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
