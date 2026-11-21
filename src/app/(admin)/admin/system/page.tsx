'use client';

import React, { useState, useEffect } from 'react';
import {
  Server,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Cpu,
  RefreshCw,
  ShieldCheck,
  Database,
  FileCode,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminSystemHealthPage() {
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadHealth = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/health');
      if (res.ok) setHealthData(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">System Health & Infrastructure Center</h1>
          <p className="text-xs text-slate-400">Live operational statuses for Appwrite, Database, Storage, ImageKit, Email & AI</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={loadHealth}
          className="border-slate-700 bg-slate-800 text-slate-200"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Run Health Check
        </Button>
      </div>

      {/* Top Status Bar */}
      <div className="p-4 rounded-xl bg-[#0B1524] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            System Overall Status: {healthData?.systemStatus?.toUpperCase() || 'OPERATIONAL'}
          </span>
        </div>
        <div className="flex items-center gap-6 text-xs text-slate-400">
          <span>Node.js: <strong className="text-white">{healthData?.nodeVersion || process.version}</strong></span>
          <span>Uptime: <strong className="text-white">{healthData?.uptimeSeconds || 0}s</strong></span>
          <span>Environment: <strong className="text-white uppercase">{healthData?.environment || 'development'}</strong></span>
        </div>
      </div>

      {/* Service Health Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {healthData?.services?.map((srv: any, idx: number) => {
          const isHealthy = srv.status === 'healthy';
          const isFallback = srv.status === 'fallback';

          return (
            <div key={idx} className="p-5 rounded-xl bg-[#0B1524] border border-slate-800 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">{srv.type}</span>
                  <h3 className="text-sm font-bold text-white mt-0.5">{srv.name}</h3>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    isHealthy
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : isFallback
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {srv.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="text-xs text-slate-400 font-mono text-[11px] bg-[#070E18] p-2.5 rounded-lg border border-slate-800/80">
                {srv.details || srv.latency || 'Connected and validated'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
