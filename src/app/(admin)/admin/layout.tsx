import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentContext } from '@/lib/auth';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getCurrentContext();

  // Strict server-side authorization check: Super Admin only
  if (!ctx || !ctx.isSuperAdmin) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen bg-[#070E18] text-slate-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader adminEmail={ctx.user.email} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
