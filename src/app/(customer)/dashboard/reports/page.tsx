import React from 'react';
import { getCurrentContext } from '@/lib/auth';
import { documentRepo, buyerRepo, shipmentRepo, paymentRepo } from '@/lib/db';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { formatCurrency } from '@/lib/utils';
import { BarChart3, TrendingUp, Users, Ship } from 'lucide-react';

export default async function ReportsPage() {
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.organization) return null;

  const [docs, buyers, shipments, payments] = await Promise.all([
    documentRepo.listByOrg(ctx.organization.id),
    buyerRepo.listByOrg(ctx.organization.id),
    shipmentRepo.listByOrg(ctx.organization.id),
    paymentRepo.listByOrg(ctx.organization.id),
  ]);

  const quotations = docs.filter((d) => d.type === 'quotation');
  const invoices = docs.filter((d) => d.type === 'commercial_invoice');
  const totalQuoteValue = quotations.reduce((a, b) => a + (b.grandTotal || 0), 0);
  const totalInvoiceValue = invoices.reduce((a, b) => a + (b.grandTotal || 0), 0);
  const totalPayments = payments.reduce((a, b) => a + (b.amount || 0), 0);

  // Group by Incoterm
  const incotermBreakdown: Record<string, number> = {};
  docs.forEach((d) => {
    incotermBreakdown[d.incoterm] = (incotermBreakdown[d.incoterm] || 0) + (d.grandTotal || 0);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#172033] tracking-tight">Export Reports & Business Intelligence</h1>
        <p className="text-xs text-[#64748B]">Audited international trade records, Incoterms distribution, and revenue realizations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Pipeline Quotations"
          value={formatCurrency(totalQuoteValue, 'USD')}
          subtitle={`${quotations.length} total quotes issued`}
          icon={BarChart3}
          color="blue"
        />
        <StatCard
          title="Billed Sales (CI)"
          value={formatCurrency(totalInvoiceValue, 'USD')}
          subtitle={`${invoices.length} invoices generated`}
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Bank Realizations"
          value={formatCurrency(totalPayments, 'USD')}
          subtitle={`${payments.length} payment records`}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Shipments Handled"
          value={shipments.length}
          subtitle="Container bookings"
          icon={Ship}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Trade Value by Incoterms 2020</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(incotermBreakdown).length === 0 ? (
              <p className="text-xs text-slate-400">No documents generated yet</p>
            ) : (
              <div className="space-y-3 text-xs">
                {Object.entries(incotermBreakdown).map(([inc, val]) => (
                  <div key={inc} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-bold text-[#172033] bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      {inc}
                    </span>
                    <span className="font-bold text-slate-700">{formatCurrency(val, 'USD')}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top International Markets</CardTitle>
          </CardHeader>
          <CardContent>
            {buyers.length === 0 ? (
              <p className="text-xs text-slate-400">No buyers added yet</p>
            ) : (
              <div className="space-y-2 text-xs">
                {buyers.slice(0, 5).map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
                    <div>
                      <span className="font-bold text-[#172033] block">{b.companyName}</span>
                      <span className="text-slate-400 text-[11px]">{b.country}</span>
                    </div>
                    <span className="font-semibold text-slate-700">${b.totalOrderValue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
