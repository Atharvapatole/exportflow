import { OpenRouterModelInfo } from '@/types';
import { infraConfig } from '@/config/infrastructure';

export const OPENROUTER_FREE_ROUTER_ID = 'openrouter/free';

/**
 * Filter and categorize models fetched from OpenRouter
 */
export function filterFreeChatModels(rawModels: any[]): OpenRouterModelInfo[] {
  if (!Array.isArray(rawModels)) return [];

  const filtered: OpenRouterModelInfo[] = [];

  // Always include the official OpenRouter Free virtual router as the top recommended choice
  filtered.push({
    id: OPENROUTER_FREE_ROUTER_ID,
    name: 'OpenRouter Free Router (Auto)',
    description: 'Recommended: OpenRouter automatically selects and routes to an available free high-performance model.',
    contextLength: 128000,
    pricing: {
      prompt: '0',
      completion: '0',
      request: '0',
    },
    isFree: true,
    isChatCapable: true,
    lastVerified: new Date().toISOString(),
  });

  for (const item of rawModels) {
    if (!item || !item.id) continue;
    const modelId: string = item.id.toLowerCase();

    // 1. Check pricing: both prompt and completion pricing must be 0
    const promptPrice = item.pricing?.prompt != null ? parseFloat(String(item.pricing.prompt)) : NaN;
    const completionPrice = item.pricing?.completion != null ? parseFloat(String(item.pricing.completion)) : NaN;

    const hasZeroPricing = promptPrice === 0 && completionPrice === 0;
    const endsWithFree = modelId.endsWith(':free');

    // Must be either confirmed zero price or explicitly designated :free variant
    if (!hasZeroPricing && !endsWithFree) {
      continue;
    }

    // Double check: if pricing exists and is greater than 0, exclude even if name had 'free'
    if (promptPrice > 0 || completionPrice > 0) {
      continue;
    }

    // 2. Exclude embeddings, audio-only, rerankers, image-only
    if (
      modelId.includes('embedding') ||
      modelId.includes('embed') ||
      modelId.includes('rerank') ||
      modelId.includes('whisper') ||
      modelId.includes('tts') ||
      modelId.includes('dall-e') ||
      modelId.includes('stable-diffusion') ||
      modelId.includes('flux') ||
      modelId.includes('midjourney')
    ) {
      continue;
    }

    // 3. Modality check: if architecture or modalities specified, ensure it supports text output
    const modality = item.architecture?.modality || item.modalities;
    if (modality) {
      const modalityStr = JSON.stringify(modality).toLowerCase();
      // If it only does image/audio or does not support text
      if (modalityStr.includes('image->image') && !modalityStr.includes('text')) {
        continue;
      }
    }

    filtered.push({
      id: item.id,
      name: item.name || item.id,
      description: item.description || '',
      contextLength: item.context_length || item.top_provider?.context_length || 4096,
      pricing: {
        prompt: item.pricing?.prompt ?? '0',
        completion: item.pricing?.completion ?? '0',
        request: item.pricing?.request ?? '0',
      },
      architecture: item.architecture,
      topProvider: item.top_provider,
      isFree: true,
      isChatCapable: true,
      lastVerified: new Date().toISOString(),
    });
  }

  // Sort: put :free variants near top, then by contextLength descending
  filtered.sort((a, b) => {
    if (a.id === OPENROUTER_FREE_ROUTER_ID) return -1;
    if (b.id === OPENROUTER_FREE_ROUTER_ID) return 1;
    const aIsFreeVariant = a.id.endsWith(':free') ? 1 : 0;
    const bIsFreeVariant = b.id.endsWith(':free') ? 1 : 0;
    if (aIsFreeVariant !== bIsFreeVariant) return bIsFreeVariant - aIsFreeVariant;
    return (b.contextLength || 0) - (a.contextLength || 0);
  });

  return filtered;
}

/**
 * Fetch available models from OpenRouter and extract verified free models
 */
export async function fetchOpenRouterModels(apiKey: string): Promise<OpenRouterModelInfo[]> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    throw new Error('OpenRouter API key is required to fetch models');
  }

  const response = await fetch('https://openrouter.ai/api/v1/models', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${cleanKey}`,
      'HTTP-Referer': infraConfig.getAppUrl(),
      'X-Title': 'ExportFlow by BENZWELL',
    },
    // 15 second timeout
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter models API returned ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const rawModels = data.data || [];
  return filterFreeChatModels(rawModels);
}

/**
 * Call OpenRouter Chat Completions
 */
export async function callOpenRouter(
  apiKey: string,
  model: string,
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  timeoutMs: number = 30000,
  responseFormat: 'json' | 'text' = 'text'
): Promise<{ text: string; usage: { promptTokens: number; completionTokens: number }; rawModelUsed?: string }> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    throw new Error('OpenRouter API key is not configured');
  }

  const cleanModel = model.trim() || OPENROUTER_FREE_ROUTER_ID;
  const appUrl = infraConfig.getAppUrl();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const payload: any = {
    model: cleanModel,
    messages,
    temperature: 0.2,
    max_tokens: 3500,
  };

  // Attempt json_object if requested (some free models support response_format)
  if (responseFormat === 'json') {
    payload.response_format = { type: 'json_object' };
  }

  try {
    let response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cleanKey}`,
        'HTTP-Referer': appUrl,
        'X-Title': 'ExportFlow by BENZWELL',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    // If model rejected response_format: { type: 'json_object' } with a 400 error, retry without response_format
    if (!response.ok && response.status === 400 && responseFormat === 'json') {
      const errBody = await response.text();
      if (errBody.toLowerCase().includes('response_format') || errBody.toLowerCase().includes('json')) {
        delete payload.response_format;
        response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${cleanKey}`,
            'HTTP-Referer': appUrl,
            'X-Title': 'ExportFlow by BENZWELL',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
      } else {
        throw new Error(`OpenRouter API returned ${response.status}: ${errBody}`);
      }
    }

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter API returned ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const promptTokens = data.usage?.prompt_tokens || 0;
    const completionTokens = data.usage?.completion_tokens || 0;
    const rawModelUsed = data.model || cleanModel;

    return {
      text: content,
      usage: { promptTokens, completionTokens },
      rawModelUsed,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Test OpenRouter Connection
 */
export async function testOpenRouterConnection(
  apiKey: string,
  model: string = OPENROUTER_FREE_ROUTER_ID
): Promise<{ success: boolean; latencyMs: number; message: string; modelUsed?: string }> {
  const start = Date.now();
  try {
    const testMessages = [
      {
        role: 'user' as const,
        content: 'Respond with exactly the single word "CONNECTED" to confirm API connectivity.',
      },
    ];

    const res = await callOpenRouter(apiKey, model, testMessages, 12000, 'text');
    const latency = Date.now() - start;

    return {
      success: true,
      latencyMs: latency,
      message: `Successfully connected to OpenRouter (${res.rawModelUsed || model}) in ${latency}ms. Response: ${res.text.trim().substring(0, 40)}`,
      modelUsed: res.rawModelUsed,
    };
  } catch (err: any) {
    return {
      success: false,
      latencyMs: Date.now() - start,
      message: err.message || 'Connection failed',
    };
  }
}
