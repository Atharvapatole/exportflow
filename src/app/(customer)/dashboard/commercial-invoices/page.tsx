import React from 'react';
import Link from 'next/link';
import { getCurrentContext } from '@/lib/auth';
import { documentRepo } from '@/lib/db';
import { TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function CommercialInvoicesListPage() {
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.organization) return null;

  const docs = await documentRepo.listByOrg(ctx.organization.id, 'commercial_invoice');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#172033] tracking-tight">Commercial Invoices (CI)</h1>
          <p className="text-xs text-[#64748B]">Generate official customs clearance invoices for international export shipments</p>
        </div>
        <Link href="/dashboard/commercial-invoices/new">
          <Button size="sm" variant="secondary">
            <Plus className="w-4 h-4 mr-1.5" />
            Create Commercial Invoice
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {docs.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="No Commercial Invoices yet"
              description="Convert a Proforma Invoice with 1-click or generate a new Commercial Invoice with Incoterms and HS Code details."
              actionLabel="Create Commercial Invoice"
              actionHref="/dashboard/commercial-invoices/new"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[#64748B] font-semibold">
                    <th className="py-3 px-4">Invoice No</th>
                    <th className="py-3 px-4">Buyer / Consignee</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Incoterm</th>
                    <th className="py-3 px-4">Total Value</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {docs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-bold text-[#172033]">
                        <Link href={`/dashboard/commercial-invoices/${doc.id}`} className="hover:text-blue-600 block">
                          {doc.documentNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#172033]">{doc.buyerCompany}</div>
                        <div className="text-[11px] text-slate-400">{doc.buyerCountry}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{formatDate(doc.date)}</td>
                      <td className="py-3 px-4 font-bold text-blue-700">{doc.incoterm}</td>
                      <td className="py-3 px-4 font-bold text-[#172033]">
                        {formatCurrency(doc.grandTotal, doc.currency)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-100 text-purple-800">
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link href={`/dashboard/commercial-invoices/${doc.id}`}>
                          <Button size="sm" variant="ghost" className="h-7 text-xs">
                            View <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </Link>
                      </td>
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
