'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, ArrowLeft, ArrowRight, ShieldCheck, Mail, Phone, MapPin, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function NewClientPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyName: '',
    iecNumber: '',
    gstin: '',
    pan: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    creditTerms: 'Net 15 Days',
    notes: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/cha/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to enroll client');
      }

      router.push(`/cha/dashboard/clients/${data.client.id}`);
    } catch (err: any) {
      setError(err.message || 'Error creating client');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top back nav */}
      <div className="flex items-center gap-3">
        <Link
          href="/cha/dashboard/clients"
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Enroll Exporter Client</h1>
          <p className="text-xs text-slate-400">Add an exporter firm for ICEGATE documentation, job booking and billing</p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 md:p-8">
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Statutory Registration Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Building2 className="w-4 h-4" /> Statutory & Identification Codes
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Exporter / Firm Legal Name"
                name="companyName"
                required
                placeholder="e.g. Bharat Agrotech Private Limited"
                value={formData.companyName}
                onChange={handleChange}
                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
              />

              <Input
                label="IEC Number (Import Export Code)"
                name="iecNumber"
                required
                placeholder="10-digit DGFT IEC (e.g. 0511012345)"
                value={formData.iecNumber}
                onChange={handleChange}
                className="bg-slate-950 border-slate-800 text-white uppercase font-mono placeholder:text-slate-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="GSTIN (15-digit GST Number)"
                name="gstin"
                placeholder="e.g. 27AAACB0000A1Z5"
                value={formData.gstin}
                onChange={handleChange}
                className="bg-slate-950 border-slate-800 text-white uppercase font-mono placeholder:text-slate-500"
              />

              <Input
                label="Entity PAN Number"
                name="pan"
                placeholder="e.g. AAACB0000A"
                value={formData.pan}
                onChange={handleChange}
                className="bg-slate-950 border-slate-800 text-white uppercase font-mono placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Primary Representative */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Building2 className="w-4 h-4" /> Contact Representative & Communication
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Contact Person Name"
                name="contactPerson"
                required
                placeholder="e.g. Vikram Sharma"
                value={formData.contactPerson}
                onChange={handleChange}
                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
              />

              <Input
                label="Official Email"
                name="email"
                type="email"
                required
                placeholder="vikram@bharatagrotech.com"
                value={formData.email}
                onChange={handleChange}
                leftIcon={<Mail className="w-4 h-4 text-slate-500" />}
                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
              />

              <Input
                label="Mobile / Office Phone"
                name="phone"
                placeholder="+91 98200 12345"
                value={formData.phone}
                onChange={handleChange}
                leftIcon={<Phone className="w-4 h-4 text-slate-500" />}
                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Address & Terms */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <MapPin className="w-4 h-4" /> Location & Billing Terms
            </h3>

            <Input
              label="Registered Business Address"
              name="address"
              placeholder="Plot No. 45, GIDC Industrial Estate"
              value={formData.address}
              onChange={handleChange}
              className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="City"
                name="city"
                placeholder="e.g. Ahmedabad"
                value={formData.city}
                onChange={handleChange}
                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
              />

              <Input
                label="State"
                name="state"
                placeholder="e.g. Gujarat"
                value={formData.state}
                onChange={handleChange}
                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
              />

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Payment / Credit Terms
                </label>
                <select
                  name="creditTerms"
                  value={formData.creditTerms}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Immediate / Advance">Immediate / Advance</option>
                  <option value="Net 7 Days">Net 7 Days</option>
                  <option value="Net 15 Days">Net 15 Days</option>
                  <option value="Net 30 Days">Net 30 Days</option>
                  <option value="Against OOC / LEO Release">Against OOC / LEO Release</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Internal Operational Notes
              </label>
              <textarea
                name="notes"
                rows={3}
                placeholder="Special handling instructions, preferred shipping line, branch office preferences..."
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <Link href="/cha/dashboard/clients">
              <Button type="button" variant="outline" className="border-slate-800 text-slate-300 hover:bg-slate-800 text-xs">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border-0 text-xs px-5 py-2.5"
              isLoading={isLoading}
            >
              Enroll Client
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
