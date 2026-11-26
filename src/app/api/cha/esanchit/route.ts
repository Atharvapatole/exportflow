import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentContext } from '@/lib/auth';
import { esanchitRepo, customsJobRepo, adminRepo } from '@/lib/db';

const esanchitSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  documentCode: z.string().min(2, 'e-SANCHIT Document Code is required'),
  documentName: z.string().min(2, 'Document Name is required'),
  documentReference: z.string().optional(),
  irnNumber: z.string().min(3, 'IRN Number is required'),
  drnNumber: z.string().optional(),
  uploadStatus: z.enum(['pending', 'uploaded', 'verified', 'rejected']).default('uploaded'),
  icegateUserId: z.string().optional(),
  fileName: z.string().optional(),
  fileUrl: z.string().optional(),
  notes: z.string().optional(),
});

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const ctx = await getCurrentContext();
    if (!ctx || !ctx.organization?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');

    const records = jobId
      ? await esanchitRepo.listByJob(jobId)
      : await esanchitRepo.listByOrg(ctx.organization.id);

    return NextResponse.json({ records });
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
    const result = esanchitSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: (result.error as any).issues?.[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const job = await customsJobRepo.findById(result.data.jobId);
    if (!job || job.chaOrgId !== ctx.organization.id) {
      return NextResponse.json({ error: 'Invalid Job ID' }, { status: 400 });
    }

    const record = await esanchitRepo.create({
      jobId: job.id,
      chaOrgId: ctx.organization.id,
      documentCode: result.data.documentCode,
      documentName: result.data.documentName,
      documentReference: result.data.documentReference,
      irnNumber: result.data.irnNumber.toUpperCase(),
      drnNumber: result.data.drnNumber?.toUpperCase(),
      uploadStatus: result.data.uploadStatus,
      icegateUserId: result.data.icegateUserId,
      fileName: result.data.fileName || 'supporting_doc.pdf',
      fileUrl: result.data.fileUrl,
      uploadedAt: new Date().toISOString(),
      notes: result.data.notes,
    });

    // Also update Job IRN / DRN if not yet present
    if (!job.irnNumber) {
      await customsJobRepo.update(job.id, {
        irnNumber: record.irnNumber,
        drnNumber: record.drnNumber,
      });
    }

    return NextResponse.json({ record }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
