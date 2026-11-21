import { NextRequest, NextResponse } from 'next/server';
import { getCurrentContext } from '@/lib/auth';
import { supportRepo, adminRepo } from '@/lib/db';

export async function GET() {
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.isSuperAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const tickets = await supportRepo.listAll();
  return NextResponse.json(tickets);
}

export async function POST(req: NextRequest) {
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.isSuperAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { ticketId, replyMessage, status } = body;

  if (replyMessage) {
    await supportRepo.addReply(ticketId, {
      authorName: 'BENZWELL Support Admin',
      authorRole: 'admin',
      message: replyMessage,
    });
  }

  if (status) {
    await supportRepo.updateStatus(ticketId, status);
  }

  const updated = await supportRepo.findById(ticketId);
  return NextResponse.json(updated);
}
