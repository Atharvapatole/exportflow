import { NextRequest, NextResponse } from 'next/server';
import { getCurrentContext } from '@/lib/auth';
import { walletRepo, subscriptionRepo } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const ctx = await getCurrentContext();
    if (!ctx || !ctx.organization?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [wallet, sub, aiBalance] = await Promise.all([
      walletRepo.getOrCreateWallet(ctx.organization.id),
      subscriptionRepo.findByOrg(ctx.organization.id),
      walletRepo.getAiCreditBalance(ctx.organization.id),
    ]);

    return NextResponse.json({
      wallet,
      subscription: sub,
      aiBalance: {
        aiMessages: aiBalance.aiMessages,
        balanceCredits: aiBalance.balanceCredits,
        totalAvailable: aiBalance.aiMessages + aiBalance.balanceCredits,
        canUseAi: aiBalance.canUseAi,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
