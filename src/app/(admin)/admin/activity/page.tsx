import React from 'react';
import { getCurrentContext } from '@/lib/auth';
import { adminRepo } from '@/lib/db';
import { Activity, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function AdminActivityPage() {
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.isSuperAdmin) return null;

  const activities = await adminRepo.getActivity(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Platform Activity Monitor</h1>
        <p className="text-xs text-slate-400">Chronological event log across all tenant organizations</p>
      </div>

      <div className="bg-[#0B1524] rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#070E18] text-slate-400 font-semibold">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {activities.map((act) => (
                <tr key={act.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                    {new Date(act.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-amber-300 text-[10px] uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {act.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-300">{act.entity}</td>
                  <td className="py-3 px-4 text-slate-300">{act.userName || 'System'}</td>
                  <td className="py-3 px-4 text-slate-400">{act.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
