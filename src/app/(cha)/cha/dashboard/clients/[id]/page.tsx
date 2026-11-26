import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Building2,
  ArrowLeft,
  Ship,
  FileText,
  Plus,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  CreditCard,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { getCurrentContext } from '@/lib/auth';
import { chaClientRepo, customsJobRepo } from '@/lib/db';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getCurrentContext();
  const orgId = ctx?.organization?.id || '';

  const client = await chaClientRepo.findById(id);
  if (!client || client.chaOrgId !== orgId) {
    notFound();
  }

  const jobs = await customsJobRepo.listByOrg(orgId, { clientId: id });
  const totalBilled = jobs.reduce((sum, j) => sum + (j.chaChargesInr || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/cha/dashboard/clients"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">{client.companyName}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> KYC Verified
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              IEC: <span className="font-mono text-slate-200">{client.iecNumber}</span>
              {client.gstin && (
                <>
                  {' '}
                  • GST: <span className="font-mono text-slate-200">{client.gstin}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/cha/dashboard/jobs/new?clientId=${client.id}`}>
            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border-0 text-xs px-3.5 py-2">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Open Customs Job
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400">Total Customs Jobs</span>
          <p className="text-2xl font-bold text-white mt-1.5">{jobs.length}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Clearance filings recorded</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400">Import Shipments</span>
          <p className="text-2xl font-bold text-blue-400 mt-1.5">
            {jobs.filter((j) => j.jobType === 'import').length}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Bills of entry</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400">Export Shipments</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1.5">
            {jobs.filter((j) => j.jobType === 'export').length}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Shipping bills</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400">Agency Charges Billed</span>
          <p className="text-xl font-bold text-emerald-400 mt-1.5">
            ₹{totalBilled.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Terms: {client.creditTerms || 'Net 15'}</p>
        </div>
      </div>

      {/* Info & Job History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Profile Details */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Client Information</h3>

          <div className="space-y-3 text-xs text-slate-300">
            <div>
              <span className="text-slate-500 block text-[11px]">Primary Representative</span>
              <span className="font-semibold text-white">{client.contactPerson}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">Email Address</span>
              <a href={`mailto:${client.email}`} className="text-amber-400 hover:underline">
                {client.email}
              </a>
            </div>

            {client.phone && (
              <div>
                <span className="text-slate-500 block text-[11px]">Phone / Mobile</span>
                <span className="text-slate-200">{client.phone}</span>
              </div>
            )}

            <div>
              <span className="text-slate-500 block text-[11px]">Address</span>
              <span className="text-slate-200">
                {client.address ? `${client.address}, ` : ''}
                {client.city ? `${client.city}, ` : ''}
                {client.state ? `${client.state} ` : ''}
                {client.pincode || ''}
              </span>
            </div>

            {client.notes && (
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-500 block text-[11px]">Internal Notes</span>
                <p className="text-slate-400 italic text-[11px] mt-0.5">{client.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Assigned Customs Jobs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Clearance Job History</h3>
            <span className="text-xs text-slate-400">{jobs.length} total records</span>
          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            {jobs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No customs clearance jobs opened for this client yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Job Number</th>
                      <th className="py-2.5 px-3 font-semibold">Type</th>
                      <th className="py-2.5 px-3 font-semibold">Customs Ref</th>
                      <th className="py-2.5 px-3 font-semibold">Station</th>
                      <th className="py-2.5 px-3 font-semibold">Status</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-850/50">
                        <td className="py-3 px-3 font-bold text-white">
                          <Link href={`/cha/dashboard/jobs/${job.id}`} className="hover:text-amber-400">
                            {job.jobNumber}
                          </Link>
                        </td>
                        <td className="py-3 px-3 uppercase text-[10px] font-semibold text-slate-400">
                          {job.jobType}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-300">
                          {job.billOfEntryNumber ? `BoE: ${job.billOfEntryNumber}` : job.shippingBillNumber ? `SB: ${job.shippingBillNumber}` : '—'}
                        </td>
                        <td className="py-3 px-3 text-slate-400">{job.customsStation}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 capitalize">
                            {job.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            href={`/cha/dashboard/jobs/${job.id}`}
                            className="text-amber-400 hover:text-amber-300 font-semibold"
                          >
                            Open →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
