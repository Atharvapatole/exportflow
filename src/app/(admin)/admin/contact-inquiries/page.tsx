'use client';

import React, { useEffect, useState } from 'react';
import {
  Mail,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Archive,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  Building2,
  Phone,
  User,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ContactInquiry } from '@/types';

export default function AdminContactInquiriesPage() {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeInquiry, setActiveInquiry] = useState<ContactInquiry | null>(null);
  const [updating, setUpdating] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState<ContactInquiry['status']>('new');

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/contact-inquiries?status=${selectedStatus}`);
      if (res.ok) {
        const data = await res.json();
        setInquiries(data.inquiries || []);
      }
    } catch (e) {
      console.error('Failed to load inquiries', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [selectedStatus]);

  const handleOpenDetail = (inquiry: ContactInquiry) => {
    setActiveInquiry(inquiry);
    setEditStatus(inquiry.status);
    setEditNotes(inquiry.adminNotes || '');
  };

  const handleUpdate = async () => {
    if (!activeInquiry) return;
    setUpdating(true);
    try {
      const res = await fetch('/api/admin/contact-inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeInquiry.id,
          status: editStatus,
          adminNotes: editNotes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveInquiry(data.inquiry);
        setInquiries((prev) =>
          prev.map((i) => (i.id === data.inquiry.id ? data.inquiry : i))
        );
      }
    } catch (e) {
      console.error('Failed to update inquiry', e);
    } finally {
      setUpdating(false);
    }
  };

  const filteredInquiries = inquiries.filter((i) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      i.inquiryNumber.toLowerCase().includes(q) ||
      i.name.toLowerCase().includes(q) ||
      i.email.toLowerCase().includes(q) ||
      i.subject.toLowerCase().includes(q) ||
      (i.companyName && i.companyName.toLowerCase().includes(q))
    );
  });

  const getStatusBadge = (status: ContactInquiry['status']) => {
    switch (status) {
      case 'new':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">New</span>;
      case 'read':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/40">Read</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">In Progress</span>;
      case 'resolved':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">Resolved</span>;
      case 'archived':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/20 text-slate-400 border border-slate-500/40">Archived</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold mb-1">
            <Mail className="w-3.5 h-3.5" />
            <span>Super Admin Inbox</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Contact & Support Inquiries
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review and respond to exporter inquiries, sales requests, and enterprise contact forms.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={fetchInquiries}
          className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0F172A] p-4 rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'new', 'in_progress', 'resolved', 'archived'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                selectedStatus === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search inquiries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#08121E] border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Inquiries Table & Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table / List (2 Cols) */}
        <div className="lg:col-span-2 bg-[#0F172A] rounded-xl border border-slate-800 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500">
              Loading inquiries...
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No inquiries found in this view.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#08121E] text-slate-400 border-b border-slate-800 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="p-3">Inquiry #</th>
                    <th className="p-3">Sender</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredInquiries.map((inq) => (
                    <tr
                      key={inq.id}
                      onClick={() => handleOpenDetail(inq)}
                      className={`hover:bg-slate-800/40 cursor-pointer transition-colors ${
                        activeInquiry?.id === inq.id ? 'bg-blue-600/10' : ''
                      }`}
                    >
                      <td className="p-3 font-mono font-bold text-blue-400 whitespace-nowrap">
                        {inq.inquiryNumber}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="font-bold text-white block">{inq.name}</span>
                        <span className="text-[11px] text-slate-400 block">{inq.email}</span>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="capitalize text-slate-300 font-medium">
                          {inq.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3 max-w-xs truncate text-slate-200">
                        {inq.subject}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {getStatusBadge(inq.status)}
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Panel (1 Col) */}
        <div className="bg-[#0F172A] rounded-xl border border-slate-800 p-5 space-y-4">
          {activeInquiry ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-blue-400 font-bold block">
                    {activeInquiry.inquiryNumber}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(activeInquiry.createdAt).toLocaleString()}
                  </span>
                </div>
                {getStatusBadge(activeInquiry.status)}
              </div>

              {/* Sender Info */}
              <div className="space-y-2 text-xs text-slate-300 bg-[#08121E] p-3 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-bold text-white">{activeInquiry.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <a href={`mailto:${activeInquiry.email}`} className="text-blue-400 hover:underline">
                    {activeInquiry.email}
                  </a>
                </div>
                {activeInquiry.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{activeInquiry.phone}</span>
                  </div>
                )}
                {activeInquiry.companyName && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>{activeInquiry.companyName}</span>
                  </div>
                )}
              </div>

              {/* Subject & Message */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Subject
                </span>
                <h4 className="text-xs font-bold text-white mt-0.5">{activeInquiry.subject}</h4>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                  Message
                </span>
                <div className="p-3 rounded-lg bg-[#08121E] border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {activeInquiry.message}
                </div>
              </div>

              {/* Status Update & Admin Notes */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block">
                    Update Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as ContactInquiry['status'])}
                    className="w-full bg-[#08121E] border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block">
                    Admin Internal Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Add internal notes on phone follow-up or custom quote sent..."
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full bg-[#08121E] border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                  />
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleUpdate}
                  isLoading={updating}
                  className="w-full text-xs font-bold"
                >
                  Save Status & Notes
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500">
              Select an inquiry to view details and update notes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
