'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AdminHeaderProps {
  adminEmail?: string;
}

export function AdminHeader({ adminEmail = 'admin@benzwell.com' }: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  return (
    <header className="h-16 bg-[#0B1524] border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20 text-white">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>System Online</span>
        </div>
        <span className="text-xs text-slate-400">BENZWELL Root Authorization Active</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>{adminEmail}</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleLogout}
          className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </Button>
      </div>
    </header>
  );
}
