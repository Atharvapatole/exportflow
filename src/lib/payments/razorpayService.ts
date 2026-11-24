import crypto from 'crypto';
import { razorpayRepo } from '@/lib/db';
import { RazorpayConfig } from '@/types';

export function maskSecret(secret?: string): string {
  if (!secret) return '';
  if (secret.length <= 8) return '••••••••';
  return `${secret.substring(0, 4)}••••••••${secret.substring(secret.length - 4)}`;
}

export async function getActiveRazorpayCredentials(): Promise<{
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  mode: 'test' | 'live';
  isEnabled: boolean;
}> {
  const config = await razorpayRepo.getConfig();
  const mode = config.mode || 'test';
  const isEnabled = config.isEnabled;

  const keyId = mode === 'live' ? config.liveKeyId : config.testKeyId;
  const keySecret = mode === 'live' ? config.liveKeySecret : config.testKeySecret;
  const webhookSecret = mode === 'live' ? config.liveWebhookSecret : config.testWebhookSecret;

  return {
    keyId: keyId || '',
    keySecret: keySecret || '',
    webhookSecret: webhookSecret || '',
    mode,
    isEnabled,
  };
}

/**
 * Creates an order directly with Razorpay API
 */
export async function createRazorpayOrder(
  amountInr: number,
  currency: string = 'INR',
  receipt: string,
  notes?: Record<string, string>
): Promise<{ orderId: string; amount: number; currency: string; keyId: string }> {
  const creds = await getActiveRazorpayCredentials();

  if (!creds.isEnabled) {
    throw new Error('Razorpay Payment Gateway is currently disabled by Platform Administration.');
  }

  if (!creds.keyId || !creds.keySecret) {
    throw new Error(`Razorpay ${creds.mode.toUpperCase()} credentials are not fully configured.`);
  }

  const authHeader = `Basic ${Buffer.from(`${creds.keyId.trim()}:${creds.keySecret.trim()}`).toString('base64')}`;
  const amountInPaise = Math.round(amountInr * 100);

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency: currency.toUpperCase(),
      receipt: receipt.substring(0, 40),
      notes: notes || {},
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Razorpay Order creation failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return {
    orderId: data.id,
    amount: data.amount,
    currency: data.currency,
    keyId: creds.keyId,
  };
}

/**
 * Validates checkout payment signature (orderId|paymentId HMAC SHA256)
 */
export async function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): Promise<boolean> {
  const creds = await getActiveRazorpayCredentials();
  if (!creds.keySecret) return false;

  const expectedSignature = crypto
    .createHmac('sha256', creds.keySecret.trim())
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

/**
 * Validates incoming webhook signature using the webhook secret
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string
): Promise<boolean> {
  const creds = await getActiveRazorpayCredentials();
  if (!creds.webhookSecret) return false;

  const expectedSignature = crypto
    .createHmac('sha256', creds.webhookSecret.trim())
    .update(rawBody)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expectedSignature));
  } catch {
    return false;
  }
}

/**
 * Tests live connection with Razorpay API credentials
 */
export async function testRazorpayConnection(
  mode: 'test' | 'live',
  keyId: string,
  keySecret: string
): Promise<{ success: boolean; latencyMs: number; message: string }> {
  const start = Date.now();
  try {
    if (!keyId || !keySecret) {
      return { success: false, latencyMs: 0, message: 'Key ID and Secret are required to test connection.' };
    }

    const authHeader = `Basic ${Buffer.from(`${keyId.trim()}:${keySecret.trim()}`).toString('base64')}`;
    const res = await fetch('https://api.razorpay.com/v1/payments?count=1', {
      method: 'GET',
      headers: {
        Authorization: authHeader,
      },
      signal: AbortSignal.timeout(10000),
    });

    const latency = Date.now() - start;

    if (!res.ok) {
      const errText = await res.text();
      return {
        success: false,
        latencyMs: latency,
        message: `Connection failed with status ${res.status}: ${errText}`,
      };
    }

    return {
      success: true,
      latencyMs: latency,
      message: `Successfully connected to Razorpay (${mode.toUpperCase()} Mode) in ${latency}ms.`,
    };
  } catch (err: any) {
    return {
      success: false,
      latencyMs: Date.now() - start,
      message: err.message || 'Connection test timed out or failed.',
    };
  }
}
