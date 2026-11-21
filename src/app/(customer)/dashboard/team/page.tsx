import React from 'react';
import { getCurrentContext } from '@/lib/auth';
import { orgRepo } from '@/lib/db';
import { Users, UserPlus, Shield, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';

export default async function TeamPage() {
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.organization) return null;

  const members = await orgRepo.getMembers(ctx.organization.id);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#172033] tracking-tight">Team Members & Access Control</h1>
          <p className="text-xs text-[#64748B]">Manage colleagues and role-based permissions (Manager, Employee, Viewer)</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Members ({members.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {members.map((m) => (
              <div key={m.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#10243A] text-white flex items-center justify-center font-bold text-xs">
                    {m.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#172033] block">{m.userName}</span>
                    <span className="text-[11px] text-slate-400">{m.userEmail}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                    {m.role}
                  </span>
                  <span className="text-[10px] text-slate-400">Joined {formatDate(m.joinedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
