import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { documentRepo } from '@/lib/db';
import { DocumentRenderer } from '@/components/document-studio/DocumentRenderer';
import { StandalonePrintControls } from '@/components/document-studio/StandalonePrintControls';
import { DOCUMENT_TITLES } from '@/lib/pdf/generateDocumentPdf';

export const dynamic = 'force-dynamic';

interface StandalonePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: StandalonePageProps): Promise<Metadata> {
  const { id } = await params;
  const doc = await documentRepo.findByIdGlobal(id);
  if (!doc) {
    return { title: 'ExportFlow Document' };
  }

  const docTypeTitle = DOCUMENT_TITLES[doc.type] || doc.type.replace(/_/g, ' ').toUpperCase();
  const cleanType = docTypeTitle.replace(/\s+/g, '_');
  const cleanDocNum = (doc.documentNumber || 'Draft').replace(/[\/\\]/g, '-');

  return {
    title: `ExportFlow_${cleanType}_${cleanDocNum}`,
    description: `ExportFlow business trade document ${doc.documentNumber}`,
  };
}

export default async function StandaloneDocumentPage({ params }: StandalonePageProps) {
  const { id } = await params;
  const doc = await documentRepo.findByIdGlobal(id);

  if (!doc) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white text-slate-900 flex flex-col justify-start items-center p-4 sm:p-8 print:p-0 print:m-0 print:bg-transparent">
      {/* Non-intrusive floating control pill (hidden on print / PDF capture) */}
      <StandalonePrintControls doc={doc} />

      {/* Pure Business Document Container */}
      <main className="w-full max-w-4xl mx-auto print:max-w-none print:w-full print:p-0 print:m-0">
        <DocumentRenderer doc={doc} />
      </main>
    </div>
  );
}
