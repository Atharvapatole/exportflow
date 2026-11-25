'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      window.location.href = data.redirectUrl || '/dashboard';
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0B0F17] flex flex-col justify-center items-center p-4 transition-colors">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <BrandLogo size="lg" showTagline={true} className="justify-center mb-3" />
          <h1 className="text-xl font-bold text-[#172033] dark:text-white mt-4">Welcome back</h1>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
            Access your unified export workspace and documentation center
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#131B2A] rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-[#E5EAF1] dark:border-[#243047] p-7 transition-colors">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#172033] dark:text-slate-200">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold"
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
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
            </div>

            <Button
              type="submit"
              variant="secondary"
              className="w-full py-2.5 mt-2"
              isLoading={isLoading}
            >
              Sign In to ExportFlow
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#64748B] dark:text-slate-400 mt-6">
          Don&apos;t have an ExportFlow account?{' '}
          <Link href="/register" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
            Start 3-Day Free Trial
          </Link>
        </p>
      </div>
    </div>
  );
}
