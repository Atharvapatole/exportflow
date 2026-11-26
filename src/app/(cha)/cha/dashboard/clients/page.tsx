import React from 'react';
import Link from 'next/link';
import { Building2, Plus, Search, FileText, Phone, Mail, MapPin, CheckCircle, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { getCurrentContext } from '@/lib/auth';
import { chaClientRepo, customsJobRepo } from '@/lib/db';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function ChaClientsPage() {
  const ctx = await getCurrentContext();
  const orgId = ctx?.organization?.id || '';

  const [clients, allJobs] = await Promise.all([
    chaClientRepo.listByOrg(orgId),
    customsJobRepo.listByOrg(orgId),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Client CRM & Exporter Directory</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your exporter clients, verify IEC & KYC status, and track job history in tenant isolation
          </p>
        </div>

        <Link href="/cha/dashboard/clients/new">
          <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border-0 text-xs px-3.5 py-2">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Exporter Client
          </Button>
        </Link>
      </div>

      {/* Directory Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        {clients.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white">No exporter clients enrolled yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Add your client firms with their IEC Number, GSTIN, and contact details to begin filing customs clearance jobs.
            </p>
            <div className="mt-4">
              <Link href="/cha/dashboard/clients/new">
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Add First Client
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Exporter / Firm Name</th>
                  <th className="py-3 px-4 font-semibold">IEC / GSTIN / PAN</th>
                  <th className="py-3 px-4 font-semibold">Contact Person</th>
                  <th className="py-3 px-4 font-semibold">Location</th>
                  <th className="py-3 px-4 font-semibold">KYC Status</th>
                  <th className="py-3 px-4 font-semibold">Active Jobs</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {clients.map((client) => {
                  const clientJobs = allJobs.filter((j) => j.clientId === client.id);
                  return (
                    <tr key={client.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/cha/dashboard/clients/${client.id}`}
                          className="font-bold text-white hover:text-amber-400 block"
                        >
                          {client.companyName}
                        </Link>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Terms: {client.creditTerms || 'Net 15 Days'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div className="text-slate-200 font-semibold">IEC: {client.iecNumber}</div>
                        {client.gstin && (
                          <div className="text-[11px] text-slate-400">GST: {client.gstin}</div>
                        )}
                        {client.pan && (
                          <div className="text-[10px] text-slate-500">PAN: {client.pan}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-white">{client.contactPerson}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-500" />
                          <span>{client.email}</span>
                        </div>
                        {client.phone && (
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-500" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">
                        {client.city ? `${client.city}, ${client.state || 'India'}` : 'India'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            client.kycStatus === 'verified'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {client.kycStatus === 'verified' ? (
                            <>
                              <ShieldCheck className="w-3 h-3" /> Verified
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" /> Pending
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-white px-2 py-0.5 rounded bg-slate-800 text-[11px]">
                          {clientJobs.length} {clientJobs.length === 1 ? 'Job' : 'Jobs'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/cha/dashboard/jobs/new?clientId=${client.id}`}
                            className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-semibold text-[11px]"
                            title="Open New Customs Job for this client"
                          >
                            + Job
                          </Link>
                          <Link
                            href={`/cha/dashboard/clients/${client.id}`}
                            className="text-slate-400 hover:text-white p-1"
                            title="View Client Profile"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
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
