import React from 'react';
import Link from 'next/link';
import { Plus, Users, Building2, FilePlus, Download } from 'lucide-react';
import { getCurrentContext } from '@/lib/auth';
import { chaClientRepo, customsJobRepo, chaDocRepo } from '@/lib/db';
import { Button } from '@/components/ui/Button';
import { CustomerListClient } from './CustomerListClient';

export const dynamic = 'force-dynamic';

export default async function ChaCustomersPage() {
  const ctx = await getCurrentContext();
  const orgId = ctx?.organization?.id || '';

  const [clients, allJobs, allDocs] = await Promise.all([
    chaClientRepo.listByOrg(orgId),
    customsJobRepo.listByOrg(orgId),
    chaDocRepo.listByOrg(orgId),
  ]);

  const enrichedCustomers = clients.map((client) => {
    const clientJobs = allJobs.filter((j) => j.clientId === client.id);
    const clientDocs = allDocs.filter((d) => d.clientId === client.id);
    const latestDoc = clientDocs.length > 0 ? clientDocs[0] : null;
    const activeJobs = clientJobs.filter(
      (j) => !['ooc_granted', 'leo_granted', 'completed', 'cancelled'].includes(j.status)
    );

    return {
      id: client.id,
      chaOrgId: client.chaOrgId,
      companyName: client.companyName,
      iecNumber: client.iecNumber || '',
      gstin: client.gstin,
      pan: client.pan,
      contactPerson: client.contactPerson,
      email: client.email,
      phone: client.phone,
      address: client.address,
      city: client.city,
      state: client.state,
      kycStatus: client.kycStatus,
      creditTerms: client.creditTerms,
      totalJobsCount: clientJobs.length,
      activeJobsCount: activeJobs.length,
      totalDocumentsCount: clientDocs.length,
      totalDutyBilled: clientJobs.reduce((sum, j) => sum + (j.actualDutyPaidInr || j.estimatedDutyInr || 0), 0),
      totalChaFees: clientJobs.reduce((sum, j) => sum + (j.chaChargesInr || 0), 0),
      latestDocument: latestDoc
        ? {
            id: latestDoc.id,
            title: latestDoc.documentTitle,
            number: latestDoc.documentNumber,
            type: latestDoc.type,
            status: latestDoc.status,
            createdAt: latestDoc.createdAt,
          }
        : null,
    };
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
              CHA Customer Hub
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400">Exporter & Importer Registry</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">Customer & Client Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track all enrolled exporters, monitor the last document created from your brokerage, verify KYC compliance, and launch new customs documents.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/cha/dashboard/documents/create">
            <Button
              size="sm"
              variant="outline"
              className="border-slate-700 text-slate-200 hover:bg-slate-800 text-xs px-3.5 py-2"
            >
              <FilePlus className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              Document Studio
            </Button>
          </Link>
          <Link href="/cha/dashboard/clients/new">
            <Button
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border-0 text-xs px-3.5 py-2 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add New Customer
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Client Component */}
      <CustomerListClient initialCustomers={enrichedCustomers} />
    </div>
  );
}
