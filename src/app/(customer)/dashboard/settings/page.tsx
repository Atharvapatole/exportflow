'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Save,
  Check,
  FileCheck2,
  Landmark,
  Sliders,
  Shield,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { INCOTERMS_2020, SUPPORTED_CURRENCIES, DOCUMENT_TEMPLATES } from '@/config/constants';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'company' | 'taxes' | 'banking' | 'templates'>('company');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    legalName: '',
    tradingName: '',
    businessType: 'Manufacturer & Exporter',
    country: 'India',
    registeredAddress: '',
    city: '',
    website: '',
    logoUrl: '',
    gstin: '',
    pan: '',
    iec: '',
    cin: '',
    lutNumber: '',
    primaryContactName: '',
    primaryContactPhone: '',
    primaryContactEmail: '',
    designation: 'Managing Director',
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    swiftBic: '',
    bankBranchAddress: '',
    bankCurrency: 'USD',
    defaultCurrency: 'USD',
    defaultPaymentTerms: '30% Advance TT, 70% against BL copy',
    defaultIncoterms: 'FOB',
    defaultValidityDays: 15,
    preferredTemplate: 'classic-corporate',
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data) setFormData((prev) => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess(false);
    setError('');

    try {
      const res = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to update settings');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#172033] tracking-tight">Company Settings & Preferences</h1>
          <p className="text-xs text-[#64748B]">Configure legal entity, tax registrations, default Incoterms, and bank details</p>
        </div>
        <Button size="sm" variant="secondary" onClick={handleSave} isLoading={isSubmitting}>
          <Save className="w-4 h-4 mr-1.5" />
          Save Changes
        </Button>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('company')}
          className={`px-3 py-1.5 rounded-lg ${
            activeTab === 'company' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Company Profile
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('taxes')}
          className={`px-3 py-1.5 rounded-lg ${
            activeTab === 'taxes' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          GST, IEC & Regulatory
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('banking')}
          className={`px-3 py-1.5 rounded-lg ${
            activeTab === 'banking' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Bank Remittance Details
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('templates')}
          className={`px-3 py-1.5 rounded-lg ${
            activeTab === 'templates' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Document Defaults & Templates
        </button>
      </div>

      {/* Form Area */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSave} className="space-y-4">
            {activeTab === 'company' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Legal Company Name"
                    name="legalName"
                    required
                    value={formData.legalName}
                    onChange={handleChange}
                  />
                  <Input
                    label="Trading / Brand Name"
                    name="tradingName"
                    value={formData.tradingName}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Business Website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                  />
                  <Input
                    label="Company Logo URL"
                    name="logoUrl"
                    value={formData.logoUrl}
                    onChange={handleChange}
                  />
                </div>
                <Textarea
                  label="Registered Address"
                  name="registeredAddress"
                  value={formData.registeredAddress}
                  onChange={handleChange}
                  rows={2}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="City / State"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                  />
                  <Input
                    label="Country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {activeTab === 'taxes' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="IEC (Import Export Code)"
                    name="iec"
                    value={formData.iec}
                    onChange={handleChange}
                  />
                  <Input
                    label="GSTIN"
                    name="gstin"
                    value={formData.gstin}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="PAN"
                    name="pan"
                    value={formData.pan}
                    onChange={handleChange}
                  />
                  <Input
                    label="LUT / Bond Reference"
                    name="lutNumber"
                    value={formData.lutNumber}
                    onChange={handleChange}
                  />
                </div>
                <Input
                  label="CIN Number"
                  name="cin"
                  value={formData.cin}
                  onChange={handleChange}
                />
              </div>
            )}

            {activeTab === 'banking' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Bank Name"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                  />
                  <Input
                    label="Account Beneficiary Name"
                    name="accountHolderName"
                    value={formData.accountHolderName}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Account Number / IBAN"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                  />
                  <Input
                    label="SWIFT / BIC Code"
                    name="swiftBic"
                    value={formData.swiftBic}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="IFSC Code (Domestic)"
                    name="ifscCode"
                    value={formData.ifscCode}
                    onChange={handleChange}
                  />
                  <Input
                    label="Bank Branch Address"
                    name="bankBranchAddress"
                    value={formData.bankBranchAddress}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {activeTab === 'templates' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    label="Default Currency"
                    name="defaultCurrency"
                    value={formData.defaultCurrency}
                    onChange={handleChange}
                    options={SUPPORTED_CURRENCIES.map((c) => ({ value: c.code, label: c.code }))}
                  />
                  <Select
                    label="Default Incoterms"
                    name="defaultIncoterms"
                    value={formData.defaultIncoterms}
                    onChange={handleChange}
                    options={INCOTERMS_2020.map((i) => ({ value: i.code, label: i.code }))}
                  />
                  <Input
                    label="Default Validity (Days)"
                    name="defaultValidityDays"
                    type="number"
                    value={formData.defaultValidityDays}
                    onChange={handleChange}
                  />
                </div>
                <Input
                  label="Default Payment Terms"
                  name="defaultPaymentTerms"
                  value={formData.defaultPaymentTerms}
                  onChange={handleChange}
                />
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-[#172033] block">Default Document Design Template</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {DOCUMENT_TEMPLATES.map((tmpl) => (
                      <div
                        key={tmpl.id}
                        onClick={() => setFormData({ ...formData, preferredTemplate: tmpl.id })}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          formData.preferredTemplate === tmpl.id
                            ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <span className="text-xs font-bold text-[#172033]">{tmpl.name}</span>
                        <p className="text-[11px] text-slate-500 mt-1">{tmpl.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
