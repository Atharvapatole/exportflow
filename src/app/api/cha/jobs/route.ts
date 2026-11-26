import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentContext } from '@/lib/auth';
import { customsJobRepo, chaClientRepo, adminRepo } from '@/lib/db';

const createJobSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  jobType: z.enum(['import', 'export', 're_export', 'transshipment']),
  customsStation: z.string().min(2, 'Customs Station is required'),
  customsHouseCode: z.string().optional(),
  billOfEntryNumber: z.string().optional(),
  billOfEntryDate: z.string().optional(),
  shippingBillNumber: z.string().optional(),
  shippingBillDate: z.string().optional(),
  irnNumber: z.string().optional(),
  drnNumber: z.string().optional(),
  igmNumber: z.string().optional(),
  igmDate: z.string().optional(),
  blAwbNumber: z.string().optional(),
  blAwbDate: z.string().optional(),
  containerNumbers: z.array(z.string()).optional(),
  invoiceNumber: z.string().optional(),
  invoiceValue: z.number().optional(),
  currency: z.string().default('USD'),
  totalPackages: z.number().optional(),
  grossWeightKg: z.number().optional(),
  portOfLoading: z.string().optional(),
  portOfDischarge: z.string().optional(),
  goodsDescription: z.string().optional(),
  hsCodes: z.array(z.string()).optional(),
  estimatedDutyInr: z.number().optional(),
  chaChargesInr: z.number().optional(),
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
    const jobType = searchParams.get('type') || undefined;
    const status = searchParams.get('status') || undefined;
    const clientId = searchParams.get('clientId') || undefined;

    const jobs = await customsJobRepo.listByOrg(ctx.organization.id, {
      jobType,
      status,
      clientId,
    });

    return NextResponse.json({ jobs });
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
    const result = createJobSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: (result.error as any).issues?.[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const client = await chaClientRepo.findById(result.data.clientId);
    if (!client || client.chaOrgId !== ctx.organization.id) {
      return NextResponse.json({ error: 'Invalid client selection' }, { status: 400 });
    }

    const job = await customsJobRepo.create({
      chaOrgId: ctx.organization.id,
      clientId: client.id,
      clientName: client.companyName,
      jobType: result.data.jobType,
      status: 'docs_received',
      customsStation: result.data.customsStation,
      customsHouseCode: result.data.customsHouseCode,
      billOfEntryNumber: result.data.billOfEntryNumber,
      billOfEntryDate: result.data.billOfEntryDate,
      shippingBillNumber: result.data.shippingBillNumber,
      shippingBillDate: result.data.shippingBillDate,
      irnNumber: result.data.irnNumber,
      drnNumber: result.data.drnNumber,
      igmNumber: result.data.igmNumber,
      igmDate: result.data.igmDate,
      blAwbNumber: result.data.blAwbNumber,
      blAwbDate: result.data.blAwbDate,
      containerNumbers: result.data.containerNumbers || [],
      invoiceNumber: result.data.invoiceNumber,
      invoiceValue: result.data.invoiceValue,
      currency: result.data.currency,
      totalPackages: result.data.totalPackages,
      grossWeightKg: result.data.grossWeightKg,
      portOfLoading: result.data.portOfLoading,
      portOfDischarge: result.data.portOfDischarge,
      goodsDescription: result.data.goodsDescription,
      hsCodes: result.data.hsCodes || [],
      assignedTo: ctx.user.name,
      estimatedDutyInr: result.data.estimatedDutyInr,
      chaChargesInr: result.data.chaChargesInr,
      notes: result.data.notes,
    });

    await adminRepo.logActivity({
      userId: ctx.user.id,
      userName: ctx.user.name,
      organizationId: ctx.organization.id,
      action: 'CUSTOMS_JOB_CREATED',
      entity: 'CUSTOMS_JOB',
      entityId: job.id,
      details: `Created ${job.jobType.toUpperCase()} Job ${job.jobNumber} for client ${client.companyName}`,
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
