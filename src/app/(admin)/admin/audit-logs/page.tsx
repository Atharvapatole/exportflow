import React from 'react';
import { getAdminContext } from '@/lib/auth';
import { adminRepo } from '@/lib/db';
import { ShieldAlert, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function AdminAuditLogsPage() {
  const ctx = await getAdminContext();
  if (!ctx || !ctx.isSuperAdmin) return null;

  const logs = await adminRepo.getAuditLogs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Super Admin Audit Logs</h1>
        <p className="text-xs text-slate-400">Auditable chronological record of administrative actions, user suspensions, and revenue entries</p>
      </div>

      <div className="bg-[#0B1524] rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#070E18] text-slate-400 font-semibold">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Admin Email</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No admin actions recorded yet
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-amber-400 font-medium">{log.adminEmail}</td>
                    <td className="py-3 px-4 font-bold text-white uppercase text-[10px]">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{log.targetEntity} ({log.targetId})</td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {log.details ? JSON.stringify(log.details) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
