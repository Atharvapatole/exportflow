import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentContext } from '@/lib/auth';
import { subscriptionRepo } from '@/lib/db';
import { ChaActivateTrialClient } from './ChaActivateTrialClient';

export const dynamic = 'force-dynamic';

export default async function ChaActivateTrialPage() {
  const ctx = await getCurrentContext();

  if (!ctx || !ctx.user) {
    redirect('/cha/login');
  }

  // Super Admins don't need trial activation
  if (ctx.isSuperAdmin) {
    redirect('/cha/dashboard');
  }

  // Check current access
  if (ctx.organization?.id) {
    const access = await subscriptionRepo.checkDashboardAccess(ctx.organization.id);
    if (access.allowed) {
      redirect('/cha/dashboard');
    }
    if (access.reason === 'trial_expired') {
      redirect('/cha/trial-expired');
    }
  }

  return (
    <ChaActivateTrialClient
      userName={ctx.user.name}
      userEmail={ctx.user.email}
      organizationName={ctx.organization?.name || 'Customs Brokerage Firm'}
      licenseNumber={ctx.organization?.chaLicenseNumber || 'Unregistered'}
    />
  );
}
