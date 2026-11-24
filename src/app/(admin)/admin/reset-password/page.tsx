'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldAlert,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  KeyRound,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';

export default function AdminResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Session verification state: 'checking' | 'valid' | 'invalid'
  const [sessionState, setSessionState] = useState<'checking' | 'valid' | 'invalid'>('checking');
  const [userEmail, setUserEmail] = useState<string>('');

  // Form states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Password validation rules
  const hasMinLength = newPassword.length >= 12;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isFormValid =
    hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial && passwordsMatch;

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    async function verifyRecoverySession() {
      if (!supabase) {
        if (isMounted) setSessionState('invalid');
        return;
      }

      try {
        // 1. Check for PKCE code in query parameters
        const code = searchParams.get('code');
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.warn('[RESET PASSWORD] exchangeCodeForSession notice:', exchangeError.message);
          }
        }

        // 2. Check current session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          if (isMounted) {
            setUserEmail(session.user.email || '');
            setSessionState('valid');
          }
          return;
        }

        // 3. Listen to auth state change (handles hash token #access_token=...&type=recovery)
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'PASSWORD_RECOVERY' || (session && session.user)) {
            if (isMounted) {
              setUserEmail(session?.user?.email || '');
              setSessionState('valid');
            }
          }
        });

        // 4. Set timeout to mark invalid if no recovery session detected
        const timer = setTimeout(() => {
          if (isMounted && sessionState === 'checking') {
            supabase.auth.getSession().then(({ data }) => {
              if (data?.session?.user) {
                setUserEmail(data.session.user.email || '');
                setSessionState('valid');
              } else {
                setSessionState('invalid');
              }
            });
          }
        }, 2500);

        return () => {
          clearTimeout(timer);
          authListener?.subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Error verifying recovery session:', err);
        if (isMounted) setSessionState('invalid');
      }
    }

    verifyRecoverySession();

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!isFormValid) {
      setErrorMessage('Please ensure your password meets all complexity requirements.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Update password via server-side endpoint with strict Super Admin verification
      const res = await fetch('/api/admin/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update Super Admin password');
      }

      setSuccessMessage('Your Super Admin password has been updated successfully.');

      // Wait 1.8 seconds and redirect to Super Admin console
      setTimeout(() => {
        router.push('/admin');
        router.refresh();
      }, 1800);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during password update.');
    } finally {
      setIsSubmitting(false);
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
          <h1 className="text-xl font-bold text-white tracking-tight">Create a New Password</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Choose a strong, high-entropy password to secure the ExportFlow management console.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#0B1524] rounded-2xl border border-slate-800 p-8 shadow-2xl shadow-black/80 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-blue-500 to-amber-500"></div>

          {/* State 1: Checking recovery session */}
          {sessionState === 'checking' && (
            <div className="py-8 text-center space-y-3">
              <RefreshCw className="w-6 h-6 text-amber-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Verifying security recovery token...</p>
            </div>
          )}

          {/* State 2: Invalid or expired link */}
          {sessionState === 'invalid' && (
            <div className="space-y-5 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-white">Invalid or Expired Link</h3>
                <p className="text-xs text-slate-400 leading-relaxed bg-[#060D17] p-4 rounded-xl border border-slate-800 text-left">
                  This password reset link is invalid or has expired. Please request a new one.
                </p>
              </div>
              <div className="pt-2">
                <Link href="/admin/forgot-password">
                  <Button variant="secondary" className="w-full text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold">
                    Request Another Reset Link
                  </Button>
                </Link>
              </div>
              <div className="pt-1">
                <Link href="/admin" className="text-xs text-slate-400 hover:text-white transition-colors">
                  Return to Admin Sign In
                </Link>
              </div>
            </div>
          )}

          {/* State 3: Valid recovery session - Show reset form */}
          {sessionState === 'valid' && (
            <div>
              {userEmail && (
                <div className="mb-5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                  <span className="text-slate-400">Admin Account:</span>
                  <span className="font-mono font-bold text-amber-400">{userEmail}</span>
                </div>
              )}

              {successMessage ? (
                <div className="space-y-5 text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">Password Updated</h3>
                    <p className="text-xs text-emerald-300">{successMessage}</p>
                    <p className="text-[11px] text-slate-500 mt-2">Redirecting to Super Admin Console...</p>
                  </div>
                  <Link href="/admin">
                    <Button variant="secondary" className="w-full text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold mt-2">
                      Go to Admin Console Now
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-600/50 text-xs text-rose-300 font-medium">
                      {errorMessage}
                    </div>
                  )}

                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>New Password</span>
                    </label>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="At least 12 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-[#060D17] border-slate-700 text-slate-100 text-xs font-mono py-2.5"
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="cursor-pointer text-slate-500 hover:text-slate-300 focus:outline-none"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                    />
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Confirm New Password</span>
                    </label>
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-[#060D17] border-slate-700 text-slate-100 text-xs font-mono py-2.5"
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="cursor-pointer text-slate-500 hover:text-slate-300 focus:outline-none"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                    />
                  </div>

                  {/* Password Requirements Checklist */}
                  <div className="p-3.5 rounded-xl bg-[#060D17] border border-slate-800 text-[11px] space-y-1.5">
                    <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[10px]">
                      Complexity Requirements:
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {hasMinLength ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <XCircle className="w-3 h-3 shrink-0" />}
                        <span>12+ Characters</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {hasUppercase ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <XCircle className="w-3 h-3 shrink-0" />}
                        <span>Uppercase Letter</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasLowercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {hasLowercase ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <XCircle className="w-3 h-3 shrink-0" />}
                        <span>Lowercase Letter</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {hasNumber ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <XCircle className="w-3 h-3 shrink-0" />}
                        <span>Number (0-9)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {hasSpecial ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <XCircle className="w-3 h-3 shrink-0" />}
                        <span>Special Character</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {passwordsMatch ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <XCircle className="w-3 h-3 shrink-0" />}
                        <span>Passwords Match</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2">
                    <Button
                      type="submit"
                      variant="secondary"
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-950/50 gap-1.5"
                      isLoading={isSubmitting}
                      disabled={!isFormValid}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Save New Password</span>
                    </Button>

                    <Link href="/admin">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full text-xs border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"
                      >
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
