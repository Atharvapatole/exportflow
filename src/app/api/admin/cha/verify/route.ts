import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth';
import { orgRepo, adminRepo } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireSuperAdmin();
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized: Super Admin required' }, { status: 403 });
    }

    const { orgId, status } = await req.json();
    if (!orgId || !status) {
      return NextResponse.json({ error: 'orgId and status are required' }, { status: 400 });
    }

    const updated = await orgRepo.update(orgId, {
      chaLicenseStatus: status,
    });

    await adminRepo.logAudit({
      adminId: auth.user.id,
      adminEmail: auth.user.email,
      action: 'CHA_LICENSE_STATUS_UPDATED',
      targetEntity: 'ORGANIZATION',
      targetId: orgId,
      details: {
        newStatus: status,
        updatedBy: auth.user.email,
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({ success: true, organization: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
