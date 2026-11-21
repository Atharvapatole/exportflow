import React from 'react';
import Link from 'next/link';
import { getCurrentContext } from '@/lib/auth';
import { adminRepo, userRepo, orgRepo, documentRepo } from '@/lib/db';
import {
  Users,
  Building2,
  FileText,
  DollarSign,
  Activity,
  Server,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Ship,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function SuperAdminDashboardPage() {
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.isSuperAdmin) return null;

  const [stats, users, companies, activities] = await Promise.all([
    adminRepo.getPlatformStats(),
    userRepo.listAll(),
    orgRepo.listAll(),
    adminRepo.getActivity(10),
  ]);

  return (
    <div className="space-y-6">
      {/* Admin Top Banner */}
      <div className="bg-[#0B1524] p-6 rounded-2xl border border-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded tracking-wider uppercase">
              Super Admin Control Center
            </span>
            <span className="text-xs text-slate-400">BENZWELL Root System</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-1">ExportFlow Platform Overview</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-tenant monitoring, platform-wide documents, and legitimate revenue records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/revenue">
            <button className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-xs">
              + Log Platform Revenue
            </button>
          </Link>
          <Link href="/admin/system">
            <button className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all">
              System Health
            </button>
          </Link>
        </div>
      </div>

      {/* Primary Platform KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0B1524] p-5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Registered Users</span>
          <div className="text-3xl font-black text-white mt-1">{stats.totalUsers}</div>
          <span className="text-xs text-slate-500 mt-1 block">Across all export companies</span>
        </div>

        <div className="bg-[#0B1524] p-5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Organizations</span>
          <div className="text-3xl font-black text-amber-400 mt-1">{stats.totalCompanies}</div>
          <span className="text-xs text-slate-500 mt-1 block">Active tenant databases</span>
        </div>

        <div className="bg-[#0B1524] p-5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Documents Issued</span>
          <div className="text-3xl font-black text-blue-400 mt-1">{stats.totalDocuments}</div>
          <span className="text-xs text-slate-500 mt-1 block">
            {stats.totalQuotations} quotes • {stats.totalPIs} PIs • {stats.totalCIs} CIs
          </span>
        </div>

        <div className="bg-[#0B1524] p-5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">BENZWELL Platform Revenue</span>
          <div className="text-3xl font-black text-emerald-400 mt-1">
            {formatCurrency(stats.benzwellRevenue, 'USD')}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Consulting & setup services</span>
        </div>
      </div>

      {/* Separation of Concerns Banner: Platform Revenue vs Customer Business Activity */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="font-bold text-white block mb-0.5">Customer Export Activity Summary:</span>
          <p className="text-slate-400">
            Platform customers have recorded <strong>{formatCurrency(stats.customerRecordedSales, 'USD')}</strong> in export sales and <strong>{formatCurrency(stats.customerPayments, 'USD')}</strong> in bank remittances.
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold shrink-0">
          Separated from BENZWELL Revenue
        </div>
      </div>

      {/* Two Column Grid: Recent Registrations & Live Platform Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Companies / Users */}
        <div className="bg-[#0B1524] p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Recent Companies Registered</h3>
            <Link href="/admin/companies" className="text-xs text-amber-400 hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y divide-slate-800/80">
            {companies.slice(0, 5).map((comp) => (
              <div key={comp.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">{comp.name}</span>
                  <span className="text-[11px] text-slate-400">{comp.country} • {comp.businessType}</span>
                </div>
                <span className="text-[10px] text-slate-500">{formatDate(comp.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Platform Activity */}
        <div className="bg-[#0B1524] p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Live Platform Activity Log</h3>
            <Link href="/admin/activity" className="text-xs text-amber-400 hover:underline">
              Full Activity
            </Link>
          </div>
          <div className="divide-y divide-slate-800/80">
            {activities.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-500">No events logged yet</div>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="py-2.5 text-xs flex items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-amber-300 text-[10px] uppercase block">
                      {act.action}
                    </span>
                    <span className="text-slate-300 text-[11px]">{act.details}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0">{formatDate(act.createdAt)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
