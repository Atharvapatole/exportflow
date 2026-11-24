import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/auth';
import { adminRepo, userRepo, orgRepo, documentRepo } from '@/lib/db';

export async function GET() {
  const ctx = await getAdminContext();
  if (!ctx || !ctx.isSuperAdmin) {
    return NextResponse.json({ error: 'Forbidden: Super Admin only' }, { status: 403 });
  }

  const stats = await adminRepo.getPlatformStats();
  const users = await userRepo.listAll();
  const companies = await orgRepo.listAll();
  const recentActivity = await adminRepo.getActivity(15);

  return NextResponse.json({
    stats,
    usersCount: users.length,
    companiesCount: companies.length,
    recentActivity,
  });
}
