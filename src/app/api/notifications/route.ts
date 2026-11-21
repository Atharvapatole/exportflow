import { NextRequest, NextResponse } from 'next/server';
import { getCurrentContext } from '@/lib/auth';
import { notificationRepo } from '@/lib/db';

export async function GET() {
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.organization) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const notifs = await notificationRepo.listByOrg(ctx.organization.id);
  return NextResponse.json(notifs);
}
