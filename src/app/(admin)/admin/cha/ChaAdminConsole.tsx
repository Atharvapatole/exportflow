'use client';

import React, { useState } from 'react';
import {
  Ship,
  ShieldCheck,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  Mail,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Organization } from '@/types';

interface ChaAdminConsoleProps {
  initialOrgs: Organization[];
}

export function ChaAdminConsole({ initialOrgs }: ChaAdminConsoleProps) {
  const [orgs, setOrgs] = useState<Organization[]>(initialOrgs);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleUpdateStatus = async (orgId: string, newStatus: string) => {
    setIsUpdating(orgId);
    try {
      const res = await fetch('/api/admin/cha/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId, status: newStatus }),
      });
      if (res.ok) {
        setOrgs(
          orgs.map((o) =>
            o.id === orgId ? { ...o, chaLicenseStatus: newStatus as any } : o
          )
        );
      }
    } catch {} finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        {orgs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <Ship className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white">No CHA Broker accounts registered</h3>
            <p className="mt-1 text-slate-500">
              When customs brokers register at <code className="text-amber-400">/cha/register</code>, their license verification records will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Brokerage Legal Name</th>
                  <th className="py-3 px-4 font-semibold">License No. & Station</th>
                  <th className="py-3 px-4 font-semibold">Contact Info</th>
                  <th className="py-3 px-4 font-semibold">Verification Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {orgs.map((org) => {
                  const isVerified = org.chaLicenseStatus === 'verified';
                  return (
                    <tr key={org.id} className="hover:bg-slate-850/50">
                      <td className="py-3.5 px-4 font-bold text-white">
                        {org.name}
                        <span className="text-[10px] text-slate-500 block font-normal">
                          Joined: {new Date(org.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-amber-400 block">
                          {org.chaLicenseNumber || 'Pending'}
                        </span>
                        <span className="text-slate-400 text-[11px] block">
                          {org.chaLicenseAuthority || 'Port Unspecified'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">
                        {org.email && <div>{org.email}</div>}
                        {org.phone && <div className="text-[11px] text-slate-500">{org.phone}</div>}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isVerified
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : org.chaLicenseStatus === 'rejected'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {isVerified ? (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5" /> Verified
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5" /> {org.chaLicenseStatus || 'Unverified'}
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isVerified ? (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(org.id, 'verified')}
                              isLoading={isUpdating === org.id}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] h-7 px-3"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Grant Verification
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(org.id, 'unverified')}
                              isLoading={isUpdating === org.id}
                              className="border-slate-700 text-amber-400 hover:bg-slate-800 text-[11px] h-7 px-3"
                            >
                              Revoke Badge
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
