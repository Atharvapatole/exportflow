import { NextRequest, NextResponse } from 'next/server';
import { getCurrentContext } from '@/lib/auth';
import { subscriptionRepo } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const auth = await getCurrentContext();
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await subscriptionRepo.activateTrial(auth.organization.id);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'ExportFlow 3-Day Growth Trial activated successfully!',
      subscription: result.subscription,
    });
  } catch (error: any) {
    console.error('Failed to activate 3-day trial:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
