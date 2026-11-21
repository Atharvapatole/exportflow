import React from 'react';
import { getCurrentContext } from '@/lib/auth';
import { readDb } from '@/lib/db/store';
import { FileText, TrendingUp, Ship, Package } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

export default async function AdminDocumentsPage() {
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.isSuperAdmin) return null;

  const db = readDb();
  const docs = db.documents;

  const quotes = docs.filter((d) => d.type === 'quotation');
  const pis = docs.filter((d) => d.type === 'proforma_invoice');
  const cis = docs.filter((d) => d.type === 'commercial_invoice');
  const pls = docs.filter((d) => d.type === 'packing_list');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Platform Document Analytics</h1>
        <p className="text-xs text-slate-400">Audited volume of international trade documents across all tenant companies</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#0B1524] p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Quotations</span>
          <div className="text-2xl font-black text-blue-400 mt-1">{quotes.length}</div>
        </div>
        <div className="bg-[#0B1524] p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Proforma Invoices</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">{pis.length}</div>
        </div>
        <div className="bg-[#0B1524] p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Commercial Invoices</span>
          <div className="text-2xl font-black text-purple-400 mt-1">{cis.length}</div>
        </div>
        <div className="bg-[#0B1524] p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Packing Lists</span>
          <div className="text-2xl font-black text-amber-400 mt-1">{pls.length}</div>
        </div>
      </div>

      <div className="bg-[#0B1524] rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#070E18] text-slate-400 font-semibold">
                <th className="py-3 px-4">Doc No.</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Buyer Company</th>
                <th className="py-3 px-4">Incoterm</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Issued Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {docs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No documents generated on platform yet
                  </td>
                </tr>
              ) : (
                docs.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-white">{d.documentNumber}</td>
                    <td className="py-3 px-4 uppercase text-[10px] text-slate-400">{d.type.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-4 text-slate-300">{d.buyerCompany}</td>
                    <td className="py-3 px-4 font-bold text-blue-400">{d.incoterm}</td>
                    <td className="py-3 px-4 font-bold text-emerald-400">{formatCurrency(d.grandTotal, d.currency)}</td>
                    <td className="py-3 px-4 text-slate-400">{formatDate(d.date)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
