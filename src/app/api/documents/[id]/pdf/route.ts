import { NextRequest, NextResponse } from 'next/server';
import { documentRepo } from '@/lib/db';
import { generateDocumentPdf, DOCUMENT_TITLES } from '@/lib/pdf/generateDocumentPdf';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doc = await documentRepo.findByIdGlobal(id);

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const isInline = searchParams.get('view') === 'inline';

    // Generate pure vector PDF buffer directly from document data
    const pdfBytes = generateDocumentPdf(doc);

    const docTypeTitle = DOCUMENT_TITLES[doc.type] || doc.type.replace(/_/g, ' ').toUpperCase();
    const cleanType = docTypeTitle.replace(/\s+/g, '_');
    const cleanDocNum = (doc.documentNumber || 'Draft').replace(/[\/\\]/g, '-');
    const filename = `ExportFlow_${cleanType}_${cleanDocNum}.pdf`;

    const disposition = isInline
      ? `inline; filename="${filename}"`
      : `attachment; filename="${filename}"`;

    return new NextResponse(pdfBytes as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': disposition,
        'Content-Length': String(pdfBytes.byteLength),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF document' },
      { status: 500 }
    );
  }
}
