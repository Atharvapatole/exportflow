import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentContext } from '@/lib/auth';
import { teamRepo, adminRepo } from '@/lib/db';

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name is required'),
  role: z.enum(['admin', 'manager', 'editor', 'viewer', 'cha_broker']),
  permissions: z.array(z.string()).optional(),
});

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const ctx = await getCurrentContext();
    if (!ctx || !ctx.organization?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const members = await teamRepo.listByOrg(ctx.organization.id);
    return NextResponse.json({ members });
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
    const result = inviteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: (result.error as any).issues?.[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const member = await teamRepo.inviteMember({
      orgId: ctx.organization.id,
      email: result.data.email.toLowerCase(),
      name: result.data.name,
      role: result.data.role,
      status: 'active',
      permissions: result.data.permissions || ['read', 'write', 'export'],
      invitedBy: ctx.user.id,
    });

    await adminRepo.logActivity({
      userId: ctx.user.id,
      userName: ctx.user.name,
      organizationId: ctx.organization.id,
      action: 'TEAM_MEMBER_INVITED',
      entity: 'TEAM_MEMBER',
      entityId: member.id,
      details: `Invited ${member.name} (${member.email}) as ${member.role}`,
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
