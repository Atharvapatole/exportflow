import { NextRequest, NextResponse } from 'next/server';
import { getCurrentContext } from '@/lib/auth';
import { documentRepo, revisionRepo } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.organization) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const revisions = await revisionRepo.listByQuotation(id);
  return NextResponse.json({ revisions });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.organization) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { changeSummary = 'Created new revision' } = await request.json();
    const doc = await documentRepo.findById(ctx.organization.id, id);

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Save snapshot of current document state
    const rev = await revisionRepo.createRevision(
      doc.id,
      ctx.organization.id,
      doc,
      changeSummary,
      ctx.user.id
    );

    // Increment revision number and unlock for editing
    const updatedDoc = await documentRepo.update(ctx.organization.id, doc.id, {
      revisionNumber: (doc.revisionNumber || 1) + 1,
      isLocked: false,
      status: 'draft',
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Revision #${rev.revisionNumber} archived successfully. Quotation unlocked for editing.`,
      document: updatedDoc,
      revision: rev,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to create revision' },
      { status: 500 }
    );
  }
}
