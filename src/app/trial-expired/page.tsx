import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentContext } from '@/lib/auth';
import { subscriptionRepo } from '@/lib/db';
import { TrialExpiredClient } from './TrialExpiredClient';

export const dynamic = 'force-dynamic';

export default async function TrialExpiredPage() {
  const ctx = await getCurrentContext();

  if (!ctx || !ctx.user) {
    redirect('/login');
  }

  // Super Admins don't get paywalled
  if (ctx.isSuperAdmin) {
    redirect('/dashboard');
  }

  // Check current access
  if (ctx.organization?.id) {
    const access = await subscriptionRepo.checkDashboardAccess(ctx.organization.id);
    if (access.allowed) {
      redirect('/dashboard');
    }
    if (access.reason === 'trial_not_activated') {
      redirect('/activate-trial');
    }
  }

  return (
    <TrialExpiredClient
      userName={ctx.user.name}
      userEmail={ctx.user.email}
      organizationName={ctx.organization?.name || 'Your Company'}
    />
  );
}
