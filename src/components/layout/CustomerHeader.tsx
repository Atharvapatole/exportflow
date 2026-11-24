'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Plus,
  LogOut,
  Settings,
  User as UserIcon,
  ChevronDown,
  FileText,
  Users,
  Package,
  Calculator,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

interface CustomerHeaderProps {
  userName?: string;
  userEmail?: string;
  companyName?: string;
}

export function CustomerHeader({
  userName = 'Exporter',
  userEmail = 'user@example.com',
  companyName = 'My Export Business',
}: CustomerHeaderProps) {
  const router = useRouter();
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-[#131B2A] border-b border-[#E5EAF1] dark:border-[#243047] px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs no-print transition-colors">
      {/* Left: Organization Title & Date */}
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-sm font-bold text-[#172033] dark:text-white tracking-tight">{companyName}</h2>
          <p className="text-[11px] text-[#64748B] dark:text-slate-400">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        {/* Quick Actions Dropdown */}
        <div className="relative">
          <Button
            size="sm"
            variant="secondary"
            className="gap-1.5 shadow-xs"
            onClick={() => setShowQuickMenu(!showQuickMenu)}
          >
            <Plus className="w-4 h-4" />
            <span>Create</span>
            <ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-70" />
          </Button>

          {showQuickMenu && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setShowQuickMenu(false)}
            >
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Quick Actions
              </div>
              <Link
                href="/dashboard/quotations/new"
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#172033] hover:bg-slate-50 transition-colors"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span>New Quotation</span>
              </Link>
              <Link
                href="/dashboard/proforma-invoices/new"
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#172033] hover:bg-slate-50 transition-colors"
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>New Proforma Invoice</span>
              </Link>
              <Link
                href="/dashboard/buyers"
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#172033] hover:bg-slate-50 transition-colors"
              >
                <Users className="w-4 h-4 text-purple-600" />
                <span>Add Buyer</span>
              </Link>
              <Link
                href="/dashboard/products"
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#172033] hover:bg-slate-50 transition-colors"
              >
                <Package className="w-4 h-4 text-amber-600" />
                <span>Add Product</span>
              </Link>
              <div className="border-t border-slate-100 my-1" />
              <Link
                href="/dashboard/calculators"
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#172033] hover:bg-slate-50 transition-colors"
              >
                <Calculator className="w-4 h-4 text-indigo-600" />
                <span>Export Pricing Calculator</span>
              </Link>
            </div>
          )}
        </div>

        {/* Notifications Icon */}
        <Link
          href="/dashboard/notifications"
          className="relative p-2 rounded-lg text-slate-500 hover:text-[#172033] hover:bg-slate-100 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
        </Link>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#10243A] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <span className="text-xs font-bold text-[#172033] block leading-tight">{userName}</span>
              <span className="text-[10px] text-slate-500 block leading-tight">{userEmail}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div
              className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setShowUserMenu(false)}
            >
              <div className="px-3 py-2 border-b border-slate-100">
                <span className="text-xs font-bold text-[#172033] block">{userName}</span>
                <span className="text-[11px] text-slate-400 block truncate">{userEmail}</span>
              </div>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#172033] hover:bg-slate-50 transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-500" />
                <span>Company Settings</span>
              </Link>
              <Link
                href="/dashboard/team"
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#172033] hover:bg-slate-50 transition-colors"
              >
                <UserIcon className="w-4 h-4 text-slate-500" />
                <span>Team & Access</span>
              </Link>
              <div className="border-t border-slate-100 my-1" />
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>{isLoggingOut ? 'Logging out...' : 'Sign Out'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
