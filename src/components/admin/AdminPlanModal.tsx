'use client';

import React, { useState } from 'react';
import {
  X,
  Shield,
  CreditCard,
  Sparkles,
  Zap,
  Check,
  Building2,
  Calendar,
  Settings2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface AdminPlanModalProps {
  organizationId: string;
  organizationName: string;
  currentPlanId?: string;
  currentStatus?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminPlanModal({
  organizationId,
  organizationName,
  currentPlanId = 'free',
  currentStatus = 'active',
  isOpen,
  onClose,
  onSuccess,
}: AdminPlanModalProps) {
  const [selectedPlan, setSelectedPlan] = useState(currentPlanId);
  const [status, setStatus] = useState(currentStatus);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [extendTrialDays, setExtendTrialDays] = useState(0);

  // Custom limits fields
  const [customMaxClients, setCustomMaxClients] = useState(150);
  const [customQuotes, setCustomQuotes] = useState(500);
  const [customPIs, setCustomPIs] = useState(300);
  const [customAiMessages, setCustomAiMessages] = useState(1000);
  const [customTeamMembers, setCustomTeamMembers] = useState(20);
  const [customWhiteLabel, setCustomWhiteLabel] = useState(true);
  const [customApiAccess, setCustomApiAccess] = useState(true);
  const [customPriceInr, setCustomPriceInr] = useState(5999);

  // Direct Credit Grant (without payment)
  const [grantQuotes, setGrantQuotes] = useState(0);
  const [grantPIs, setGrantPIs] = useState(0);
  const [grantAiMessages, setGrantAiMessages] = useState(0);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload: any = {
        organizationId,
        planId: selectedPlan,
        status,
        billingCycle,
        extendTrialDays: Number(extendTrialDays) || 0,
      };

      if (selectedPlan === 'cha_custom') {
        payload.customLimits = {
          maxClients: Number(customMaxClients),
          quotations: Number(customQuotes),
          proformaInvoices: Number(customPIs),
          aiMessages: Number(customAiMessages),
          teamMembersLimit: Number(customTeamMembers),
          hasWhiteLabel: customWhiteLabel,
          hasApiAccess: customApiAccess,
          customPriceInr: Number(customPriceInr),
        };
      }

      if (grantQuotes > 0 || grantPIs > 0 || grantAiMessages > 0) {
        payload.grantCredits = {
          quotations: Number(grantQuotes),
          proformaInvoices: Number(grantPIs),
          aiMessages: Number(grantAiMessages),
        };
      }

      const res = await fetch('/api/admin/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update subscription');
      }

      alert(`Plan successfully updated to "${selectedPlan}" for ${organizationName}!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error updating subscription');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl text-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Manage Plan & Quotas (Super Admin Override)</h2>
              <p className="text-xs text-slate-400">Target Tenant: <strong className="text-amber-400">{organizationName}</strong></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300">
              {error}
            </div>
          )}

          {/* Plan Selector */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300 block">Select Subscription Plan</label>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-medium focus:border-amber-500 outline-hidden"
            >
              <optgroup label="Exporter Plans">
                <option value="free">Exporter Free Plan (₹0)</option>
                <option value="starter">Exporter Starter (₹299/mo)</option>
                <option value="professional">Exporter Professional (₹599/mo)</option>
                <option value="business">Exporter Business (₹1,199/mo)</option>
              </optgroup>
              <optgroup label="CHA Agent Special Plans">
                <option value="cha_starter">CHA Starter (5 clients, ₹999/mo)</option>
                <option value="cha_professional">CHA Professional (25 clients, ₹1,999/mo)</option>
                <option value="cha_enterprise">CHA Enterprise (100 clients, ₹3,999/mo)</option>
                <option value="cha_custom">⚡ CHA Custom Plan (Bespoke Quotas)</option>
              </optgroup>
            </select>
          </div>

          {/* Status & Billing Cycle */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-hidden"
              >
                <option value="active">Active (Paid / Active)</option>
                <option value="trial">3-Day Free Trial</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Billing Cycle</label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-hidden"
              >
                <option value="monthly">Monthly</option>
                <option value="annual">Annual (~17% discount)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Extend Trial (Days)</label>
              <Input
                type="number"
                min="0"
                value={extendTrialDays}
                onChange={(e) => setExtendTrialDays(Number(e.target.value))}
                placeholder="e.g. 7"
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>
          </div>

          {/* Custom Plan Builder Section (When cha_custom is selected) */}
          {selectedPlan === 'cha_custom' && (
            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-4">
              <div className="flex items-center gap-2 text-purple-400 font-bold">
                <Settings2 className="w-4 h-4" />
                <span>CHA Custom Plan Limits Builder</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Max Exporter Clients</label>
                  <Input
                    type="number"
                    value={customMaxClients}
                    onChange={(e) => setCustomMaxClients(Number(e.target.value))}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Monthly Quotes</label>
                  <Input
                    type="number"
                    value={customQuotes}
                    onChange={(e) => setCustomQuotes(Number(e.target.value))}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Monthly PIs</label>
                  <Input
                    type="number"
                    value={customPIs}
                    onChange={(e) => setCustomPIs(Number(e.target.value))}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">AI Messages Limit</label>
                  <Input
                    type="number"
                    value={customAiMessages}
                    onChange={(e) => setCustomAiMessages(Number(e.target.value))}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Team Members Limit</label>
                  <Input
                    type="number"
                    value={customTeamMembers}
                    onChange={(e) => setCustomTeamMembers(Number(e.target.value))}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Agreed Price (₹/mo)</label>
                  <Input
                    type="number"
                    value={customPriceInr}
                    onChange={(e) => setCustomPriceInr(Number(e.target.value))}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customWhiteLabel}
                    onChange={(e) => setCustomWhiteLabel(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700"
                  />
                  <span>Enable White-label Branding</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customApiAccess}
                    onChange={(e) => setCustomApiAccess(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700"
                  />
                  <span>Enable Developer API Access</span>
                </label>
              </div>
            </div>
          )}

          {/* Instant Credit Grant Section */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Zap className="w-4 h-4" />
              <span>Instant Credit Grant (No Payment Required)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Directly inject bonus credits into this tenant&apos;s wallet immediately without charging them.
            </p>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">+ Quotes</label>
                <Input
                  type="number"
                  min="0"
                  value={grantQuotes}
                  onChange={(e) => setGrantQuotes(Number(e.target.value))}
                  placeholder="0"
                  className="bg-slate-900 border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">+ PIs</label>
                <Input
                  type="number"
                  min="0"
                  value={grantPIs}
                  onChange={(e) => setGrantPIs(Number(e.target.value))}
                  placeholder="0"
                  className="bg-slate-900 border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">+ AI Messages</label>
                <Input
                  type="number"
                  min="0"
                  value={grantAiMessages}
                  onChange={(e) => setGrantAiMessages(Number(e.target.value))}
                  placeholder="0"
                  className="bg-slate-900 border-slate-800 text-white"
                />
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
            >
              {saving ? 'Applying Override...' : 'Apply Plan & Credit Overrides'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
