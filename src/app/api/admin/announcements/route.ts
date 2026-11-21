import { NextRequest, NextResponse } from 'next/server';
import { getCurrentContext } from '@/lib/auth';
import { announcementRepo, adminRepo } from '@/lib/db';

export async function GET() {
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.isSuperAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const list = await announcementRepo.listAll();
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.isSuperAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const created = await announcementRepo.create({
    title: body.title,
    content: body.content,
    type: body.type || 'feature',
    active: true,
    targetAudience: 'all',
    publishedAt: new Date().toISOString(),
  });

  await adminRepo.logAudit({
    adminId: ctx.user.id,
    adminEmail: ctx.user.email,
    action: 'ANNOUNCEMENT_PUBLISHED',
    targetEntity: 'ANNOUNCEMENT',
    targetId: created.id,
    details: { title: created.title },
  });

  return NextResponse.json(created, { status: 201 });
}
