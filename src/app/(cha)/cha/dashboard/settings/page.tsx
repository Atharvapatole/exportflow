import React from 'react';
import { getCurrentContext } from '@/lib/auth';
import { ChaSettingsForm } from './ChaSettingsForm';

export const dynamic = 'force-dynamic';

export default async function ChaSettingsPage() {
  const ctx = await getCurrentContext();
  const org = ctx?.organization;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Brokerage & White-label Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure your Customs Broker license credentials, custom firm branding, and white-label client portal
        </p>
      </div>

      <ChaSettingsForm
        initialOrg={{
          id: org?.id || '',
          name: org?.name || '',
          chaLicenseNumber: org?.chaLicenseNumber || '',
          chaLicenseAuthority: org?.chaLicenseAuthority || '',
          chaLicenseStatus: org?.chaLicenseStatus || 'unverified',
          address: org?.address || '',
          phone: org?.phone || '',
          email: org?.email || ctx?.user.email || '',
        }}
      />
    </div>
  );
}
