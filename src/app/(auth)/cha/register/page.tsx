'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, User, Building2, Anchor, ShieldAlert, ArrowRight, Phone, MapPin } from 'lucide-react';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const CUSTOMS_PORTS = [
  'Nhava Sheva (JNPT) / Mumbai Zone II (INNSA1)',
  'Mumbai Port Trust / Zone I (INBOM1)',
  'Air Cargo Complex, Mumbai (INBOM4)',
  'Mundra Port (INMUN1)',
  'Kandla Port / Deendayal (INIXY1)',
  'Chennai Sea Port (INMAA1)',
  'Chennai Air Cargo (INMAA4)',
  'Kolkata Sea Port (INCCU1)',
  'Air Cargo Complex, New Delhi (INDEL4)',
  'ICD Tughlakabad, Delhi (INTKD6)',
  'ICD Patparganj, Delhi (INPPG6)',
  'Cochin / Vallarpadam (INCOK1)',
  'Tuticorin / V.O. Chidambaranar (INTUT1)',
  'Hazira Port, Surat (INHZA1)',
  'Pipavav Port (INPAV1)',
  'Other Inland Container Depot (ICD)',
];

export default function ChaRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firmName: '',
    licenseNumber: '',
    customsAuthority: CUSTOMS_PORTS[0],
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    city: '',
    address: '',
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
      const res = await fetch('/api/cha/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          firmName: formData.firmName,
          licenseNumber: formData.licenseNumber,
          customsAuthority: formData.customsAuthority,
          phone: formData.phone,
          city: formData.city,
          address: formData.address,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register CHA workspace');
      }

      window.location.href = data.redirectUrl || '/cha/dashboard';
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-950 -z-10" />

      <div className="w-full max-w-xl">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <BrandLogo size="lg" showTagline={false} className="justify-center mb-3" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
            <Anchor className="w-3.5 h-3.5" />
            <span>Customs Broker Onboarding</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Register Your Customs Brokerage</h1>
          <p className="text-xs text-slate-400 mt-1">
            Empower your firm with multi-client job management, e-SANCHIT tracking, and automated client billing
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/80 p-7">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Brokerage Firm Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Brokerage Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label="Customs Broker / Firm Name"
                  name="firmName"
                  required
                  placeholder="e.g. Apex Customs Logistics LLP"
                  value={formData.firmName}
                  onChange={handleChange}
                  className="bg-slate-900/80 border-slate-700 text-white placeholder:text-slate-500"
                />

                <Input
                  label="CB License No. / PAN"
                  name="licenseNumber"
                  required
                  placeholder="e.g. 11/2018 / AAACA0000A"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className="bg-slate-900/80 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Primary Customs Station / Commissionerate
                </label>
                <select
                  name="customsAuthority"
                  value={formData.customsAuthority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {CUSTOMS_PORTS.map((port) => (
                    <option key={port} value={port} className="bg-slate-900 text-slate-200">
                      {port}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Authorized Person Details */}
            <div className="space-y-3 pt-3 border-t border-slate-700/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Authorized Representative
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label="Authorized Person Name"
                  name="name"
                  required
                  placeholder="e.g. Rajesh Kumar"
                  value={formData.name}
                  onChange={handleChange}
                  leftIcon={<User className="w-4 h-4 text-slate-400" />}
                  className="bg-slate-900/80 border-slate-700 text-white placeholder:text-slate-500"
                />

                <Input
                  label="Contact Phone / Mobile"
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
                  className="bg-slate-900/80 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>

              <Input
                label="Official Email Address"
                name="email"
                type="email"
                required
                placeholder="rajesh@apexcustoms.com"
                value={formData.email}
                onChange={handleChange}
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                className="bg-slate-900/80 border-slate-700 text-white placeholder:text-slate-500"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label="City / Port Base"
                  name="city"
                  placeholder="e.g. Navi Mumbai"
                  value={formData.city}
                  onChange={handleChange}
                  leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
                  className="bg-slate-900/80 border-slate-700 text-white placeholder:text-slate-500"
                />

                <Input
                  label="Office Address (Optional)"
                  name="address"
                  placeholder="Office 402, Logistics Park"
                  value={formData.address}
                  onChange={handleChange}
                  className="bg-slate-900/80 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                  className="bg-slate-900/80 border-slate-700 text-white placeholder:text-slate-500"
                />

                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                  className="bg-slate-900/80 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Compliance Badge */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Verification Notice:</strong> Registered broker accounts start in <em>Pending Verification</em> status. The Super Admin team verifies license details before issuing the Verified Broker badge.
              </span>
            </div>

            <Button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold border-0 shadow-lg shadow-amber-500/20"
              isLoading={isLoading}
            >
              Complete CHA Registration
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-5">
          Already registered as Customs Broker?{' '}
          <Link href="/cha/login" className="text-amber-400 font-bold hover:underline">
            Sign In to CHA Portal
          </Link>
        </p>
      </div>
    </div>
  );
}
