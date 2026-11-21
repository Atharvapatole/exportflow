import { NextRequest, NextResponse } from 'next/server';
import { getCurrentContext } from '@/lib/auth';
import { buyerRepo } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.organization) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const buyer = await buyerRepo.findById(ctx.organization.id, id);
  if (!buyer) return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });

  return NextResponse.json(buyer);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.organization) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const updated = await buyerRepo.update(ctx.organization.id, id, body);
  if (!updated) return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.organization) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const deleted = await buyerRepo.delete(ctx.organization.id, id);
  if (!deleted) return NextResponse.json({ error: 'Failed to delete buyer' }, { status: 404 });

  return NextResponse.json({ success: true });
}
