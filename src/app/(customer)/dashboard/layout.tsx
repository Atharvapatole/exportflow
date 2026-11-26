import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentContext } from '@/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';
import { CustomerHeader } from '@/components/layout/CustomerHeader';

export const dynamic = 'force-dynamic';

export default async function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getCurrentContext();

  if (!ctx) {
    redirect('/login');
  }

  // Redirect CHA accounts to dedicated CHA dashboard
  if (ctx.organization?.orgType === 'cha' && !ctx.isSuperAdmin) {
    redirect('/cha/dashboard');
  }

  const companyName = ctx.organization?.name || 'My Export Company';

  return (
    <div className="flex min-h-screen bg-[#F7F9FC]">
      <Sidebar companyName={companyName} isSuperAdmin={ctx.isSuperAdmin} />
      <div className="flex-1 flex flex-col min-w-0">
        <CustomerHeader
          userName={ctx.user.name}
          userEmail={ctx.user.email}
          companyName={companyName}
        />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
