import React from 'react';
import { getCurrentContext } from '@/lib/auth';
import { customsJobRepo, chaClientRepo } from '@/lib/db';
import { CreditCard, TrendingUp, DollarSign, Building2, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ChaFinancesPage() {
  const ctx = await getCurrentContext();
  const orgId = ctx?.organization?.id || '';

  const [jobs, clients] = await Promise.all([
    customsJobRepo.listByOrg(orgId),
    chaClientRepo.listByOrg(orgId),
  ]);

  const totalBilled = jobs.reduce((sum, j) => sum + (j.chaChargesInr || 0), 0);
  const totalDutyHandled = jobs.reduce((sum, j) => sum + (j.actualDutyPaidInr || j.estimatedDutyInr || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Financial Management & Client Invoicing</h1>
        <p className="text-xs text-slate-400 mt-1">
          Track customs duty disbursements, agency clearance charges, handling fees, and credit status
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-slate-400 text-xs">Total Agency Clearance Fees</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">₹{totalBilled.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Across {jobs.length} jobs</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-slate-400 text-xs">Customs Duty Handled (ECL)</span>
          <p className="text-2xl font-bold text-amber-400 mt-1">₹{totalDutyHandled.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">ICEGATE duty payments</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-slate-400 text-xs">Active Exporter Billing Accounts</span>
          <p className="text-2xl font-bold text-white mt-1">{clients.length}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Client CRM profiles</p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Job-Wise Invoicing Register</h3>
        </div>

        {jobs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No jobs to bill yet.</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Job Number</th>
                <th className="py-3 px-4 font-semibold">Client Name</th>
                <th className="py-3 px-4 font-semibold">Customs Ref</th>
                <th className="py-3 px-4 font-semibold">Estimated Duty</th>
                <th className="py-3 px-4 font-semibold">Agency Fee</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-850/50">
                  <td className="py-3 px-4 font-bold text-white font-mono">{job.jobNumber}</td>
                  <td className="py-3 px-4 text-white">{job.clientName}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {job.billOfEntryNumber ? `BoE: ${job.billOfEntryNumber}` : job.shippingBillNumber ? `SB: ${job.shippingBillNumber}` : '—'}
                  </td>
                  <td className="py-3 px-4 font-mono">₹{job.estimatedDutyInr?.toLocaleString('en-IN') || '0'}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">₹{job.chaChargesInr?.toLocaleString('en-IN') || '0'}</td>
                  <td className="py-3 px-4 capitalize">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400">
                      {job.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
