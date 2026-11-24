import React from 'react';
import Link from 'next/link';
import { requireSuperAdmin } from '@/lib/auth';
import { infraConfig } from '@/config/infrastructure';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { SuperAdminLoginForm } from '@/components/admin/SuperAdminLoginForm';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. LOCAL DEVELOPMENT DIRECT ADMIN BYPASS
  // When running locally in development with ADMIN_DEV_BYPASS=true,
  // directly open the Super Admin Dashboard without any authorization screen.
  if (infraConfig.isDevAdminBypassEnabled()) {
    return (
      <div className="flex min-h-screen bg-[#070E18] text-slate-100">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader adminEmail="admin@benzwell.in (Local Dev Bypass)" />
          <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
        </div>
      </div>
    );
  }

  // 2. PRODUCTION / NORMAL SECURE AUTHORIZATION FLOW
  const authRes = await requireSuperAdmin();

  // If visitor is unauthenticated, show Super Admin Login form
  if (!authRes.authorized && authRes.statusCode === 401) {
    return (
      <div className="min-h-screen bg-[#040A12] flex flex-col justify-center items-center p-4">
        <SuperAdminLoginForm />
      </div>
    );
  }

  // If authenticated customer without Super Admin role: minimal access denied response
  if (!authRes.authorized) {
    return (
      <div className="min-h-screen bg-[#040A12] flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-sm bg-[#0B1524] border border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-base font-semibold text-white">Access Denied</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            You do not have permission to access the management console.
          </p>
          <div className="pt-2">
            <Link href="/dashboard" className="w-full">
              <Button variant="secondary" className="w-full text-xs">
                Back to Workspace
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated & Authorized Super Admin -> Render Super Admin Dashboard
  return (
    <div className="flex min-h-screen bg-[#070E18] text-slate-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader adminEmail={authRes.user?.email || 'admin@benzwell.in'} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
