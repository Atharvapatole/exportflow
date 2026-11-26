import React from 'react';
import { getCurrentContext } from '@/lib/auth';
import { signatureRepo } from '@/lib/db';
import { SignatureManager } from '@/components/signatures/SignatureManager';

export const dynamic = 'force-dynamic';

export default async function ExporterSignaturesPage() {
  const ctx = await getCurrentContext();
  const orgId = ctx?.organization?.id || '';

  const signatures = await signatureRepo.listByOrg(orgId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Signature & Stamp Library</h1>
        <p className="text-xs text-slate-500 mt-1">
          Upload and isolate transparent signatures and company rubber seals for automatic inclusion on export quotations and invoices
        </p>
      </div>

      <SignatureManager initialSignatures={signatures} theme="light" />
    </div>
  );
}
