import { NextRequest, NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/auth';
import { contactRepo } from '@/lib/db';
import { ContactInquiry } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAdminContext();
    if (!auth || !auth.isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden: Super Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'all';
    const category = searchParams.get('category') || 'all';

    const inquiries = await contactRepo.listInquiries(status, category, 100);

    return NextResponse.json({ inquiries });
  } catch (error: any) {
    console.error('Failed to list contact inquiries:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAdminContext();
    if (!auth || !auth.isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden: Super Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { id, status, adminNotes } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Inquiry ID and status are required' }, { status: 400 });
    }

    const updated = await contactRepo.updateInquiryStatus(
      id,
      status as ContactInquiry['status'],
      adminNotes
    );

    if (!updated) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, inquiry: updated });
  } catch (error: any) {
    console.error('Failed to update inquiry:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
