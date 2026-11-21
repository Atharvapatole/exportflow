import { NextRequest, NextResponse } from 'next/server';
import { getCurrentContext } from '@/lib/auth';
import { documentRepo, adminRepo } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.organization) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const doc = await documentRepo.findById(ctx.organization.id, id);
  if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

  return NextResponse.json(doc);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.organization) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const updated = await documentRepo.update(ctx.organization.id, id, body);
  if (!updated) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.organization) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const deleted = await documentRepo.delete(ctx.organization.id, id);
  if (!deleted) return NextResponse.json({ error: 'Failed to delete document' }, { status: 404 });

  await adminRepo.logActivity({
    userId: ctx.user.id,
    userName: ctx.user.name,
    organizationId: ctx.organization.id,
    action: 'DOCUMENT_DELETED',
    entity: 'DOCUMENT',
    entityId: id,
    details: `Deleted document ID: ${id}`,
  });

  return NextResponse.json({ success: true });
}
