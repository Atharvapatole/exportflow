import React from 'react';
import Link from 'next/link';
import { getCurrentContext } from '@/lib/auth';
import { documentRepo } from '@/lib/db';
import {
  FileText,
  Plus,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function AllDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.organization) return null;

  const docs = await documentRepo.listByOrg(ctx.organization.id, type);

  const tabs = [
    { label: 'All Documents', value: '' },
    { label: 'Quotations', value: 'quotation' },
    { label: 'Proforma Invoices', value: 'proforma_invoice' },
    { label: 'Commercial Invoices', value: 'commercial_invoice' },
    { label: 'Packing Lists', value: 'packing_list' },
    { label: 'Sales Orders', value: 'sales_order' },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#172033] tracking-tight">Document Studio Repository</h1>
          <p className="text-xs text-[#64748B]">Centralized international trade documentation, revisions & conversions</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/quotations/new">
            <Button size="sm" variant="secondary">
              <Plus className="w-4 h-4 mr-1.5" />
              New Quotation
            </Button>
          </Link>
          <Link href="/dashboard/proforma-invoices/new">
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1.5" />
              New Proforma Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        {tabs.map((t) => {
          const isActive = (type || '') === t.value;
          const href = t.value ? `/dashboard/documents?type=${t.value}` : '/dashboard/documents';
          return (
            <Link
              key={t.value}
              href={href}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {/* Documents Table */}
      <Card>
        <CardContent className="p-0">
          {docs.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No documents generated"
              description="Create export quotations, proforma invoices, commercial invoices, and packing lists with one click."
              actionLabel="Create Quotation"
              actionHref="/dashboard/quotations/new"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[#64748B] font-semibold">
                    <th className="py-3 px-4">Doc Type & No</th>
                    <th className="py-3 px-4">Buyer / Consignee</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Incoterm</th>
                    <th className="py-3 px-4">Grand Total</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {docs.map((doc) => {
                    const viewUrl =
                      doc.type === 'quotation'
                        ? `/dashboard/quotations/${doc.id}`
                        : doc.type === 'proforma_invoice'
                        ? `/dashboard/proforma-invoices/${doc.id}`
                        : doc.type === 'commercial_invoice'
                        ? `/dashboard/commercial-invoices/${doc.id}`
                        : doc.type === 'packing_list'
                        ? `/dashboard/packing-lists/${doc.id}`
                        : `/dashboard/documents/${doc.id}`;

                    return (
                      <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#172033]">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-black text-xs flex items-center justify-center shrink-0">
                              {doc.type === 'quotation' ? 'QT' : doc.type === 'proforma_invoice' ? 'PI' : doc.type === 'commercial_invoice' ? 'CI' : 'PL'}
                            </span>
                            <div>
                              <Link href={viewUrl} className="hover:text-blue-600 block">
                                {doc.documentNumber}
                              </Link>
                              <span className="text-[10px] text-slate-400 font-normal uppercase">
                                {doc.type.replace(/_/g, ' ')}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#172033]">
                          <div className="font-semibold">{doc.buyerCompany || 'Customer'}</div>
                          <div className="text-[10px] text-slate-400">{doc.buyerCountry}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{formatDate(doc.date)}</td>
                        <td className="py-3 px-4 font-bold text-blue-700">{doc.incoterm}</td>
                        <td className="py-3 px-4 font-bold text-[#172033]">
                          {formatCurrency(doc.grandTotal, doc.currency)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                            {doc.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link href={viewUrl}>
                            <Button size="sm" variant="ghost" className="h-7 text-xs">
                              Open <ArrowRight className="w-3.5 h-3.5 ml-1" />
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
