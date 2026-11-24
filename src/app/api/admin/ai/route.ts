import { NextRequest, NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/auth';
import { aiRepo, adminRepo } from '@/lib/db';
import { maskApiKey, testAiConnection } from '@/lib/ai/aiService';

export const dynamic = 'force-dynamic';

export async function GET() {
  const ctx = await getAdminContext();
  if (!ctx || !ctx.isSuperAdmin) {
    return NextResponse.json({ error: 'Unauthorized: Super Admin access required' }, { status: 403 });
  }

  const config = await aiRepo.getConfig();
  const usageLogs = await aiRepo.listUsageLogs(undefined, 30);

  // Return masked API keys so real keys are never exposed back to client
  const safeConfig = {
    ...config,
    openrouterApiKeyMasked: maskApiKey(config.openrouterApiKey),
    groqApiKeyMasked: maskApiKey(config.groqApiKey),
    geminiApiKeyMasked: maskApiKey(config.geminiApiKey),
    hasOpenRouterKey: Boolean(config.openrouterApiKey),
    hasGroqKey: Boolean(config.groqApiKey),
    hasGeminiKey: Boolean(config.geminiApiKey),
    openrouterApiKey: undefined,
    groqApiKey: undefined,
    geminiApiKey: undefined,
  };

  return NextResponse.json({
    config: safeConfig,
    usageLogs,
  });
}

export async function PUT(request: NextRequest) {
  const ctx = await getAdminContext();
  if (!ctx || !ctx.isSuperAdmin) {
    return NextResponse.json({ error: 'Unauthorized: Super Admin access required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const current = await aiRepo.getConfig();

    const updates: any = {};

    if (typeof body.isEnabled === 'boolean') updates.isEnabled = body.isEnabled;
    if (body.primaryProvider) updates.primaryProvider = body.primaryProvider;
    if (body.backupProvider1) updates.backupProvider1 = body.backupProvider1;
    if (body.backupProvider2) updates.backupProvider2 = body.backupProvider2;

    // OpenRouter Settings
    if (typeof body.openrouterIsEnabled === 'boolean') updates.openrouterIsEnabled = body.openrouterIsEnabled;
    if (body.openrouterModel) updates.openrouterModel = body.openrouterModel;
    if (body.openrouterModelMode) updates.openrouterModelMode = body.openrouterModelMode;
    if (body.openrouterApiKey && !body.openrouterApiKey.includes('••••')) {
      updates.openrouterApiKey = body.openrouterApiKey.trim();
    }

    // Groq Settings
    if (typeof body.groqIsEnabled === 'boolean') updates.groqIsEnabled = body.groqIsEnabled;
    if (body.groqModel) updates.groqModel = body.groqModel;
    if (body.groqApiKey && !body.groqApiKey.includes('••••')) {
      updates.groqApiKey = body.groqApiKey.trim();
    }

    // Gemini Settings
    if (typeof body.geminiIsEnabled === 'boolean') updates.geminiIsEnabled = body.geminiIsEnabled;
    if (body.geminiModel) updates.geminiModel = body.geminiModel;
    if (body.geminiApiKey && !body.geminiApiKey.includes('••••')) {
      updates.geminiApiKey = body.geminiApiKey.trim();
    }

    // Operational limits
    if (body.requestTimeout) updates.requestTimeout = Number(body.requestTimeout);
    if (body.maxRetries) updates.maxRetries = Number(body.maxRetries);
    if (body.maxInputLength) updates.maxInputLength = Number(body.maxInputLength);
    if (body.dailyLimit) updates.dailyLimit = Number(body.dailyLimit);

    const updated = await aiRepo.updateConfig(updates);

    await adminRepo.logAudit({
      adminId: ctx.user.id,
      adminEmail: ctx.user.email,
      action: 'UPDATE_AI_CONFIGURATION',
      targetEntity: 'ai_provider_configs',
      targetId: updated.id,
      details: {
        primaryProvider: updated.primaryProvider,
        openrouterModel: updated.openrouterModel,
        openrouterModelMode: updated.openrouterModelMode,
        groqModel: updated.groqModel,
        geminiModel: updated.geminiModel,
        isEnabled: updated.isEnabled,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'AI provider configuration updated successfully.',
      config: {
        ...updated,
        openrouterApiKeyMasked: maskApiKey(updated.openrouterApiKey),
        groqApiKeyMasked: maskApiKey(updated.groqApiKey),
        geminiApiKeyMasked: maskApiKey(updated.geminiApiKey),
        hasOpenRouterKey: Boolean(updated.openrouterApiKey),
        hasGroqKey: Boolean(updated.groqApiKey),
        hasGeminiKey: Boolean(updated.geminiApiKey),
        openrouterApiKey: undefined,
        groqApiKey: undefined,
        geminiApiKey: undefined,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update AI configuration' }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  const ctx = await getAdminContext();
  if (!ctx || !ctx.isSuperAdmin) {
    return NextResponse.json({ error: 'Unauthorized: Super Admin access required' }, { status: 403 });
  }

  try {
    const { provider, apiKey, model } = await request.json();
    if (!provider || !model) {
      return NextResponse.json({ error: 'Provider and Model are required' }, { status: 400 });
    }

    const config = await aiRepo.getConfig();
    let keyToTest = apiKey;

    if (!keyToTest || keyToTest.includes('••••')) {
      if (provider === 'openrouter') {
        keyToTest = config.openrouterApiKey || process.env.OPENROUTER_API_KEY;
      } else if (provider === 'groq') {
        keyToTest = config.groqApiKey || process.env.GROQ_API_KEY;
      } else if (provider === 'gemini') {
        keyToTest = config.geminiApiKey || process.env.GEMINI_API_KEY;
      }
    }

    if (!keyToTest) {
      return NextResponse.json(
        { success: false, message: `No API key configured for ${provider}. Please enter a valid API key first.` },
        { status: 400 }
      );
    }

    const result = await testAiConnection(provider, keyToTest, model);

    if (result.success && provider === 'openrouter') {
      await aiRepo.updateConfig({
        openrouterLastSuccessfulConnection: new Date().toISOString(),
      });
    }

    await adminRepo.logAudit({
      adminId: ctx.user.id,
      adminEmail: ctx.user.email,
      action: `TEST_AI_CONNECTION_${provider.toUpperCase()}`,
      targetEntity: 'ai_provider_configs',
      targetId: provider,
      details: {
        success: result.success,
        latencyMs: result.latencyMs,
        model,
      },
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Connection test failed' }, { status: 500 });
  }
}
