'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  DollarSign,
  Activity,
  LifeBuoy,
  Megaphone,
  Server,
  Cpu,
  ShieldAlert,
  Settings,
  ArrowLeft,
  Sparkles,
  CreditCard,
  Mail,
  Ship,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ADMIN_NAVIGATION } from '@/config/constants';

const ADMIN_ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  DollarSign,
  Activity,
  LifeBuoy,
  Megaphone,
  Server,
  Cpu,
  ShieldAlert,
  Settings,
  Sparkles,
  CreditCard,
  Mail,
  Ship,
};

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#08121E] text-slate-300 flex flex-col shrink-0 h-screen sticky top-0 border-r border-slate-800 z-30 select-none no-print">
      {/* Admin Branding */}
      <div className="p-4 border-b border-slate-800 bg-[#040A12] flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-sm">
            B
          </div>
          <div>
            <div className="text-xs font-black text-white tracking-wider flex items-center gap-1.5">
              <span>BENZWELL</span>
              <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded">
                ADMIN
              </span>
            </div>
            <div className="text-[10px] text-slate-400">ExportFlow Control Center</div>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {ADMIN_NAVIGATION.map((item) => {
          const Icon = ADMIN_ICON_MAP[item.icon] || LayoutDashboard;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all',
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              )}
            >
              <Icon className={cn('w-4 h-4', isActive ? 'text-slate-950' : 'text-slate-400')} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Back to Customer Panel */}
      <div className="p-3 border-t border-slate-800 bg-[#040A12]/80">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-white text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400" />
          <span>Exit to Customer Panel</span>
        </Link>
      </div>
    </aside>
  );
}
