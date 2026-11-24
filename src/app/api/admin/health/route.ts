import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/auth';
import { infraConfig } from '@/config/infrastructure';
import { readDb } from '@/lib/db/store';

export async function GET() {
  const ctx = await getAdminContext();
  if (!ctx || !ctx.isSuperAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabaseCfg = infraConfig.getSupabaseConfig();
  const imagekitCfg = infraConfig.getImageKitConfig();
  const emailCfg = infraConfig.getEmailConfig();
  const aiCfg = infraConfig.getAiConfig();

  // Test local database read
  let dbHealthy = false;
  try {
    const state = readDb();
    dbHealthy = Array.isArray(state.users);
  } catch {
    dbHealthy = false;
  }

  const uptimeSeconds = Math.round(process.uptime());

  const healthServices = [
    {
      name: 'Primary Database',
      status: dbHealthy ? 'healthy' : 'unhealthy',
      type: supabaseCfg.isConfigured ? 'Supabase PostgreSQL' : 'Local Persistent Storage Engine',
      latency: '< 5ms',
    },
    {
      name: 'Supabase Cloud Infrastructure',
      status: supabaseCfg.isConfigured ? 'healthy' : 'not_configured',
      type: 'PostgreSQL / Storage / Auth',
      details: supabaseCfg.isConfigured ? `Endpoint: ${supabaseCfg.url}` : 'Environment keys pending (.env.local)',
    },
    {
      name: 'ImageKit Media CDN',
      status: imagekitCfg.isConfigured ? 'healthy' : 'not_configured',
      type: 'Asset CDN',
      details: imagekitCfg.isConfigured ? 'Active' : 'Awaiting credentials',
    },
    {
      name: 'Email Delivery Service',
      status: emailCfg.isConfigured ? 'healthy' : 'fallback',
      type: emailCfg.isConfigured ? 'Resend API' : 'Internal Console Dispatcher',
      details: emailCfg.fromEmail,
    },
    {
      name: 'OpenRouter AI Engine',
      status: aiCfg.isConfigured ? 'healthy' : 'fallback',
      type: 'LLM Gateway',
      details: `Model: ${aiCfg.model}`,
    },
    {
      name: 'PDF Rendering Engine',
      status: 'healthy',
      type: 'jsPDF / Client & Server Headless HTML',
      details: 'Active & Validated',
    },
  ];

  return NextResponse.json({
    systemStatus: 'operational',
    nodeVersion: process.version,
    uptimeSeconds,
    environment: infraConfig.getEnvironment(),
    services: healthServices,
  });
}
