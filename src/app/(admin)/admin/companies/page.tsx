import React from 'react';
import { getAdminContext } from '@/lib/auth';
import { orgRepo, userRepo, subscriptionRepo } from '@/lib/db';
import { AdminCompaniesTable } from '@/components/admin/AdminCompaniesTable';

export const dynamic = 'force-dynamic';

export default async function AdminCompaniesPage() {
  const ctx = await getAdminContext();
  if (!ctx || !ctx.isSuperAdmin) return null;

  const [companies, users] = await Promise.all([
    orgRepo.listAll(),
    userRepo.listAll(),
  ]);

  const companiesWithPlans = await Promise.all(
    companies.map(async (comp) => {
      const owner = users.find((u) => u.id === comp.ownerId);
      const sub = await subscriptionRepo.findByOrg(comp.id);

      return {
        id: comp.id,
        name: comp.name,
        businessType: comp.businessType,
        country: comp.country,
        orgType: comp.orgType,
        ownerName: owner?.name,
        ownerEmail: owner?.email,
        planId: sub?.planId || 'free',
        status: sub?.status || 'active',
        createdAt: comp.createdAt,
      };
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Registered Companies & Tenants</h1>
          <p className="text-xs text-slate-400">Multi-tenant exporter businesses and customs brokers onboarded on ExportFlow</p>
        </div>
        <div className="text-xs text-slate-400">
          Total Organizations: <strong className="text-white">{companies.length}</strong>
        </div>
      </div>

      <AdminCompaniesTable companies={companiesWithPlans} />
    </div>
  );
}
