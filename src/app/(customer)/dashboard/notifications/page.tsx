'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  Check,
  ArrowRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Notification } from '@/types';
import { formatDate } from '@/lib/utils';

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications');
      if (res.ok) setNotifs(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifs();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-[#172033] tracking-tight">Notification & Alert Center</h1>
        <p className="text-xs text-[#64748B]">Real-time buyer quotation acceptances, shipment updates, and compliance reminders</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading alerts...</div>
          ) : notifs.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No alerts right now"
              description="You will receive real-time notifications here when buyers accept quotations, request revisions, or when shipment milestones are logged."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {notifs.map((n) => (
                <div key={n.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/50">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#172033]">{n.title}</div>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{formatDate(n.createdAt)}</span>
                    </div>
                  </div>

                  {n.link && (
                    <Link href={n.link}>
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        View <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
