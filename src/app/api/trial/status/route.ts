import { NextRequest, NextResponse } from 'next/server';
import { getCurrentContext } from '@/lib/auth';
import { subscriptionRepo } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const auth = await getCurrentContext();
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sub = await subscriptionRepo.getOrCreateSubscription(auth.organization.id);
    const trialStatus = await subscriptionRepo.getTrialStatus(auth.organization.id);

    return NextResponse.json({
      subscription: sub,
      trial: trialStatus,
    });
  } catch (error: any) {
    console.error('Failed to get trial status:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
