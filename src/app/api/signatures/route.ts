import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentContext } from '@/lib/auth';
import { signatureRepo, adminRepo } from '@/lib/db';

const signatureSchema = z.object({
  signatoryName: z.string().min(2, 'Signatory name is required'),
  designation: z.string().min(2, 'Designation is required'),
  assetType: z.enum(['signature', 'company_stamp', 'both']),
  originalImageUrl: z.string().optional(),
  processedPngUrl: z.string().min(10, 'Processed transparent PNG data is required'),
  isActive: z.boolean().default(true),
  cropSettings: z.object({
    x: z.number().optional(),
    y: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    threshold: z.number().optional(),
    contrast: z.number().optional(),
  }).optional(),
});

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const ctx = await getCurrentContext();
    if (!ctx || !ctx.organization?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const signatures = await signatureRepo.listByOrg(ctx.organization.id);
    return NextResponse.json({ signatures });
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
    const result = signatureSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: (result.error as any).issues?.[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const asset = await signatureRepo.create({
      orgId: ctx.organization.id,
      userId: ctx.user.id,
      signatoryName: result.data.signatoryName,
      designation: result.data.designation,
      assetType: result.data.assetType,
      originalImageUrl: result.data.originalImageUrl,
      processedPngUrl: result.data.processedPngUrl,
      isActive: result.data.isActive,
      cropSettings: result.data.cropSettings,
    });

    await adminRepo.logActivity({
      userId: ctx.user.id,
      userName: ctx.user.name,
      organizationId: ctx.organization.id,
      action: 'SIGNATURE_ASSET_CREATED',
      entity: 'SIGNATURE',
      entityId: asset.id,
      details: `Saved new signature/stamp for ${asset.signatoryName} (${asset.designation})`,
    });

    return NextResponse.json({ asset }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
