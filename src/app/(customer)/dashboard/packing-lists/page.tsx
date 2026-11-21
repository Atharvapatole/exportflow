import React from 'react';
import Link from 'next/link';
import { getCurrentContext } from '@/lib/auth';
import { documentRepo } from '@/lib/db';
import { Package, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';

export default async function PackingListsListPage() {
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.organization) return null;

  const docs = await documentRepo.listByOrg(ctx.organization.id, 'packing_list');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#172033] tracking-tight">Export Packing Lists (PL)</h1>
          <p className="text-xs text-[#64748B]">Automated package manifests, carton totals, net/gross weights, and CBM volumes</p>
        </div>
        <Link href="/dashboard/packing-lists/new">
          <Button size="sm" variant="secondary">
            <Plus className="w-4 h-4 mr-1.5" />
            Create Packing List
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {docs.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No Packing Lists created yet"
              description="Convert an invoice with 1-click to auto-calculate cartons, gross weights, and total cubic meters (CBM) for ocean cargo."
              actionLabel="Create Packing List"
              actionHref="/dashboard/packing-lists/new"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[#64748B] font-semibold">
                    <th className="py-3 px-4">Packing List No</th>
                    <th className="py-3 px-4">Buyer / Consignee</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Items / Total Qty</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {docs.map((doc) => {
                    const totalQty = doc.items.reduce((acc, it) => acc + (it.quantity || 0), 0);
                    return (
                      <tr key={doc.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-bold text-[#172033]">
                          <Link href={`/dashboard/packing-lists/${doc.id}`} className="hover:text-blue-600 block">
                            {doc.documentNumber}
                          </Link>
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#172033]">{doc.buyerCompany}</td>
                        <td className="py-3 px-4 text-slate-600">{formatDate(doc.date)}</td>
                        <td className="py-3 px-4 font-medium text-[#172033]">
                          {doc.items.length} items ({totalQty} units)
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                            {doc.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link href={`/dashboard/packing-lists/${doc.id}`}>
                            <Button size="sm" variant="ghost" className="h-7 text-xs">
                              View <ArrowRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
