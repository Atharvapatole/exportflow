import React from 'react';
import { getCurrentContext } from '@/lib/auth';
import { Mail, CheckCircle2, Send, Clock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function ChaEmailsPage() {
  const ctx = await getCurrentContext();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Automated Email Notification Workflows</h1>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch automated email updates to exporters when Let Export Orders (LEO) or Out of Charge (OOC) are issued
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">OOC Clearance Notification</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">Active</span>
          </div>
          <p className="text-xs text-slate-400">
            Automatically notifies importer when customs assessment is finished and Out of Charge is received.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">LEO Export Release</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">Active</span>
          </div>
          <p className="text-xs text-slate-400">
            Emails Let Export Order copy and Shipping Bill number to exporter immediately upon officer endorsement.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">Missing Documents Chaser</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400">Configurable</span>
          </div>
          <p className="text-xs text-slate-400">
            Sends automated checklist reminders to exporter for pending commercial invoices or packing lists.
          </p>
        </div>
      </div>

      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
        <Mail className="w-10 h-10 text-slate-700 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-white">Email Delivery Service Configured</h3>
        <p className="text-slate-500 mt-1 max-w-sm mx-auto">
          Transaction emails are relayed via Resend / SMTP. Outbound messages contain verified tracking numbers and links to client portals.
        </p>
      </div>
    </div>
  );
}
