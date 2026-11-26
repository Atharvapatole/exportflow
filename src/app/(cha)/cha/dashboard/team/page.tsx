import React from 'react';
import { getCurrentContext } from '@/lib/auth';
import { teamRepo } from '@/lib/db';
import { TeamConsole } from './TeamConsole';

export const dynamic = 'force-dynamic';

export default async function ChaTeamPage() {
  const ctx = await getCurrentContext();
  const orgId = ctx?.organization?.id || '';

  const members = await teamRepo.listByOrg(orgId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Team Management & RBAC Roles</h1>
        <p className="text-xs text-slate-400 mt-1">
          Control access permissions for customs documentation clerks, field pass holders, and billing managers
        </p>
      </div>

      <TeamConsole initialMembers={members} />
    </div>
  );
}
