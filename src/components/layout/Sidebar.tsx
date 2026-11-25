'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  Calculator,
  FileCheck,
  Ship,
  CreditCard,
  Sparkles,
  BarChart3,
  UserCheck,
  Settings,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { cn } from '@/lib/utils';
import { CUSTOMER_NAVIGATION } from '@/config/constants';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  Calculator,
  FileCheck,
  Ship,
  CreditCard,
  Sparkles,
  BarChart3,
  UserCheck,
  Settings,
};

interface SidebarProps {
  companyName?: string;
  isSuperAdmin?: boolean;
}

export function Sidebar({ companyName = 'Your Company', isSuperAdmin = false }: SidebarProps) {
  const pathname = usePathname();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    'Document Studio': true,
    'Catalog & Inventory': false,
  });

  const toggleSubmenu = (name: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <aside className="w-64 bg-[#10243A] text-slate-300 flex flex-col shrink-0 h-screen sticky top-0 border-r border-[#1E3A8A]/30 z-30 select-none no-print">
      {/* Top Brand Header */}
      <div className="p-4 border-b border-slate-700/60 bg-[#0A1726]/80 flex flex-col gap-2">
        <BrandLogo theme="dark" showTagline={false} size="sm" />
        <div className="mt-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-center justify-between">
          <div className="truncate">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Active Company</span>
            <span className="text-xs font-bold text-white truncate block">{companyName}</span>
          </div>
          <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" title="Active Organization" />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {CUSTOMER_NAVIGATION.map((item) => {
          const Icon = ICON_MAP[item.icon] || FileText;
          const hasChildren = Boolean(item.children && item.children.length > 0);
          const isActive = pathname === item.href || (hasChildren && pathname.startsWith(item.href));
          const isOpen = openSubmenus[item.name];

          if (hasChildren) {
            return (
              <div key={item.name} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleSubmenu(item.name)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all',
                    isActive
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn('w-4 h-4', isActive ? 'text-blue-400' : 'text-slate-400')} />
                    <span>{item.name}</span>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {isOpen && item.children && (
                  <div className="pl-6 pr-1 py-1 space-y-1 border-l-2 border-slate-700/60 ml-4">
                    {item.children.map((sub) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={cn(
                            'block px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                            isSubActive
                              ? 'bg-blue-600 text-white font-semibold shadow-xs'
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
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all',
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              )}
            >
              <Icon className={cn('w-4 h-4', isActive ? 'text-white' : 'text-slate-400')} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Footer Actions */}
      <div className="p-3 border-t border-slate-700/60 bg-[#0A1726]/60">
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-2">
          <span>BENZWELL ExportFlow</span>
          <span className="text-blue-400 font-semibold">v2.4 Pro</span>
        </div>
      </div>
    </aside>
  );
}
