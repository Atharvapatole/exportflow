import { NextRequest, NextResponse } from 'next/server';
import { getCurrentContext } from '@/lib/auth';
import { runAiCompletion } from '@/lib/ai/aiService';
import { orgRepo } from '@/lib/db';
import { BaseDocument, AiQuotationChangeProposal } from '@/types';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `
You are the "ExportFlow AI Document Assistant" by BENZWELL, an expert international export trade and document documentation AI.
Your job is to assist exporters in preparing, refining, and polishing their official Export Quotations.

IMPORTANT CONSTRAINTS & RULES:
1. You must return ONLY a structured JSON response matching this exact schema:
{
  "summary": "Short 1-line summary of what changes are proposed",
  "explanation": "Friendly, professional explanation to the exporter",
  "changes": {
    /* ONLY the fields from the BaseDocument that are being modified or added */
  },
  "highlightedCommercialChanges": [
    /* Array of any changes to price, quantity, currency, payment terms, tax treatment, or Incoterms */
    {
      "field": "Field Name (e.g. 'Currency', 'Payment Terms', 'Product 1 Price')",
      "oldValue": "Old Value",
      "newValue": "New Value",
      "reason": "Why this was updated"
    }
  ],
  "clarificationNeeded": "If the user instruction was ambiguous (e.g. 'Change the price to $5' when there are multiple items), do not invent or guess. Fill this string with a polite question asking which item to change."
}

2. COMMERCIAL INTEGRITY:
- Never fabricate financial numbers or randomly invent buyer/seller information.
- If the user asks to add or change a discount, specify the new discount percentage or amount on the item or document.
- If the user asks for Incoterm changes (e.g. "Add port of loading as Nhava Sheva"), ensure the named place and Incoterm version are specified properly (e.g., 'FOB Nhava Sheva (INNSA), India — Incoterms 2020').
- If the user asks to add company logo, use the company's saved logo URL provided in the context. If no logo exists in context, instruct them to upload one in Company Profile or Storage. Never invent internet URLs for logos!
- If the user asks to add bank details, set "showBankDetails": true and populate "bankDetails" from the company profile in context.
- If the user asks to remove buyer acceptance, set "showBuyerAcceptance": false.
- If the user asks to change template (e.g. "Use Premium International template"), set "templateId": "premium-international". Supported templates: 'classic-corporate', 'modern-minimal', 'premium-international', 'international-trade', 'compact-business'.
- If the user asks to adjust colors, set "brandingSettings": { "primaryColor": "#...", "secondaryColor": "#...", "logoPosition": "left"|"center"|"right" }.

3. Tone: Highly professional, courteous, international B2B commerce tone.
`;

export async function POST(request: NextRequest) {
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.organization) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const { prompt, currentDoc, chatHistory = [] } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Instruction prompt is required' }, { status: 400 });
    }

    // Check if quotation is locked/issued
    if (currentDoc?.isLocked || currentDoc?.status === 'accepted') {
      return NextResponse.json(
        {
          error:
            'This quotation has been finalized or issued. AI cannot directly edit locked documents. Please create a new revision first.',
        },
        { status: 400 }
      );
    }

    // Prepare current context for the AI
    const orgProfile = ctx.organization ? await orgRepo.getProfile(ctx.organization.id) : null;
    const companyProfile = orgProfile || currentDoc?.sellerDetails || {};
    const contextSummary = {
      quotationNumber: currentDoc?.documentNumber || 'New Draft',
      currency: currentDoc?.currency || 'USD',
      incoterm: currentDoc?.incoterm || 'FOB',
      namedPlace: currentDoc?.namedPlace || currentDoc?.originPort || '',
      buyerCompany: currentDoc?.buyerCompany || '',
      templateId: currentDoc?.templateId || 'classic-corporate',
      itemsCount: currentDoc?.items?.length || 0,
      items: (currentDoc?.items || []).map((it: any, idx: number) => ({
        index: idx + 1,
        name: it.productName,
        hsCode: it.hsCode,
        qty: it.quantity,
        unit: it.unit,
        price: it.unitPrice,
        discount: it.discountPercentage || 0,
        total: it.lineTotal,
      })),
      companySavedLogo: companyProfile.logoUrl || null,
      companySavedSignature: companyProfile.authorizedSignatureUrl || null,
      companySavedStamp: companyProfile.companyStampUrl || null,
      companySavedBank: companyProfile.bankName
        ? {
            bankName: companyProfile.bankName,
            accountNumber: companyProfile.accountNumber,
            swift: companyProfile.swiftBic,
            ifsc: companyProfile.ifscCode,
            beneficiary: companyProfile.accountHolderName || companyProfile.legalName,
          }
        : null,
      brandingSettings: currentDoc?.brandingSettings || {},
      showBankDetails: currentDoc?.showBankDetails ?? false,
      showBuyerAcceptance: currentDoc?.showBuyerAcceptance ?? false,
      paymentTerms: currentDoc?.paymentTerms || '',
      notes: currentDoc?.notes || '',
      termsAndConditions: currentDoc?.termsAndConditions || '',
    };

    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...chatHistory.slice(-4).map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: `
CURRENT QUOTATION STATE:
${JSON.stringify(contextSummary, null, 2)}

USER INSTRUCTION:
"${prompt}"

Analyze the user's intent and provide the exact JSON response.
`,
      },
    ];

    const aiResult = await runAiCompletion(messages, {
      organizationId: ctx.organization.id,
      userId: ctx.user.id,
      quotationId: currentDoc?.id,
      userIntent: prompt.substring(0, 150),
      responseFormat: 'json',
    });

    const parsed: AiQuotationChangeProposal =
      aiResult.parsedJson || JSON.parse(aiResult.text);

    return NextResponse.json({
      success: true,
      proposal: parsed,
      provider: aiResult.provider,
      model: aiResult.model,
      latencyMs: aiResult.latencyMs,
    });
  } catch (err: any) {
    console.error('AI Quotation Assistant Error:', err);
    return NextResponse.json(
      {
        error:
          err.message ||
          'Failed to process instruction with AI Document Assistant. Please verify OpenRouter / backup AI provider settings in Super Admin.',
      },
      { status: 500 }
    );
  }
}
