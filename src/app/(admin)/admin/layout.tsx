import React from 'react';
import Link from 'next/link';
import { getAdminContext } from '@/lib/auth';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getAdminContext();

  // If not authorized (only applicable in production when an unauthorized user navigates directly to /admin)
  if (!ctx || !ctx.isSuperAdmin) {
    return (
      <div className="min-h-screen bg-[#040A12] flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-[#0B1524] border border-rose-600/40 rounded-2xl p-8 text-center space-y-4 shadow-2xl shadow-black/80">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-white">403 — Super Admin Access Required</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            This area is strictly restricted to platform super administrators. Normal customer accounts cannot access the management console.
          </p>
          <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-800">
            <Link href="/dashboard" className="w-full">
              <Button variant="secondary" className="w-full text-xs">
                Return to Customer Workspace
              </Button>
            </Link>
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full text-xs border-slate-700 text-slate-300 hover:bg-slate-800">
                Sign In to Customer Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Super Admin: Render full administrative dashboard immediately
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
