import { NextRequest, NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/auth';
import { userRepo, adminRepo } from '@/lib/db';

export async function GET() {
  const ctx = await getAdminContext();
  if (!ctx || !ctx.isSuperAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const users = await userRepo.listAll();
  const safeUsers = users.map((u) => {
    const { passwordHash, ...rest } = u;
    return rest;
  });

  return NextResponse.json(safeUsers);
}

export async function PUT(req: NextRequest) {
  const ctx = await getAdminContext();
  if (!ctx || !ctx.isSuperAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { id, status, role } = body;

  const target = await userRepo.findById(id);
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const updated = await userRepo.update(id, {
    status: status || target.status,
    role: role || target.role,
  });

  await adminRepo.logAudit({
    adminId: ctx.user.id,
    adminEmail: ctx.user.email,
    action: `USER_STATUS_CHANGE_${status?.toUpperCase() || 'UPDATE'}`,
    targetEntity: 'USER',
    targetId: id,
    details: { previousStatus: target.status, newStatus: status, newRole: role },
  });

  return NextResponse.json(updated);
}
