import React from 'react';
import Link from 'next/link';
import { CheckSquare, Ship, ArrowRight } from 'lucide-react';
import { getCurrentContext } from '@/lib/auth';
import { customsJobRepo, customsChecklistRepo } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function ChecklistsPage() {
  const ctx = await getCurrentContext();
  const orgId = ctx?.organization?.id || '';

  const jobs = await customsJobRepo.listByOrg(orgId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Customs Document Checklists</h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor document completeness, verification statuses, and e-SANCHIT readiness across all active clearance jobs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-slate-900 rounded-2xl border border-slate-800 text-xs text-slate-400">
            No active jobs. Open a customs clearance job to view checklists.
          </div>
        ) : (
          jobs.map((job) => {
            const isImport = job.jobType === 'import';
            return (
              <div key={job.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{job.jobNumber}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      isImport ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'
                    }`}
                  >
                    {job.jobType}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-300">{job.clientName}</h4>
                  <p className="text-[11px] text-slate-500">{job.customsStation}</p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Readiness</span>
                    <span className="font-bold text-amber-400">{job.checklistCompletionRate || 0}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${job.checklistCompletionRate || 0}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 capitalize">{job.status.replace(/_/g, ' ')}</span>
                  <Link
                    href={`/cha/dashboard/jobs/${job.id}`}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                  >
                    <span>Manage Checklist</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
