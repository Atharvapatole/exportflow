'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BaseDocument } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, BarChart2 } from 'lucide-react';

interface DashboardChartsProps {
  quotations: BaseDocument[];
  commercialInvoices: BaseDocument[];
  currency: string;
}

interface MonthData {
  name: string;
  quotations: number;
  sales: number;
}

export function DashboardCharts({
  quotations,
  commercialInvoices,
  currency,
}: DashboardChartsProps) {
  // Aggregate real monthly figures from documents
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthIdx = new Date().getMonth();

  // Pick last 6 months
  const last6Months: MonthData[] = [];
  for (let i = 5; i >= 0; i--) {
    const idx = (currentMonthIdx - i + 12) % 12;
    last6Months.push({
      name: months[idx],
      quotations: 0,
      sales: 0,
    });
  }

  quotations.forEach((q) => {
    const d = new Date(q.date || q.createdAt);
    const mName = months[d.getMonth()];
    const item = last6Months.find((m) => m.name === mName);
    if (item) {
      item.quotations += q.grandTotal || 0;
    }
  });

  commercialInvoices.forEach((ci) => {
    const d = new Date(ci.date || ci.createdAt);
    const mName = months[d.getMonth()];
    const item = last6Months.find((m) => m.name === mName);
    if (item) {
      item.sales += ci.grandTotal || 0;
    }
  });

  const maxVal = Math.max(
    ...last6Months.map((m) => Math.max(m.quotations, m.sales)),
    1000
  );

  const totalQuotationValue = quotations.reduce((a, b) => a + (b.grandTotal || 0), 0);
  const totalSalesValue = commercialInvoices.reduce((a, b) => a + (b.grandTotal || 0), 0);
  const conversionRate =
    quotations.length > 0
      ? Math.round(
          (quotations.filter((q) => q.status === 'accepted').length / quotations.length) * 100
        )
      : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Monthly Pipeline Chart */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Quotation vs Sales Trajectory</CardTitle>
            <p className="text-xs text-slate-500">Real monthly document values ({currency})</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-blue-500" />
              <span className="text-slate-600">Quotations</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-500" />
              <span className="text-slate-600">Invoices</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-100">
            {last6Months.map((m) => {
              const qHeight = Math.min(100, Math.max(6, (m.quotations / maxVal) * 100));
              const sHeight = Math.min(100, Math.max(6, (m.sales / maxVal) * 100));

              return (
                <div key={m.name} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1.5 h-full">
                    <div
                      style={{ height: `${qHeight}%` }}
                      className="w-1/2 max-w-[28px] bg-blue-500 rounded-t-md transition-all group-hover:bg-blue-600 relative"
                      title={`Quotations: ${formatCurrency(m.quotations, currency)}`}
                    />
                    <div
                      style={{ height: `${sHeight}%` }}
                      className="w-1/2 max-w-[28px] bg-emerald-500 rounded-t-md transition-all group-hover:bg-emerald-600 relative"
                      title={`Sales: ${formatCurrency(m.sales, currency)}`}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">{m.name}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between pt-3 text-xs text-slate-500">
            <span>Total Quotations: <strong>{formatCurrency(totalQuotationValue, currency)}</strong></span>
            <span>Total Realized Sales: <strong>{formatCurrency(totalSalesValue, currency)}</strong></span>
          </div>
        </CardContent>
      </Card>

      {/* Conversion Rate & Performance Card */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Rate & Health</CardTitle>
          <p className="text-xs text-slate-500">Quotation acceptance metrics</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Quotation Acceptance Rate
            </span>
            <div className="text-4xl font-black text-blue-600 my-1">{conversionRate}%</div>
            <p className="text-xs text-slate-500">
              {quotations.filter((q) => q.status === 'accepted').length} of {quotations.length} quotes accepted
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Accepted</span>
                <span className="text-[#172033]">{quotations.filter((q) => q.status === 'accepted').length}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${quotations.length > 0 ? (quotations.filter((q) => q.status === 'accepted').length / quotations.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Pending / Reviewing</span>
                <span className="text-[#172033]">{quotations.filter((q) => q.status === 'sent' || q.status === 'draft').length}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{
                    width: `${quotations.length > 0 ? (quotations.filter((q) => q.status === 'sent' || q.status === 'draft').length / quotations.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
