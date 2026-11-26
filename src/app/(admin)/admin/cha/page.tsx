import React from 'react';
import { requireSuperAdmin } from '@/lib/auth';
import { orgRepo, customsJobRepo } from '@/lib/db';
import { ChaAdminConsole } from './ChaAdminConsole';

export const dynamic = 'force-dynamic';

export default async function AdminChaManagementPage() {
  await requireSuperAdmin();

  const [allOrgs, allJobs] = await Promise.all([
    orgRepo.listAll(),
    // fetch all jobs
    customsJobRepo.listByOrg(''),
  ]);

  const chaOrgs = allOrgs.filter((o) => o.orgType === 'cha');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Customs House Agents (CHA) Governance</h1>
        <p className="text-xs text-slate-400 mt-1">
          Review broker registrations, verify DGFT / Customs Commissionerate licenses, and audit clearance volumes
        </p>
      </div>

      <ChaAdminConsole initialOrgs={chaOrgs} />
    </div>
  );
}
