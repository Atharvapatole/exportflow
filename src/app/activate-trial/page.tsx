import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentContext } from '@/lib/auth';
import { subscriptionRepo } from '@/lib/db';
import { ActivateTrialClient } from './ActivateTrialClient';

export const dynamic = 'force-dynamic';

export default async function ActivateTrialPage() {
  const ctx = await getCurrentContext();

  if (!ctx || !ctx.user) {
    redirect('/login');
  }

  // Super Admins don't need trial activation
  if (ctx.isSuperAdmin) {
    redirect('/dashboard');
  }

  // Check current access
  if (ctx.organization?.id) {
    const access = await subscriptionRepo.checkDashboardAccess(ctx.organization.id);
    if (access.allowed) {
      redirect('/dashboard');
    }
    if (access.reason === 'trial_expired') {
      redirect('/trial-expired');
    }
  }

  return (
    <ActivateTrialClient
      userName={ctx.user.name}
      userEmail={ctx.user.email}
      organizationName={ctx.organization?.name || 'Your Company'}
    />
  );
}
