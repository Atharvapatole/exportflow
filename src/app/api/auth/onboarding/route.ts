import { NextRequest, NextResponse } from 'next/server';
import { getCurrentContext } from '@/lib/auth';
import { orgRepo, adminRepo } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const ctx = await getCurrentContext();
    if (!ctx || !ctx.organization) {
      return NextResponse.json({ error: 'Unauthorized or no active organization' }, { status: 401 });
    }

    const body = await req.json();

    const updatedProfile = await orgRepo.updateProfile(ctx.organization.id, {
      legalName: body.legalName || ctx.organization.name,
      tradingName: body.tradingName || body.legalName || ctx.organization.name,
      businessType: body.businessType || ctx.organization.businessType,
      country: body.country || ctx.organization.country,
      registeredAddress: body.registeredAddress || '',
      city: body.city || '',
      website: body.website || '',
      gstin: body.gstin || '',
      pan: body.pan || '',
      iec: body.iec || '',
      cin: body.cin || '',
      lutNumber: body.lutNumber || '',
      primaryContactName: body.primaryContactName || ctx.user.name,
      primaryContactPhone: body.primaryContactPhone || '',
      primaryContactEmail: body.primaryContactEmail || ctx.user.email,
      designation: body.designation || 'Proprietor / Director',
      bankName: body.bankName || '',
      accountHolderName: body.accountHolderName || '',
      accountNumber: body.accountNumber || '',
      ifscCode: body.ifscCode || '',
      swiftBic: body.swiftBic || '',
      bankBranchAddress: body.bankBranchAddress || '',
      bankCurrency: body.bankCurrency || 'USD',
      defaultCurrency: body.defaultCurrency || 'USD',
      defaultPaymentTerms: body.defaultPaymentTerms || '30% Advance, 70% against BL copy',
      defaultIncoterms: body.defaultIncoterms || 'FOB',
      defaultValidityDays: body.defaultValidityDays ? Number(body.defaultValidityDays) : 15,
      preferredTemplate: body.preferredTemplate || 'classic-corporate',
    });

    await adminRepo.logActivity({
      userId: ctx.user.id,
      userName: ctx.user.name,
      organizationId: ctx.organization.id,
      action: 'ONBOARDING_COMPLETED',
      entity: 'COMPANY_PROFILE',
      entityId: updatedProfile?.id,
      details: `Completed company onboarding setup`,
    });

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      profile: updatedProfile,
    });
  } catch (error: any) {
    console.error('Onboarding save error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save onboarding data' }, { status: 500 });
  }
}
