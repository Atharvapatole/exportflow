'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  ExternalLink,
  Key,
  Lock,
  RefreshCw,
  Clock,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RazorpayWebhookEvent, RazorpayPaymentLog } from '@/types';

const RECOMMENDED_EVENTS = [
  'order.paid',
  'payment.authorized',
  'payment.captured',
  'payment.failed',
  'refund.created',
  'refund.processed',
  'refund.failed',
  'subscription.activated',
  'subscription.charged',
  'subscription.halted',
  'subscription.cancelled',
  'subscription.completed',
];

export default function RazorpayAdminPage() {
  const [config, setConfig] = useState<any>(null);
  const [webhookEvents, setWebhookEvents] = useState<RazorpayWebhookEvent[]>([]);
  const [paymentLogs, setPaymentLogs] = useState<RazorpayPaymentLog[]>([]);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedEvents, setCopiedEvents] = useState(false);

  // Form State
  const [mode, setMode] = useState<'test' | 'live'>('test');
  const [isEnabled, setIsEnabled] = useState(false);
  const [merchantDisplayName, setMerchantDisplayName] = useState('ExportFlow by BENZWELL');
  const [merchantSupportEmail, setMerchantSupportEmail] = useState('info@benzwell.in');

  const [testKeyId, setTestKeyId] = useState('');
  const [testKeySecret, setTestKeySecret] = useState('');
  const [testWebhookSecret, setTestWebhookSecret] = useState('');

  const [liveKeyId, setLiveKeyId] = useState('');
  const [liveKeySecret, setLiveKeySecret] = useState('');
  const [liveWebhookSecret, setLiveWebhookSecret] = useState('');

  // Test Connection
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latency?: number } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/payments/razorpay');
      if (!res.ok) throw new Error('Failed to load Razorpay settings');
      const data = await res.json();
      setConfig(data.config);
      setWebhookEvents(data.webhookEvents || []);
      setPaymentLogs(data.paymentLogs || []);
      setWebhookUrl(data.webhookUrl || '');

      setMode(data.config.mode || 'test');
      setIsEnabled(data.config.isEnabled || false);
      setMerchantDisplayName(data.config.merchantDisplayName || 'ExportFlow by BENZWELL');
      setMerchantSupportEmail(data.config.merchantSupportEmail || 'info@benzwell.in');

      setTestKeyId(data.config.testKeyId || '');
      setTestKeySecret(data.config.testKeySecretMasked || '');
      setTestWebhookSecret(data.config.testWebhookSecretMasked || '');

      setLiveKeyId(data.config.liveKeyId || '');
      setLiveKeySecret(data.config.liveKeySecretMasked || '');
      setLiveWebhookSecret(data.config.liveWebhookSecretMasked || '');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error loading Razorpay configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage('');

    try {
      const payload: any = {
        isEnabled,
        mode,
        merchantDisplayName,
        merchantSupportEmail,
        testKeyId,
        testKeySecret: testKeySecret.includes('••••') ? undefined : testKeySecret,
        testWebhookSecret: testWebhookSecret.includes('••••') ? undefined : testWebhookSecret,
        liveKeyId,
        liveKeySecret: liveKeySecret.includes('••••') ? undefined : liveKeySecret,
        liveWebhookSecret: liveWebhookSecret.includes('••••') ? undefined : liveWebhookSecret,
      };

      const res = await fetch('/api/admin/payments/razorpay', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save configuration');

      setConfig(data.config);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const activeKey = mode === 'live' ? liveKeyId : testKeyId;
      const activeSecret = mode === 'live' ? liveKeySecret : testKeySecret;

      const res = await fetch('/api/admin/payments/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          keyId: activeKey.includes('••••') ? undefined : activeKey,
          keySecret: activeSecret.includes('••••') ? undefined : activeSecret,
        }),
      });

      const data = await res.json();
      setTestResult({
        success: data.success,
        message: data.message,
        latency: data.latencyMs,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Network error during connection test',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const copyToClipboard = (text: string, type: 'url' | 'events') => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } else {
      setCopiedEvents(true);
      setTimeout(() => setCopiedEvents(false), 2500);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
          <span>Loading Razorpay Payment Configuration...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-white tracking-tight">Razorpay Payment Gateway</h1>
            <span
              className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                isEnabled && config?.status === 'active'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}
            >
              {isEnabled && config?.status === 'active' ? 'Gateway Active' : 'Gateway Disabled / Inactive'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure test and live Razorpay credentials, webhook secret, and document credit fulfillment.
          </p>
        </div>

        {/* Mode Indicator */}
        <div className="flex items-center gap-2 bg-[#0D1826] border border-slate-800 rounded-xl px-4 py-2 text-xs">
          <span className="text-slate-400 font-semibold">Active Mode:</span>
          <span
            className={`font-black uppercase px-2 py-0.5 rounded text-[11px] ${
              mode === 'live'
                ? 'bg-emerald-500 text-slate-950 shadow-xs shadow-emerald-500/50'
                : 'bg-amber-500 text-slate-950 shadow-xs shadow-amber-500/50'
            }`}
          >
            {mode} Mode
          </span>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-600/40 text-emerald-400 text-xs flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>Razorpay settings saved successfully. Secret keys securely encrypted server-side!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-600/40 text-rose-400 text-xs flex items-center gap-2.5">
          <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* ========================================================================= */}
        {/* 1. GENERAL GATEWAY SETTINGS & MODE TOGGLE */}
        {/* ========================================================================= */}
        <div className="bg-[#0B1524] rounded-2xl border border-slate-800 p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-400" />
                Gateway Operation Mode
              </h2>
              <p className="text-xs text-slate-400">Choose between sandbox test transactions and real live customer billing.</p>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-200">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => setIsEnabled(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span>Enable Payment Gateway</span>
              </label>

              <div className="flex rounded-lg bg-[#060D17] border border-slate-800 p-1">
                <button
                  type="button"
                  onClick={() => setMode('test')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    mode === 'test' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Test Mode
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (mode !== 'live') {
                      if (confirm('Switch to LIVE Mode? Ensure your Live Key ID and Secret are configured and verified. Real money will be charged.')) {
                        setMode('live');
                      }
                    }
                  }}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    mode === 'live' ? 'bg-emerald-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Live Mode
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200">Merchant Display Name</label>
              <Input
                type="text"
                placeholder="ExportFlow by BENZWELL"
                value={merchantDisplayName}
                onChange={(e) => setMerchantDisplayName(e.target.value)}
                className="bg-[#060D17] border-slate-700 text-slate-100 text-xs"
              />
              <p className="text-[11px] text-slate-500">Visible to customer on Razorpay Checkout pop-up window.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200">Merchant Support Email</label>
              <Input
                type="email"
                placeholder="info@benzwell.in"
                value={merchantSupportEmail}
                onChange={(e) => setMerchantSupportEmail(e.target.value)}
                className="bg-[#060D17] border-slate-700 text-slate-100 text-xs"
              />
              <p className="text-[11px] text-slate-500">Official business contact displayed on receipts and dispute inquiries.</p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. TEST MODE CREDENTIALS */}
        {/* ========================================================================= */}
        <div className={`bg-[#0B1524] rounded-2xl border ${mode === 'test' ? 'border-amber-500/40 shadow-lg shadow-amber-950/20' : 'border-slate-800 opacity-70'} p-6 space-y-4`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <h3 className="text-sm font-bold text-white">Test Mode Credentials (Sandbox)</h3>
            </div>
            {mode === 'test' && (
              <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-bold uppercase">
                Currently Active
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Test API Key ID</label>
              <Input
                type="text"
                placeholder="rzp_test_••••••••"
                value={testKeyId}
                onChange={(e) => setTestKeyId(e.target.value)}
                className="bg-[#060D17] border-slate-700 text-slate-100 font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Test API Secret Key</label>
              <Input
                type="password"
                placeholder="••••••••••••••••"
                value={testKeySecret}
                onChange={(e) => setTestKeySecret(e.target.value)}
                className="bg-[#060D17] border-slate-700 text-slate-100 font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Test Webhook Secret</label>
              <Input
                type="password"
                placeholder="••••••••••••••••"
                value={testWebhookSecret}
                onChange={(e) => setTestWebhookSecret(e.target.value)}
                className="bg-[#060D17] border-slate-700 text-slate-100 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. LIVE MODE CREDENTIALS */}
        {/* ========================================================================= */}
        <div className={`bg-[#0B1524] rounded-2xl border ${mode === 'live' ? 'border-emerald-500/40 shadow-lg shadow-emerald-950/20' : 'border-slate-800 opacity-70'} p-6 space-y-4`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <h3 className="text-sm font-bold text-white">Live Mode Credentials (Production Payments)</h3>
            </div>
            {mode === 'live' && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold uppercase">
                Currently Active
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Live API Key ID</label>
              <Input
                type="text"
                placeholder="rzp_live_••••••••"
                value={liveKeyId}
                onChange={(e) => setLiveKeyId(e.target.value)}
                className="bg-[#060D17] border-slate-700 text-slate-100 font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Live API Secret Key</label>
              <Input
                type="password"
                placeholder="••••••••••••••••"
                value={liveKeySecret}
                onChange={(e) => setLiveKeySecret(e.target.value)}
                className="bg-[#060D17] border-slate-700 text-slate-100 font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Live Webhook Secret</label>
              <Input
                type="password"
                placeholder="••••••••••••••••"
                value={liveWebhookSecret}
                onChange={(e) => setLiveWebhookSecret(e.target.value)}
                className="bg-[#060D17] border-slate-700 text-slate-100 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CONNECTION TEST & SAVE ACTIONS */}
        {/* ========================================================================= */}
        <div className="bg-[#0B1524] rounded-2xl border border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
              isLoading={isTesting}
              className="border-slate-700 hover:bg-slate-800 text-slate-200 text-xs"
            >
              <Zap className="w-4 h-4 mr-1.5 text-amber-400" />
              Test {mode.toUpperCase()} Connection
            </Button>

            {config?.lastSuccessfulConnection && (
              <span className="text-[11px] text-slate-500">
                Last Connected:{' '}
                <strong className="text-slate-300 font-mono">
                  {new Date(config.lastSuccessfulConnection).toLocaleString()}
                </strong>
              </span>
            )}
          </div>

          <Button type="submit" variant="secondary" isLoading={isSaving} className="px-6 py-2.5 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 mr-1.5" />
            Save & Update Credentials
          </Button>
        </div>

        {testResult && (
          <div
            className={`p-4 rounded-xl border text-xs flex items-center gap-2.5 animate-in fade-in ${
              testResult.success
                ? 'bg-emerald-950/30 border-emerald-600/40 text-emerald-300'
                : 'bg-rose-950/30 border-rose-600/40 text-rose-300'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}
      </form>

      {/* ========================================================================= */}
      {/* 4. WEBHOOK SETUP & VERIFICATION */}
      {/* ========================================================================= */}
      <div className="bg-[#0B1524] rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Production Webhook Endpoint
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Razorpay sends real-time signed HTTP POST events to this URL to trigger credit allocation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                config?.webhookStatus === 'verified'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {config?.webhookStatus === 'verified' ? '✓ Webhook Verified' : 'Unverified (Awaiting First Signed Event)'}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Public Webhook URL</label>
            <div className="flex gap-2">
              <Input
                type="text"
                readOnly
                value={webhookUrl}
                className="bg-[#060D17] border-slate-700 text-slate-100 font-mono text-xs select-all"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => copyToClipboard(webhookUrl, 'url')}
                className="border-slate-700 text-xs shrink-0"
              >
                <Copy className="w-3.5 h-3.5 mr-1.5" />
                {copiedUrl ? 'Copied!' : 'Copy URL'}
              </Button>
            </div>
            <p className="text-[11px] text-slate-500">
              Note: Webhook endpoint must be publicly accessible over HTTPS. In local dev, use an HTTPS tunnel (e.g. ngrok).
            </p>
          </div>

          {/* Webhook Status Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-[#060D17] border border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-500 text-[10px] block">Webhook Status</span>
              <span className="font-bold text-white capitalize">{config?.webhookStatus || 'Unverified'}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Last Received</span>
              <span className="font-mono text-slate-300 text-[11px]">
                {config?.lastReceivedWebhook ? new Date(config.lastReceivedWebhook).toLocaleTimeString() : 'None yet'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Last Successful</span>
              <span className="font-mono text-emerald-400 text-[11px]">
                {config?.lastSuccessfulWebhook ? new Date(config.lastSuccessfulWebhook).toLocaleTimeString() : 'None yet'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Failed Webhooks</span>
              <span className="font-mono text-rose-400 font-bold">{config?.failedWebhookCount || 0}</span>
            </div>
          </div>

          {/* Step by step setup guide */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
              Step-by-Step Razorpay Webhook Configuration Guide
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-400 leading-relaxed pl-1">
              <li>Log in to your <strong>Razorpay Dashboard</strong> (test or live mode).</li>
              <li>Navigate to <strong>Account & Settings → Webhooks</strong> in the left navigation.</li>
              <li>Click <strong>+ Add New Webhook</strong>.</li>
              <li>Paste the <strong>Public Webhook URL</strong> copied above into the Webhook URL field.</li>
              <li>Generate or create a separate random <strong>Webhook Secret</strong>.</li>
              <li>Enter that exact secret into the <strong>Webhook Secret</strong> field in ExportFlow above and save.</li>
              <li>Select the required payment events (see checklist below).</li>
              <li>Click <strong>Save Webhook</strong> in Razorpay.</li>
              <li>Perform a test checkout or trigger a test event in the Razorpay Dashboard.</li>
              <li>ExportFlow will automatically verify the signature and mark the status as <strong>Verified</strong>.</li>
            </ol>
          </div>

          {/* Recommended Events Checklist */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Required Payment & Subscription Events</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(RECOMMENDED_EVENTS.join('\n'), 'events')}
                className="text-xs border-slate-700"
              >
                <Copy className="w-3.5 h-3.5 mr-1" />
                {copiedEvents ? 'Copied List!' : 'Copy Recommended Event Names'}
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {RECOMMENDED_EVENTS.map((ev) => (
                <div key={ev} className="flex items-center gap-2 p-2 rounded bg-[#060D17] border border-slate-800/80 font-mono text-[11px] text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{ev}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. RECENT PAYMENT AUDIT LOGS */}
      {/* ========================================================================= */}
      <div className="bg-[#0B1524] rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Recent Payment Transactions & Credit Grants
            </h2>
            <p className="text-xs text-slate-400">Order verification records and credit wallet fulfillment logs.</p>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Last 20 Transactions</span>
        </div>

        {paymentLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No payment records found yet. Real-time transactions will appear here upon customer checkout.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#070E18] text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Order ID</th>
                  <th className="py-2.5 px-4">Item</th>
                  <th className="py-2.5 px-4">Amount</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Credits Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {paymentLogs.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-blue-300 text-[11px]">{p.orderId}</td>
                    <td className="py-2.5 px-4 font-medium">{p.description}</td>
                    <td className="py-2.5 px-4 font-bold text-white">₹{p.amount}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                          p.status === 'captured'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : p.status === 'failed'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-400 text-[11px]">
                      {p.creditsAdded
                        ? `${p.creditsAdded.quotations} Quotes, ${p.creditsAdded.proformaInvoices} PIs`
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
