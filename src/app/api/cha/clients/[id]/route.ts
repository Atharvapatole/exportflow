import { NextRequest, NextResponse } from 'next/server';
import { getCurrentContext } from '@/lib/auth';
import { chaClientRepo, customsJobRepo } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ctx = await getCurrentContext();
    if (!ctx || !ctx.organization?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await chaClientRepo.findById(id);
    if (!client || client.chaOrgId !== ctx.organization.id) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const jobs = await customsJobRepo.listByOrg(ctx.organization.id, { clientId: id });
    return NextResponse.json({ client, jobs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ctx = await getCurrentContext();
    if (!ctx || !ctx.organization?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await chaClientRepo.findById(id);
    if (!client || client.chaOrgId !== ctx.organization.id) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const updates = await req.json();
    const updated = await chaClientRepo.update(id, updates);
    return NextResponse.json({ client: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ctx = await getCurrentContext();
    if (!ctx || !ctx.organization?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await chaClientRepo.findById(id);
    if (!client || client.chaOrgId !== ctx.organization.id) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const success = await chaClientRepo.delete(id);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
