'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Code2,
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  Shield,
  ExternalLink,
  Terminal,
  AlertCircle,
  Ship,
  Zap,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: string[];
  isActive: boolean;
  totalRequests: number;
  lastUsedAt?: string;
  createdAt: string;
}

export default function ChaDeveloperApiPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [creating, setCreating] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/developer/keys');
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim() || creating) return;

    try {
      setCreating(true);
      const res = await fetch('/api/developer/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName.trim(),
          permissions: ['read', 'write', 'cha_jobs', 'esanchit', 'customs'],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setNewlyCreatedKey(data.rawKey);
        fetchKeys();
        setNewKeyName('');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create API key');
      }
    } catch {
      alert('Network error while generating API key');
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeKey = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to revoke API key "${name}"? Any external customs integrations using this key will immediately fail.`)) return;

    try {
      const res = await fetch(`/api/developer/keys?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchKeys();
      }
    } catch {
      alert('Failed to revoke API key');
    }
  };

  const copyText = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    if (identifier === 'newKey') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedSnippet(identifier);
      setTimeout(() => setCopiedSnippet(null), 2000);
    }
  };

  const curlExample = `curl -X POST https://exportflow.benzwell.in/api/v1/jobs \\
  -H "Authorization: Bearer ef_live_YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "import",
    "clientId": "cli_9876",
    "portOfReporting": "INNSA1",
    "boeNumber": "9812456",
    "blNumber": "MEDU991203",
    "grossWeightKg": 14200,
    "packages": 350
  }'`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">CHA Brokerage Developer API</h1>
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold border border-indigo-200 dark:border-indigo-800">
              Customs Broker API
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Programmatically intake import/export clearance jobs, upload e-SANCHIT documents, and automate client status alerts
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setShowCreateModal(true);
            setNewlyCreatedKey(null);
          }}
          className="gap-1.5 shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus className="w-4 h-4" />
          Generate Broker API Key
        </Button>
      </div>

      {/* API Notice Card */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-500/20 flex items-start gap-3">
        <Ship className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
          <p className="font-semibold text-slate-900 dark:text-white">ICEGATE & Clearance Job Webhooks</p>
          <p>
            Authenticate your freight forwarder or in-house logistics ERP using a standard Bearer token.
            Included in <strong>CHA Enterprise</strong> and <strong>CHA Custom Plans</strong> (or via API Access add-on).
          </p>
        </div>
      </div>

      {/* Keys Table Card */}
      <Card className="dark:bg-[#0E1524] dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-slate-500" />
            <CardTitle className="text-sm font-semibold">Active Broker API Credentials</CardTitle>
          </div>
          <span className="text-xs text-slate-400">{keys.length} keys active</span>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading API credentials...</div>
          ) : keys.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <Key className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No API keys created yet</p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Generate an API key to automatically ingest clearance jobs directly from your clients&apos; systems.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {keys.map((k) => (
                <div key={k.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">{k.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        k.isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {k.isActive ? 'Active' : 'Revoked'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 text-[11px] font-mono">
                      <span>Prefix: {k.keyPrefix}••••••••</span>
                      <span>•</span>
                      <span>Total Requests: {k.totalRequests || 0}</span>
                      <span>•</span>
                      <span>Created: {new Date(k.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {k.isActive && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRevokeKey(k.id, k.name)}
                      className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integration Code Snippet */}
      <Card className="dark:bg-[#0E1524] dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-500" />
            <CardTitle className="text-sm font-semibold">Job Intake Endpoint Example</CardTitle>
          </div>
          <button
            onClick={() => copyText(curlExample, 'curl')}
            className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {copiedSnippet === 'curl' ? (
              <>
                <Check className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-500 font-bold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy Snippet</span>
              </>
            )}
          </button>
        </CardHeader>
        <CardContent className="p-4 bg-slate-950 rounded-b-xl overflow-x-auto text-xs text-slate-200 font-mono leading-relaxed">
          <pre>{curlExample}</pre>
        </CardContent>
      </Card>

      {/* Key Generation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {newlyCreatedKey ? 'Broker API Key Ready' : 'Generate Customs API Key'}
            </h3>

            {newlyCreatedKey ? (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>Security Notice:</strong> Copy this secret key immediately. It will not be shown again.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={newlyCreatedKey}
                    className="font-mono text-xs bg-slate-50 dark:bg-slate-900 select-all"
                  />
                  <Button
                    size="sm"
                    onClick={() => copyText(newlyCreatedKey, 'newKey')}
                    className="gap-1 bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    {copiedKey ? 'Copied' : 'Copy'}
                  </Button>
                </div>

                <Button
                  size="md"
                  onClick={() => setShowCreateModal(false)}
                  className="w-full bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white"
                >
                  Close
                </Button>
              </div>
            ) : (
              <form onSubmit={handleCreateKey} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Key Identifier / Client System
                  </label>
                  <Input
                    placeholder="e.g. Navkar CFS ERP, Client EDI Ingest"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    disabled={creating}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!newKeyName.trim() || creating}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {creating ? 'Generating...' : 'Create API Key'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
