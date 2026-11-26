import React from 'react';
import { getCurrentContext } from '@/lib/auth';
import { auditRepo } from '@/lib/db';
import { History, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ChaAuditPage() {
  const ctx = await getCurrentContext();
  const orgId = ctx?.organization?.id || '';

  const logs = await auditRepo.listByOrg(orgId, 50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Audit Trail & Security Logs</h1>
        <p className="text-xs text-slate-400 mt-1">
          Immutable audit record of all document modifications, status progressions, and customs filing events
        </p>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <History className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white">No security audit events recorded</h3>
            <p className="mt-1 text-slate-500">Document generation and ICEGATE actions will be tracked here in real time.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Actor / User</th>
                <th className="py-3 px-4 font-semibold">Action</th>
                <th className="py-3 px-4 font-semibold">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-850/50">
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {new Date(log.timestamp || log.createdAt || Date.now()).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-bold text-white">{log.actorName}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
