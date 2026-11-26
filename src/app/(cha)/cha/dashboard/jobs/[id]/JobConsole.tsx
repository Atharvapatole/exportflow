'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Ship,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UploadCloud,
  FileText,
  DollarSign,
  HelpCircle,
  Building2,
  Save,
  Plus,
  ShieldCheck,
  Send,
  Anchor,
  FileCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  CustomsJob,
  CustomsDocumentChecklist,
  EsanchitRecord,
  CustomsQuery,
  ChaClient,
} from '@/types';

interface JobConsoleProps {
  initialJob: CustomsJob;
  initialChecklists: CustomsDocumentChecklist[];
  initialEsanchit: EsanchitRecord[];
  initialQueries: CustomsQuery[];
  client: ChaClient | null;
}

export function JobConsole({
  initialJob,
  initialChecklists,
  initialEsanchit,
  initialQueries,
  client,
}: JobConsoleProps) {
  const [job, setJob] = useState<CustomsJob>(initialJob);
  const [checklists, setChecklists] = useState<CustomsDocumentChecklist[]>(initialChecklists);
  const [esanchitDocs, setEsanchitDocs] = useState<EsanchitRecord[]>(initialEsanchit);
  const [queries, setQueries] = useState<CustomsQuery[]>(initialQueries);
  const [activeTab, setActiveTab] = useState<'checklist' | 'esanchit' | 'queries' | 'financials' | 'details'>('checklist');

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Edit References modal/state
  const [filingRefs, setFilingRefs] = useState({
    billOfEntryNumber: job.billOfEntryNumber || '',
    billOfEntryDate: job.billOfEntryDate || '',
    shippingBillNumber: job.shippingBillNumber || '',
    shippingBillDate: job.shippingBillDate || '',
    irnNumber: job.irnNumber || '',
    drnNumber: job.drnNumber || '',
    leoNumber: job.leoNumber || '',
    leoDate: job.leoDate || '',
    oocNumber: job.oocNumber || '',
    oocDate: job.oocDate || '',
  });

  // e-SANCHIT Modal
  const [showEsanchitModal, setShowEsanchitModal] = useState(false);
  const [newEsanchit, setNewEsanchit] = useState({
    documentCode: '380000',
    documentName: 'Commercial Invoice',
    documentReference: job.invoiceNumber || '',
    irnNumber: '',
    drnNumber: '',
    icegateUserId: '',
    fileName: 'commercial_invoice_signed.pdf',
    notes: '',
  });

  // Query Modal
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [newQueryText, setNewQueryText] = useState('');
  const [officerName, setOfficerName] = useState('Appraising Officer (Group 1)');
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

  const isImport = job.jobType === 'import';

  // Handler: Update Job Status
  const handleStatusChange = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    setStatusMessage('');
    try {
      const res = await fetch(`/api/cha/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setJob((prev) => ({ ...prev, status: newStatus as any }));
        setStatusMessage('Status updated successfully');
      }
    } catch {} finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handler: Save Filing References
  const handleSaveReferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingStatus(true);
    setStatusMessage('');
    try {
      const res = await fetch(`/api/cha/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filingRefs),
      });
      const data = await res.json();
      if (res.ok) {
        setJob(data.job);
        setStatusMessage('Customs references saved');
      }
    } catch {} finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handler: Toggle Checklist Item
  const handleChecklistToggle = async (
    item: CustomsDocumentChecklist,
    field: 'isReceived' | 'isVerified' | 'isEsanchitUploaded'
  ) => {
    const updatedValue = !item[field];
    const newItems = checklists.map((i) =>
      i.id === item.id ? { ...i, [field]: updatedValue } : i
    );
    setChecklists(newItems);

    try {
      const res = await fetch(`/api/cha/jobs/${job.id}/checklists`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id, [field]: updatedValue }),
      });
      const data = await res.json();
      if (data?.item) {
        // Re-calculate job completion rate
        const required = newItems.filter((i) => i.isRequired);
        const done = required.filter((i) => i.isReceived && i.isVerified).length;
        const rate = required.length > 0 ? Math.round((done / required.length) * 100) : 0;
        setJob((prev) => ({ ...prev, checklistCompletionRate: rate }));
      }
    } catch {}
  };

  // Handler: Submit e-SANCHIT
  const handleAddEsanchit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEsanchit.irnNumber) return;

    try {
      const res = await fetch('/api/cha/esanchit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          ...newEsanchit,
        }),
      });
      const data = await res.json();
      if (res.ok && data.record) {
        setEsanchitDocs((prev) => [data.record, ...prev]);
        setShowEsanchitModal(false);
        setNewEsanchit({
          documentCode: '380000',
          documentName: 'Commercial Invoice',
          documentReference: '',
          irnNumber: '',
          drnNumber: '',
          icegateUserId: '',
          fileName: 'supporting_doc.pdf',
          notes: '',
        });
        if (!job.irnNumber) {
          setJob((prev) => ({ ...prev, irnNumber: data.record.irnNumber }));
        }
      }
    } catch {}
  };

  // Handler: Add Query
  const handleAddQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQueryText.trim()) return;

    try {
      const res = await fetch(`/api/cha/jobs/${job.id}/queries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queryText: newQueryText,
          officerName,
        }),
      });
      const data = await res.json();
      if (res.ok && data.query) {
        setQueries((prev) => [data.query, ...prev]);
        setShowQueryModal(false);
        setNewQueryText('');
        setJob((prev) => ({ ...prev, status: 'query_raised' }));
      }
    } catch {}
  };

  // Handler: Reply to Query
  const handleReplyQuery = async (queryId: string) => {
    const text = replyTextMap[queryId];
    if (!text?.trim()) return;

    try {
      const res = await fetch(`/api/cha/jobs/${job.id}/queries`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queryId,
          replyText: text,
        }),
      });
      const data = await res.json();
      if (res.ok && data.query) {
        setQueries((prev) => prev.map((q) => (q.id === queryId ? data.query : q)));
      }
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/cha/dashboard/jobs"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">{job.jobNumber}</h1>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  isImport ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {job.jobType}
              </span>
              <span className="text-xs text-slate-400">• {job.clientName}</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Customs Station: <span className="text-slate-200">{job.customsStation}</span>
            </p>
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Workflow Status:</span>
            <select
              value={job.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isUpdatingStatus}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 capitalize"
            >
              <option value="draft" className="bg-slate-900 text-slate-200">Draft</option>
              <option value="docs_received" className="bg-slate-900 text-slate-200">Docs Received</option>
              <option value="under_scrutiny" className="bg-slate-900 text-slate-200">Under Scrutiny</option>
              <option value="checklist_approved" className="bg-slate-900 text-slate-200">Checklist Approved</option>
              <option value="query_raised" className="bg-slate-900 text-slate-200">Query Raised</option>
              <option value="assessment_done" className="bg-slate-900 text-slate-200">Assessment Done</option>
              <option value="duty_paid" className="bg-slate-900 text-slate-200">Duty Paid</option>
              <option value="ooc_granted" className="bg-slate-900 text-slate-200">OOC Granted (Out of Charge)</option>
              <option value="leo_granted" className="bg-slate-900 text-slate-200">LEO Granted (Let Export)</option>
              <option value="cargo_delivered" className="bg-slate-900 text-slate-200">Cargo Delivered</option>
              <option value="completed" className="bg-slate-900 text-slate-200">Job Completed</option>
            </select>
          </div>

          <Link href={`/cha/dashboard/documents/worksheets?jobId=${job.id}`}>
            <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs">
              <FileText className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              Prepare Worksheet
            </Button>
          </Link>
        </div>
      </div>

      {statusMessage && (
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-medium">
          {statusMessage}
        </div>
      )}

      {/* ICEGATE References Summary Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-slate-500 block text-[11px]">
            {isImport ? 'Bill of Entry (BoE)' : 'Shipping Bill (SB)'}
          </span>
          <span className="font-mono font-bold text-white">
            {isImport ? (job.billOfEntryNumber || 'Pending Filing') : (job.shippingBillNumber || 'Pending Registration')}
          </span>
        </div>

        <div>
          <span className="text-slate-500 block text-[11px]">e-SANCHIT IRN</span>
          <span className="font-mono font-bold text-amber-400">
            {job.irnNumber || 'No IRN Linked'}
          </span>
        </div>

        <div>
          <span className="text-slate-500 block text-[11px]">
            {isImport ? 'Out of Charge (OOC)' : 'Let Export Order (LEO)'}
          </span>
          <span className="font-mono font-bold text-white">
            {isImport ? (job.oocNumber || 'Awaiting OOC') : (job.leoNumber || 'Awaiting LEO')}
          </span>
        </div>

        <div>
          <span className="text-slate-500 block text-[11px]">Checklist Readiness</span>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="h-2 flex-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${job.checklistCompletionRate || 0}%` }}
              />
            </div>
            <span className="font-bold text-amber-400">{job.checklistCompletionRate || 0}%</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('checklist')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'checklist' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Document Checklist ({checklists.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('esanchit')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'esanchit' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>e-SANCHIT Register ({esanchitDocs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('queries')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'queries' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Customs Queries ({queries.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('financials')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'financials' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Duty & Agency Invoicing</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'details' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Customs Filing References</span>
        </button>
      </div>

      {/* TAB 1: Document Checklist */}
      {activeTab === 'checklist' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                ICEGATE Mandatory Document Checklist
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Verify each client paper before uploading to e-SANCHIT and submitting BE/SB
              </p>
            </div>
            <Link href="/cha/dashboard/documents/ai-checker">
              <Button size="sm" variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-950/40 text-xs">
                <FileCheck className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
                AI Cross-Check Docs
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Document Name</th>
                  <th className="py-3 px-4 font-semibold">Requirement</th>
                  <th className="py-3 px-4 font-semibold text-center">Received</th>
                  <th className="py-3 px-4 font-semibold text-center">Verified by CHA</th>
                  <th className="py-3 px-4 font-semibold text-center">e-SANCHIT Uploaded</th>
                  <th className="py-3 px-4 font-semibold">Notes / Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {checklists.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-850/50">
                    <td className="py-3 px-4 font-semibold text-white">
                      {item.documentName}
                    </td>

                    <td className="py-3 px-4">
                      {item.isRequired ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Mandatory
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Optional</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={item.isReceived}
                        onChange={() => handleChecklistToggle(item, 'isReceived')}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-950 border-slate-700 cursor-pointer"
                      />
                    </td>

                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={item.isVerified}
                        onChange={() => handleChecklistToggle(item, 'isVerified')}
                        className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-950 border-slate-700 cursor-pointer"
                      />
                    </td>

                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={item.isEsanchitUploaded}
                        onChange={() => handleChecklistToggle(item, 'isEsanchitUploaded')}
                        className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500 bg-slate-950 border-slate-700 cursor-pointer"
                      />
                    </td>

                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {item.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: e-SANCHIT Register */}
      {activeTab === 'esanchit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                e-SANCHIT Registered Supporting Documents
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Record actual Image Reference Numbers (IRN) and Document Reference Numbers (DRN) received from ICEGATE
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setShowEsanchitModal(true)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Record e-SANCHIT Upload
            </Button>
          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            {esanchitDocs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No e-SANCHIT documents recorded for this job yet. Click &quot;Record e-SANCHIT Upload&quot; to log IRN numbers.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Document Name & Code</th>
                    <th className="py-3 px-4 font-semibold">IRN (Image Ref No.)</th>
                    <th className="py-3 px-4 font-semibold">DRN</th>
                    <th className="py-3 px-4 font-semibold">File Name</th>
                    <th className="py-3 px-4 font-semibold">Upload Date</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {esanchitDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-850/50">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-white block">{doc.documentName}</span>
                        <span className="text-[10px] font-mono text-slate-500">Code: {doc.documentCode}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">{doc.irnNumber}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{doc.drnNumber || '—'}</td>
                      <td className="py-3 px-4 text-slate-300">{doc.fileName}</td>
                      <td className="py-3 px-4 text-slate-400">
                        {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                          {doc.uploadStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Customs Queries */}
      {activeTab === 'queries' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Customs Officer Appraising Queries
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Log ICEGATE queries raised by Group Appraisers and draft legal compliance responses
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setShowQueryModal(true)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Log Officer Query
            </Button>
          </div>

          {queries.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
              No queries raised by Customs for this job.
            </div>
          ) : (
            <div className="space-y-4">
              {queries.map((q) => (
                <div key={q.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-400 font-mono">{q.queryNumber}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-300 capitalize">
                      {q.status}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <span className="text-[10px] text-slate-500 block">
                      Query from: <strong className="text-slate-300">{q.officerName}</strong> on{' '}
                      {new Date(q.queryDate).toLocaleString()}
                    </span>
                    <p className="text-slate-200 font-medium">{q.queryText}</p>
                  </div>

                  {q.chaReply ? (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                      <span className="text-[10px] text-emerald-400 font-bold block">
                        CHA Formal Reply Filed ({q.replyDate ? new Date(q.replyDate).toLocaleDateString() : ''}):
                      </span>
                      <p className="text-emerald-200">{q.chaReply}</p>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-2">
                      <textarea
                        rows={2}
                        placeholder="Draft reply to appraising query (cite notification, valuation, or GATT rule)..."
                        value={replyTextMap[q.id] || ''}
                        onChange={(e) => setReplyTextMap({ ...replyTextMap, [q.id]: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleReplyQuery(q.id)}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
                      >
                        <Send className="w-3.5 h-3.5 mr-1.5" />
                        Submit Formal Reply
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Duty & Agency Financials */}
      {activeTab === 'financials' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Clearance Duty & Agency Fee Statement
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 text-[11px]">Invoice Declared Value</span>
              <p className="text-xl font-bold text-white mt-1">
                {job.currency} {job.invoiceValue?.toLocaleString() || '0'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 text-[11px]">Estimated Customs Duty</span>
              <p className="text-xl font-bold text-amber-400 mt-1">
                ₹{job.estimatedDutyInr?.toLocaleString('en-IN') || '0'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 text-[11px]">CHA Agency & Handling Charges</span>
              <p className="text-xl font-bold text-emerald-400 mt-1">
                ₹{job.chaChargesInr?.toLocaleString('en-IN') || '0'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-1">
            <h4 className="font-bold text-amber-300">Client Invoicing Ready</h4>
            <p>
              Credit terms for {job.clientName}: <strong>{client?.creditTerms || 'Net 15 Days'}</strong>. You can bill agency fees, dock examination charges, and transport directly from the Financials Center.
            </p>
          </div>
        </div>
      )}

      {/* TAB 5: Customs Filing References Edit */}
      {activeTab === 'details' && (
        <form onSubmit={handleSaveReferences} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Update Official Customs & ICEGATE Identifiers
            </h3>
            <Button
              type="submit"
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
              isLoading={isUpdatingStatus}
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Save Filing References
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isImport ? (
              <>
                <Input
                  label="Bill of Entry (BoE) Number"
                  value={filingRefs.billOfEntryNumber}
                  onChange={(e) => setFilingRefs({ ...filingRefs, billOfEntryNumber: e.target.value })}
                  placeholder="e.g. 7891234"
                  className="bg-slate-950 border-slate-800 text-white font-mono"
                />
                <Input
                  label="BoE Filing Date"
                  type="date"
                  value={filingRefs.billOfEntryDate}
                  onChange={(e) => setFilingRefs({ ...filingRefs, billOfEntryDate: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-white"
                />
                <Input
                  label="Out of Charge (OOC) Number"
                  value={filingRefs.oocNumber}
                  onChange={(e) => setFilingRefs({ ...filingRefs, oocNumber: e.target.value })}
                  placeholder="e.g. OOC/2026/001"
                  className="bg-slate-950 border-slate-800 text-white font-mono"
                />
                <Input
                  label="OOC Clearance Date"
                  type="date"
                  value={filingRefs.oocDate}
                  onChange={(e) => setFilingRefs({ ...filingRefs, oocDate: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </>
            ) : (
              <>
                <Input
                  label="Shipping Bill (SB) Number"
                  value={filingRefs.shippingBillNumber}
                  onChange={(e) => setFilingRefs({ ...filingRefs, shippingBillNumber: e.target.value })}
                  placeholder="e.g. 9812456"
                  className="bg-slate-950 border-slate-800 text-white font-mono"
                />
                <Input
                  label="SB Filing Date"
                  type="date"
                  value={filingRefs.shippingBillDate}
                  onChange={(e) => setFilingRefs({ ...filingRefs, shippingBillDate: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-white"
                />
                <Input
                  label="Let Export Order (LEO) Number"
                  value={filingRefs.leoNumber}
                  onChange={(e) => setFilingRefs({ ...filingRefs, leoNumber: e.target.value })}
                  placeholder="e.g. LEO/2026/088"
                  className="bg-slate-950 border-slate-800 text-white font-mono"
                />
                <Input
                  label="LEO Clearance Date"
                  type="date"
                  value={filingRefs.leoDate}
                  onChange={(e) => setFilingRefs({ ...filingRefs, leoDate: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </>
            )}

            <Input
              label="Primary e-SANCHIT IRN"
              value={filingRefs.irnNumber}
              onChange={(e) => setFilingRefs({ ...filingRefs, irnNumber: e.target.value })}
              placeholder="e.g. IRN202600123"
              className="bg-slate-950 border-slate-800 text-white font-mono"
            />
            <Input
              label="DRN (Document Ref Number)"
              value={filingRefs.drnNumber}
              onChange={(e) => setFilingRefs({ ...filingRefs, drnNumber: e.target.value })}
              placeholder="e.g. DRN998811"
              className="bg-slate-950 border-slate-800 text-white font-mono"
            />
          </div>
        </form>
      )}

      {/* Modal: Record e-SANCHIT Upload */}
      {showEsanchitModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-amber-400" />
              Record e-SANCHIT Upload
            </h3>
            <p className="text-xs text-slate-400">
              Enter the official ICEGATE Image Reference Number (IRN) generated upon uploading supporting documents.
            </p>

            <form onSubmit={handleAddEsanchit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Document Code (CBIC / ICEGATE)
                </label>
                <select
                  value={newEsanchit.documentCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    const nameMap: Record<string, string> = {
                      '380000': 'Commercial Invoice',
                      '271000': 'Packing List',
                      '704000': 'Bill of Lading',
                      '861000': 'Certificate of Origin',
                      '911000': 'GATT Declaration',
                    };
                    setNewEsanchit({
                      ...newEsanchit,
                      documentCode: code,
                      documentName: nameMap[code] || 'Supporting Document',
                    });
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                >
                  <option value="380000">380000 - Commercial Invoice</option>
                  <option value="271000">271000 - Packing List</option>
                  <option value="704000">704000 - Bill of Lading / AWB</option>
                  <option value="861000">861000 - Certificate of Origin (COO)</option>
                  <option value="911000">911000 - GATT Valuation Declaration</option>
                  <option value="999999">999999 - Other Technical Specification</option>
                </select>
              </div>

              <Input
                label="IRN Number (from ICEGATE)"
                required
                placeholder="e.g. IRN2026112600123"
                value={newEsanchit.irnNumber}
                onChange={(e) => setNewEsanchit({ ...newEsanchit, irnNumber: e.target.value })}
                className="bg-slate-950 border-slate-800 text-white font-mono"
              />

              <Input
                label="DRN Number (Optional)"
                placeholder="e.g. DRN998811"
                value={newEsanchit.drnNumber}
                onChange={(e) => setNewEsanchit({ ...newEsanchit, drnNumber: e.target.value })}
                className="bg-slate-950 border-slate-800 text-white font-mono"
              />

              <Input
                label="ICEGATE User ID Used for Upload"
                placeholder="e.g. CHA_PORTAL_01"
                value={newEsanchit.icegateUserId}
                onChange={(e) => setNewEsanchit({ ...newEsanchit, icegateUserId: e.target.value })}
                className="bg-slate-950 border-slate-800 text-white"
              />

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEsanchitModal(false)}
                  className="border-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs">
                  Save e-SANCHIT Record
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Log Officer Query */}
      {showQueryModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              Log Customs Appraising Query
            </h3>

            <form onSubmit={handleAddQuery} className="space-y-3">
              <Input
                label="Appraising Officer / Group"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                placeholder="e.g. Appraiser Group 1, Nhava Sheva"
                className="bg-slate-950 border-slate-800 text-white"
              />

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Query Text (from ICEGATE)
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Paste officer query text e.g. 'Please explain valuation discrepancy and provide manufacturer test report for grade 316L'..."
                  value={newQueryText}
                  onChange={(e) => setNewQueryText(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowQueryModal(false)}
                  className="border-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs">
                  Log Query
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
