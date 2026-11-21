import React from 'react';
import { getCurrentContext } from '@/lib/auth';
import { orgRepo, userRepo, documentRepo } from '@/lib/db';
import { Building2, Globe, FileText, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function AdminCompaniesPage() {
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.isSuperAdmin) return null;

  const companies = await orgRepo.listAll();
  const users = await userRepo.listAll();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Registered Companies & Tenants</h1>
        <p className="text-xs text-slate-400">Multi-tenant export businesses onboarded on ExportFlow</p>
      </div>

      <div className="bg-[#0B1524] rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#070E18] text-slate-400 font-semibold">
                <th className="py-3 px-4">Company Name</th>
                <th className="py-3 px-4">Business Category</th>
                <th className="py-3 px-4">Country</th>
                <th className="py-3 px-4">Owner / Contact</th>
                <th className="py-3 px-4">Registration Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {companies.map((comp) => {
                const owner = users.find((u) => u.id === comp.ownerId);

                return (
                  <tr key={comp.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs uppercase">
                          {comp.name.charAt(0)}
                        </div>
                        <span>{comp.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{comp.businessType}</td>
                    <td className="py-3 px-4 text-slate-300">{comp.country}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {owner ? `${owner.name} (${owner.email})` : 'Direct Account'}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{formatDate(comp.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
