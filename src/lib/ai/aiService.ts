import { aiRepo } from '@/lib/db';
import { AiProviderConfig, AiUsageLog } from '@/types';
import {
  callOpenRouter,
  testOpenRouterConnection,
  OPENROUTER_FREE_ROUTER_ID,
} from './openrouterService';

export interface AiChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiCompletionOptions {
  organizationId?: string;
  userId?: string;
  quotationId?: string;
  userIntent?: string;
  temperature?: number;
  responseFormat?: 'json' | 'text';
}

export interface AiCompletionResult {
  text: string;
  parsedJson?: any;
  provider: 'openrouter' | 'groq' | 'gemini';
  model: string;
  latencyMs: number;
  usage: {
    promptTokens: number;
    completionTokens: number;
  };
}

/**
 * Mask an API key for safe display in Admin UI
 */
export function maskApiKey(key?: string): string {
  if (!key) return '';
  if (key.length <= 8) return '••••••••';
  return `${key.substring(0, 4)}••••••••${key.substring(key.length - 4)}`;
}

/**
 * Call Groq API (OpenAI-compatible completions endpoint)
 */
export async function callGroq(
  apiKey: string,
  model: string,
  messages: AiChatMessage[],
  timeoutMs: number,
  responseFormat: 'json' | 'text' = 'text'
): Promise<{ text: string; usage: { promptTokens: number; completionTokens: number } }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const bodyPayload: any = {
      model,
      messages,
      temperature: 0.2,
      max_tokens: 3000,
    };

    if (responseFormat === 'json') {
      bodyPayload.response_format = { type: 'json_object' };
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify(bodyPayload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API returned ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const promptTokens = data.usage?.prompt_tokens || 0;
    const completionTokens = data.usage?.completion_tokens || 0;

    return {
      text: content,
      usage: { promptTokens, completionTokens },
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Call Google Gemini API (generateContent endpoint)
 */
export async function callGemini(
  apiKey: string,
  model: string,
  messages: AiChatMessage[],
  timeoutMs: number,
  responseFormat: 'json' | 'text' = 'text'
): Promise<{ text: string; usage: { promptTokens: number; completionTokens: number } }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const contents = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const systemInstructionMsg = messages.find((m) => m.role === 'system');
    const cleanModel = model.replace('models/', '');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey.trim()}`;

    const requestBody: any = {
      contents,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 3000,
      },
    };

    if (responseFormat === 'json') {
      requestBody.generationConfig.responseMimeType = 'application/json';
    }

    if (systemInstructionMsg) {
      requestBody.systemInstruction = {
        parts: [{ text: systemInstructionMsg.content }],
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API returned ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const content = candidate?.content?.parts?.[0]?.text || '';
    const promptTokens = data.usageMetadata?.promptTokenCount || 0;
    const completionTokens = data.usageMetadata?.candidatesTokenCount || 0;

    return {
      text: content,
      usage: { promptTokens, completionTokens },
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

function parseJsonSafely(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch {
        return undefined;
      }
    }
    const genericMatch = text.match(/```\s*([\s\S]*?)\s*```/);
    if (genericMatch && genericMatch[1]) {
      try {
        return JSON.parse(genericMatch[1]);
      } catch {
        return undefined;
      }
    }
    return undefined;
  }
}

/**
 * Unified AI Completion Engine with 3-Tier Automatic Fallback:
 * 1. Primary: OpenRouter (Default)
 * 2. Backup 1: Groq
 * 3. Backup 2: Google Gemini
 */
export async function runAiCompletion(
  messages: AiChatMessage[],
  options: AiCompletionOptions = {}
): Promise<AiCompletionResult> {
  const config = await aiRepo.getConfig();

  if (!config.isEnabled) {
    throw new Error('AI Assistant is currently disabled by Platform Administration.');
  }

  const startTime = Date.now();
  const timeoutMs = config.requestTimeout || 30000;
  const maxRetries = config.maxRetries || 2;
  const responseFormat = options.responseFormat || 'text';

  const errors: { provider: string; message: string }[] = [];

  // =========================================================================
  // TIER 1: OPENROUTER (PRIMARY)
  // =========================================================================
  const openRouterEnabled = config.openrouterIsEnabled !== false;
  const openRouterKey = config.openrouterApiKey || process.env.OPENROUTER_API_KEY || '';
  const openRouterModel = config.openrouterModel || OPENROUTER_FREE_ROUTER_ID;

  if (openRouterEnabled && openRouterKey) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await callOpenRouter(openRouterKey, openRouterModel, messages, timeoutMs, responseFormat);
        const latencyMs = Date.now() - startTime;
        const parsedJson = responseFormat === 'json' ? parseJsonSafely(result.text) : undefined;

        // Log successful OpenRouter usage
        await aiRepo.logUsage({
          organizationId: options.organizationId,
          userId: options.userId,
          quotationId: options.quotationId,
          provider: 'openrouter',
          model: result.rawModelUsed || openRouterModel,
          promptTokens: result.usage.promptTokens,
          completionTokens: result.usage.completionTokens,
          latencyMs,
          status: 'success',
          userIntent: options.userIntent,
        });

        // Update health status
        await aiRepo.updateConfig({
          status: 'healthy',
          lastSuccessfulRequest: new Date().toISOString(),
          openrouterLastSuccessfulConnection: new Date().toISOString(),
          lastError: undefined,
        });

        return {
          text: result.text,
          parsedJson,
          provider: 'openrouter',
          model: result.rawModelUsed || openRouterModel,
          latencyMs,
          usage: result.usage,
        };
      } catch (err: any) {
        console.warn(`[AI] OpenRouter attempt ${attempt} failed: ${err.message}`);
        if (attempt === maxRetries) {
          errors.push({ provider: 'OpenRouter', message: err.message });
        } else {
          await new Promise((res) => setTimeout(res, 800 * attempt));
        }
      }
    }
  } else if (openRouterEnabled && !openRouterKey) {
    errors.push({ provider: 'OpenRouter', message: 'API Key not configured in Super Admin settings' });
  }

  // =========================================================================
  // TIER 2: GROQ (BACKUP 1)
  // =========================================================================
  const groqEnabled = config.groqIsEnabled !== false;
  const groqKey = config.groqApiKey || process.env.GROQ_API_KEY || '';
  const groqModel = config.groqModel || 'llama-3.3-70b-versatile';

  if (groqEnabled && groqKey) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[AI] Fallback Tier 1: Calling Groq (${groqModel})...`);
        const result = await callGroq(groqKey, groqModel, messages, timeoutMs, responseFormat);
        const latencyMs = Date.now() - startTime;
        const parsedJson = responseFormat === 'json' ? parseJsonSafely(result.text) : undefined;

        // Log fallback usage
        await aiRepo.logUsage({
          organizationId: options.organizationId,
          userId: options.userId,
          quotationId: options.quotationId,
          provider: 'groq',
          model: groqModel,
          promptTokens: result.usage.promptTokens,
          completionTokens: result.usage.completionTokens,
          latencyMs,
          status: 'fallback_success',
          errorMessage: `OpenRouter failed: ${errors[0]?.message || 'Unavailable'}`,
          userIntent: options.userIntent,
        });

        await aiRepo.updateConfig({
          status: 'degraded',
          lastSuccessfulRequest: new Date().toISOString(),
          lastError: `Primary (OpenRouter) failed: ${errors[0]?.message || 'Unavailable'}. Active on Groq Backup 1.`,
        });

        return {
          text: result.text,
          parsedJson,
          provider: 'groq',
          model: groqModel,
          latencyMs,
          usage: result.usage,
        };
      } catch (err: any) {
        console.warn(`[AI] Groq attempt ${attempt} failed: ${err.message}`);
        if (attempt === maxRetries) {
          errors.push({ provider: 'Groq', message: err.message });
        } else {
          await new Promise((res) => setTimeout(res, 800 * attempt));
        }
      }
    }
  } else if (groqEnabled && !groqKey) {
    errors.push({ provider: 'Groq', message: 'API Key not configured' });
  }

  // =========================================================================
  // TIER 3: GOOGLE GEMINI (BACKUP 2)
  // =========================================================================
  const geminiEnabled = config.geminiIsEnabled !== false;
  const geminiKey = config.geminiApiKey || process.env.GEMINI_API_KEY || '';
  const geminiModel = config.geminiModel || 'gemini-2.0-flash';

  if (geminiEnabled && geminiKey) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[AI] Fallback Tier 2: Calling Google Gemini (${geminiModel})...`);
        const result = await callGemini(geminiKey, geminiModel, messages, timeoutMs, responseFormat);
        const latencyMs = Date.now() - startTime;
        const parsedJson = responseFormat === 'json' ? parseJsonSafely(result.text) : undefined;

        await aiRepo.logUsage({
          organizationId: options.organizationId,
          userId: options.userId,
          quotationId: options.quotationId,
          provider: 'gemini',
          model: geminiModel,
          promptTokens: result.usage.promptTokens,
          completionTokens: result.usage.completionTokens,
          latencyMs,
          status: 'fallback_success',
          errorMessage: `OpenRouter and Groq failed. OpenRouter: ${errors[0]?.message}. Groq: ${errors[1]?.message}`,
          userIntent: options.userIntent,
        });

        await aiRepo.updateConfig({
          status: 'degraded',
          lastSuccessfulRequest: new Date().toISOString(),
          lastError: `Primary and Backup 1 failed. Active on Gemini Backup 2.`,
        });

        return {
          text: result.text,
          parsedJson,
          provider: 'gemini',
          model: geminiModel,
          latencyMs,
          usage: result.usage,
        };
      } catch (err: any) {
        console.warn(`[AI] Gemini attempt ${attempt} failed: ${err.message}`);
        if (attempt === maxRetries) {
          errors.push({ provider: 'Gemini', message: err.message });
        } else {
          await new Promise((res) => setTimeout(res, 800 * attempt));
        }
      }
    }
  } else if (geminiEnabled && !geminiKey) {
    errors.push({ provider: 'Gemini', message: 'API Key not configured' });
  }

  // =========================================================================
  // ALL PROVIDERS FAILED
  // =========================================================================
  const totalLatency = Date.now() - startTime;
  const failureSummary = errors.map((e) => `${e.provider}: ${e.message}`).join(' | ');

  await aiRepo.logUsage({
    organizationId: options.organizationId,
    userId: options.userId,
    quotationId: options.quotationId,
    provider: 'none',
    model: 'all_failed',
    promptTokens: 0,
    completionTokens: 0,
    latencyMs: totalLatency,
    status: 'failed',
    errorMessage: failureSummary,
    userIntent: options.userIntent,
  });

  await aiRepo.updateConfig({
    status: 'unhealthy',
    lastError: `All configured AI providers failed. ${failureSummary}`,
  });

  throw new Error(
    `ExportFlow AI Assistant is temporarily unavailable. All providers failed (OpenRouter Primary, Groq Backup 1, Gemini Backup 2). Please review Super Admin AI configuration. Details: ${failureSummary}`
  );
}

/**
 * Test connection for any supported provider
 */
export async function testAiConnection(
  provider: 'openrouter' | 'groq' | 'gemini',
  apiKey: string,
  model: string
): Promise<{ success: boolean; latencyMs: number; message: string }> {
  if (provider === 'openrouter') {
    return await testOpenRouterConnection(apiKey, model);
  }

  const start = Date.now();
  const testMessages: AiChatMessage[] = [
    { role: 'user', content: 'Respond with exactly the word "CONNECTED" to confirm API connectivity.' },
  ];

  try {
    if (provider === 'groq') {
      const res = await callGroq(apiKey, model, testMessages, 10000, 'text');
      const latency = Date.now() - start;
      return {
        success: true,
        latencyMs: latency,
        message: `Successfully connected to Groq (${model}) in ${latency}ms. Response: ${res.text.trim().substring(0, 50)}`,
      };
    } else {
      const res = await callGemini(apiKey, model, testMessages, 10000, 'text');
      const latency = Date.now() - start;
      return {
        success: true,
        latencyMs: latency,
        message: `Successfully connected to Google Gemini (${model}) in ${latency}ms. Response: ${res.text.trim().substring(0, 50)}`,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      latencyMs: Date.now() - start,
      message: err.message || 'Connection failed',
    };
  }
}
