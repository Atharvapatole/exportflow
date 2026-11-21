import React from 'react';
import { notFound } from 'next/navigation';
import { getCurrentContext } from '@/lib/auth';
import { documentRepo } from '@/lib/db';
import { DocumentEditor } from '@/components/document-studio/DocumentEditor';

export default async function EditQuotationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.organization) return notFound();

  const doc = await documentRepo.findById(ctx.organization.id, id);
  if (!doc) return notFound();

  return <DocumentEditor initialDoc={doc} docType="quotation" />;
}
