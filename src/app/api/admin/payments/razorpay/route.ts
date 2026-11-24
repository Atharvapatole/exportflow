import { NextRequest, NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/auth';
import { razorpayRepo, adminRepo } from '@/lib/db';
import { maskSecret, testRazorpayConnection } from '@/lib/payments/razorpayService';
import { infraConfig } from '@/config/infrastructure';

export const dynamic = 'force-dynamic';

export async function GET() {
  const ctx = await getAdminContext();
  if (!ctx || !ctx.isSuperAdmin) {
    return NextResponse.json({ error: 'Unauthorized: Super Admin access required' }, { status: 403 });
  }

  const config = await razorpayRepo.getConfig();
  const webhookEvents = razorpayRepo.listWebhookEvents(20);
  const paymentLogs = razorpayRepo.listPaymentLogs(undefined, 20);

  const appUrl = infraConfig.getAppUrl();
  const webhookUrl = `${appUrl}/api/webhooks/razorpay`;

  // Never return raw secret keys in plaintext
  const safeConfig = {
    ...config,
    testKeySecretMasked: maskSecret(config.testKeySecret),
    liveKeySecretMasked: maskSecret(config.liveKeySecret),
    testWebhookSecretMasked: maskSecret(config.testWebhookSecret),
    liveWebhookSecretMasked: maskSecret(config.liveWebhookSecret),
    hasTestSecret: Boolean(config.testKeySecret),
    hasLiveSecret: Boolean(config.liveKeySecret),
    hasTestWebhookSecret: Boolean(config.testWebhookSecret),
    hasLiveWebhookSecret: Boolean(config.liveWebhookSecret),
    testKeySecret: undefined,
    liveKeySecret: undefined,
    testWebhookSecret: undefined,
    liveWebhookSecret: undefined,
    webhookUrl,
  };

  return NextResponse.json({
    config: safeConfig,
    webhookEvents,
    paymentLogs,
    webhookUrl,
  });
}

export async function PUT(req: NextRequest) {
  const ctx = await getAdminContext();
  if (!ctx || !ctx.isSuperAdmin) {
    return NextResponse.json({ error: 'Unauthorized: Super Admin access required' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const current = await razorpayRepo.getConfig();
    const updates: any = {};

    if (typeof body.isEnabled === 'boolean') updates.isEnabled = body.isEnabled;
    if (body.mode && (body.mode === 'test' || body.mode === 'live')) updates.mode = body.mode;
    if (body.merchantDisplayName) updates.merchantDisplayName = body.merchantDisplayName.trim();
    if (body.merchantSupportEmail) updates.merchantSupportEmail = body.merchantSupportEmail.trim();

    // Test credentials
    if (body.testKeyId !== undefined) updates.testKeyId = body.testKeyId.trim();
    if (body.testKeySecret && !body.testKeySecret.includes('••••')) {
      updates.testKeySecret = body.testKeySecret.trim();
    }
    if (body.testWebhookSecret && !body.testWebhookSecret.includes('••••')) {
      updates.testWebhookSecret = body.testWebhookSecret.trim();
    }

    // Live credentials
    if (body.liveKeyId !== undefined) updates.liveKeyId = body.liveKeyId.trim();
    if (body.liveKeySecret && !body.liveKeySecret.includes('••••')) {
      updates.liveKeySecret = body.liveKeySecret.trim();
    }
    if (body.liveWebhookSecret && !body.liveWebhookSecret.includes('••••')) {
      updates.liveWebhookSecret = body.liveWebhookSecret.trim();
    }

    // Evaluate gateway status
    const activeKey = (updates.mode || current.mode) === 'live' ? (updates.liveKeyId ?? current.liveKeyId) : (updates.testKeyId ?? current.testKeyId);
    const activeSec = (updates.mode || current.mode) === 'live' ? (updates.liveKeySecret ?? current.liveKeySecret) : (updates.testKeySecret ?? current.testKeySecret);
    const isEn = updates.isEnabled !== undefined ? updates.isEnabled : current.isEnabled;

    if (!isEn) {
      updates.status = 'inactive';
    } else if (activeKey && activeSec) {
      updates.status = 'active';
    } else {
      updates.status = 'unconfigured';
    }

    const updated = await razorpayRepo.updateConfig(updates);

    await adminRepo.logAudit({
      adminId: ctx.user.id,
      adminEmail: ctx.user.email,
      action: 'UPDATE_RAZORPAY_CONFIG',
      targetEntity: 'razorpay_configurations',
      targetId: updated.id,
      details: {
        mode: updated.mode,
        isEnabled: updated.isEnabled,
        status: updated.status,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Razorpay configuration saved successfully.',
      config: {
        ...updated,
        testKeySecretMasked: maskSecret(updated.testKeySecret),
        liveKeySecretMasked: maskSecret(updated.liveKeySecret),
        testWebhookSecretMasked: maskSecret(updated.testWebhookSecret),
        liveWebhookSecretMasked: maskSecret(updated.liveWebhookSecret),
        testKeySecret: undefined,
        liveKeySecret: undefined,
        testWebhookSecret: undefined,
        liveWebhookSecret: undefined,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update Razorpay configuration' }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  const ctx = await getAdminContext();
  if (!ctx || !ctx.isSuperAdmin) {
    return NextResponse.json({ error: 'Unauthorized: Super Admin access required' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const config = await razorpayRepo.getConfig();
    const mode = body.mode || config.mode;

    let keyId = body.keyId;
    let keySecret = body.keySecret;

    if (!keyId || keyId.includes('••••')) {
      keyId = mode === 'live' ? config.liveKeyId : config.testKeyId;
    }
    if (!keySecret || keySecret.includes('••••')) {
      keySecret = mode === 'live' ? config.liveKeySecret : config.testKeySecret;
    }

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { success: false, message: `Please enter both ${mode.toUpperCase()} Key ID and Key Secret to test connection.` },
        { status: 400 }
      );
    }

    const result = await testRazorpayConnection(mode, keyId, keySecret);

    if (result.success) {
      await razorpayRepo.updateConfig({
        lastSuccessfulConnection: new Date().toISOString(),
      });
    }

    await adminRepo.logAudit({
      adminId: ctx.user.id,
      adminEmail: ctx.user.email,
      action: `TEST_RAZORPAY_CONNECTION_${mode.toUpperCase()}`,
      targetEntity: 'razorpay_configurations',
      targetId: mode,
      details: {
        success: result.success,
        latencyMs: result.latencyMs,
      },
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Connection test failed' }, { status: 500 });
  }
}
