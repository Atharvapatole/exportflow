import React from 'react';
import Link from 'next/link';
import { getCurrentContext } from '@/lib/auth';
import { documentRepo } from '@/lib/db';
import { FileText, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function QuotationsListPage() {
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.organization) return null;

  const docs = await documentRepo.listByOrg(ctx.organization.id, 'quotation');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#172033] tracking-tight">Export Quotations</h1>
          <p className="text-xs text-[#64748B]">Issue multi-currency export quotations with automated Incoterms & tax calculations</p>
        </div>
        <Link href="/dashboard/quotations/new">
          <Button size="sm" variant="secondary">
            <Plus className="w-4 h-4 mr-1.5" />
            Create Quotation
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {docs.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No quotations created yet"
              description="Create professional export quotations for international buyers with multi-currency pricing, Incoterms, and live PDF preview."
              actionLabel="Create Quotation"
              actionHref="/dashboard/quotations/new"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[#64748B] font-semibold">
                    <th className="py-3 px-4">Quotation No</th>
                    <th className="py-3 px-4">Buyer</th>
                    <th className="py-3 px-4">Date & Validity</th>
                    <th className="py-3 px-4">Incoterm</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {docs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-bold text-[#172033]">
                        <Link href={`/dashboard/quotations/${doc.id}`} className="hover:text-blue-600 block">
                          {doc.documentNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#172033]">{doc.buyerCompany}</div>
                        <div className="text-[11px] text-slate-400">{doc.buyerCountry}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div>{formatDate(doc.date)}</div>
                        {doc.validityDate && <div className="text-[10px] text-slate-400">Valid till {formatDate(doc.validityDate)}</div>}
                      </td>
                      <td className="py-3 px-4 font-bold text-blue-700">{doc.incoterm}</td>
                      <td className="py-3 px-4 font-bold text-[#172033]">
                        {formatCurrency(doc.grandTotal, doc.currency)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          doc.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : doc.status === 'sent'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link href={`/dashboard/quotations/${doc.id}`}>
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
