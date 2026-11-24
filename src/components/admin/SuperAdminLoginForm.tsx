'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function SuperAdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid administrator credentials');
      }

      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify administrator credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Terminal Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-400 mb-4 shadow-lg shadow-amber-950/40">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded tracking-wider uppercase">
            Platform Root
          </span>
          <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
            BENZWELL Admin
          </span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight mt-2">
          Super Admin Console
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Strictly restricted to authorized platform administrators
        </p>
      </div>

      {/* Terminal Card */}
      <div className="bg-[#0B1524] rounded-2xl border border-slate-800 p-8 shadow-2xl shadow-black/80">
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Administrator Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                placeholder="admin@benzwell.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-[#070E18] border border-slate-800 rounded-xl text-white placeholder-slate-600 text-xs focus:outline-none focus:border-amber-500/60 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Administrator Password
              </label>
              <Link
                href="/admin/forgot-password"
                className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 bg-[#070E18] border border-slate-800 rounded-xl text-white placeholder-slate-600 text-xs focus:outline-none focus:border-amber-500/60 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 mt-2 transition-all shadow-lg shadow-amber-500/20"
          >
            <span>Verify & Enter Console</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <div className="pt-3 border-t border-slate-800/80 text-center">
            <Link
              href="/dashboard"
              className="text-[11px] text-slate-500 hover:text-slate-400 transition-colors"
            >
              ← Return to Customer Workspace
            </Link>
          </div>
        </form>
      </div>

      <div className="text-center mt-6 text-[11px] text-slate-600">
        ExportFlow Security Protocol • Benzwell Proprietary Platform
      </div>
    </div>
  );
}
