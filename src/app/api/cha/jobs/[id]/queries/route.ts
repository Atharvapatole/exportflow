import { NextRequest, NextResponse } from 'next/server';
import { getCurrentContext } from '@/lib/auth';
import { customsJobRepo, customsQueryRepo } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { queryNumber, queryText, officerName, queryCategory } = await req.json();
    if (!queryText) {
      return NextResponse.json({ error: 'Query text is required' }, { status: 400 });
    }

    const query = await customsQueryRepo.create({
      jobId,
      queryNumber: queryNumber || `QRY-${Date.now().toString().slice(-4)}`,
      queryDate: new Date().toISOString(),
      officerName: officerName || 'Appraising Officer',
      queryText,
      queryCategory: queryCategory || 'general',
      status: 'pending',
    });

    // Update job status to query_raised
    await customsJobRepo.update(jobId, { status: 'query_raised' });

    return NextResponse.json({ query }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: jobId } = await params;
    const ctx = await getCurrentContext();
    if (!ctx || !ctx.organization?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { queryId, replyText, action } = await req.json();
    if (!queryId) {
      return NextResponse.json({ error: 'Query ID is required' }, { status: 400 });
    }

    if (action === 'resolve') {
      const resolved = await customsQueryRepo.resolve(queryId);
      return NextResponse.json({ query: resolved });
    }

    if (!replyText) {
      return NextResponse.json({ error: 'Reply text is required' }, { status: 400 });
    }

    const replied = await customsQueryRepo.reply(queryId, replyText, ctx.user.id);
    return NextResponse.json({ query: replied });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
