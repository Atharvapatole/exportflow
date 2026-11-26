import React from 'react';
import { getCurrentContext } from '@/lib/auth';
import { chaClientRepo } from '@/lib/db';
import { NewJobClientForm } from './NewJobClientForm';

export const dynamic = 'force-dynamic';

export default async function NewCustomsJobPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; clientId?: string }>;
}) {
  const { type, clientId } = await searchParams;
  const ctx = await getCurrentContext();
  const orgId = ctx?.organization?.id || '';

  const clients = await chaClientRepo.listByOrg(orgId);

  return (
    <NewJobClientForm
      clients={clients}
      initialJobType={type || 'import'}
      initialClientId={clientId}
    />
  );
}
