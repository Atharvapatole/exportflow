import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentContext } from '@/lib/auth';
import { subscriptionRepo } from '@/lib/db';
import { ChaSidebar } from '@/components/layout/ChaSidebar';
import { ChaHeader } from '@/components/layout/ChaHeader';

export const dynamic = 'force-dynamic';

export default async function ChaDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getCurrentContext();

  if (!ctx) {
    redirect('/cha/login');
  }

  const isCha =
    ctx.organization?.orgType === 'cha' ||
    ctx.organization?.businessType?.toLowerCase().includes('customs') ||
    ctx.organization?.businessType?.toLowerCase().includes('cha') ||
    ctx.organization?.name?.toLowerCase().includes('custom');

  // If a standard exporter account lands here, redirect them to exporter dashboard
  if (!isCha && !ctx.isSuperAdmin) {
    redirect('/dashboard');
  }

  // Strict Trial & Subscription Paywall Gate for CHA Brokers
  if (!ctx.isSuperAdmin && ctx.organization?.id) {
    const access = await subscriptionRepo.checkDashboardAccess(ctx.organization.id);
    if (!access.allowed) {
      if (access.reason === 'trial_not_activated') {
        redirect('/cha/activate-trial');
      } else if (access.reason === 'trial_expired') {
        redirect('/cha/trial-expired');
      }
    }
  }

  const firmName = ctx.organization?.name || 'Customs Brokerage Firm';
  const licenseNumber = ctx.organization?.chaLicenseNumber || 'Unregistered';
  const isVerified = ctx.organization?.chaLicenseStatus === 'verified';

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <ChaSidebar
        firmName={firmName}
        licenseNumber={licenseNumber}
        isVerified={isVerified}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <ChaHeader
          userName={ctx.user.name}
          userEmail={ctx.user.email}
          firmName={firmName}
        />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
