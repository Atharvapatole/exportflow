'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Building2,
  Plus,
  Search,
  FileText,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  Clock,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  FilePlus,
  Ship,
  Sparkles,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EnrichedCustomer {
  id: string;
  chaOrgId: string;
  companyName: string;
  iecNumber: string;
  gstin?: string;
  pan?: string;
  contactPerson: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  kycStatus?: 'verified' | 'pending' | 'submitted' | 'rejected';
  creditTerms?: string;
  totalJobsCount: number;
  activeJobsCount: number;
  totalDocumentsCount: number;
  totalDutyBilled: number;
  totalChaFees: number;
  latestDocument: {
    id: string;
    title: string;
    number: string;
    type: string;
    status: string;
    createdAt: string;
  } | null;
}

interface CustomerListClientProps {
  initialCustomers: EnrichedCustomer[];
}

export function CustomerListClient({ initialCustomers }: CustomerListClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [kycFilter, setKycFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [docFilter, setDocFilter] = useState<'all' | 'with_docs' | 'without_docs'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredCustomers = useMemo(() => {
    return initialCustomers.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        c.companyName.toLowerCase().includes(q) ||
        c.iecNumber.toLowerCase().includes(q) ||
        (c.gstin && c.gstin.toLowerCase().includes(q)) ||
        (c.pan && c.pan.toLowerCase().includes(q)) ||
        c.contactPerson.toLowerCase().includes(q) ||
        (c.city && c.city.toLowerCase().includes(q));

      const matchKyc =
        kycFilter === 'all' ||
        (kycFilter === 'verified' && c.kycStatus === 'verified') ||
        (kycFilter === 'pending' && c.kycStatus !== 'verified');

      const matchDoc =
        docFilter === 'all' ||
        (docFilter === 'with_docs' && c.totalDocumentsCount > 0) ||
        (docFilter === 'without_docs' && c.totalDocumentsCount === 0);

      return matchSearch && matchKyc && matchDoc;
    });
  }, [initialCustomers, searchQuery, kycFilter, docFilter]);

  const totalClients = initialCustomers.length;
  const verifiedCount = initialCustomers.filter((c) => c.kycStatus === 'verified').length;
  const clientsWithDocs = initialCustomers.filter((c) => c.totalDocumentsCount > 0).length;
  const totalDocsCount = initialCustomers.reduce((acc, c) => acc + c.totalDocumentsCount, 0);

  const formatTimeAgo = (isoDate: string) => {
    try {
      const diffMs = Date.now() - new Date(isoDate).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 30) return `${diffDays}d ago`;
      return new Date(isoDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Customers</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{totalClients}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Enrolled Exporters & Importers</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">KYC Verified</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">
            {verifiedCount}{' '}
            <span className="text-xs font-normal text-slate-400">
              ({totalClients > 0 ? Math.round((verifiedCount / totalClients) * 100) : 0}%)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Customs compliant profiles</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active with Docs</span>
            <FileText className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-2">{clientsWithDocs}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Clients with generated worksheets</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Docs Issued</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400 mt-2">{totalDocsCount}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">BoE, SB checklists & declarations</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, IEC, GSTIN, PAN, city, or contact..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setKycFilter('all')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors ${
                kycFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All KYC
            </button>
            <button
              onClick={() => setKycFilter('verified')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors ${
                kycFilter === 'verified' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Verified
            </button>
            <button
              onClick={() => setKycFilter('pending')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors ${
                kycFilter === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pending
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setDocFilter('all')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors ${
                docFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Docs
            </button>
            <button
              onClick={() => setDocFilter('with_docs')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors ${
                docFilter === 'with_docs' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Has Docs
            </button>
            <button
              onClick={() => setDocFilter('without_docs')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors ${
                docFilter === 'without_docs' ? 'bg-slate-800 text-slate-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              No Docs Yet
            </button>
          </div>
        </div>
      </div>

      {/* Main Customers Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white">No customers match your criteria</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery ? 'Try clearing your search query or reset filters.' : 'Add your first exporter or importer client to begin generating customs documents.'}
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              {searchQuery && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSearchQuery('')}
                  className="text-xs border-slate-700 text-slate-300"
                >
                  Clear Search
                </Button>
              )}
              <Link href="/cha/dashboard/clients/new">
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Customer
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px]">Customer / Exporter</th>
                  <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px]">Identities (IEC / GST)</th>
                  <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px]">KYC & Contact</th>
                  <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px]">
                    Last Document Created From Us
                  </th>
                  <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px] text-center">Docs</th>
                  <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px] text-center">Jobs</th>
                  <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {filteredCustomers.map((customer) => {
                  return (
                    <tr key={customer.id} className="hover:bg-slate-850/50 transition-colors group">
                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/cha/dashboard/clients/${customer.id}`}
                          className="font-bold text-white group-hover:text-amber-400 transition-colors block text-sm"
                        >
                          {customer.companyName}
                        </Link>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                          {customer.city && (
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              {customer.city}
                              {customer.state ? `, ${customer.state}` : ''}
                            </span>
                          )}
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-500 font-mono">
                            {customer.creditTerms || 'Net 15'}
                          </span>
                        </div>
                      </td>

                      {/* Identities */}
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-amber-400 font-bold tracking-wider">IEC:</span>
                          <span className="text-slate-200">{customer.iecNumber}</span>
                          <button
                            onClick={() => handleCopy(customer.iecNumber, `iec-${customer.id}`)}
                            title="Copy IEC"
                            className="text-slate-500 hover:text-white transition-colors ml-0.5"
                          >
                            {copiedId === `iec-${customer.id}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        {customer.gstin && (
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[150px]">
                            GST: {customer.gstin}
                          </div>
                        )}
                        {customer.pan && (
                          <div className="text-[10px] text-slate-500 mt-0.5">PAN: {customer.pan}</div>
                        )}
                      </td>

                      {/* KYC & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 mb-1">
                          {customer.kycStatus === 'verified' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle className="w-3 h-3" /> Verified KYC
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <Clock className="w-3 h-3" /> KYC Pending
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-300 font-medium">{customer.contactPerson}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[160px]">{customer.email}</div>
                      </td>

                      {/* Last Document Created From Us */}
                      <td className="py-3.5 px-4">
                        {customer.latestDocument ? (
                          <div className="space-y-1">
                            <Link
                              href={`/cha/dashboard/documents/${customer.latestDocument.id}`}
                              className="font-semibold text-amber-300 hover:text-amber-200 hover:underline flex items-center gap-1 max-w-[220px] truncate"
                              title={customer.latestDocument.title}
                            >
                              <FileText className="w-3 h-3 text-amber-400 shrink-0" />
                              <span className="truncate">{customer.latestDocument.title}</span>
                            </Link>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <span className="font-mono text-slate-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                                {customer.latestDocument.number}
                              </span>
                              <span className="text-slate-500">•</span>
                              <span className="flex items-center gap-1 text-slate-400">
                                <Clock className="w-2.5 h-2.5 text-slate-500" />
                                {formatTimeAgo(customer.latestDocument.createdAt)}
                              </span>
                              <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-bold ${
                                customer.latestDocument.status === 'finalized'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : customer.latestDocument.status === 'submitted'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : 'bg-slate-800 text-slate-400'
                              }`}>
                                {customer.latestDocument.status}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-slate-500 text-[11px] flex items-center gap-1.5 italic">
                            <span>No documents created yet</span>
                            <Link
                              href={`/cha/dashboard/documents/create?clientId=${customer.id}`}
                              className="text-amber-400 hover:underline not-italic font-bold text-[10px]"
                            >
                              + Create First
                            </Link>
                          </div>
                        )}
                      </td>

                      {/* Docs Count */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-[24px] px-1.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700">
                          {customer.totalDocumentsCount}
                        </span>
                      </td>

                      {/* Jobs Count */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center justify-center min-w-[24px] px-1.5 py-0.5 rounded-full text-xs font-bold border ${
                          customer.activeJobsCount > 0
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {customer.activeJobsCount}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/cha/dashboard/documents/create?clientId=${customer.id}`}>
                            <Button
                              size="sm"
                              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border-0 text-[11px] px-2.5 py-1 h-7"
                              title="Create Customs Document"
                            >
                              <FilePlus className="w-3 h-3 mr-1" />
                              Create Doc
                            </Button>
                          </Link>
                          <Link href={`/cha/dashboard/jobs/new?clientId=${customer.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-700 text-slate-300 hover:bg-slate-800 text-[11px] px-2 py-1 h-7"
                              title="New Clearance Job"
                            >
                              <Ship className="w-3 h-3" />
                            </Button>
                          </Link>
                          <Link href={`/cha/dashboard/clients/${customer.id}`}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-slate-400 hover:text-white text-[11px] px-2 py-1 h-7"
                              title="View Customer Profile"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </Button>
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
