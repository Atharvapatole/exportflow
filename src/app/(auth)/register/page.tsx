'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, User, Building2, Globe, ArrowRight } from 'lucide-react';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

const COUNTRIES = [
  'India',
  'United States',
  'United Arab Emirates',
  'Saudi Arabia',
  'United Kingdom',
  'Germany',
  'Singapore',
  'Vietnam',
  'Bangladesh',
  'China',
  'Canada',
  'Australia',
  'Netherlands',
  'Japan',
  'South Africa',
  'Brazil',
];

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    country: 'India',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          companyName: formData.companyName,
          country: formData.country,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      window.location.href = data.redirectUrl || '/dashboard';
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0B0F17] flex flex-col justify-center items-center p-4 py-8 transition-colors">
      <div className="w-full max-w-lg">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <BrandLogo size="lg" showTagline={true} className="justify-center mb-3" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-bold mb-2">
            <span>🚀 Start Your 3-Day Free Trial — Full Growth Tier Access</span>
          </div>
          <h1 className="text-xl font-bold text-[#172033] dark:text-white">Create Your Exporter Account</h1>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
            Build Quotations, Proforma Invoices, Commercial Invoices & Manage Shipments
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="name"
                required
                placeholder="Ramesh Patel"
                value={formData.name}
                onChange={handleChange}
                leftIcon={<User className="w-4 h-4" />}
              />
              <Input
                label="Business Email"
                name="email"
                type="email"
                required
                placeholder="ramesh@company.com"
                value={formData.email}
                onChange={handleChange}
                leftIcon={<Mail className="w-4 h-4" />}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Company Name"
                name="companyName"
                required
                placeholder="Acme Global Exports Ltd"
                value={formData.companyName}
                onChange={handleChange}
                leftIcon={<Building2 className="w-4 h-4" />}
              />
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#172033] dark:text-slate-200 tracking-wide">
                  Country <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-[#E5EAF1] dark:border-[#243047] bg-white dark:bg-[#0F172A] pl-9 pr-3 py-2 text-sm text-[#172033] dark:text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="At least 6 chars"
                value={formData.password}
                onChange={handleChange}
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
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={handleChange}
                leftIcon={<Lock className="w-4 h-4" />}
              />
            </div>

            <Button
              type="submit"
              variant="secondary"
              className="w-full py-2.5 mt-2"
              isLoading={isLoading}
            >
              Start 3-Day Free Trial
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-[#64748B] dark:text-slate-400 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
            Sign In here
          </Link>
        </p>

        <p className="text-center text-xs text-slate-500 mt-2">
          Are you a Customs Broker / Forwarder?{' '}
          <Link href="/cha/register" className="text-amber-600 dark:text-amber-400 font-bold hover:underline">
            Register as CHA
          </Link>
        </p>
      </div>
    </div>
  );
}
