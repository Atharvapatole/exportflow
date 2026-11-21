'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  FileCheck2,
  Phone,
  Landmark,
  Sliders,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { INCOTERMS_2020, SUPPORTED_CURRENCIES, DOCUMENT_TEMPLATES } from '@/config/constants';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // Step 1: Company
    legalName: '',
    tradingName: '',
    businessType: 'Manufacturer & Exporter',
    country: 'India',
    registeredAddress: '',
    city: '',
    website: '',
    logoUrl: '',
    // Step 2: Registration
    gstin: '',
    pan: '',
    iec: '',
    cin: '',
    lutNumber: '',
    // Step 3: Contact
    primaryContactName: '',
    primaryContactPhone: '',
    primaryContactEmail: '',
    designation: 'Managing Director',
    // Step 4: Banking
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    swiftBic: '',
    bankBranchAddress: '',
    bankCurrency: 'USD',
    // Step 5: Document Preferences
    defaultCurrency: 'USD',
    defaultValidityDays: 15,
    defaultPaymentTerms: '30% TT advance, 70% against Bill of Lading copy',
    defaultIncoterms: 'FOB',
    preferredTemplate: 'classic-corporate',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = async () => {
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save company settings');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error completing onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  const stepsHeader = [
    { num: 1, title: 'Company', icon: Building2 },
    { num: 2, title: 'Registrations', icon: FileCheck2 },
    { num: 3, title: 'Contact', icon: Phone },
    { num: 4, title: 'Banking', icon: Landmark },
    { num: 5, title: 'Preferences', icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col justify-center items-center p-4 py-8">
      <div className="w-full max-w-3xl">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <BrandLogo size="md" showTagline={true} className="justify-center mb-2" />
          <h1 className="text-2xl font-black text-[#172033] tracking-tight">
            Company Onboarding Setup
          </h1>
          <p className="text-xs text-[#64748B]">
            Configure your official export details once. All generated documents will automatically use this info.
          </p>
        </div>

        {/* Wizard Stepper */}
        <div className="flex items-center justify-between mb-6 bg-white p-3 rounded-2xl border border-[#E5EAF1] shadow-xs">
          {stepsHeader.map((s, idx) => {
            const Icon = s.icon;
            const isCompleted = step > s.num;
            const isCurrent = step === s.num;

            return (
              <React.Fragment key={s.num}>
                <div
                  onClick={() => setStep(s.num)}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-sm'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span
                    className={`hidden sm:inline text-xs font-semibold ${
                      isCurrent ? 'text-[#172033]' : 'text-slate-400'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                {idx < stepsHeader.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${
                      step > s.num ? 'bg-emerald-400' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Card Body */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-[#E5EAF1] p-7">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* STEP 1: COMPANY */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-2 mb-4">
                <h3 className="text-sm font-bold text-[#172033]">Step 1: Company Profile</h3>
                <p className="text-xs text-slate-500">Legal entity information and registered office</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Legal Company Name"
                  name="legalName"
                  required
                  placeholder="e.g. Apex Global Exports Private Limited"
                  value={formData.legalName}
                  onChange={handleChange}
                />
                <Input
                  label="Trading / Brand Name"
                  name="tradingName"
                  placeholder="e.g. Apex Exports"
                  value={formData.tradingName}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Business Type"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  options={[
                    { value: 'Merchant Exporter', label: 'Merchant Exporter' },
                    { value: 'Manufacturer & Exporter', label: 'Manufacturer & Exporter' },
                    { value: 'International Trading House', label: 'International Trading House' },
                    { value: 'Buying House / Agent', label: 'Buying House / Agent' },
                    { value: 'Custom Broker / Freight Forwarder', label: 'Custom Broker / Freight Forwarder' },
                  ]}
                />
                <Input
                  label="Website"
                  name="website"
                  placeholder="https://apexexports.com"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>

              <Textarea
                label="Registered Office Address"
                name="registeredAddress"
                placeholder="Suite 400, Trade Tower, Port Road"
                value={formData.registeredAddress}
                onChange={handleChange}
                rows={2}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="City / State"
                  name="city"
                  placeholder="Mumbai, Maharashtra"
                  value={formData.city}
                  onChange={handleChange}
                />
                <Input
                  label="Company Logo URL (optional)"
                  name="logoUrl"
                  placeholder="https://example.com/logo.png"
                  value={formData.logoUrl}
                  onChange={handleChange}
                  helperText="You can also upload later in settings"
                />
              </div>
            </div>
          )}

          {/* STEP 2: REGISTRATIONS */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-2 mb-4">
                <h3 className="text-sm font-bold text-[#172033]">Step 2: Regulatory & Tax Registrations</h3>
                <p className="text-xs text-slate-500">Government export codes and tax identification</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="IEC (Import Export Code)"
                  name="iec"
                  placeholder="10-digit DGFT IEC"
                  value={formData.iec}
                  onChange={handleChange}
                  helperText="Mandatory for Indian exporters"
                />
                <Input
                  label="GSTIN"
                  name="gstin"
                  placeholder="15-character GSTIN"
                  value={formData.gstin}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="PAN"
                  name="pan"
                  placeholder="Permanent Account Number"
                  value={formData.pan}
                  onChange={handleChange}
                />
                <Input
                  label="LUT / Bond Number (if applicable)"
                  name="lutNumber"
                  placeholder="LUT Reference for Zero-Rated Exports"
                  value={formData.lutNumber}
                  onChange={handleChange}
                  helperText="Letter of Undertaking for zero GST export"
                />
              </div>

              <Input
                label="CIN / Company Registration No."
                name="cin"
                placeholder="Corporate Identity Number"
                value={formData.cin}
                onChange={handleChange}
              />
            </div>
          )}

          {/* STEP 3: CONTACT */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-2 mb-4">
                <h3 className="text-sm font-bold text-[#172033]">Step 3: Primary Contact & Signatory</h3>
                <p className="text-xs text-slate-500">Person authorized to issue export quotations & invoices</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Primary Contact Person"
                  name="primaryContactName"
                  placeholder="Full Name"
                  value={formData.primaryContactName}
                  onChange={handleChange}
                />
                <Input
                  label="Designation / Role"
                  name="designation"
                  placeholder="e.g. Export Director / Partner"
                  value={formData.designation}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Direct Phone / WhatsApp"
                  name="primaryContactPhone"
                  placeholder="+91 98765 43210"
                  value={formData.primaryContactPhone}
                  onChange={handleChange}
                />
                <Input
                  label="Official Email"
                  name="primaryContactEmail"
                  type="email"
                  placeholder="exports@company.com"
                  value={formData.primaryContactEmail}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {/* STEP 4: BANKING */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-2 mb-4">
                <h3 className="text-sm font-bold text-[#172033]">Step 4: International Banking Details</h3>
                <p className="text-xs text-slate-500">Beneficiary bank details printed on Proforma and Commercial Invoices for buyer remittances</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Bank Name"
                  name="bankName"
                  placeholder="e.g. Standard Chartered / HDFC Bank"
                  value={formData.bankName}
                  onChange={handleChange}
                />
                <Input
                  label="Account Beneficiary Name"
                  name="accountHolderName"
                  placeholder="Name as registered with bank"
                  value={formData.accountHolderName}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Bank Account Number / IBAN"
                  name="accountNumber"
                  placeholder="Account Number"
                  value={formData.accountNumber}
                  onChange={handleChange}
                />
                <Input
                  label="SWIFT / BIC Code"
                  name="swiftBic"
                  placeholder="8 or 11 character SWIFT"
                  value={formData.swiftBic}
                  onChange={handleChange}
                  helperText="Required for overseas wire transfers"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="IFSC Code (for domestic/INR)"
                  name="ifscCode"
                  placeholder="IFSC Code"
                  value={formData.ifscCode}
                  onChange={handleChange}
                />
                <Select
                  label="Account Primary Currency"
                  name="bankCurrency"
                  value={formData.bankCurrency}
                  onChange={handleChange}
                  options={SUPPORTED_CURRENCIES.map((c) => ({
                    value: c.code,
                    label: `${c.code} (${c.name})`,
                  }))}
                />
              </div>

              <Input
                label="Bank Branch Address"
                name="bankBranchAddress"
                placeholder="Branch name, City, Country"
                value={formData.bankBranchAddress}
                onChange={handleChange}
              />
            </div>
          )}

          {/* STEP 5: PREFERENCES */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-2 mb-4">
                <h3 className="text-sm font-bold text-[#172033]">Step 5: Document Defaults & Template</h3>
                <p className="text-xs text-slate-500">Default presets for instant 1-click quotation creation</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="Default Currency"
                  name="defaultCurrency"
                  value={formData.defaultCurrency}
                  onChange={handleChange}
                  options={SUPPORTED_CURRENCIES.map((c) => ({
                    value: c.code,
                    label: `${c.code} - ${c.name}`,
                  }))}
                />
                <Select
                  label="Default Incoterms"
                  name="defaultIncoterms"
                  value={formData.defaultIncoterms}
                  onChange={handleChange}
                  options={INCOTERMS_2020.map((i) => ({
                    value: i.code,
                    label: `${i.code} - ${i.name}`,
                  }))}
                />
                <Input
                  label="Quotation Validity (Days)"
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
                placeholder="e.g. 30% TT advance, 70% against BL copy"
              />

              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-[#172033] block">
                  Select Default Document Template
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {DOCUMENT_TEMPLATES.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      onClick={() => setFormData({ ...formData, preferredTemplate: tmpl.id })}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        formData.preferredTemplate === tmpl.id
                          ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#172033]">{tmpl.name}</span>
                        {formData.preferredTemplate === tmpl.id && (
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{tmpl.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
            {step > 1 ? (
              <Button type="button" variant="outline" size="sm" onClick={handlePrev}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Previous Step
              </Button>
            ) : (
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="text-xs text-slate-400 hover:text-slate-600 underline"
              >
                Skip for now
              </button>
            )}

            {step < 5 ? (
              <Button type="button" variant="primary" size="sm" onClick={handleNext}>
                Continue
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="emerald"
                size="sm"
                onClick={handleFinish}
                isLoading={isLoading}
              >
                <Sparkles className="w-4 h-4 mr-1" />
                Complete Setup & Go to Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
