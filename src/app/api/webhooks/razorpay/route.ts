import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/payments/razorpayService';
import { razorpayRepo, walletRepo, subscriptionRepo, adminRepo } from '@/lib/db';
import { PRICING_CATALOG } from '@/config/constants';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let rawBody = '';
  try {
    rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';

    const isValid = await verifyWebhookSignature(rawBody, signature);
    const now = new Date().toISOString();

    if (!isValid) {
      const config = await razorpayRepo.getConfig();
      await razorpayRepo.updateConfig({
        webhookStatus: 'error',
        failedWebhookCount: (config.failedWebhookCount || 0) + 1,
        lastReceivedWebhook: now,
      });

      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const eventId = payload.event_id || payload.id || `evt_${Date.now()}`;
    const eventType = payload.event || 'unknown';

    // Idempotency check: Don't re-process duplicate events
    if (razorpayRepo.isWebhookEventProcessed(eventId)) {
      return NextResponse.json({ status: 'already_processed', eventId });
    }

    // Process event
    let processingError = undefined;

    try {
      if (eventType === 'order.paid' || eventType === 'payment.captured') {
        const paymentEntity = payload.payload?.payment?.entity || payload.payload?.order?.entity;
        const orderId = paymentEntity?.order_id || paymentEntity?.id;
        const paymentId = paymentEntity?.id;

        if (orderId) {
          const log = razorpayRepo.getPaymentLogByOrderId(orderId);
          if (log && log.status !== 'captured') {
            await razorpayRepo.updatePaymentLog(orderId, {
              paymentId: paymentId || log.paymentId,
              status: 'captured',
            });

            // Fulfill credits or plan
            if (log.itemType === 'credit_pack') {
              const pack = PRICING_CATALOG.creditPacks.find((p) => p.id === log.itemId);
              if (pack) {
                await walletRepo.addCredits(log.organizationId, pack.credits, 'lifetime');
              }
            } else if (log.itemType === 'subscription') {
              const sub = PRICING_CATALOG.subscriptions.find((s) => s.id === log.itemId);
              if (sub) {
                await subscriptionRepo.activatePlan(log.organizationId, sub.id as any, 'monthly');
                await walletRepo.addCredits(log.organizationId, sub.allowances, 'subscription');
              }
            }
          }
        }
      } else if (eventType === 'payment.failed') {
        const paymentEntity = payload.payload?.payment?.entity;
        const orderId = paymentEntity?.order_id;
        if (orderId) {
          await razorpayRepo.updatePaymentLog(orderId, {
            status: 'failed',
            errorDetails: paymentEntity?.error_description || 'Payment failed',
          });
        }
      } else if (eventType === 'refund.created' || eventType === 'refund.processed') {
        const paymentEntity = payload.payload?.payment?.entity;
        const orderId = paymentEntity?.order_id;
        if (orderId) {
          await razorpayRepo.updatePaymentLog(orderId, {
            status: 'refunded',
          });
        }
      }
    } catch (procErr: any) {
      processingError = procErr.message;
      console.error('Webhook event handling error:', procErr);
    }

    // Log webhook event
    await razorpayRepo.logWebhookEvent({
      id: eventId,
      eventType,
      payload,
      signature,
      status: processingError ? 'failed' : 'processed',
      errorMessage: processingError,
    });

    // Mark webhook status verified on actual incoming signed event
    await razorpayRepo.updateConfig({
      webhookStatus: 'verified',
      lastReceivedWebhook: now,
      lastSuccessfulWebhook: now,
    });

    return NextResponse.json({
      status: 'received',
      eventId,
      processed: !processingError,
    });
  } catch (err: any) {
    console.error('Razorpay Webhook Error:', err);
    return NextResponse.json({ error: err.message || 'Webhook processing failed' }, { status: 500 });
  }
}
