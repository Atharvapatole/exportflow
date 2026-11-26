import { NextRequest, NextResponse } from 'next/server';
import { getCurrentContext } from '@/lib/auth';
import { subscriptionRepo, walletRepo, orgRepo, adminRepo } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const ctx = await getCurrentContext();
    if (!ctx || !ctx.isSuperAdmin) {
      return NextResponse.json({ error: 'Super Admin access required' }, { status: 403 });
    }

    const orgs = await orgRepo.listAll();
    const subscriptions = await Promise.all(
      orgs.map(async (org) => {
        const sub = await subscriptionRepo.findByOrg(org.id);
        const wallet = await walletRepo.getOrCreateWallet(org.id);
        return {
          organizationId: org.id,
          organizationName: org.name,
          orgType: org.orgType || 'exporter',
          chaLicenseNumber: org.chaLicenseNumber,
          chaLicenseStatus: org.chaLicenseStatus,
          subscription: sub,
          wallet,
        };
      })
    );

    return NextResponse.json({ subscriptions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getCurrentContext();
    if (!ctx || !ctx.isSuperAdmin) {
      return NextResponse.json({ error: 'Super Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const {
      organizationId,
      planId,
      status,
      billingCycle,
      customLimits,
      grantCredits,
      extendTrialDays,
    } = body;

    if (!organizationId || !planId) {
      return NextResponse.json({ error: 'organizationId and planId are required' }, { status: 400 });
    }

    const updatedSub = await subscriptionRepo.updateSubscriptionByAdmin(organizationId, {
      planId,
      status: status || 'active',
      billingCycle: billingCycle || 'monthly',
      customLimits,
      grantCredits,
      extendTrialDays,
    });

    const targetOrg = await orgRepo.findById(organizationId);

    await adminRepo.logActivity({
      userId: ctx.user.id,
      userName: ctx.user.name,
      organizationId,
      action: 'ADMIN_PLAN_OVERRIDE',
      entity: 'SUBSCRIPTION',
      entityId: updatedSub.id,
      details: `Super Admin assigned plan "${planId}" to "${targetOrg?.name || organizationId}" with status "${status || 'active'}"`,
    });

    return NextResponse.json({
      success: true,
      subscription: updatedSub,
      message: `Plan successfully updated to ${planId}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
