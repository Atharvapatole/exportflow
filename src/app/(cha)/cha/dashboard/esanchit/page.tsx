import React from 'react';
import Link from 'next/link';
import { UploadCloud, Plus, Search, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import { getCurrentContext } from '@/lib/auth';
import { esanchitRepo, customsJobRepo } from '@/lib/db';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function EsanchitRegisterPage() {
  const ctx = await getCurrentContext();
  const orgId = ctx?.organization?.id || '';

  const [records, jobs] = await Promise.all([
    esanchitRepo.listByOrg(orgId),
    customsJobRepo.listByOrg(orgId),
  ]);

  const jobMap = new Map(jobs.map((j) => [j.id, j]));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">e-SANCHIT Supporting Document Register</h1>
          <p className="text-xs text-slate-400 mt-1">
            Central repository of all Image Reference Numbers (IRN) and Document Reference Numbers (DRN) filed with ICEGATE
          </p>
        </div>
      </div>

      {/* ICEGATE Legal Banner */}
      <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-blue-300">Mandatory ICEGATE Paperless Regulatory Compliance</p>
          <p className="text-[11px] text-blue-200/80 leading-relaxed">
            Every document uploaded to e-SANCHIT generates a unique 16-character alphanumeric IRN. Retain IRNs in this register to auto-populate Table 10 of Bill of Entry or Annexure C of Shipping Bill declarations.
          </p>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        {records.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <UploadCloud className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white">No e-SANCHIT records uploaded yet</h3>
            <p className="mt-1 max-w-sm mx-auto text-slate-500">
              When working on customs jobs, record the IRN numbers provided by ICEGATE to populate this central register.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">IRN (Image Ref No.)</th>
                  <th className="py-3 px-4 font-semibold">Document Name & Code</th>
                  <th className="py-3 px-4 font-semibold">Associated Job & Client</th>
                  <th className="py-3 px-4 font-semibold">File Name</th>
                  <th className="py-3 px-4 font-semibold">DRN</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Job Console</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {records.map((r) => {
                  const job = jobMap.get(r.jobId);
                  return (
                    <tr key={r.id} className="hover:bg-slate-850/50">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{r.irnNumber}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-white block">{r.documentName}</span>
                        <span className="text-[10px] font-mono text-slate-500">Code: {r.documentCode}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        {job ? (
                          <div>
                            <span className="font-bold text-white block">{job.jobNumber}</span>
                            <span className="text-[11px] text-slate-400">{job.clientName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">{r.fileName}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">{r.drnNumber || '—'}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                          {r.uploadStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {job && (
                          <Link
                            href={`/cha/dashboard/jobs/${job.id}`}
                            className="text-amber-400 hover:text-amber-300 font-semibold"
                          >
                            Open Job →
                          </Link>
                        )}
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
