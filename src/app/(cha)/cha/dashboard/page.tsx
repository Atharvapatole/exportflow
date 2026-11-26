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
  Users,
  FilePlus,
  Sparkles,
  Calculator,
  ShieldCheck,
  Anchor,
  Activity,
  Layers,
} from 'lucide-react';
import { getCurrentContext } from '@/lib/auth';
import { customsJobRepo, chaClientRepo, customsQueryRepo, chaDocRepo } from '@/lib/db';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function ChaOverviewPage() {
  const ctx = await getCurrentContext();
  const orgId = ctx?.organization?.id || '';

  const [jobs, clients, queries, documents] = await Promise.all([
    customsJobRepo.listByOrg(orgId),
    chaClientRepo.listByOrg(orgId),
    orgId ? customsJobRepo.listByOrg(orgId) : [],
    chaDocRepo.listByOrg(orgId),
  ]);

  const importJobs = jobs.filter((j) => j.jobType === 'import');
  const exportJobs = jobs.filter((j) => j.jobType === 'export');
  const activeJobs = jobs.filter(
    (j) => !['ooc_granted', 'leo_granted', 'completed', 'cancelled'].includes(j.status)
  );
  const awaitingDocsJobs = jobs.filter(
    (j) => j.status === 'awaiting_docs' || (j.checklistCompletionRate || 0) < 100
  );
  const pendingQueries = queries.filter((j) => j.status === 'query_raised');

  const totalBilledCharges = jobs.reduce((sum, j) => sum + (j.chaChargesInr || 0), 0);
  const isVerified = ctx?.organization?.chaLicenseStatus === 'verified';
  const recentDocs = documents.slice(0, 5);

  return (
    <div className="space-y-7">
      {/* Maritime Ports Live Status Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <Anchor className="w-4 h-4 text-amber-400" />
          <span className="uppercase text-[11px] tracking-wider text-slate-400">Customs EDI Gateways:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono font-bold text-slate-200">INNSA1</span>
            <span className="text-slate-400">Nhava Sheva Sea</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-mono font-bold text-slate-200">INMUN1</span>
            <span className="text-slate-400">Mundra Port</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-mono font-bold text-slate-200">INDEL4</span>
            <span className="text-slate-400">Delhi Air Cargo</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="font-mono font-bold text-slate-200">INMAA1</span>
            <span className="text-slate-400">Chennai Port</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-amber-400/90 font-mono">
          <Activity className="w-3.5 h-3.5" />
          <span>ICEGATE 2.0 Synced</span>
        </div>
      </div>

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
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
              CHA Maritime Workspace
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono">
              Broker License: {ctx?.organization?.chaLicenseNumber || 'CHA-REG-10'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">Customs Clearance Workspace</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time status for Indian Customs (ICEGATE) import assessments, shipping bill tracking, client CRM, and document generation
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/cha/dashboard/customers">
            <Button size="sm" variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800 text-xs px-3 py-2">
              <Users className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
              Manage Customers
            </Button>
          </Link>
          <Link href="/cha/dashboard/documents/create">
            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border-0 text-xs px-3.5 py-2 shadow-sm">
              <FilePlus className="w-3.5 h-3.5 mr-1.5" />
              Create Document
            </Button>
          </Link>
          <Link href="/cha/dashboard/jobs/new?type=import">
            <Button size="sm" variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800 text-xs px-3 py-2">
              <Plus className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              New Job
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Link href="/cha/dashboard/customers" className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 transition-colors block">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">CHA Customers</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{clients.length}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Enrolled clients</p>
        </Link>

        <Link href="/cha/dashboard/documents" className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-colors block">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Created Docs</span>
            <FileText className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-400 mt-2">{documents.length}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Customs worksheets</p>
        </Link>

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
            <span className="text-[11px] font-medium text-slate-400">Billed Charges</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-emerald-400 mt-2">
            ₹{totalBilledCharges.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Agency & handling</p>
        </div>
      </div>

      {/* Main Section: Jobs Table + Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Customs Jobs Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Created Documents Panel */}
          {recentDocs.length > 0 && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    Recent Customer Documents Created From Us
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Latest customs worksheets and declarations generated for your clients
                  </p>
                </div>
                <Link
                  href="/cha/dashboard/customers"
                  className="text-xs text-amber-400 hover:underline font-semibold flex items-center gap-1"
                >
                  <span>Customer Registry</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="divide-y divide-slate-800 text-xs">
                {recentDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 hover:bg-slate-850/60 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/cha/dashboard/documents/${doc.id}`}
                          className="font-bold text-white hover:text-amber-400 truncate"
                        >
                          {doc.documentTitle}
                        </Link>
                        <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                          {doc.documentNumber}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span className="text-slate-300 font-medium">{doc.clientName}</span>
                        <span>•</span>
                        <span>
                          {new Date(doc.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        doc.status === 'finalized'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {doc.status}
                      </span>
                      <Link href={`/cha/dashboard/documents/${doc.id}`}>
                        <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 text-[11px] px-2 py-1 h-7">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Clearance Jobs Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Customs Clearance Jobs</h2>
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
                <div className="p-10 text-center">
                  <Ship className="w-10 h-10 text-slate-700 mx-auto mb-2.5" />
                  <h3 className="text-xs font-bold text-white">No customs jobs opened yet</h3>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                    Create your first import or export clearance job to start organizing client documents and checklists.
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <Link href="/cha/dashboard/jobs/new?type=import">
                      <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs">
                        <Plus className="w-3.5 h-3.5 mr-1" /> Create Import Job
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
                        <th className="py-3 px-4 font-semibold">Customs Ref</th>
                        <th className="py-3 px-4 font-semibold">Port / Station</th>
                        <th className="py-3 px-4 font-semibold">Status</th>
                        <th className="py-3 px-4 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {jobs.slice(0, 6).map((job) => {
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
                                </div>
                              ) : job.shippingBillNumber ? (
                                <div>
                                  <span className="font-mono text-slate-200">SB: {job.shippingBillNumber}</span>
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
        </div>

        {/* Right Sidebar: Quick Tools & Customer Hub link */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Customs Quick Tools</h3>
              <Link href="/cha/dashboard/documents/create" className="text-[11px] text-amber-400 hover:underline">
                + Launch Studio
              </Link>
            </div>

            <div className="space-y-2">
              <Link
                href="/cha/dashboard/documents/create?type=boe_worksheet"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-xs transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                      BoE Worksheet & Duty Calc
                    </h4>
                    <p className="text-[10px] text-slate-400">BCD, SWS & IGST itemized breakdowns</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
              </Link>

              <Link
                href="/cha/dashboard/documents/create?type=shipping_bill_checklist"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-xs transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                      Shipping Bill Checklist
                    </h4>
                    <p className="text-[10px] text-slate-400">RoDTEP, Drawback & LUT filing</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
              </Link>

              <Link
                href="/cha/dashboard/documents/create?type=gatt_declaration"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-xs transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
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
                    <Sparkles className="w-4 h-4" />
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

          {/* Customer CRM Highlight Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Customer CRM</span>
              <Building2 className="w-4 h-4 text-slate-400" />
            </div>
            <h4 className="font-bold text-white text-sm">Customer Documents & Audits</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Track the exact time each customer had a document generated from your firm, inspect active clearance jobs, and issue new declarations in one click.
            </p>
            <Link href="/cha/dashboard/customers">
              <Button size="sm" className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs mt-1">
                Open Customer Management Hub
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
