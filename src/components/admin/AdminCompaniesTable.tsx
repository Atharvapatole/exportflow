'use client';

import React, { useState } from 'react';
import { Building2, Shield, Settings2, Sparkles, Ship } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { AdminPlanModal } from '@/components/admin/AdminPlanModal';

interface CompanyRow {
  id: string;
  name: string;
  businessType: string;
  country: string;
  orgType?: string;
  ownerName?: string;
  ownerEmail?: string;
  planId?: string;
  status?: string;
  createdAt: string;
}

interface AdminCompaniesTableProps {
  companies: CompanyRow[];
}

export function AdminCompaniesTable({ companies }: AdminCompaniesTableProps) {
  const [selectedComp, setSelectedComp] = useState<CompanyRow | null>(null);

  return (
    <div className="bg-[#0B1524] rounded-xl border border-slate-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-[#070E18] text-slate-400 font-semibold">
              <th className="py-3 px-4">Company Name & Type</th>
              <th className="py-3 px-4">Active Plan</th>
              <th className="py-3 px-4">Country</th>
              <th className="py-3 px-4">Owner / Contact</th>
              <th className="py-3 px-4">Registration Date</th>
              <th className="py-3 px-4 text-right">Super Admin Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {companies.map((comp) => {
              const isCha = comp.orgType === 'cha' || comp.businessType?.toLowerCase().includes('customs') || comp.businessType?.toLowerCase().includes('cha');

              return (
                <tr key={comp.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold text-white">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs uppercase ${
                        isCha
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                      }`}>
                        {isCha ? <Ship className="w-3.5 h-3.5" /> : comp.name.charAt(0)}
                      </div>
                      <div>
                        <span>{comp.name}</span>
                        <span className="text-[10px] text-slate-400 block font-normal capitalize">
                          {isCha ? 'Customs Broker (CHA)' : (comp.businessType || 'Exporter')}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-amber-400 border border-amber-500/20">
                      {comp.planId?.replace(/_/g, ' ') || 'Free'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{comp.country}</td>
                  <td className="py-3 px-4 text-slate-400">
                    {comp.ownerEmail ? `${comp.ownerName || 'User'} (${comp.ownerEmail})` : 'Direct Account'}
                  </td>
                  <td className="py-3 px-4 text-slate-400">{formatDate(comp.createdAt)}</td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedComp(comp)}
                      className="text-[11px] h-7 px-2.5 border-slate-700 text-amber-400 hover:bg-slate-800"
                    >
                      <Settings2 className="w-3 h-3 mr-1" />
                      Manage Plan
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedComp && (
        <AdminPlanModal
          organizationId={selectedComp.id}
          organizationName={selectedComp.name}
          currentPlanId={selectedComp.planId || 'free'}
          currentStatus={selectedComp.status || 'active'}
          isOpen={!!selectedComp}
          onClose={() => setSelectedComp(null)}
          onSuccess={() => {
            // Updated
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
