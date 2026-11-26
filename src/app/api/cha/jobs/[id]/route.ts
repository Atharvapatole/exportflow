import { NextRequest, NextResponse } from 'next/server';
import { getCurrentContext } from '@/lib/auth';
import {
  customsJobRepo,
  customsChecklistRepo,
  esanchitRepo,
  customsQueryRepo,
  adminRepo,
} from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ctx = await getCurrentContext();
    if (!ctx || !ctx.organization?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const job = await customsJobRepo.findById(id);
    if (!job || job.chaOrgId !== ctx.organization.id) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const [checklists, esanchitDocs, queries] = await Promise.all([
      customsChecklistRepo.listByJob(id),
      esanchitRepo.listByJob(id),
      customsQueryRepo.listByJob(id),
    ]);

    return NextResponse.json({
      job,
      checklists,
      esanchitDocs,
      queries,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ctx = await getCurrentContext();
    if (!ctx || !ctx.organization?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const job = await customsJobRepo.findById(id);
    if (!job || job.chaOrgId !== ctx.organization.id) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const updates = await req.json();
    const updated = await customsJobRepo.update(id, updates);

    await adminRepo.logActivity({
      userId: ctx.user.id,
      userName: ctx.user.name,
      organizationId: ctx.organization.id,
      action: 'CUSTOMS_JOB_UPDATED',
      entity: 'CUSTOMS_JOB',
      entityId: id,
      details: `Updated customs job ${job.jobNumber} (status: ${updates.status || job.status})`,
    });

    return NextResponse.json({ job: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
