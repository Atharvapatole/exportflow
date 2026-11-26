import React from 'react';
import Link from 'next/link';
import { HelpCircle, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { getCurrentContext } from '@/lib/auth';
import { customsJobRepo, customsQueryRepo } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function CustomsQueriesPage() {
  const ctx = await getCurrentContext();
  const orgId = ctx?.organization?.id || '';

  const jobs = await customsJobRepo.listByOrg(orgId);
  const jobMap = new Map(jobs.map((j) => [j.id, j]));

  // Aggregate queries across jobs
  const queryLists = await Promise.all(jobs.map((j) => customsQueryRepo.listByJob(j.id)));
  const allQueries = queryLists.flat();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Customs Appraising Queries Register</h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor valuation, classification (HS Code), and technical test queries raised during ICEGATE assessment
        </p>
      </div>

      <div className="space-y-4">
        {allQueries.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 rounded-2xl border border-slate-800 text-xs text-slate-400">
            <CheckCircle2 className="w-12 h-12 text-emerald-400/80 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white">No pending customs queries</h3>
            <p className="mt-1 text-slate-500">All current clearance jobs are running clear of officer objections.</p>
          </div>
        ) : (
          allQueries.map((q) => {
            const job = jobMap.get(q.jobId);
            return (
              <div key={q.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-400">{q.queryNumber}</span>
                    {job && (
                      <span className="text-slate-400 font-semibold">
                        • {job.jobNumber} ({job.clientName})
                      </span>
                    )}
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-300 capitalize">
                    {q.status}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <span className="text-[10px] text-slate-500 block">
                    Raised by: <strong className="text-slate-300">{q.officerName}</strong>
                  </span>
                  <p className="text-slate-200">{q.queryText}</p>
                </div>

                {q.chaReply && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                    <span className="text-[10px] text-emerald-400 font-bold block">CHA Reply:</span>
                    <p className="text-emerald-200">{q.chaReply}</p>
                  </div>
                )}

                {job && (
                  <div className="pt-2 flex justify-end">
                    <Link
                      href={`/cha/dashboard/jobs/${job.id}`}
                      className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      <span>Open Job Console & Reply</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
