'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Ship, ArrowLeft, ArrowRight, Building2, FileText, Anchor, DollarSign, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ChaClient } from '@/types';

interface NewJobClientFormProps {
  clients: ChaClient[];
  initialJobType?: string;
  initialClientId?: string;
}

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
];

export function NewJobClientForm({
  clients,
  initialJobType = 'import',
  initialClientId = '',
}: NewJobClientFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    clientId: initialClientId || (clients[0]?.id || ''),
    jobType: initialJobType,
    customsStation: CUSTOMS_PORTS[0],
    customsHouseCode: 'INNSA1',
    billOfEntryNumber: '',
    billOfEntryDate: '',
    shippingBillNumber: '',
    shippingBillDate: '',
    blAwbNumber: '',
    blAwbDate: '',
    invoiceNumber: '',
    invoiceValue: '',
    currency: 'USD',
    totalPackages: '',
    grossWeightKg: '',
    portOfLoading: '',
    portOfDischarge: '',
    goodsDescription: '',
    hsCodes: '',
    estimatedDutyInr: '',
    chaChargesInr: '8500',
    notes: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) {
      setError('Please select an exporter client or enroll one first.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        invoiceValue: formData.invoiceValue ? parseFloat(formData.invoiceValue) : undefined,
        totalPackages: formData.totalPackages ? parseInt(formData.totalPackages, 10) : undefined,
        grossWeightKg: formData.grossWeightKg ? parseFloat(formData.grossWeightKg) : undefined,
        estimatedDutyInr: formData.estimatedDutyInr ? parseFloat(formData.estimatedDutyInr) : undefined,
        chaChargesInr: formData.chaChargesInr ? parseFloat(formData.chaChargesInr) : undefined,
        hsCodes: formData.hsCodes ? formData.hsCodes.split(',').map((h) => h.trim()) : [],
      };

      const res = await fetch('/api/cha/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create customs job');
      }

      router.push(`/cha/dashboard/jobs/${data.job.id}`);
    } catch (err: any) {
      setError(err.message || 'Error creating job');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top back nav */}
      <div className="flex items-center gap-3">
        <Link
          href="/cha/dashboard/jobs"
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Open New Customs Clearance Job</h1>
          <p className="text-xs text-slate-400">Initialize document tracking, ICEGATE references and checklists</p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 md:p-8">
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client & Job Classification */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Building2 className="w-4 h-4" /> Client & Clearance Type
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Exporter Client <span className="text-rose-400">*</span>
                </label>
                {clients.length === 0 ? (
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                    <span>No clients found</span>
                    <Link
                      href="/cha/dashboard/clients/new"
                      className="text-amber-400 font-bold hover:underline"
                    >
                      + Add Client First
                    </Link>
                  </div>
                ) : (
                  <select
                    name="clientId"
                    value={formData.clientId}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id} className="bg-slate-950 text-slate-200">
                        {c.companyName} (IEC: {c.iecNumber})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Customs Job Operation <span className="text-rose-400">*</span>
                </label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="import">Import Clearance (Bill of Entry)</option>
                  <option value="export">Export Clearance (Shipping Bill)</option>
                  <option value="re_export">Re-export Clearance</option>
                  <option value="transshipment">Transshipment / Bond Movement</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Customs Port / Station <span className="text-rose-400">*</span>
                </label>
                <select
                  name="customsStation"
                  value={formData.customsStation}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {CUSTOMS_PORTS.map((p) => (
                    <option key={p} value={p} className="bg-slate-950 text-slate-200">
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {formData.jobType === 'import' ? (
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Bill of Entry (BoE) No."
                    name="billOfEntryNumber"
                    placeholder="e.g. 7891234"
                    value={formData.billOfEntryNumber}
                    onChange={handleChange}
                    className="bg-slate-950 border-slate-800 text-white font-mono placeholder:text-slate-500"
                  />
                  <Input
                    label="BoE Filing Date"
                    name="billOfEntryDate"
                    type="date"
                    value={formData.billOfEntryDate}
                    onChange={handleChange}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Shipping Bill (SB) No."
                    name="shippingBillNumber"
                    placeholder="e.g. 9812456"
                    value={formData.shippingBillNumber}
                    onChange={handleChange}
                    className="bg-slate-950 border-slate-800 text-white font-mono placeholder:text-slate-500"
                  />
                  <Input
                    label="SB Filing Date"
                    name="shippingBillDate"
                    type="date"
                    value={formData.shippingBillDate}
                    onChange={handleChange}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Transport & Shipping Details */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Anchor className="w-4 h-4" /> Transport & Consignment
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="BL / Airway Bill No."
                name="blAwbNumber"
                placeholder="e.g. MAEU987654321"
                value={formData.blAwbNumber}
                onChange={handleChange}
                className="bg-slate-950 border-slate-800 text-white font-mono placeholder:text-slate-500"
              />

              <Input
                label="Port of Loading"
                name="portOfLoading"
                placeholder="e.g. Shanghai / Jebel Ali"
                value={formData.portOfLoading}
                onChange={handleChange}
                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
              />

              <Input
                label="Port of Discharge"
                name="portOfDischarge"
                placeholder="e.g. Nhava Sheva (INNSA1)"
                value={formData.portOfDischarge}
                onChange={handleChange}
                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                label="Invoice Number"
                name="invoiceNumber"
                placeholder="e.g. INV-2026-09"
                value={formData.invoiceNumber}
                onChange={handleChange}
                className="bg-slate-950 border-slate-800 text-white font-mono placeholder:text-slate-500"
              />

              <Input
                label="Invoice Value"
                name="invoiceValue"
                type="number"
                placeholder="e.g. 45000"
                value={formData.invoiceValue}
                onChange={handleChange}
                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
              />

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Currency</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AED">AED (د.إ)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>

              <Input
                label="Gross Weight (KG)"
                name="grossWeightKg"
                type="number"
                placeholder="e.g. 12500"
                value={formData.grossWeightKg}
                onChange={handleChange}
                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Goods Description"
                name="goodsDescription"
                placeholder="e.g. Stainless Steel Valves and Flanges"
                value={formData.goodsDescription}
                onChange={handleChange}
                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
              />

              <Input
                label="HS Tariff Codes (comma separated)"
                name="hsCodes"
                placeholder="e.g. 8481.80.30, 7307.21.00"
                value={formData.hsCodes}
                onChange={handleChange}
                className="bg-slate-950 border-slate-800 text-white font-mono placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Agency & Duty Estimate */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" /> Duty & Agency Charges
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Estimated Duty (INR)"
                name="estimatedDutyInr"
                type="number"
                placeholder="Customs duty estimate"
                value={formData.estimatedDutyInr}
                onChange={handleChange}
                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
              />

              <Input
                label="Agreed CHA Agency Charges (INR)"
                name="chaChargesInr"
                type="number"
                placeholder="e.g. 8500"
                value={formData.chaChargesInr}
                onChange={handleChange}
                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Filing Notes & Special Instructions
              </label>
              <textarea
                name="notes"
                rows={3}
                placeholder="Prior BE filing, DPD cargo, special bond execution or concession notification numbers..."
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <Link href="/cha/dashboard/jobs">
              <Button type="button" variant="outline" className="border-slate-800 text-slate-300 hover:bg-slate-800 text-xs">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border-0 text-xs px-5 py-2.5"
              isLoading={isLoading}
            >
              Open Job & Initialize Checklist
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
