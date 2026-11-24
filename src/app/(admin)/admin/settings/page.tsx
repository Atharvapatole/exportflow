import React from 'react';
import { getAdminContext } from '@/lib/auth';
import { infraConfig } from '@/config/infrastructure';
import { Settings, ShieldCheck, Key, Server } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default async function AdminSettingsPage() {
  const ctx = await getAdminContext();
  if (!ctx || !ctx.isSuperAdmin) return null;

  const bootstrap = infraConfig.getAdminBootstrapConfig();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Root Admin System Settings</h1>
        <p className="text-xs text-slate-400">BENZWELL administrative controls and security parameters</p>
      </div>

      <div className="bg-[#0B1524] p-6 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <ShieldCheck className="w-6 h-6 text-amber-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Super Admin Provisioning</h3>
            <p className="text-xs text-slate-400">Master account configured via server-side bootstrap environment</p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-slate-300">
          <div className="flex justify-between py-2 border-b border-slate-800/80">
            <span className="text-slate-400">Bootstrap Admin Email:</span>
            <span className="font-mono text-amber-400">{bootstrap.email}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-800/80">
            <span className="text-slate-400">Root Access Control:</span>
            <span className="text-emerald-400 font-bold">Server-side Protected</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-800/80">
            <span className="text-slate-400">Public Registration:</span>
            <span className="text-slate-300">Customer Role Only (No Admin Role Grants)</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-400">Application URL:</span>
            <span className="font-mono">{infraConfig.getAppUrl()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
