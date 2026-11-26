import React from 'react';
import Link from 'next/link';
import { Ship, Plus, Search, Filter, ArrowRight, CheckCircle2, Clock, AlertTriangle, FileText } from 'lucide-react';
import { getCurrentContext } from '@/lib/auth';
import { customsJobRepo, chaClientRepo } from '@/lib/db';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function CustomsJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string }>;
}) {
  const { type: filterType, status: filterStatus } = await searchParams;
  const ctx = await getCurrentContext();
  const orgId = ctx?.organization?.id || '';

  const jobs = await customsJobRepo.listByOrg(orgId, {
    jobType: filterType,
    status: filterStatus,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Customs Clearance Jobs</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track Bill of Entry (BoE) assessments, Shipping Bill (SB) registrations, e-SANCHIT IRNs, and cargo release orders
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/cha/dashboard/jobs/new?type=import">
            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border-0 text-xs px-3.5 py-2">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              New Import Job
            </Button>
          </Link>
          <Link href="/cha/dashboard/jobs/new?type=export">
            <Button size="sm" variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800 text-xs px-3.5 py-2">
              <Plus className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              New Export Job
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs">
        <Link
          href="/cha/dashboard/jobs"
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            !filterType ? 'bg-amber-500/20 text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          All Jobs
        </Link>
        <Link
          href="/cha/dashboard/jobs?type=import"
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            filterType === 'import' ? 'bg-blue-500/20 text-blue-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Import Clearance (BoE)
        </Link>
        <Link
          href="/cha/dashboard/jobs?type=export"
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            filterType === 'export' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Export Clearance (SB)
        </Link>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        {jobs.length === 0 ? (
          <div className="p-12 text-center">
            <Ship className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white">No customs clearance jobs found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Start by creating an import or export job to track checklists, ICEGATE filing, and delivery orders.
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <Link href="/cha/dashboard/jobs/new?type=import">
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Create Import Job
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Job Number</th>
                  <th className="py-3 px-4 font-semibold">Client Name</th>
                  <th className="py-3 px-4 font-semibold">Customs Filing Ref</th>
                  <th className="py-3 px-4 font-semibold">Port / Station</th>
                  <th className="py-3 px-4 font-semibold">Checklist</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {jobs.map((job) => {
                  const isImport = job.jobType === 'import';
                  return (
                    <tr key={job.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/cha/dashboard/jobs/${job.id}`}
                          className="font-bold text-white hover:text-amber-400 block"
                        >
                          {job.jobNumber}
                        </Link>
                        <span
                          className={`inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase ${
                            isImport ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'
                          }`}
                        >
                          {job.jobType}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-white">{job.clientName}</td>

                      <td className="py-3.5 px-4">
                        {job.billOfEntryNumber ? (
                          <div>
                            <span className="font-mono text-slate-200">BoE: {job.billOfEntryNumber}</span>
                            {job.billOfEntryDate && (
                              <span className="text-[10px] text-slate-500 block">{job.billOfEntryDate}</span>
                            )}
                          </div>
                        ) : job.shippingBillNumber ? (
                          <div>
                            <span className="font-mono text-slate-200">SB: {job.shippingBillNumber}</span>
                            {job.shippingBillDate && (
                              <span className="text-[10px] text-slate-500 block">{job.shippingBillDate}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Not filed yet</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 truncate max-w-[150px]">
                        {job.customsStation}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="w-24">
                          <div className="flex items-center justify-between text-[10px] mb-1">
                            <span className="text-slate-400">Ready</span>
                            <span className="font-bold text-amber-400">
                              {job.checklistCompletionRate || 0}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 transition-all rounded-full"
                              style={{ width: `${job.checklistCompletionRate || 0}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 capitalize">
                          {job.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/cha/dashboard/jobs/${job.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300"
                        >
                          <span>Manage</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
