'use client';

import React, { useState } from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Phone, Building2, User, Send, CheckCircle2, Shield, Clock, HelpCircle } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    category: 'sales',
    subject: '',
    message: '',
    consent: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [successData, setSuccessData] = useState<{ inquiryNumber: string; message: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessData(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit inquiry');
      }

      setSuccessData(data);
      setFormData({
        name: '',
        email: '',
        phone: '',
        companyName: '',
        category: 'sales',
        subject: '',
        message: '',
        consent: true,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0B0F17] text-[#172033] dark:text-[#F1F5F9] flex flex-col transition-colors">
      <PublicHeader />

      <main className="flex-1 py-16 px-6 md:px-12 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <span>TRADE SPECIALIST & ENTERPRISE SUPPORT</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-[#10243A] dark:text-white tracking-tight">
            Contact ExportFlow by BENZWELL
          </h1>
          <p className="mt-4 text-sm md:text-base text-[#64748B] dark:text-slate-400 leading-relaxed">
            Have questions about custom export templates, enterprise multi-user plans, API access, or billing? Reach out to our dedicated export solutions team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left 2 Cols: Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-[#131B2A] rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm transition-colors">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Send Us an Inquiry</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                All inquiries receive a tracked ticket number and response within 24 business hours.
              </p>

              {successData && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span>Inquiry Registered: {successData.inquiryNumber}</span>
                  </div>
                  <p className="text-xs mt-1.5 text-emerald-700 dark:text-emerald-300">
                    {successData.message}
                  </p>
                </div>
              )}

              {errorMsg && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name *"
                    required
                    placeholder="Aditya Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    leftIcon={<User className="w-4 h-4" />}
                  />
                  <Input
                    label="Business Email *"
                    type="email"
                    required
                    placeholder="aditya@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    leftIcon={<Mail className="w-4 h-4" />}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Phone / WhatsApp Number"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    leftIcon={<Phone className="w-4 h-4" />}
                  />
                  <Input
                    label="Company Name / Export House"
                    placeholder="Sharma Global Impex Ltd"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    leftIcon={<Building2 className="w-4 h-4" />}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#172033] dark:text-slate-200">
                      Inquiry Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full rounded-lg border border-[#E5EAF1] dark:border-[#243047] bg-white dark:bg-[#0F172A] px-3 py-2 text-sm text-[#172033] dark:text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="sales">Sales & Subscriptions</option>
                      <option value="custom_plan">Custom Plan / High Volume</option>
                      <option value="support">Technical Support</option>
                      <option value="partnership">Trade Partnership / Reseller</option>
                      <option value="general">General Inquiries</option>
                    </select>
                  </div>

                  <Input
                    label="Subject *"
                    required
                    placeholder="Need custom invoice template layout"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#172033] dark:text-slate-200">
                    Message Details *
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Describe your inquiry, estimated export shipment volume, or feature requirements..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full rounded-lg border border-[#E5EAF1] dark:border-[#243047] bg-white dark:bg-[#0F172A] p-3 text-sm text-[#172033] dark:text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400"
                  />
                </div>

                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={formData.consent}
                    onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="consent" className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed cursor-pointer">
                    I consent to ExportFlow processing my contact details for responding to this inquiry according to the{' '}
                    <a href="/privacy-policy" className="text-blue-600 dark:text-blue-400 underline">Privacy Policy</a>.
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto px-8 mt-2 gap-2"
                  isLoading={isLoading}
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Inquiry</span>
                </Button>
              </form>
            </div>
          </div>

          {/* Right Col: Info Cards */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#131B2A] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Official Support Channels
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Direct Email</span>
                    <a href="mailto:info@benzwell.in" className="font-bold text-slate-900 dark:text-white hover:text-blue-600">
                      info@benzwell.in
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Operating Hours</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      Mon – Sat: 9:00 AM – 7:00 PM IST
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Emergency trade dispatch support 24/7</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Platform Management</span>
                    <span className="font-bold text-slate-900 dark:text-white">BENZWELL Technologies</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">India</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900 to-[#10243A] text-white rounded-2xl p-6 shadow-md space-y-3">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                <span>Enterprise SLA</span>
              </div>
              <h4 className="text-base font-bold">Custom Integrations for Export Houses</h4>
              <p className="text-xs text-blue-200 leading-relaxed">
                Need automated sync with your ERP (SAP, Tally, Zoho Books, Microsoft Dynamics) or custom ICEGATE / customs broker formatting? Contact us for dedicated integration options.
              </p>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
