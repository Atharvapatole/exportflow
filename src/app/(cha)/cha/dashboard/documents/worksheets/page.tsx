import React from 'react';
import { getCurrentContext } from '@/lib/auth';
import { chaClientRepo, customsJobRepo } from '@/lib/db';
import { WorksheetsStudio } from './WorksheetsStudio';

export const dynamic = 'force-dynamic';

export default async function WorksheetsPage({
  searchParams,
}: {
  searchParams: Promise<{ tool?: string; jobId?: string }>;
}) {
  const { tool, jobId } = await searchParams;
  const ctx = await getCurrentContext();
  const orgId = ctx?.organization?.id || '';

  const [clients, jobs] = await Promise.all([
    chaClientRepo.listByOrg(orgId),
    customsJobRepo.listByOrg(orgId),
  ]);

  const selectedJob = jobId ? jobs.find((j) => j.id === jobId) || null : null;

  return (
    <WorksheetsStudio
      clients={clients}
      jobs={jobs}
      initialTool={tool || 'boe'}
      selectedJob={selectedJob}
      chaFirmName={ctx?.organization?.name || 'Customs Brokerage Firm'}
      chaLicenseNumber={ctx?.organization?.chaLicenseNumber || 'Pending'}
    />
  );
}
