import { NextRequest, NextResponse } from 'next/server';
import { getCurrentContext } from '@/lib/auth';
import { productRepo } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.organization) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const product = await productRepo.findById(ctx.organization.id, id);
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  return NextResponse.json(product);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.organization) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const updated = await productRepo.update(ctx.organization.id, id, body);
  if (!updated) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.organization) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const deleted = await productRepo.delete(ctx.organization.id, id);
  if (!deleted) return NextResponse.json({ error: 'Failed to delete product' }, { status: 404 });

  return NextResponse.json({ success: true });
}
