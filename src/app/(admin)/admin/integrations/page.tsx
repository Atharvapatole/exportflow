import React from 'react';
import { getAdminContext } from '@/lib/auth';
import { infraConfig } from '@/config/infrastructure';
import { Cpu, CheckCircle2, AlertTriangle, Key, ExternalLink } from 'lucide-react';

export default async function AdminIntegrationsPage() {
  const ctx = await getAdminContext();
  if (!ctx || !ctx.isSuperAdmin) return null;

  const supabase = infraConfig.getSupabaseConfig();
  const imagekit = infraConfig.getImageKitConfig();
  const email = infraConfig.getEmailConfig();
  const ai = infraConfig.getAiConfig();

  const integrations = [
    {
      name: 'Supabase PostgreSQL & Storage',
      category: 'PostgreSQL Database, Auth & Private Document Storage',
      isConfigured: supabase.isConfigured,
      endpoint: supabase.url || 'Not configured',
      details: supabase.isConfigured ? 'Connected to Supabase Project' : 'Awaiting NEXT_PUBLIC_SUPABASE_URL & ANON_KEY in .env.local',
    },
    {
      name: 'ImageKit Media CDN',
      category: 'Public Company Logos & Signatures',
      isConfigured: imagekit.isConfigured,
      endpoint: imagekit.urlEndpoint || 'Not set',
      details: imagekit.isConfigured ? 'Active & Optimized' : 'Awaiting IMAGEKIT_PUBLIC_KEY',
    },
    {
      name: 'Resend Transactional Email',
      category: 'Buyer Acceptance & System Notifications',
      isConfigured: email.isConfigured,
      endpoint: email.fromEmail,
      details: email.isConfigured ? 'Production Resend API' : 'Fallback to console delivery',
    },
    {
      name: 'OpenRouter AI Engine',
      category: 'AI Export Trade Assistant',
      isConfigured: ai.isConfigured,
      endpoint: 'https://openrouter.ai/api/v1',
      details: `Model: ${ai.model}`,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">External Platform Integrations</h1>
        <p className="text-xs text-slate-400">Server-side managed API credentials and infrastructure providers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((item, idx) => (
          <div key={idx} className="p-5 rounded-xl bg-[#0B1524] border border-slate-800 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{item.category}</span>
                <h3 className="text-sm font-bold text-white mt-0.5">{item.name}</h3>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                item.isConfigured
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}>
                {item.isConfigured ? 'Connected' : 'Pending Env Setup'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#070E18] border border-slate-800 text-xs text-slate-400 font-mono space-y-1 text-[11px]">
              <div>Endpoint: {item.endpoint}</div>
              <div>Status: {item.details}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
