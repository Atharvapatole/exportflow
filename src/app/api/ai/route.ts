import { NextRequest, NextResponse } from 'next/server';
import { getCurrentContext } from '@/lib/auth';
import { orgRepo, productRepo, buyerRepo, documentRepo, walletRepo } from '@/lib/db';
import { runAiCompletion } from '@/lib/ai/aiService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ctx = await getCurrentContext();
    if (!ctx || !ctx.organization) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const userPrompt = body.prompt;
    if (!userPrompt) return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });

    // Strict AI Message Limit Check (1 credit per AI prompt / message)
    const aiBalance = await walletRepo.getAiCreditBalance(ctx.organization.id);
    if (!aiBalance.canUseAi) {
      return NextResponse.json(
        {
          error: 'AI_LIMIT_REACHED',
          message: 'You have exhausted your available AI Assistant messages for this billing period. Please upgrade your plan or purchase an AI Credit Pack to continue.',
          remainingCredits: 0,
        },
        { status: 403 }
      );
    }

    // Tenant-isolated context
    const [profile, products, buyers, recentDocs] = await Promise.all([
      orgRepo.getProfile(ctx.organization.id),
      productRepo.listByOrg(ctx.organization.id),
      buyerRepo.listByOrg(ctx.organization.id),
      documentRepo.listByOrg(ctx.organization.id),
    ]);

    const systemContext = `You are ExportFlow AI by BENZWELL, a senior international trade advisor and export business specialist.
You assist verified exporters with:
1. Drafting professional buyer correspondence, quotation cover emails, follow-ups, and negotiation messages.
2. Explaining Incoterms 2020 (EXW, FOB, CFR, CIF, DAP, DDP, etc.) responsibilities for buyer and seller.
3. Structuring commercial payment terms (TT, L/C at sight, usance, advance).
4. Generating compelling technical product descriptions for export catalogs.
5. Clarifying customs documentation requirements (Shipping Bills, B/L, Certificate of Origin, eBRC).

CURRENT EXPORTER CONTEXT (STRICTLY ISOLATED TO THIS COMPANY):
- Company: ${profile?.legalName || ctx.organization.name}
- Country: ${profile?.country || ctx.organization.country}
- Products Catalog: ${products.slice(0, 5).map((p) => `${p.name} (HS: ${p.hsCode}, FOB Price: ${p.defaultCurrency} ${p.sellingPrice})`).join(', ') || 'None registered yet'}
- Registered Buyers: ${buyers.slice(0, 5).map((b) => `${b.companyName} (${b.country})`).join(', ') || 'None yet'}
- Active Documents Count: ${recentDocs.length}

RULES:
- Provide concise, formal, B2B international trade responses.
- Never claim to have sent an email, charged money, or submitted documents to government customs.
- Clearly present drafted emails with Subject line and Body.`;

    try {
      const completion = await runAiCompletion(
        [
          { role: 'system', content: systemContext },
          { role: 'user', content: userPrompt },
        ],
        {
          organizationId: ctx.organization.id,
          userId: ctx.user.id,
          userIntent: 'export_advisory_chat',
        }
      );

      // Deduct 1 AI credit upon successful inference
      await walletRepo.useAiCredit(ctx.organization.id);
      const updatedBalance = await walletRepo.getAiCreditBalance(ctx.organization.id);

      return NextResponse.json({
        reply: completion.text,
        model: completion.model,
        provider: completion.provider,
        remainingCredits: updatedBalance.aiMessages + updatedBalance.balanceCredits,
      });
    } catch (aiErr: any) {
      console.warn('Unified AI completion fallback triggered:', aiErr.message);

      // Graceful offline fallback expert rule engine if no provider keys configured
      let simulatedReply = '';
      const lower = userPrompt.toLowerCase();

      if (lower.includes('email') || lower.includes('quotation')) {
        simulatedReply = `Subject: Official Export Quotation — ${profile?.legalName || 'Apex Global Exports'}\n\nDear Purchasing Team,\n\nThank you for your inquiry regarding our export product line.\n\nWe are pleased to submit our formal Export Quotation for your review. All prices have been quoted under standard Incoterms 2020 rules with seaworthy export packaging.\n\nPlease find the attached formal quotation and technical data sheet. We look forward to confirming your specifications and issuing the formal Proforma Invoice.\n\nWarm regards,\n${profile?.primaryContactName || ctx.user.name}\n${profile?.legalName || ctx.organization.name}`;
      } else if (lower.includes('incoterm') || lower.includes('fob') || lower.includes('cif')) {
        simulatedReply = `Under Incoterms 2020:\n- **FOB (Free on Board):** As the exporter, your obligation ends once the goods pass over the vessel's rail at the origin port. The buyer pays international ocean freight and marine cargo insurance.\n- **CIF (Cost, Insurance & Freight):** You (the exporter) arrange and pay for the ocean freight and obtain minimum cargo insurance up to the named destination port. Risk transfers to the buyer once goods are on board the ship.`;
      } else {
        simulatedReply = `ExportFlow Assistant Advisory:\n\nRegarding "${userPrompt}":\nFor international export transactions, ensure all commercial terms (payment milestones, Incoterm point of delivery, and currency fluctuation clause) are explicitly detailed in both your Quotation and Proforma Invoice before cargo dispatch.\n\n(Note: Configure your OpenRouter API key in Super Admin Settings > AI Engine to activate live multi-provider inference).`;
      }

      // Also deduct 1 AI credit for fallback response
      await walletRepo.useAiCredit(ctx.organization.id);
      const updatedBalance = await walletRepo.getAiCreditBalance(ctx.organization.id);

      return NextResponse.json({
        reply: simulatedReply,
        fallback: true,
        remainingCredits: updatedBalance.aiMessages + updatedBalance.balanceCredits,
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
