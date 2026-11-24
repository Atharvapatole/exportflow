'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Cpu,
  Key,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Layers,
  ArrowRight,
  ExternalLink,
  Search,
  Zap,
  Lock,
  Sliders,
  Server,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { OpenRouterModelInfo, AiUsageLog } from '@/types';
import { OPENROUTER_FREE_ROUTER_ID } from '@/lib/ai/openrouterService';

export default function AdminAiSettingsPage() {
  const [config, setConfig] = useState<any>(null);
  const [usageLogs, setUsageLogs] = useState<AiUsageLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [openRouterKey, setOpenRouterKey] = useState('');
  const [openRouterModelMode, setOpenRouterModelMode] = useState<'auto_free' | 'specific_free'>('auto_free');
  const [openRouterModel, setOpenRouterModel] = useState(OPENROUTER_FREE_ROUTER_ID);
  const [openRouterEnabled, setOpenRouterEnabled] = useState(true);

  const [groqKey, setGroqKey] = useState('');
  const [groqModel, setGroqModel] = useState('llama-3.3-70b-versatile');
  const [groqEnabled, setGroqEnabled] = useState(true);

  const [geminiKey, setGeminiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-2.0-flash');
  const [geminiEnabled, setGeminiEnabled] = useState(true);

  const [requestTimeout, setRequestTimeout] = useState(30000);
  const [maxRetries, setMaxRetries] = useState(2);
  const [isAiEnabled, setIsAiEnabled] = useState(true);

  // Model Discovery State
  const [availableModels, setAvailableModels] = useState<OpenRouterModelInfo[]>([]);
  const [isRefreshingModels, setIsRefreshingModels] = useState(false);
  const [modelSearch, setModelSearch] = useState('');
  const [modelRefreshMessage, setModelRefreshMessage] = useState('');

  // Connection Test States
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string; latency?: number }>>({});

  useEffect(() => {
    loadAiConfig();
  }, []);

  const loadAiConfig = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/ai');
      if (!res.ok) throw new Error('Failed to load AI configuration');
      const data = await res.json();
      setConfig(data.config);
      setUsageLogs(data.usageLogs || []);

      // Populate form
      setIsAiEnabled(data.config.isEnabled !== false);
      setOpenRouterEnabled(data.config.openrouterIsEnabled !== false);
      setOpenRouterModelMode(data.config.openrouterModelMode || 'auto_free');
      setOpenRouterModel(data.config.openrouterModel || OPENROUTER_FREE_ROUTER_ID);
      setOpenRouterKey(data.config.openrouterApiKeyMasked || '');

      setGroqEnabled(data.config.groqIsEnabled !== false);
      setGroqModel(data.config.groqModel || 'llama-3.3-70b-versatile');
      setGroqKey(data.config.groqApiKeyMasked || '');

      setGeminiEnabled(data.config.geminiIsEnabled !== false);
      setGeminiModel(data.config.geminiModel || 'gemini-2.0-flash');
      setGeminiKey(data.config.geminiApiKeyMasked || '');

      setRequestTimeout(data.config.requestTimeout || 30000);
      setMaxRetries(data.config.maxRetries || 2);

      if (Array.isArray(data.config.openrouterAvailableModels)) {
        setAvailableModels(data.config.openrouterAvailableModels);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error loading AI configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage('');

    try {
      const payload: any = {
        isEnabled: isAiEnabled,
        primaryProvider: 'openrouter',
        backupProvider1: 'groq',
        backupProvider2: 'gemini',
        openrouterIsEnabled: openRouterEnabled,
        openrouterModel: openRouterModelMode === 'auto_free' ? OPENROUTER_FREE_ROUTER_ID : openRouterModel,
        openrouterModelMode: openRouterModelMode,
        groqIsEnabled: groqEnabled,
        groqModel,
        geminiIsEnabled: geminiEnabled,
        geminiModel,
        requestTimeout,
        maxRetries,
      };

      // Only send keys if changed/new
      if (openRouterKey && !openRouterKey.includes('••••')) {
        payload.openrouterApiKey = openRouterKey;
      }
      if (groqKey && !groqKey.includes('••••')) {
        payload.groqApiKey = groqKey;
      }
      if (geminiKey && !geminiKey.includes('••••')) {
        payload.geminiApiKey = geminiKey;
      }

      const res = await fetch('/api/admin/ai', {
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
      setErrorMessage(err.message || 'Error saving AI configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefreshModels = async () => {
    setIsRefreshingModels(true);
    setModelRefreshMessage('');
    try {
      const res = await fetch('/api/admin/ai/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: openRouterKey.includes('••••') ? undefined : openRouterKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to refresh models from OpenRouter');

      setAvailableModels(data.models || []);
      setModelRefreshMessage(`Discovered ${data.models?.length || 0} free models from OpenRouter.`);
      setTimeout(() => setModelRefreshMessage(''), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to fetch free models');
    } finally {
      setIsRefreshingModels(false);
    }
  };

  const handleTestConnection = async (provider: 'openrouter' | 'groq' | 'gemini', modelToTest: string) => {
    setTestingProvider(provider);
    try {
      let keyToPass: string | undefined = undefined;
      if (provider === 'openrouter') {
        keyToPass = openRouterKey.includes('••••') ? undefined : openRouterKey;
      } else if (provider === 'groq') {
        keyToPass = groqKey.includes('••••') ? undefined : groqKey;
      } else if (provider === 'gemini') {
        keyToPass = geminiKey.includes('••••') ? undefined : geminiKey;
      }

      const res = await fetch('/api/admin/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          model: modelToTest,
          apiKey: keyToPass,
        }),
      });

      const data = await res.json();
      setTestResults((prev) => ({
        ...prev,
        [provider]: {
          success: data.success,
          message: data.message,
          latency: data.latencyMs,
        },
      }));
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [provider]: {
          success: false,
          message: err.message || 'Network error during test',
        },
      }));
    } finally {
      setTestingProvider(null);
    }
  };

  const filteredFreeModels = availableModels.filter(
    (m) =>
      m.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
      m.id.toLowerCase().includes(modelSearch.toLowerCase()) ||
      (m.description && m.description.toLowerCase().includes(modelSearch.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-amber-500" />
          <span>Loading Super Admin AI Configuration...</span>
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
            <h1 className="text-xl font-bold text-white tracking-tight">AI Engine & Multi-Provider Priority</h1>
            <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-bold">
              Root Protected
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure OpenRouter as primary AI engine with automatic free model discovery, plus Groq and Gemini fallbacks.
          </p>
        </div>

        {/* Priority Banner */}
        <div className="bg-[#0D1826] border border-blue-500/30 rounded-xl px-4 py-2.5 flex items-center gap-3 text-xs">
          <span className="text-slate-400 font-semibold">Active Fallback Chain:</span>
          <div className="flex items-center gap-2 font-mono font-bold">
            <span className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">
              1. OpenRouter (Primary)
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              2. Groq (Backup 1)
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              3. Gemini (Backup 2)
            </span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-600/40 text-emerald-400 text-xs flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>AI Provider Configuration updated and persisted securely on server!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-600/40 text-rose-400 text-xs flex items-center gap-2.5">
          <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSaveConfig} className="space-y-6">
        {/* ========================================================================= */}
        {/* CARD 1: OPENROUTER (PRIMARY PROVIDER) */}
        {/* ========================================================================= */}
        <div className="bg-[#0B1524] rounded-2xl border-2 border-blue-500/40 overflow-hidden shadow-lg shadow-blue-950/30">
          <div className="p-5 bg-gradient-to-r from-blue-950/40 to-slate-900 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white tracking-wide">Primary Provider: OpenRouter</h2>
                  <span className="text-[10px] bg-blue-600 text-white font-black px-2 py-0.5 rounded uppercase tracking-wider">
                    Tier 1 (Default)
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Dynamic routing with automatic free model discovery. Zero billable models used.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                <input
                  type="checkbox"
                  checked={openRouterEnabled}
                  onChange={(e) => setOpenRouterEnabled(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span>Enable OpenRouter</span>
              </label>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  handleTestConnection(
                    'openrouter',
                    openRouterModelMode === 'auto_free' ? OPENROUTER_FREE_ROUTER_ID : openRouterModel
                  )
                }
                isLoading={testingProvider === 'openrouter'}
                className="border-blue-500/40 hover:bg-blue-950/50 text-blue-300 text-xs"
              >
                <Zap className="w-3.5 h-3.5 mr-1 text-blue-400" />
                Test Connection
              </Button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* OpenRouter API Key Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-blue-400" />
                  <span>OpenRouter API Key</span>
                  {config?.hasOpenRouterKey && (
                    <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      ✓ Configured
                    </span>
                  )}
                </label>
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
                >
                  <span>Get OpenRouter API Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <Input
                type="password"
                placeholder="sk-or-v1-••••••••"
                value={openRouterKey}
                onChange={(e) => setOpenRouterKey(e.target.value)}
                className="bg-[#060D17] border-slate-700 text-slate-100 font-mono text-xs"
              />
              <p className="text-[11px] text-slate-500">
                Encrypted & stored strictly server-side. Never exposed to customer browsers or client bundles.
              </p>
            </div>

            {/* Model Selection Mode: Option A vs Option B */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-200 block">Model Selection Mode</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option A: Automatic Free Model */}
                <div
                  onClick={() => setOpenRouterModelMode('auto_free')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    openRouterModelMode === 'auto_free'
                      ? 'border-blue-500 bg-blue-950/20 shadow-md shadow-blue-950/40'
                      : 'border-slate-800 bg-[#08121E]/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      Option A: Automatic Free Model
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Uses <code className="text-blue-300 font-mono">openrouter/free</code>. OpenRouter automatically routes every request to an available free high-throughput chat model without manual intervention.
                  </p>
                </div>

                {/* Option B: Specific Free Model */}
                <div
                  onClick={() => setOpenRouterModelMode('specific_free')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    openRouterModelMode === 'specific_free'
                      ? 'border-blue-500 bg-blue-950/20 shadow-md shadow-blue-950/40'
                      : 'border-slate-800 bg-[#08121E]/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      Option B: Specific Verified Free Model
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded">
                      Manual Pick
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Choose an exact free model variant (e.g. Llama 3.3 70B, DeepSeek R1, Mistral). Never falls back to a paid model.
                  </p>
                </div>
              </div>
            </div>

            {/* Model Selector if Option B is active */}
            {openRouterModelMode === 'specific_free' && (
              <div className="space-y-2 p-4 rounded-xl bg-[#08121E] border border-slate-800 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200">Select Verified Free Model</label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {availableModels.length} Free Models Available
                  </span>
                </div>
                <Select
                  value={openRouterModel}
                  onChange={(e) => setOpenRouterModel(e.target.value)}
                  className="bg-[#060D17] border-slate-700 text-slate-100 text-xs"
                >
                  {availableModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.id}) {m.contextLength ? `— ${m.contextLength.toLocaleString()} tokens` : ''}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {/* Test Connection Result Banner */}
            {testResults['openrouter'] && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                  testResults['openrouter'].success
                    ? 'bg-emerald-950/30 border-emerald-600/40 text-emerald-300'
                    : 'bg-rose-950/30 border-rose-600/40 text-rose-300'
                }`}
              >
                {testResults['openrouter'].success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{testResults['openrouter'].message}</span>
              </div>
            )}

            {/* Status Footer */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
              <div className="flex items-center gap-4">
                <span>
                  Status:{' '}
                  <strong className={config?.hasOpenRouterKey ? 'text-emerald-400' : 'text-amber-400'}>
                    {config?.hasOpenRouterKey ? 'Configured & Active' : 'API Key Required'}
                  </strong>
                </span>
                {config?.openrouterLastSuccessfulConnection && (
                  <span>
                    Last Connected:{' '}
                    <strong className="text-slate-300 font-mono">
                      {new Date(config.openrouterLastSuccessfulConnection).toLocaleString()}
                    </strong>
                  </span>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRefreshModels}
                isLoading={isRefreshingModels}
                className="border-slate-700 hover:bg-slate-800 text-slate-300 text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Fetch / Refresh Free Models
              </Button>
            </div>

            {modelRefreshMessage && (
              <p className="text-[11px] text-emerald-400 font-semibold animate-in fade-in">
                {modelRefreshMessage}
              </p>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CARD 2: GROQ (BACKUP 1) */}
        {/* ========================================================================= */}
        <div className="bg-[#0B1524] rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-5 bg-gradient-to-r from-amber-950/30 to-slate-900 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white tracking-wide">Backup Provider 1: Groq</h2>
                  <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded uppercase tracking-wider">
                    Tier 2 (Fallback)
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Ultra-low latency LPU inference. Automatically invoked if OpenRouter fails.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                <input
                  type="checkbox"
                  checked={groqEnabled}
                  onChange={(e) => setGroqEnabled(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-400 w-4 h-4 cursor-pointer"
                />
                <span>Enable Groq Fallback</span>
              </label>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleTestConnection('groq', groqModel)}
                isLoading={testingProvider === 'groq'}
                className="border-amber-500/40 hover:bg-amber-950/50 text-amber-300 text-xs"
              >
                <Zap className="w-3.5 h-3.5 mr-1 text-amber-400" />
                Test Groq
              </Button>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Groq API Key</span>
                {config?.hasGroqKey && (
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    ✓ Configured
                  </span>
                )}
              </label>
              <Input
                type="password"
                placeholder="gsk_••••••••"
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                className="bg-[#060D17] border-slate-700 text-slate-100 font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200">Groq Fallback Model</label>
              <Select
                value={groqModel}
                onChange={(e) => setGroqModel(e.target.value)}
                className="bg-[#060D17] border-slate-700 text-slate-100 text-xs"
              >
                <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Recommended)</option>
                <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (Fastest)</option>
                <option value="mixtral-8x7b-32768">mixtral-8x7b-32768</option>
              </Select>
            </div>

            {testResults['groq'] && (
              <div
                className={`col-span-full p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                  testResults['groq'].success
                    ? 'bg-emerald-950/30 border-emerald-600/40 text-emerald-300'
                    : 'bg-rose-950/30 border-rose-600/40 text-rose-300'
                }`}
              >
                {testResults['groq'].success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{testResults['groq'].message}</span>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CARD 3: GOOGLE GEMINI (BACKUP 2) */}
        {/* ========================================================================= */}
        <div className="bg-[#0B1524] rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-5 bg-gradient-to-r from-emerald-950/30 to-slate-900 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white tracking-wide">Backup Provider 2: Google Gemini</h2>
                  <span className="text-[10px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded uppercase tracking-wider">
                    Tier 3 (Safety Net)
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Google multimodal infrastructure. Automatically invoked if OpenRouter and Groq fail.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                <input
                  type="checkbox"
                  checked={geminiEnabled}
                  onChange={(e) => setGeminiEnabled(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-400 w-4 h-4 cursor-pointer"
                />
                <span>Enable Gemini Fallback</span>
              </label>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleTestConnection('gemini', geminiModel)}
                isLoading={testingProvider === 'gemini'}
                className="border-emerald-500/40 hover:bg-emerald-950/50 text-emerald-300 text-xs"
              >
                <Zap className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Test Gemini
              </Button>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                <span>Google Gemini API Key</span>
                {config?.hasGeminiKey && (
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    ✓ Configured
                  </span>
                )}
              </label>
              <Input
                type="password"
                placeholder="AIzaSy••••••••"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="bg-[#060D17] border-slate-700 text-slate-100 font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200">Gemini Fallback Model</label>
              <Select
                value={geminiModel}
                onChange={(e) => setGeminiModel(e.target.value)}
                className="bg-[#060D17] border-slate-700 text-slate-100 text-xs"
              >
                <option value="gemini-2.0-flash">gemini-2.0-flash (Recommended)</option>
                <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                <option value="gemini-1.5-pro">gemini-1.5-pro</option>
              </Select>
            </div>

            {testResults['gemini'] && (
              <div
                className={`col-span-full p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                  testResults['gemini'].success
                    ? 'bg-emerald-950/30 border-emerald-600/40 text-emerald-300'
                    : 'bg-rose-950/30 border-rose-600/40 text-rose-300'
                }`}
              >
                {testResults['gemini'].success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{testResults['gemini'].message}</span>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* OPERATIONAL PARAMETERS & SAVE BUTTON */}
        {/* ========================================================================= */}
        <div className="bg-[#0B1524] rounded-2xl border border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <label className="text-slate-400 font-semibold">Request Timeout:</label>
              <input
                type="number"
                value={requestTimeout}
                onChange={(e) => setRequestTimeout(Number(e.target.value))}
                className="w-24 px-2 py-1 rounded bg-[#060D17] border border-slate-700 text-white font-mono text-xs"
              />
              <span className="text-slate-500">ms</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-slate-400 font-semibold">Max Retries per Provider:</label>
              <input
                type="number"
                value={maxRetries}
                onChange={(e) => setMaxRetries(Number(e.target.value))}
                className="w-16 px-2 py-1 rounded bg-[#060D17] border border-slate-700 text-white font-mono text-xs"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-200">
              <input
                type="checkbox"
                checked={isAiEnabled}
                onChange={(e) => setIsAiEnabled(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-400 w-4 h-4 cursor-pointer"
              />
              <span>Master AI Engine Active</span>
            </label>
          </div>

          <Button type="submit" variant="secondary" isLoading={isSaving} className="px-6 py-2.5 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 mr-1.5" />
            Save & Apply AI Configuration
          </Button>
        </div>
      </form>

      {/* ========================================================================= */}
      {/* DISCOVERED FREE MODELS EXPLORER */}
      {/* ========================================================================= */}
      <div className="bg-[#0B1524] rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-400" />
              Discovered OpenRouter Free Models ({availableModels.length})
            </h2>
            <p className="text-xs text-slate-400">
              Verified free models dynamically fetched from OpenRouter. Pricing $0.00 confirmed.
            </p>
          </div>

          <div className="w-full md:w-64">
            <Input
              type="text"
              placeholder="Search free models..."
              value={modelSearch}
              onChange={(e) => setModelSearch(e.target.value)}
              className="bg-[#060D17] border-slate-700 text-slate-100 text-xs py-1.5"
            />
          </div>
        </div>

        {availableModels.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <Info className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-300">No free models discovered yet.</p>
            <p className="text-slate-500 mt-1">Enter your OpenRouter API key above and click &quot;Fetch / Refresh Free Models&quot;.</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#070E18] text-slate-400 text-[10px] uppercase font-bold sticky top-0 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Model Name</th>
                  <th className="py-2.5 px-4">Model ID</th>
                  <th className="py-2.5 px-4">Context Length</th>
                  <th className="py-2.5 px-4">Pricing</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {filteredFreeModels.map((m) => {
                  const isSelected = openRouterModel === m.id;
                  return (
                    <tr key={m.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <span className="font-bold text-white block">{m.name}</span>
                        {m.description && (
                          <span className="text-[10px] text-slate-500 line-clamp-1 max-w-md">
                            {m.description}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-blue-300">{m.id}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {m.contextLength ? `${m.contextLength.toLocaleString()} tokens` : '128k'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                          $0.00 / Free
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isSelected ? (
                          <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/30">
                            Active Choice
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setOpenRouterModelMode('specific_free');
                              setOpenRouterModel(m.id);
                            }}
                            className="text-[10px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded transition-colors"
                          >
                            Select Model
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* LIVE AI USAGE & FALLBACK AUDIT LOGS */}
      {/* ========================================================================= */}
      <div className="bg-[#0B1524] rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Live AI Provider Audit & Fallback Logs
            </h2>
            <p className="text-xs text-slate-400">
              Audit trail showing which provider actually resolved each user request.
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Last 30 Requests</span>
        </div>

        {usageLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <p>No AI activity recorded yet. Logs will stream in as users interact with the AI assistant.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#070E18] text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">Provider Used</th>
                  <th className="py-2.5 px-4">Model</th>
                  <th className="py-2.5 px-4">Latency</th>
                  <th className="py-2.5 px-4">Tokens</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {usageLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                          log.provider === 'openrouter'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : log.provider === 'groq'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : log.provider === 'gemini'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {log.provider}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-300">{log.model}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-400">{log.latencyMs}ms</td>
                    <td className="py-2.5 px-4 font-mono text-slate-400">
                      {log.promptTokens + log.completionTokens}
                    </td>
                    <td className="py-2.5 px-4">
                      {log.status === 'success' ? (
                        <span className="text-[10px] text-emerald-400 font-semibold">Success</span>
                      ) : log.status === 'fallback_success' ? (
                        <span className="text-[10px] text-amber-400 font-semibold" title={log.errorMessage}>
                          Fallback Success
                        </span>
                      ) : (
                        <span className="text-[10px] text-rose-400 font-semibold" title={log.errorMessage}>
                          Failed
                        </span>
                      )}
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
