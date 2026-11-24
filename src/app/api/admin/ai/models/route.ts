import { NextRequest, NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/auth';
import { aiRepo, adminRepo } from '@/lib/db';
import { fetchOpenRouterModels } from '@/lib/ai/openrouterService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const ctx = await getAdminContext();
  if (!ctx || !ctx.isSuperAdmin) {
    return NextResponse.json({ error: 'Unauthorized: Super Admin access required' }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const config = await aiRepo.getConfig();

    let apiKey = body.apiKey;
    if (!apiKey || apiKey.includes('••••')) {
      apiKey = config.openrouterApiKey || process.env.OPENROUTER_API_KEY;
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key is missing. Please save an OpenRouter API key first.' },
        { status: 400 }
      );
    }

    const freeModels = await fetchOpenRouterModels(apiKey);

    // Save discovered models to config
    const now = new Date().toISOString();
    await aiRepo.updateConfig({
      openrouterAvailableModels: freeModels,
      openrouterLastModelRefresh: now,
    });

    await adminRepo.logAudit({
      adminId: ctx.user.id,
      adminEmail: ctx.user.email,
      action: 'DISCOVER_OPENROUTER_FREE_MODELS',
      targetEntity: 'ai_provider_configs',
      targetId: 'openrouter',
      details: {
        totalFreeModelsFound: freeModels.length,
        timestamp: now,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully retrieved ${freeModels.length} free chat models from OpenRouter.`,
      models: freeModels,
      lastRefresh: now,
    });
  } catch (err: any) {
    console.error('Failed to fetch OpenRouter models:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch models from OpenRouter' },
      { status: 500 }
    );
  }
}
