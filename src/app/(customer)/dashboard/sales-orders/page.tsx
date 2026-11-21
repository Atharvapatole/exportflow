import React from 'react';
import Link from 'next/link';
import { getCurrentContext } from '@/lib/auth';
import { documentRepo } from '@/lib/db';
import { FileCheck2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function SalesOrdersListPage() {
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.organization) return null;

  const docs = await documentRepo.listByOrg(ctx.organization.id, 'sales_order');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#172033] tracking-tight">Sales Orders (SO)</h1>
          <p className="text-xs text-[#64748B]">Internal order authorizations for export production and shipment packaging</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {docs.length === 0 ? (
            <EmptyState
              icon={FileCheck2}
              title="No Sales Orders created yet"
              description="Convert an accepted quotation or proforma invoice into a Sales Order with 1-click."
              actionLabel="View Quotations"
              actionHref="/dashboard/quotations"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[#64748B] font-semibold">
                    <th className="py-3 px-4">SO Number</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Total Value</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {docs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-bold text-[#172033]">{doc.documentNumber}</td>
                      <td className="py-3 px-4 text-[#172033]">{doc.buyerCompany}</td>
                      <td className="py-3 px-4 text-slate-600">{formatDate(doc.date)}</td>
                      <td className="py-3 px-4 font-bold text-[#172033]">{formatCurrency(doc.grandTotal, doc.currency)}</td>
                      <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100">{doc.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
