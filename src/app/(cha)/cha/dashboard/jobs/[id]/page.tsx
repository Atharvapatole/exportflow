import React from 'react';
import { notFound } from 'next/navigation';
import { getCurrentContext } from '@/lib/auth';
import {
  customsJobRepo,
  customsChecklistRepo,
  esanchitRepo,
  customsQueryRepo,
  chaClientRepo,
} from '@/lib/db';
import { JobConsole } from './JobConsole';

export const dynamic = 'force-dynamic';

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getCurrentContext();
  const orgId = ctx?.organization?.id || '';

  const job = await customsJobRepo.findById(id);
  if (!job || job.chaOrgId !== orgId) {
    notFound();
  }

  const [checklists, esanchitDocs, queries, client] = await Promise.all([
    customsChecklistRepo.listByJob(id),
    esanchitRepo.listByJob(id),
    customsQueryRepo.listByJob(id),
    chaClientRepo.findById(job.clientId),
  ]);

  return (
    <JobConsole
      initialJob={job}
      initialChecklists={checklists}
      initialEsanchit={esanchitDocs}
      initialQueries={queries}
      client={client}
    />
  );
}
