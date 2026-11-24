'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, Mail, ArrowRight, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit recovery request');
      }

      setSubmitted(true);
      setMessage(
        data.message ||
          'If an account exists for this email address, a password reset link will be sent shortly. Please check your inbox and spam folder.'
      );
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting password recovery request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040A12] flex flex-col justify-center items-center p-4 select-none">
      <div className="w-full max-w-md">
        {/* Terminal Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-400 mb-4 shadow-lg shadow-amber-950/40">
            <KeyRound className="w-7 h-7" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-sm font-black tracking-widest text-white uppercase">BENZWELL</span>
            <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
              SUPER ADMIN
            </span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Forgot Your Password?</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Enter your registered Super Admin email address. We will send you a secure password reset link.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#0B1524] rounded-2xl border border-slate-800 p-8 shadow-2xl shadow-black/80 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-blue-500 to-amber-500"></div>

          {submitted ? (
            <div className="space-y-6 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white">Reset Link Dispatched</h3>
                <p className="text-xs text-slate-300 leading-relaxed bg-[#060D17] p-4 rounded-xl border border-slate-800 text-left">
                  {message}
                </p>
              </div>
              <div className="pt-2">
                <Link href="/admin">
                  <Button variant="outline" className="w-full text-xs border-slate-700 text-slate-300 hover:bg-slate-800 gap-2">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Return to Admin Sign In</span>
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-600/50 text-xs text-rose-300 font-medium leading-relaxed">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Registered Admin Email Address</span>
                </label>
                <Input
                  type="email"
                  required
                  autoFocus
                  placeholder="info@benzwell.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#060D17] border-slate-700 text-slate-100 text-xs font-mono py-2.5"
                />
              </div>

              <Button
                type="submit"
                variant="secondary"
                className="w-full py-2.5 mt-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-950/50 gap-1.5"
                isLoading={isLoading}
              >
                <span>Send Reset Link</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>

              <div className="pt-3 border-t border-slate-800/80 text-center">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Administrator Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
