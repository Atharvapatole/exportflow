import React from 'react';
import Link from 'next/link';
import { getCurrentContext } from '@/lib/auth';
import {
  documentRepo,
  buyerRepo,
  productRepo,
  shipmentRepo,
  paymentRepo,
  announcementRepo,
} from '@/lib/db';
import {
  FileText,
  Users,
  Package,
  Ship,
  CreditCard,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle,
  FileCheck,
  Calculator,
  Megaphone,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TrialBanner } from '@/components/dashboard/TrialBanner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';

export default async function DashboardPage() {
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.organization) return null;

  const orgId = ctx.organization.id;

  // Real database queries
  const [docs, buyers, products, shipments, payments, announcements] = await Promise.all([
    documentRepo.listByOrg(orgId),
    buyerRepo.listByOrg(orgId),
    productRepo.listByOrg(orgId),
    shipmentRepo.listByOrg(orgId),
    paymentRepo.listByOrg(orgId),
    announcementRepo.listActive(),
  ]);

  const quotations = docs.filter((d) => d.type === 'quotation');
  const proformaInvoices = docs.filter((d) => d.type === 'proforma_invoice');
  const commercialInvoices = docs.filter((d) => d.type === 'commercial_invoice');
  const packingLists = docs.filter((d) => d.type === 'packing_list');

  const pendingQuotations = quotations.filter((d) => d.status === 'sent' || d.status === 'draft');
  const acceptedQuotations = quotations.filter((d) => d.status === 'accepted');

  const totalRecordedSales = commercialInvoices.reduce((acc, curr) => acc + (curr.grandTotal || 0), 0);
  const totalReceivedPayments = payments
    .filter((p) => p.status === 'paid')
    .reduce((acc, p) => acc + (p.amount || 0), 0);
  const outstandingPayments = Math.max(0, totalRecordedSales - totalReceivedPayments);

  const activeShipments = shipments.filter(
    (s) => s.status !== 'delivered' && s.status !== 'cancelled'
  );

  const defaultCurrency = docs[0]?.currency || 'USD';
  const hasAnyData = docs.length > 0 || buyers.length > 0 || products.length > 0;

  return (
    <div className="space-y-6">
      {/* Announcements Banner if any */}
      {announcements.length > 0 && (
        <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Megaphone className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-bold">{announcements[0].title}:</span>
            <span className="text-blue-800">{announcements[0].content}</span>
          </div>
          <span className="text-[10px] text-blue-600 bg-blue-100 px-2 py-0.5 rounded font-semibold uppercase">
            Platform Notice
          </span>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#10243A] to-[#1E3A8A] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
            Export Business Management
          </span>
          <h1 className="text-2xl font-black tracking-tight mt-0.5">
            Welcome, {ctx.user.name}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            {ctx.organization.name} • {ctx.organization.country} • ExportFlow Workspace
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/dashboard/quotations/new">
            <Button size="sm" variant="secondary" className="gap-1.5 shadow-sm">
              <Plus className="w-4 h-4" />
              <span>Create Quotation</span>
            </Button>
          </Link>
          <Link href="/dashboard/proforma-invoices/new">
            <Button size="sm" variant="outline" className="border-slate-500 text-white bg-slate-800/60 hover:bg-slate-700">
              <FileCheck className="w-4 h-4 mr-1 text-emerald-400" />
              <span>New PI</span>
            </Button>
          </Link>
          <Link href="/dashboard/calculators">
            <Button size="sm" variant="outline" className="border-slate-500 text-white bg-slate-800/60 hover:bg-slate-700">
              <Calculator className="w-4 h-4 mr-1 text-amber-400" />
              <span>Calculators</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 3-Day Free Trial / Plan Banner */}
      <TrialBanner />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Quotations"
          value={quotations.length}
          subtitle={`${pendingQuotations.length} pending, ${acceptedQuotations.length} accepted`}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Commercial Invoices"
          value={commercialInvoices.length}
          subtitle={`${proformaInvoices.length} Proforma Invoices`}
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Recorded Export Sales"
          value={formatCurrency(totalRecordedSales, defaultCurrency)}
          subtitle={`Paid: ${formatCurrency(totalReceivedPayments, defaultCurrency)}`}
          icon={CreditCard}
          color="purple"
        />
        <StatCard
          title="Active Shipments"
          value={activeShipments.length}
          subtitle={`${shipments.length} total shipments tracked`}
          icon={Ship}
          color="amber"
        />
      </div>

      {/* Secondary Quick Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E5EAF1] shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">Registered Buyers</span>
          <div className="text-xl font-bold text-[#172033] mt-1">{buyers.length}</div>
          <Link href="/dashboard/buyers" className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 mt-1 font-medium">
            Manage Buyers <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E5EAF1] shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">Catalog Products</span>
          <div className="text-xl font-bold text-[#172033] mt-1">{products.length}</div>
          <Link href="/dashboard/products" className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 mt-1 font-medium">
            Manage Products <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E5EAF1] shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">Packing Lists</span>
          <div className="text-xl font-bold text-[#172033] mt-1">{packingLists.length}</div>
          <Link href="/dashboard/packing-lists" className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 mt-1 font-medium">
            View Packing Lists <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E5EAF1] shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">Est. Outstanding</span>
          <div className="text-xl font-bold text-amber-600 mt-1">{formatCurrency(outstandingPayments, defaultCurrency)}</div>
          <Link href="/dashboard/payments" className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 mt-1 font-medium">
            Track Payments <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Analytics Charts & Real Activity */}
      <DashboardCharts
        quotations={quotations}
        commercialInvoices={commercialInvoices}
        currency={defaultCurrency}
      />

      {/* Two Column Layout: Recent Documents & Recent Shipments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Documents Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Recent Export Documents</CardTitle>
              <p className="text-xs text-slate-500">Latest quotations, PIs, and invoices</p>
            </div>
            <Link href="/dashboard/documents">
              <Button size="sm" variant="ghost" className="text-xs">
                View All
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {docs.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No documents generated yet"
                description="Create your first international quotation or invoice in seconds with automated Incoterms and tax calculations."
                actionLabel="Create Quotation"
                actionHref="/dashboard/quotations/new"
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {docs.slice(0, 5).map((doc) => (
                  <div key={doc.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                        {doc.type === 'quotation' ? 'QT' : doc.type === 'proforma_invoice' ? 'PI' : 'CI'}
                      </div>
                      <div>
                        <Link
                          href={`/dashboard/${doc.type === 'quotation' ? 'quotations' : doc.type === 'proforma_invoice' ? 'proforma-invoices' : 'commercial-invoices'}/${doc.id}`}
                          className="text-xs font-bold text-[#172033] hover:text-blue-600 transition-colors block"
                        >
                          {doc.documentNumber}
                        </Link>
                        <span className="text-[11px] text-slate-500">
                          {doc.buyerCompany || 'Unknown Buyer'} • {formatDate(doc.date)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#172033] block">
                        {formatCurrency(doc.grandTotal, doc.currency)}
                      </span>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {doc.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Shipments Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Shipment Tracking Overview</CardTitle>
              <p className="text-xs text-slate-500">Ocean container and air freight statuses</p>
            </div>
            <Link href="/dashboard/shipments">
              <Button size="sm" variant="ghost" className="text-xs">
                View Tracker
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {shipments.length === 0 ? (
              <EmptyState
                icon={Ship}
                title="No active shipments"
                description="Keep track of ocean container bookings, ports of loading, vessels, ETDs, and custom release statuses."
                actionLabel="Create Shipment"
                actionHref="/dashboard/shipments"
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {shipments.slice(0, 5).map((shp) => (
                  <div key={shp.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                        <Ship className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#172033] block">
                          {shp.shipmentReference}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {shp.originPort} → {shp.destinationPort}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-700 block uppercase">
                        {shp.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ETA: {formatDate(shp.eta)}
                      </span>
                    </div>
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
