import React from 'react';
import { getCurrentContext } from '@/lib/auth';
import { signatureRepo } from '@/lib/db';
import { SignatureManager } from '@/components/signatures/SignatureManager';

export const dynamic = 'force-dynamic';

export default async function ChaSignaturesPage() {
  const ctx = await getCurrentContext();
  const orgId = ctx?.organization?.id || '';

  const signatures = await signatureRepo.listByOrg(orgId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Broker Signature & Stamp Studio</h1>
        <p className="text-xs text-slate-400 mt-1">
          Upload and isolate transparent signatures, round agency stamps, and customs station clearance endorsements
        </p>
      </div>

      <SignatureManager initialSignatures={signatures} theme="dark" />
    </div>
  );
}
