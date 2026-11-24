import { NextRequest, NextResponse } from 'next/server';
import { getCurrentContext } from '@/lib/auth';
import { createRazorpayOrder } from '@/lib/payments/razorpayService';
import { razorpayRepo, adminRepo } from '@/lib/db';
import { PRICING_CATALOG } from '@/config/constants';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ctx = await getCurrentContext();
    if (!ctx || !ctx.organization) {
      return NextResponse.json({ error: 'Unauthorized: Organization session required' }, { status: 401 });
    }

    const body = await req.json();
    const { itemType, itemId, billingCycle = 'monthly' } = body;

    let priceInr = 0;
    let itemName = '';
    let creditsToAdd = undefined;

    if (itemType === 'credit_pack') {
      const pack = PRICING_CATALOG.creditPacks.find((p) => p.id === itemId);
      if (!pack) {
        return NextResponse.json({ error: 'Invalid credit pack selected' }, { status: 400 });
      }
      priceInr = pack.priceInr;
      itemName = pack.name;
      creditsToAdd = pack.credits;
    } else if (itemType === 'subscription') {
      const sub = PRICING_CATALOG.subscriptions.find((s) => s.id === itemId);
      if (!sub) {
        return NextResponse.json({ error: 'Invalid subscription plan selected' }, { status: 400 });
      }
      priceInr = billingCycle === 'annual' ? sub.annualPriceInr : sub.monthlyPriceInr;
      itemName = `${sub.name} (${billingCycle === 'annual' ? 'Annual' : 'Monthly'})`;
      creditsToAdd = sub.allowances;
    } else {
      return NextResponse.json({ error: 'Invalid item type' }, { status: 400 });
    }

    const receipt = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const notes: Record<string, string> = {
      organizationId: ctx.organization.id,
      userId: ctx.user.id,
      itemType,
      itemId,
      billingCycle,
    };

    const order = await createRazorpayOrder(priceInr, 'INR', receipt, notes);

    // Record pending order log
    await razorpayRepo.createPaymentLog({
      organizationId: ctx.organization.id,
      userId: ctx.user.id,
      orderId: order.orderId,
      amount: priceInr,
      currency: 'INR',
      status: 'created',
      itemType,
      itemId,
      description: itemName,
      creditsAdded: creditsToAdd,
    });

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
      keyId: order.keyId,
      itemName,
    });
  } catch (err: any) {
    console.error('Order creation error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create payment order' }, { status: 500 });
  }
}
