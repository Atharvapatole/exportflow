import React from 'react';
import Link from 'next/link';
import { getCurrentContext } from '@/lib/auth';
import { documentRepo } from '@/lib/db';
import { ShoppingCart, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function PurchaseOrdersListPage() {
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.organization) return null;

  const docs = await documentRepo.listByOrg(ctx.organization.id, 'purchase_order');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#172033] tracking-tight">Purchase Orders (PO)</h1>
          <p className="text-xs text-[#64748B]">Issue procurement orders to suppliers and manufacturers</p>
        </div>
        <Link href="/dashboard/quotations/new">
          <Button size="sm" variant="secondary">
            <Plus className="w-4 h-4 mr-1.5" />
            Create Purchase Order
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {docs.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title="No Purchase Orders created yet"
              description="Generate supplier purchase orders for raw materials and manufactured finished goods."
              actionLabel="Create Document"
              actionHref="/dashboard/quotations/new"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[#64748B] font-semibold">
                    <th className="py-3 px-4">PO Number</th>
                    <th className="py-3 px-4">Supplier</th>
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
