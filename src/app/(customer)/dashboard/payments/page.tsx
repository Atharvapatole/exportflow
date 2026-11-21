'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Download,
  Calendar,
  Landmark,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Modal } from '@/components/ui/EmptyState';
import { EmptyState } from '@/components/ui/EmptyState';
import { PaymentRecord } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { SUPPORTED_CURRENCIES, PAYMENT_STATUSES } from '@/config/constants';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    buyerCompany: '',
    invoiceReference: '',
    amount: 5000,
    currency: 'USD',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'wire_transfer' as any,
    transactionReference: '',
    status: 'paid' as any,
    notes: '',
  });

  const loadPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/payments');
      if (res.ok) setPayments(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setForm({
          buyerCompany: '',
          invoiceReference: '',
          amount: 5000,
          currency: 'USD',
          paymentDate: new Date().toISOString().split('T')[0],
          paymentMethod: 'wire_transfer',
          transactionReference: '',
          status: 'paid',
          notes: '',
        });
        loadPayments();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalReceived = payments
    .filter((p) => p.status === 'paid')
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#172033] tracking-tight">Sales & Payment Ledger</h1>
          <p className="text-xs text-[#64748B]">Record bank wire transfers (TT), LC negotiations, and buyer settlements</p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Record Payment
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Realized Payments"
          value={formatCurrency(totalReceived, 'USD')}
          subtitle={`${payments.filter((p) => p.status === 'paid').length} inward remittances`}
          icon={CreditCard}
          color="emerald"
        />
        <StatCard
          title="Recorded Transactions"
          value={payments.length}
          subtitle="Bank wires & LC realizations"
          icon={Landmark}
          color="blue"
        />
        <StatCard
          title="Pending Settlements"
          value={payments.filter((p) => p.status === 'pending').length}
          subtitle="Awaiting bank confirmation"
          icon={AlertCircle}
          color="amber"
        />
      </div>

      {/* Payments Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading ledger...</div>
          ) : payments.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No payment records logged"
              description="Record buyer advance payments, LC remittances, or balance settlements received in your export bank account."
              actionLabel="Record Payment"
              onAction={() => setIsAddModalOpen(true)}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[#64748B] font-semibold">
                    <th className="py-3 px-4">Transaction Ref</th>
                    <th className="py-3 px-4">Buyer Company</th>
                    <th className="py-3 px-4">Invoice Reference</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => {
                    const statusObj =
                      PAYMENT_STATUSES.find((s) => s.id === p.status) || PAYMENT_STATUSES[0];

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-mono font-bold text-[#172033]">
                          {p.transactionReference}
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#172033]">{p.buyerCompany}</td>
                        <td className="py-3 px-4 text-slate-500">{p.invoiceReference || 'Direct Advance'}</td>
                        <td className="py-3 px-4 uppercase text-[11px] font-semibold text-slate-700">
                          {p.paymentMethod.replace(/_/g, ' ')}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{formatDate(p.paymentDate)}</td>
                        <td className="py-3 px-4 font-bold text-emerald-700">
                          {formatCurrency(p.amount, p.currency)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusObj.color}`}>
                            {statusObj.label}
                          </span>
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

      {/* Record Payment Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Record Inward Export Payment"
        description="Log buyer remittance received via Bank Wire, TT, or Letter of Credit"
        maxWidth="lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Buyer Company Name"
              required
              placeholder="e.g. EuroTrade GmbH"
              value={form.buyerCompany}
              onChange={(e) => setForm({ ...form, buyerCompany: e.target.value })}
            />
            <Input
              label="Related Invoice / PI Reference"
              placeholder="e.g. CI-2026-0012"
              value={form.invoiceReference}
              onChange={(e) => setForm({ ...form, invoiceReference: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Amount Received"
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
            <Input
              label="Payment Date"
              type="date"
              required
              value={form.paymentDate}
              onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Payment Method"
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as any })}
              options={[
                { value: 'wire_transfer', label: 'Telegraphic Transfer (TT / Wire)' },
                { value: 'lc', label: 'Letter of Credit (LC)' },
                { value: 'advance', label: 'Advance Payment' },
                { value: 'card', label: 'Credit Card / Online' },
                { value: 'cheque', label: 'Bank Cheque / DD' },
              ]}
            />
            <Input
              label="Bank Transaction / UTR Number"
              required
              placeholder="e.g. UTR123456789012"
              value={form.transactionReference}
              onChange={(e) => setForm({ ...form, transactionReference: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" size="sm" isLoading={isSubmitting}>
              Save Payment Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
