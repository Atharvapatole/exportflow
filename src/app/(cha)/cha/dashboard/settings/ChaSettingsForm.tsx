'use client';

import React, { useState } from 'react';
import { Building2, ShieldCheck, Palette, Save, CheckCircle2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ChaSettingsFormProps {
  initialOrg: {
    id: string;
    name: string;
    chaLicenseNumber: string;
    chaLicenseAuthority: string;
    chaLicenseStatus: string;
    address: string;
    phone: string;
    email: string;
  };
}

export function ChaSettingsForm({ initialOrg }: ChaSettingsFormProps) {
  const [formData, setFormData] = useState(initialOrg);
  const [whitelabel, setWhitelabel] = useState({
    portalTitle: `${initialOrg.name} Client Portal`,
    primaryColor: '#F59E0B',
    logoUrl: '',
    customDomain: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSavedMessage('');

    try {
      const res = await fetch('/api/organizations/current', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          whitelabelConfig: whitelabel,
        }),
      });
      if (res.ok) {
        setSavedMessage('Settings and white-label preferences saved successfully.');
      }
    } catch {} finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {savedMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-medium">
          {savedMessage}
        </div>
      )}

      {/* Broker Profile */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Customs Brokerage Credentials
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">
            Status: <strong className="text-amber-400 uppercase">{formData.chaLicenseStatus}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Brokerage Legal Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="bg-slate-950 border-slate-800 text-white"
          />

          <Input
            label="Customs Broker License No. (PAN-Based)"
            name="chaLicenseNumber"
            value={formData.chaLicenseNumber}
            onChange={handleChange}
            className="bg-slate-950 border-slate-800 text-white font-mono"
          />

          <Input
            label="Customs Station / Commissionerate"
            name="chaLicenseAuthority"
            value={formData.chaLicenseAuthority}
            onChange={handleChange}
            className="bg-slate-950 border-slate-800 text-white"
          />

          <Input
            label="Official Contact Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="bg-slate-950 border-slate-800 text-white"
          />
        </div>

        <Input
          label="Registered Office Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="bg-slate-950 border-slate-800 text-white"
        />
      </div>

      {/* White-label Section */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <Palette className="w-4 h-4" /> White-Label Client Portal & Branding
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Custom Portal Header Title"
            value={whitelabel.portalTitle}
            onChange={(e) => setWhitelabel({ ...whitelabel, portalTitle: e.target.value })}
            className="bg-slate-950 border-slate-800 text-white"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Primary Brand Accent Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={whitelabel.primaryColor}
                onChange={(e) => setWhitelabel({ ...whitelabel, primaryColor: e.target.value })}
                className="w-10 h-9 rounded-lg bg-transparent border-0 cursor-pointer"
              />
              <span className="font-mono text-xs text-white">{whitelabel.primaryColor}</span>
            </div>
          </div>

          <Input
            label="Custom Subdomain / Domain (e.g. portal.apexcustoms.com)"
            value={whitelabel.customDomain}
            onChange={(e) => setWhitelabel({ ...whitelabel, customDomain: e.target.value })}
            placeholder="portal.yourdomain.com"
            className="bg-slate-950 border-slate-800 text-white font-mono"
          />

          <Input
            label="Company Logo Image URL"
            value={whitelabel.logoUrl}
            onChange={(e) => setWhitelabel({ ...whitelabel, logoUrl: e.target.value })}
            placeholder="https://..."
            className="bg-slate-950 border-slate-800 text-white"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          isLoading={isLoading}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-6 py-2.5"
        >
          <Save className="w-3.5 h-3.5 mr-1.5" />
          Save Changes
        </Button>
      </div>
    </form>
  );
}
