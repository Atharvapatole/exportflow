'use client';

import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface DiagnosticData {
  authenticatedUserDetected: boolean;
  authUserIdDetected: boolean;
  maskedUserId: string | null;
  profileRecordFound: boolean;
  platformAdminRecordFound: boolean;
  adminRole: string;
  accountActive: boolean;
  sessionValid: boolean;
  authorizationResult: 'AUTHORIZED' | 'DENIED';
  details?: {
    authMethod: string;
    statusCode: number;
    reason: string;
  };
}

export function AdminAccessDiagnostic() {
  const [data, setData] = useState<DiagnosticData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const fetchDiagnostic = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/diagnostic');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostic();
  }, []);

  if (process.env.NODE_ENV === 'production') return null;

  return (
    <div className="w-full mt-4 text-left border border-slate-800 rounded-xl bg-[#060D17] p-4 text-xs font-mono">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <Activity className="w-4 h-4 text-amber-400" />
          <span>Security Diagnostic (Dev Mode)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDiagnostic}
            disabled={loading}
            className="p-1 hover:text-white text-slate-400 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] text-amber-400 hover:underline"
          >
            {expanded ? 'Collapse' : 'Inspect'}
          </button>
        </div>
      </div>

      {loading && !data ? (
        <div className="text-slate-500 py-1">Running security checks...</div>
      ) : data ? (
        <div className="space-y-1.5 text-[11px]">
          <div className="flex justify-between items-center py-0.5">
            <span className="text-slate-400">Auth Status:</span>
            <span className={data.authorizationResult === 'AUTHORIZED' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {data.authorizationResult}
            </span>
          </div>

          {expanded && (
            <div className="pt-2 border-t border-slate-800/60 space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Authenticated user detected:</span>
                <span>{data.authenticatedUserDetected ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Auth User ID:</span>
                <span>{data.maskedUserId || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Profile record found:</span>
                <span>{data.profileRecordFound ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Platform admin record:</span>
                <span>{data.platformAdminRecordFound ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Admin role:</span>
                <span className={data.adminRole === 'SUPER_ADMIN' ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                  {data.adminRole}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Account active:</span>
                <span>{data.accountActive ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Session valid:</span>
                <span>{data.sessionValid ? 'Yes' : 'No'}</span>
              </div>
              {data.details && (
                <div className="pt-2 border-t border-slate-800/60 text-[10px] text-slate-400">
                  <div>Reason: {data.details.reason}</div>
                  <div>Channel: {data.details.authMethod}</div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
