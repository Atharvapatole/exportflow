import React from 'react';
import { notFound } from 'next/navigation';
import { getCurrentContext } from '@/lib/auth';
import { documentRepo } from '@/lib/db';
import { DocumentActions } from '@/components/document-studio/DocumentActions';
import { DocumentRenderer } from '@/components/document-studio/DocumentRenderer';

export default async function ViewProformaInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.organization) return notFound();

  const doc = await documentRepo.findById(ctx.organization.id, id);
  if (!doc) return notFound();

  return (
    <div className="space-y-6">
      <DocumentActions document={doc} />
      <DocumentRenderer doc={doc} />
    </div>
  );
}
