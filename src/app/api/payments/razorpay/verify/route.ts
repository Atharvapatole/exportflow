import { NextRequest, NextResponse } from 'next/server';
import { getCurrentContext } from '@/lib/auth';
import { verifyPaymentSignature } from '@/lib/payments/razorpayService';
import { razorpayRepo, walletRepo, subscriptionRepo, adminRepo } from '@/lib/db';
import { PRICING_CATALOG } from '@/config/constants';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ctx = await getCurrentContext();
    if (!ctx || !ctx.organization) {
      return NextResponse.json({ error: 'Unauthorized: Organization session required' }, { status: 401 });
    }

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment signature verification parameters' }, { status: 400 });
    }

    const isValid = await verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      await razorpayRepo.updatePaymentLog(razorpay_order_id, {
        status: 'failed',
        errorDetails: 'Invalid payment signature',
      });
      return NextResponse.json({ error: 'Invalid payment signature. Payment cannot be verified.' }, { status: 400 });
    }

    const log = razorpayRepo.getPaymentLogByOrderId(razorpay_order_id);
    if (!log) {
      return NextResponse.json({ error: 'Payment order record not found' }, { status: 404 });
    }

    // Idempotency check: if already captured, don't duplicate credits
    if (log.status === 'captured') {
      return NextResponse.json({ success: true, message: 'Payment already processed successfully.' });
    }

    // Update payment log to captured
    await razorpayRepo.updatePaymentLog(razorpay_order_id, {
      paymentId: razorpay_payment_id,
      status: 'captured',
    });

    // Fulfill order based on itemType
    if (log.itemType === 'credit_pack') {
      const pack = PRICING_CATALOG.creditPacks.find((p) => p.id === log.itemId);
      if (pack) {
        await walletRepo.addCredits(log.organizationId, pack.credits, 'lifetime');
      }
    } else if (log.itemType === 'subscription') {
      const allPlans = [
        ...PRICING_CATALOG.exporterPlans,
        ...PRICING_CATALOG.chaPlans,
        ...(PRICING_CATALOG.subscriptions || []),
      ];
      const sub = allPlans.find((s) => s.id === log.itemId);
      if (sub) {
        await subscriptionRepo.activatePlan(log.organizationId, sub.id as any, 'monthly');
        if (sub.allowances) {
          await walletRepo.addCredits(log.organizationId, sub.allowances, 'subscription');
        }
      }
    }

    // Log platform revenue
    await adminRepo.addRevenueRecord({
      reference: razorpay_payment_id,
      customerName: ctx.organization.name,
      category: 'other',
      amount: log.amount,
      currency: log.currency,
      dateReceived: new Date().toISOString(),
      paymentMethod: 'Razorpay',
      transactionReference: razorpay_payment_id,
      description: log.description,
      status: 'completed',
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified and document entitlements allocated successfully.',
    });
  } catch (err: any) {
    console.error('Payment verification error:', err);
    return NextResponse.json({ error: err.message || 'Payment verification failed' }, { status: 500 });
  }
}
