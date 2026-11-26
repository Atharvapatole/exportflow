import React from 'react';
import { getCurrentContext } from '@/lib/auth';
import { customsJobRepo } from '@/lib/db';
import { AiCheckerConsole } from './AiCheckerConsole';

export const dynamic = 'force-dynamic';

export default async function AiDocCheckerPage() {
  const ctx = await getCurrentContext();
  const orgId = ctx?.organization?.id || '';

  const jobs = await customsJobRepo.listByOrg(orgId);

  return <AiCheckerConsole jobs={jobs} />;
}
