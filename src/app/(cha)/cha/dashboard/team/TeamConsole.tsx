'use client';

import React, { useState } from 'react';
import { Users, Plus, ShieldCheck, Mail, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OrganizationTeamMember } from '@/types';

interface TeamConsoleProps {
  initialMembers: OrganizationTeamMember[];
}

export function TeamConsole({ initialMembers }: TeamConsoleProps) {
  const [members, setMembers] = useState<OrganizationTeamMember[]>(initialMembers);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<OrganizationTeamMember['role']>('cha_broker');
  const [isLoading, setIsLoading] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/team/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role }),
      });
      const data = await res.json();
      if (res.ok && data.member) {
        setMembers([...members, data.member]);
        setShowInviteModal(false);
        setName('');
        setEmail('');
      }
    } catch {} finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      const res = await fetch(`/api/team/members/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMembers(members.filter((m) => m.id !== id));
      }
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() => setShowInviteModal(true)}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Invite Team Member
        </Button>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        {members.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white">No additional team members invited</h3>
            <p className="mt-1 text-slate-500">
              Invite your clearance executive, dock examiner, or accountant to collaborate on jobs.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Member Name</th>
                <th className="py-3 px-4 font-semibold">Email</th>
                <th className="py-3 px-4 font-semibold">Role & Permissions</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-slate-850/50">
                  <td className="py-3 px-4 font-bold text-white">{m.name}</td>
                  <td className="py-3 px-4 text-slate-400">{m.email}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
                      {m.role.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 capitalize">
                      {m.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemove(m.id)}
                      className="text-rose-400 hover:text-rose-300 p-1"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              Invite Team Member
            </h3>

            <form onSubmit={handleInvite} className="space-y-3">
              <Input
                label="Full Name"
                required
                placeholder="e.g. Anand Deshmukh"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-950 border-slate-800 text-white"
              />

              <Input
                label="Email Address"
                type="email"
                required
                placeholder="anand@customsbroker.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-950 border-slate-800 text-white"
              />

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                >
                  <option value="cha_broker">Customs House Agent (Clearance Executive)</option>
                  <option value="manager">Operations Manager (Full Job Control)</option>
                  <option value="editor">Documentation Editor</option>
                  <option value="viewer">Auditor / Viewer (Read Only)</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInviteModal(false)}
                  className="border-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
                >
                  Send Invitation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
