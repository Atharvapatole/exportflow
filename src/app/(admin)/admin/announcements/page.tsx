'use client';

import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  CheckCircle2,
  Bell,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/EmptyState';
import { Announcement } from '@/types';
import { formatDate } from '@/lib/utils';

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'feature' as any,
  });

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/announcements');
      if (res.ok) setAnnouncements(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setIsAddOpen(false);
        setForm({ title: '', content: '', type: 'feature' });
        loadAnnouncements();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Platform Announcements</h1>
          <p className="text-xs text-slate-400">Broadcast feature updates, maintenance notices, and news to customer dashboards</p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsAddOpen(true)}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Publish Announcement
        </Button>
      </div>

      <div className="bg-[#0B1524] rounded-xl border border-slate-800 p-5 divide-y divide-slate-800/80">
        {announcements.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No announcements published yet. Click &quot;Publish Announcement&quot; to notify customers.
          </div>
        ) : (
          announcements.map((a) => (
            <div key={a.id} className="py-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{a.title}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-slate-800 text-slate-300">
                      {a.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{a.content}</p>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Published on {formatDate(a.publishedAt)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Publish Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Broadcast Platform Announcement"
        description="This notice will appear at the top of customer dashboards"
        maxWidth="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <Input
            label="Announcement Title"
            required
            placeholder="e.g. Incoterms 2020 Auto-Conversion Engine Live"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Select
            label="Category"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as any })}
            options={[
              { value: 'feature', label: 'New Feature Announcement' },
              { value: 'update', label: 'Service Update' },
              { value: 'maintenance', label: 'Scheduled Maintenance' },
              { value: 'notice', label: 'General Notice' },
            ]}
          />
          <Textarea
            label="Announcement Message"
            required
            rows={3}
            placeholder="Brief, informative message to exporters..."
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" size="sm" isLoading={isSubmitting}>
              Broadcast
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
