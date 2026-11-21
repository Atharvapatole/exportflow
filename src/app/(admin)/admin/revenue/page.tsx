'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  Download,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Briefcase,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/EmptyState';
import { PlatformRevenueRecord } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { SUPPORTED_CURRENCIES } from '@/config/constants';

export default function AdminRevenuePage() {
  const [revenueList, setRevenueList] = useState<PlatformRevenueRecord[]>([]);
  const [platformStats, setPlatformStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    reference: '',
    customerName: '',
    category: 'custom_development' as any,
    amount: 1500,
    currency: 'USD',
    dateReceived: new Date().toISOString().split('T')[0],
    paymentMethod: 'Wire Transfer / Stripe Direct',
    transactionReference: '',
    description: 'Custom export workflow integration & deployment setup',
    status: 'completed' as any,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [revRes, statsRes] = await Promise.all([
        fetch('/api/admin/revenue'),
        fetch('/api/admin/stats'),
      ]);
      if (revRes.ok) setRevenueList(await revRes.json());
      if (statsRes.ok) {
        const data = await statsRes.json();
        setPlatformStats(data.stats);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/revenue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setForm({
          reference: '',
          customerName: '',
          category: 'custom_development',
          amount: 1500,
          currency: 'USD',
          dateReceived: new Date().toISOString().split('T')[0],
          paymentMethod: 'Wire Transfer / Stripe Direct',
          transactionReference: '',
          description: '',
          status: 'completed',
        });
        loadData();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportRevenueCsv = () => {
    if (revenueList.length === 0) return;
    const headers = ['Ref', 'Customer', 'Category', 'Amount', 'Currency', 'Date', 'Payment Method', 'Transaction Ref'];
    const rows = revenueList.map((r) => [
      `"${r.reference}"`,
      `"${r.customerName.replace(/"/g, '""')}"`,
      `"${r.category}"`,
      r.amount,
      `"${r.currency}"`,
      `"${r.dateReceived}"`,
      `"${r.paymentMethod}"`,
      `"${r.transactionReference}"`,
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encoded = encodeURI(csv);
    const a = document.createElement('a');
    a.href = encoded;
    a.download = `benzwell_revenue_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const totalBenzwellRevenue = revenueList.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Revenue & Business Analytics</h1>
          <p className="text-xs text-slate-400">Strict separation between BENZWELL Platform Revenue & Customer Export Transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={exportRevenueCsv}
            disabled={revenueList.length === 0}
            className="border-slate-700 bg-slate-800 text-slate-200"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export Revenue Report
          </Button>
          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Record Platform Income
          </Button>
        </div>
      </div>

      {/* SECTION B: CUSTOMER BUSINESS ACTIVITY SUMMARY (AGGREGATED & CLEARLY LABELED) */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <span>SECTION B: CUSTOMER EXPORT BUSINESS ACTIVITY (NOT BENZWELL REVENUE)</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Aggregated platform-wide trade volume generated by customer invoices and external buyer remittances. This reflects customer commerce, not platform fees.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="p-3 bg-[#0B1524] rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Customer Invoiced Sales</span>
            <div className="text-xl font-black text-white mt-1">
              {formatCurrency(platformStats?.customerRecordedSales || 0, 'USD')}
            </div>
            <span className="text-[10px] text-slate-500">Commercial Invoices issued</span>
          </div>

          <div className="p-3 bg-[#0B1524] rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Customer Received Payments</span>
            <div className="text-xl font-black text-emerald-400 mt-1">
              {formatCurrency(platformStats?.customerPayments || 0, 'USD')}
            </div>
            <span className="text-[10px] text-slate-500">External bank wires recorded</span>
          </div>

          <div className="p-3 bg-[#0B1524] rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Active Export Shipments</span>
            <div className="text-xl font-black text-amber-400 mt-1">
              {platformStats?.totalShipments || 0}
            </div>
            <span className="text-[10px] text-slate-500">Containers tracked</span>
          </div>
        </div>
      </div>

      {/* SECTION A: BENZWELL ACTUAL PLATFORM REVENUE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              SECTION A: BENZWELL PLATFORM INCOME ({formatCurrency(totalBenzwellRevenue, 'USD')})
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Legitimate consulting, custom engineering, and setup services
          </span>
        </div>

        <div className="bg-[#0B1524] rounded-xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-[#070E18] text-slate-400 font-semibold">
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Customer / Organization</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date Received</th>
                  <th className="py-3 px-4">Payment Method & Ref</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {revenueList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No platform income recorded yet. Click &quot;Record Platform Income&quot; to log legitimate services revenue.
                    </td>
                  </tr>
                ) : (
                  revenueList.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">{r.reference}</td>
                      <td className="py-3 px-4 font-semibold text-white">{r.customerName}</td>
                      <td className="py-3 px-4 uppercase text-[10px] text-slate-400 font-semibold">
                        {r.category.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{formatDate(r.dateReceived)}</td>
                      <td className="py-3 px-4 text-slate-300">
                        <div>{r.paymentMethod}</div>
                        <div className="text-[10px] font-mono text-slate-500">{r.transactionReference}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-400">
                        {formatCurrency(r.amount, r.currency)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Record Platform Income Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Record Legitimate BENZWELL Platform Revenue"
        description="Log income received from consulting, setup services, or custom integrations"
        maxWidth="lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Revenue Reference No."
              required
              placeholder="e.g. BENZ-REV-2026-001"
              value={form.reference}
              onChange={(e) => setForm({ ...form, reference: e.target.value })}
            />
            <Input
              label="Customer / Client Entity"
              required
              placeholder="e.g. Apex Global Trading FZE"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Income Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as any })}
              options={[
                { value: 'custom_development', label: 'Custom Software Development' },
                { value: 'setup_services', label: 'Setup & Onboarding Services' },
                { value: 'consulting', label: 'Trade Consulting Services' },
                { value: 'custom_integrations', label: 'Custom API Integrations' },
                { value: 'other', label: 'Other Agreed Services' },
              ]}
            />
            <Input
              label="Amount"
              type="number"
              step="any"
              required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
            />
            <Select
              label="Currency"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              options={SUPPORTED_CURRENCIES.map((c) => ({ value: c.code, label: c.code }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Payment Method"
              required
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
            />
            <Input
              label="Bank / Payment UTR Reference"
              required
              placeholder="UTR or Stripe Charge ID"
              value={form.transactionReference}
              onChange={(e) => setForm({ ...form, transactionReference: e.target.value })}
            />
          </div>

          <Textarea
            label="Service Scope Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" size="sm" isLoading={isSubmitting}>
              Record Revenue
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
