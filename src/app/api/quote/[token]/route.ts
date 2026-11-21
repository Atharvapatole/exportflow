import { NextRequest, NextResponse } from 'next/server';
import { documentRepo } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const doc = await documentRepo.findByShareToken(token);
  if (!doc) {
    return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
  }

  // Sanitize internal confidential fields if needed
  return NextResponse.json(doc);
}
