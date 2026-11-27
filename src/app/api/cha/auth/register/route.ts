import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { userRepo, orgRepo, adminRepo } from '@/lib/db';
import {
  hashPassword,
  setSessionCookie,
  ensureSuperAdminInitialized,
  SESSION_COOKIE_NAME,
  createSessionToken,
  SessionData,
} from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

const chaRegisterSchema = z.object({
  name: z.string().min(2, 'Contact person name is required'),
  email: z.string().email('Invalid business email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firmName: z.string().min(2, 'Customs Broker / Forwarding Firm name is required'),
  licenseNumber: z.string().min(3, 'Customs Broker License No. is required'),
  customsAuthority: z.string().min(2, 'Customs Station / Commissionerate is required'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await ensureSuperAdminInitialized();
    const body = await req.json();
    const result = chaRegisterSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: (result.error as any).issues?.[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      password,
      firmName,
      licenseNumber,
      customsAuthority,
      phone,
      address,
      city,
      state,
    } = result.data;
    const cleanEmail = email.trim().toLowerCase();

    // Check existing in local store
    const existingLocalUser = await userRepo.findByEmail(cleanEmail);
    if (existingLocalUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    let supaUserId: string | null = null;
    let supaOrgId: string | null = null;

    // 1. Save in Supabase Auth & Database
    try {
      const adminClient = createAdminClient();
      if (adminClient) {
        // Check if user already exists in Supabase
        const { data: supaUsers } = await adminClient.auth.admin.listUsers();
        const existingSupaUser = supaUsers?.users?.find(
          (u) => u.email?.toLowerCase() === cleanEmail
        );

        if (existingSupaUser) {
          return NextResponse.json(
            { error: 'An account with this email address already exists in Supabase.' },
            { status: 409 }
          );
        }

        const { data: supaAuthData, error: supaAuthErr } = await adminClient.auth.admin.createUser({
          email: cleanEmail,
          password,
          email_confirm: true,
          user_metadata: {
            name,
            firmName,
            licenseNumber,
            customsAuthority,
            role: 'owner',
            userType: 'cha',
          },
        });

        if (supaAuthErr) {
          return NextResponse.json(
            { error: supaAuthErr.message || 'Failed to create CHA account in Supabase' },
            { status: 400 }
          );
        }

        if (supaAuthData?.user) {
          supaUserId = supaAuthData.user.id;
          const now = new Date().toISOString();

          await adminClient.from('profiles').upsert({
            id: supaUserId,
            email: cleanEmail,
            name,
            role: 'owner',
            status: 'active',
            last_active_at: now,
            created_at: now,
            updated_at: now,
          });

          const slug =
            firmName
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '')
              .slice(0, 50) || 'cha-firm';

          const { data: orgData, error: orgErr } = await adminClient
            .from('organizations')
            .insert({
              name: firmName,
              slug,
              owner_id: supaUserId,
              country: 'India',
              business_type: 'Customs Broker & Freight Forwarder',
              org_type: 'cha',
              cha_license_number: licenseNumber,
              cha_license_authority: customsAuthority,
              cha_license_status: 'unverified', // Unverified until Super Admin verifies
            })
            .select()
            .maybeSingle();

          if (orgData) {
            supaOrgId = orgData.id;
            await adminClient.from('organization_members').insert({
              organization_id: supaOrgId,
              user_id: supaUserId,
              role: 'owner',
              status: 'active',
            });
            await adminClient
              .from('profiles')
              .update({ current_org_id: supaOrgId })
              .eq('id', supaUserId);
          }
        }
      }
    } catch (err: any) {
      console.warn('[CHA REGISTER] Supabase sync warning:', err.message);
    }

    // 2. Save in local repository
    const newUser = await userRepo.create({
      id: supaUserId || undefined,
      name,
      email: cleanEmail,
      passwordHash: hashPassword(password),
      role: 'owner',
      status: 'active',
      currentOrgId: supaOrgId || undefined,
      lastActiveAt: new Date().toISOString(),
    });

    const { organization } = await orgRepo.create(
      {
        id: supaOrgId || undefined,
        name: firmName,
        businessType: 'Customs House Agent (CHA)',
        country: 'India',
        ownerId: newUser.id,
        orgType: 'cha',
        chaLicenseNumber: licenseNumber,
        chaLicenseAuthority: customsAuthority,
        chaLicenseStatus: 'unverified',
        address: address ? `${address}, ${city || ''} ${state || ''}` : undefined,
        phone,
      },
      cleanEmail,
      name
    );

    if (!newUser.currentOrgId) {
      await userRepo.update(newUser.id, { currentOrgId: organization.id });
    }

    const sessionData: SessionData = {
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: 'owner',
      orgId: organization.id,
    };

    await setSessionCookie(sessionData);

    await adminRepo.logActivity({
      userId: newUser.id,
      userName: newUser.name,
      organizationId: organization.id,
      action: 'CHA_REGISTRATION',
      entity: 'ORGANIZATION',
      entityId: organization.id,
      details: `New CHA broker account registered: ${firmName} (Lic: ${licenseNumber})`,
    });

    const token = createSessionToken(sessionData);
    const response = NextResponse.json({
      success: true,
      message: 'CHA account registered successfully.',
      redirectUrl: '/cha/activate-trial',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      organization: {
        id: organization.id,
        name: organization.name,
        orgType: 'cha',
        chaLicenseNumber: licenseNumber,
        chaLicenseStatus: 'unverified',
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error: any) {
    console.error('CHA Registration error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error during CHA registration' },
      { status: 500 }
    );
  }
}
