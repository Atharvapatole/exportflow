'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, FileText, Anchor } from 'lucide-react';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ChaLoginPage() {
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
      const res = await fetch('/api/cha/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      window.location.href = data.redirectUrl || '/cha/dashboard';
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4">
      {/* Background styling elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-950 -z-10" />

      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <BrandLogo size="lg" showTagline={false} className="justify-center mb-3" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-3">
            <Anchor className="w-3.5 h-3.5" />
            <span>CHA / Customs Broker Workspace</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Customs House Agent Portal</h1>
          <p className="text-xs text-slate-400 mt-1">
            Access multi-client customs jobs, BoE/SB worksheets, e-SANCHIT register & client billing
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/80 p-7">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Broker / Firm Email"
              type="email"
              required
              placeholder="cha@customsbroker.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              className="bg-slate-900/80 border-slate-700 text-white placeholder:text-slate-500"
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer text-slate-400 hover:text-slate-200 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                className="bg-slate-900/80 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>

            <Button
              type="submit"
              className="w-full py-2.5 mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold border-0 shadow-lg shadow-amber-500/20"
              isLoading={isLoading}
            >
              Enter Broker Workspace
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* Quick Security & Compliance Note */}
          <div className="mt-6 pt-5 border-t border-slate-700/60 flex items-start gap-2.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Tenant-isolated workspace: Client files, duty challans, and ICEGATE filing records remain strictly confidential.
            </span>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="text-center space-y-2 mt-6">
          <p className="text-xs text-slate-400">
            New Customs Brokerage Firm?{' '}
            <Link href="/cha/register" className="text-amber-400 font-bold hover:underline">
              Register CHA Workspace
            </Link>
          </p>
          <p className="text-xs text-slate-500">
            Are you an Exporter?{' '}
            <Link href="/login" className="text-blue-400 hover:underline">
              Sign in to Exporter Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
