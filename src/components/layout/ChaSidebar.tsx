'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Ship,
  FileText,
  CheckSquare,
  UploadCloud,
  HelpCircle,
  CreditCard,
  Mail,
  Users,
  BarChart3,
  History,
  PenTool,
  Settings,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Anchor,
  Sparkles,
  Code2,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { cn } from '@/lib/utils';

export interface ChaSidebarProps {
  firmName?: string;
  licenseNumber?: string;
  isVerified?: boolean;
}

const CHA_NAVIGATION = [
  { name: 'Overview', href: '/cha/dashboard', icon: LayoutDashboard },
  { name: 'Customer Management', href: '/cha/dashboard/customers', icon: Building2 },
  {
    name: 'Customs Jobs',
    icon: Ship,
    href: '/cha/dashboard/jobs',
    children: [
      { name: 'All Jobs', href: '/cha/dashboard/jobs' },
      { name: 'Import Clearance', href: '/cha/dashboard/jobs?type=import' },
      { name: 'Export Clearance', href: '/cha/dashboard/jobs?type=export' },
    ],
  },
  {
    name: 'Document Studio',
    icon: FileText,
    href: '/cha/dashboard/documents',
    children: [
      { name: 'All Documents', href: '/cha/dashboard/documents' },
      { name: '+ Create Document', href: '/cha/dashboard/documents/create' },
      { name: 'BoE / SB Worksheets', href: '/cha/dashboard/documents/worksheets' },
      { name: 'AI Document Checker', href: '/cha/dashboard/documents/ai-checker' },
    ],
  },
  { name: 'Customs Checklists', href: '/cha/dashboard/checklists', icon: CheckSquare },
  { name: 'e-SANCHIT Register', href: '/cha/dashboard/esanchit', icon: UploadCloud },
  { name: 'Customs Queries', href: '/cha/dashboard/queries', icon: HelpCircle },
  { name: 'AI Customs Assistant', href: '/cha/dashboard/ai-assistant', icon: Sparkles },
  { name: 'Financials & Invoicing', href: '/cha/dashboard/finances', icon: CreditCard },
  { name: 'Email Workflows', href: '/cha/dashboard/emails', icon: Mail },
  { name: 'Developer API', href: '/cha/dashboard/api', icon: Code2 },
  { name: 'Team & RBAC', href: '/cha/dashboard/team', icon: Users },
  { name: 'Signatures & Stamps', href: '/cha/dashboard/signatures', icon: PenTool },
  { name: 'Audit Logs', href: '/cha/dashboard/audit', icon: History },
  { name: 'Settings & White-label', href: '/cha/dashboard/settings', icon: Settings },
  { name: 'Billing & Plan', href: '/cha/dashboard/billing', icon: CreditCard },
];

export function ChaSidebar({
  firmName = 'Customs Broker Firm',
  licenseNumber = 'Unregistered',
  isVerified = false,
}: ChaSidebarProps) {
  const pathname = usePathname();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    'Customs Jobs': true,
    'Document Center': false,
  });

  const toggleSubmenu = (name: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 h-screen sticky top-0 border-r border-slate-800 z-30 select-none no-print">
      {/* Broker Profile Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <BrandLogo theme="dark" showTagline={false} size="sm" />
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            CHA
          </span>
        </div>

        <div className="mt-1 px-3 py-2 rounded-xl bg-slate-850 border border-slate-800 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Brokerage</span>
            {isVerified ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                <ShieldCheck className="w-3 h-3" /> Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                Unverified
              </span>
            )}
          </div>
          <span className="text-xs font-bold text-white truncate block">{firmName}</span>
          <span className="text-[11px] text-slate-400 font-mono">Lic: {licenseNumber || 'Pending'}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {CHA_NAVIGATION.map((item) => {
          const Icon = item.icon;
          const hasChildren = Boolean(item.children && item.children.length > 0);
          const isActive = pathname === item.href || (hasChildren && pathname.startsWith(item.href));
          const isOpen = openSubmenus[item.name];

          if (hasChildren) {
            return (
              <div key={item.name} className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => toggleSubmenu(item.name)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left',
                    isActive
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </button>

                {isOpen && item.children && (
                  <div className="pl-6 space-y-0.5 mt-0.5 border-l border-slate-800 ml-4">
                    {item.children.map((sub) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className={cn(
                            'block px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors',
                            isSubActive
                              ? 'bg-amber-500/20 text-amber-300 font-bold'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                          )}
                        >
                          {sub.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                isActive
                  ? 'bg-amber-500/15 text-amber-400 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Switch to Exporter Portal / Help */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <Link
          href="/dashboard"
          className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-[11px] text-slate-300 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Anchor className="w-3.5 h-3.5 text-blue-400" />
            <span>Exporter Mode</span>
          </span>
          <ChevronRight className="w-3 h-3 text-slate-500" />
        </Link>
      </div>
    </aside>
  );
}
