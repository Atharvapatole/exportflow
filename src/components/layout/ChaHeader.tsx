'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Search,
  User,
  LogOut,
  Plus,
  Ship,
  Building2,
  FileText,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

interface ChaHeaderProps {
  userName?: string;
  userEmail?: string;
  firmName?: string;
}

export function ChaHeader({
  userName = 'Customs Broker',
  userEmail = '',
  firmName = 'Customs Brokerage Firm',
}: ChaHeaderProps) {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/cha/login';
    } catch {
      window.location.href = '/cha/login';
    }
  };

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20 select-none">
      {/* Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search jobs, BoE/SB no, IEC, client name..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Actions */}
        <Link href="/cha/dashboard/jobs/new">
          <Button
            size="sm"
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border-0 text-xs px-3 py-1.5 h-8 flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Customs Job</span>
          </Button>
        </Link>

        <Link href="/cha/dashboard/clients/new">
          <Button
            size="sm"
            variant="outline"
            className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs px-3 py-1.5 h-8 flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Add Client</span>
          </Button>
        </Link>

        <Link href="/dashboard">
          <Button
            size="sm"
            variant="outline"
            className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs px-2.5 py-1.5 h-8 flex items-center gap-1.5"
            title="Switch to Exporter Workspace"
          >
            <span>🚢 Exporter Workspace</span>
          </Button>
        </Link>

        <ThemeToggle className="text-slate-400 hover:text-white hover:bg-slate-800" />

        {/* Notifications */}
        <button
          type="button"
          className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Customs Alerts & Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500" />
        </button>

        {/* Profile Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden md:block">
              <span className="text-xs font-semibold text-white block truncate max-w-[120px]">
                {userName}
              </span>
              <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">
                {firmName}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-850 border border-slate-700 shadow-2xl py-2 z-50 text-xs">
              <div className="px-3.5 py-2 border-b border-slate-800">
                <p className="font-semibold text-white truncate">{userName}</p>
                <p className="text-[11px] text-slate-400 truncate">{userEmail}</p>
              </div>

              <div className="py-1">
                <Link
                  href="/cha/dashboard/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Firm Profile & Settings</span>
                </Link>
                <Link
                  href="/cha/dashboard/signatures"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Signature & Stamp</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
