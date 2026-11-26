import React from 'react';
import Link from 'next/link';
import {
  Ship,
  Building2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  UploadCloud,
  FileCheck,
  TrendingUp,
  Search,
  ExternalLink,
} from 'lucide-react';
import { getCurrentContext } from '@/lib/auth';
import { customsJobRepo, chaClientRepo, customsQueryRepo } from '@/lib/db';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function ChaOverviewPage() {
  const ctx = await getCurrentContext();
  const orgId = ctx?.organization?.id || '';

  const [jobs, clients, queries] = await Promise.all([
    customsJobRepo.listByOrg(orgId),
    chaClientRepo.listByOrg(orgId),
    orgId ? customsJobRepo.listByOrg(orgId) : [],
  ]);

  const importJobs = jobs.filter((j) => j.jobType === 'import');
  const exportJobs = jobs.filter((j) => j.jobType === 'export');
  const activeJobs = jobs.filter((j) => !['ooc_granted', 'leo_granted', 'completed', 'cancelled'].includes(j.status));
  const awaitingDocsJobs = jobs.filter(
    (j) => j.status === 'awaiting_docs' || (j.checklistCompletionRate || 0) < 100
  );
  const pendingQueries = queries.filter((j) => j.status === 'query_raised');

  const totalBilledCharges = jobs.reduce((sum, j) => sum + (j.chaChargesInr || 0), 0);
  const isVerified = ctx?.organization?.chaLicenseStatus === 'verified';

  return (
    <div className="space-y-7">
      {/* License Warning Banner if unverified */}
      {!isVerified && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-300">Customs Broker License Verification In Progress</h4>
              <p className="text-xs text-amber-200/80 mt-0.5">
                Your broker license (<strong>{ctx?.organization?.chaLicenseNumber || 'Pending'}</strong>) is being reviewed by the ExportFlow compliance team. You have full access to internal worksheets and multi-client job management.
              </p>
            </div>
          </div>
          <Link href="/cha/dashboard/settings">
            <Button size="sm" variant="outline" className="border-amber-500/40 text-amber-300 hover:bg-amber-500/20 text-xs shrink-0">
              Update License Details
            </Button>
          </Link>
        </div>
      )}

      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Customs Clearance Workspace</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time status for Indian Customs (ICEGATE) import assessments, shipping bill tracking, and client documentation
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Total Clients</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{clients.length}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Active exporter accounts</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Active Jobs</span>
            <Ship className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-2">{activeJobs.length}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Under process at port</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Import Clearance</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">BoE</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{importJobs.length}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Import shipments</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Export Clearance</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">SB</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{exportJobs.length}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Outbound jobs</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Awaiting Docs</span>
            <Clock className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-2xl font-bold text-orange-400 mt-2">{awaitingDocsJobs.length}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Incomplete checklist</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Billed Charges</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-emerald-400 mt-2">
            ₹{totalBilledCharges.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Agency & handling</p>
        </div>
      </div>

      {/* Main Jobs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Customs Jobs Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Recent Customs Clearance Jobs</h2>
              <p className="text-xs text-slate-400">Jobs undergoing assessment, duty payment, or cargo out-of-charge</p>
            </div>
            <Link
              href="/cha/dashboard/jobs"
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              <span>View All ({jobs.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            {jobs.length === 0 ? (
              <div className="p-12 text-center">
                <Ship className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-white">No customs jobs opened yet</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Create your first import or export clearance job to start organizing client documents and checklists.
                </p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <Link href="/cha/dashboard/jobs/new?type=import">
                    <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs">
                      <Plus className="w-3.5 h-3.5 mr-1.5" /> Create Import Job
                    </Button>
                  </Link>
                  <Link href="/cha/dashboard/clients/new">
                    <Button size="sm" variant="outline" className="border-slate-700 text-slate-200 text-xs">
                      Add Client First
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Job No & Type</th>
                      <th className="py-3 px-4 font-semibold">Client Name</th>
                      <th className="py-3 px-4 font-semibold">Customs Ref (BoE / SB)</th>
                      <th className="py-3 px-4 font-semibold">Port / Station</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {jobs.slice(0, 7).map((job) => {
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
                                isImport
                                  ? 'bg-blue-500/10 text-blue-400'
                                  : 'bg-emerald-500/10 text-emerald-400'
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
                          <td className="py-3.5 px-4 text-slate-400 truncate max-w-[140px]">
                            {job.customsStation}
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

        {/* Right Sidebar: Quick Tools & e-SANCHIT Tracker */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Customs Quick Tools</h3>
            <div className="space-y-2">
              <Link
                href="/cha/dashboard/documents/worksheets?tool=boe"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-xs transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                      BoE Worksheet & Duty Calc
                    </h4>
                    <p className="text-[10px] text-slate-400">Assess BCD, SWS & IGST amounts</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
              </Link>

              <Link
                href="/cha/dashboard/documents/worksheets?tool=gatt"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-xs transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                      GATT Valuation Declaration
                    </h4>
                    <p className="text-[10px] text-slate-400">Rule 10 customs valuation sheet</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
              </Link>

              <Link
                href="/cha/dashboard/esanchit"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-xs transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                      e-SANCHIT Document Register
                    </h4>
                    <p className="text-[10px] text-slate-400">Track ICEGATE IRN & DRN receipts</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
              </Link>

              <Link
                href="/cha/dashboard/documents/ai-checker"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-xs transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                      AI Cross-Document Checker
                    </h4>
                    <p className="text-[10px] text-slate-400">Verify CI, PL, BL & PO consistency</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
              </Link>
            </div>
          </div>

          {/* e-SANCHIT & Regulatory Compliance Note */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ICEGATE & CBIC Filing Guidelines
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Ensure all supporting documents for Bills of Entry and Shipping Bills are digitally signed in PDF/A-1b format with file sizes under 1MB prior to e-SANCHIT upload. Maintain IRN logs for audit readiness.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
