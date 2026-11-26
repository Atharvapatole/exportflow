import { NextRequest, NextResponse } from 'next/server';
import { getCurrentContext } from '@/lib/auth';
import { customsJobRepo, customsChecklistRepo } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: jobId } = await params;
    const ctx = await getCurrentContext();
    if (!ctx || !ctx.organization?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const job = await customsJobRepo.findById(jobId);
    if (!job || job.chaOrgId !== ctx.organization.id) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const { itemId, ...updates } = await req.json();
    if (!itemId) {
      return NextResponse.json({ error: 'Checklist item ID is required' }, { status: 400 });
    }

    const updated = await customsChecklistRepo.updateItem(itemId, updates);
    return NextResponse.json({ item: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
