import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { userRepo, orgRepo, adminRepo, platformAdminRepo } from '@/lib/db';
import {
  verifyPassword,
  setSessionCookie,
  ensureSuperAdminInitialized,
  SESSION_COOKIE_NAME,
  createSessionToken,
  SessionData,
} from '@/lib/auth';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const chaLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await ensureSuperAdminInitialized();
    const body = await req.json();
    const result = chaLoginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: (result.error as any).issues?.[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const cleanEmail = email.trim().toLowerCase();

    // 1. Supabase Auth attempt
    let supaUser: any = null;
    let supaAuthSuccess = false;

    try {
      const supabase = await createSupabaseServerClient();
      if (supabase) {
        const { data: supaAuthData, error: supaAuthErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (supaAuthData?.user && !supaAuthErr) {
          supaUser = supaAuthData.user;
          supaAuthSuccess = true;
        }
      }
    } catch {}

    if (!supaAuthSuccess) {
      try {
        const { createClient: createSupabaseJsClient } = await import('@supabase/supabase-js');
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
        if (url && anonKey) {
          const directClient = createSupabaseJsClient(url, anonKey);
          const { data: directData, error: directErr } = await directClient.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });
          if (directData?.user && !directErr) {
            supaUser = directData.user;
            supaAuthSuccess = true;
          }
        }
      } catch {}
    }

    let user = await userRepo.findByEmail(cleanEmail);

    if (supaAuthSuccess && supaUser) {
      if (!user) {
        let supaProf: any = null;
        try {
          const adminClient = createAdminClient();
          if (adminClient) {
            const { data: prof } = await adminClient.from('profiles').select('*').eq('id', supaUser.id).single();
            supaProf = prof;
          }
        } catch {}

        user = await userRepo.create({
          id: supaUser.id,
          name: supaProf?.name || supaUser.user_metadata?.name || supaUser.email?.split('@')[0] || 'CHA User',
          email: cleanEmail,
          role: supaProf?.role || supaUser.user_metadata?.role || 'owner',
          status: supaProf?.status || 'active',
          currentOrgId: supaProf?.current_org_id || undefined,
          lastActiveAt: new Date().toISOString(),
        });
      }
    } else {
      if (!user) {
        return NextResponse.json(
          { error: 'No account found with this email. Please register as a Customs Broker.' },
          { status: 401 }
        );
      }

      const isPasswordValid = user.passwordHash && verifyPassword(password, user.passwordHash);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Invalid email or password.' },
          { status: 401 }
        );
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'User account could not be loaded.' }, { status: 401 });
    }

    // Determine or ensure CHA Organization
    let orgId = user.currentOrgId;
    let org = orgId ? await orgRepo.findById(orgId) : null;

    if (!org) {
      const userOrgs = await orgRepo.listByUser(user.id);
      const chaOrg = userOrgs.find((o) => o.orgType === 'cha') || userOrgs[0];
      if (chaOrg) {
        org = chaOrg;
        orgId = chaOrg.id;
        await userRepo.update(user.id, { currentOrgId: orgId });
      } else {
        // Auto-provision CHA organization
        const newOrg = await orgRepo.create(
          {
            name: `${user.name} Customs Brokerage`,
            businessType: 'Customs House Agent (CHA)',
            country: 'India',
            ownerId: user.id,
            orgType: 'cha',
            chaLicenseStatus: 'unverified',
          },
          user.email,
          user.name
        );
        org = newOrg.organization;
        orgId = org.id;
        await userRepo.update(user.id, { currentOrgId: orgId });
      }
    }

    const platformAdmin = await platformAdminRepo.findByEmail(cleanEmail);
    const isSuperAdmin = (user.role === 'super_admin' || platformAdmin?.role === 'SUPER_ADMIN') && platformAdmin?.isActive !== false;

    const sessionData: SessionData = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: isSuperAdmin ? 'super_admin' : user.role,
      orgId,
    };

    await setSessionCookie(sessionData);

    const token = createSessionToken(sessionData);
    const response = NextResponse.json({
      success: true,
      message: 'CHA login successful',
      redirectUrl: '/cha/dashboard',
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
    console.error('CHA login error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error during CHA login' },
      { status: 500 }
    );
  }
}
