import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentContext } from '@/lib/auth';
import { apiKeyRepo, adminRepo } from '@/lib/db';

const keySchema = z.object({
  name: z.string().min(2, 'Key name is required'),
  permissions: z.array(z.string()).default(['read', 'write']),
});

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const ctx = await getCurrentContext();
    if (!ctx || !ctx.organization?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const keys = await apiKeyRepo.listByOrg(ctx.organization.id);
    return NextResponse.json({ keys });
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
    const result = keySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: (result.error as any).issues?.[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { apiKey, rawKey } = await apiKeyRepo.createKey(
      ctx.organization.id,
      result.data.name,
      result.data.permissions,
      ctx.user.id
    );

    await adminRepo.logActivity({
      userId: ctx.user.id,
      userName: ctx.user.name,
      organizationId: ctx.organization.id,
      action: 'API_KEY_CREATED',
      entity: 'API_KEY',
      entityId: apiKey.id,
      details: `Generated API key: ${apiKey.name} (prefix: ${apiKey.keyPrefix})`,
    });

    // rawKey is returned ONLY once upon creation!
    return NextResponse.json({ apiKey, rawKey }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const ctx = await getCurrentContext();
    if (!ctx || !ctx.organization?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const keyId = searchParams.get('id');
    if (!keyId) {
      return NextResponse.json({ error: 'Key ID required' }, { status: 400 });
    }

    const keys = await apiKeyRepo.listByOrg(ctx.organization.id);
    const key = keys.find((k) => k.id === keyId);
    if (!key) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    await apiKeyRepo.revokeKey(keyId);

    await adminRepo.logActivity({
      userId: ctx.user.id,
      userName: ctx.user.name,
      organizationId: ctx.organization.id,
      action: 'API_KEY_REVOKED',
      entity: 'API_KEY',
      entityId: keyId,
      details: `Revoked API key: ${key.name} (${key.keyPrefix})`,
    });

    return NextResponse.json({ success: true, message: 'API key revoked' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
