'use client';

import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { SupportTicket } from '@/types';
import { formatDate } from '@/lib/utils';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/support');
      if (res.ok) setTickets(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          replyMessage: replyText,
          status: 'resolved',
        }),
      });
      if (res.ok) {
        setReplyText('');
        loadTickets();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Customer Support Management</h1>
        <p className="text-xs text-slate-400">View and respond to inquiries, bug reports, and account questions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-1 bg-[#0B1524] rounded-xl border border-slate-800 p-4 space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Tickets ({tickets.length})
          </span>

          {tickets.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">No support tickets submitted</div>
          ) : (
            tickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                  selectedTicket?.id === t.id
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-slate-800 bg-[#070E18] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white truncate">{t.subject}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                    t.priority === 'urgent' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {t.priority}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">{t.companyName} • {t.userName}</div>
                <div className="text-[10px] text-slate-500 mt-1">{formatDate(t.createdAt)}</div>
              </div>
            ))
          )}
        </div>

        {/* Selected Ticket Thread */}
        <div className="lg:col-span-2 bg-[#0B1524] rounded-xl border border-slate-800 p-6 flex flex-col justify-between">
          {selectedTicket ? (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[10px] text-amber-400 font-bold uppercase">
                  {selectedTicket.category.replace(/_/g, ' ')}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedTicket.subject}</h3>
                <p className="text-xs text-slate-400">
                  From: {selectedTicket.userName} ({selectedTicket.userEmail}) • {selectedTicket.companyName}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#070E18] border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                {selectedTicket.message}
              </div>

              {/* Replies */}
              {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Thread History</span>
                  {selectedTicket.replies.map((r) => (
                    <div key={r.id} className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-amber-200">
                      <span className="font-bold block text-[10px] text-amber-400">{r.authorName} ({formatDate(r.createdAt)})</span>
                      <p className="mt-1">{r.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="space-y-3 pt-4 border-t border-slate-800">
                <Textarea
                  placeholder="Type official admin reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white"
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    type="submit"
                    isLoading={isSubmitting}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                  >
                    <Send className="w-4 h-4 mr-1.5" />
                    Send Reply & Resolve
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="py-24 text-center text-xs text-slate-500">
              Select a support ticket from the left column to view message thread and reply.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
