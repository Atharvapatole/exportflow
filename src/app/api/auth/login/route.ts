import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { userRepo, orgRepo, adminRepo, platformAdminRepo } from '@/lib/db';
import {
  verifyPassword,
  hashPassword,
  setSessionCookie,
  ensureSuperAdminInitialized,
  SESSION_COOKIE_NAME,
  createSessionToken,
  SessionData,
} from '@/lib/auth';
import { infraConfig } from '@/config/infrastructure';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await ensureSuperAdminInitialized();
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: (result.error as any).issues?.[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const cleanEmail = email.trim().toLowerCase();

    // Check if logging in as bootstrap admin
    const bootstrapConfig = infraConfig.getAdminBootstrapConfig();
    const isBootstrapAdminAttempt = cleanEmail === bootstrapConfig.email.toLowerCase();

    // 1. ATTEMPT SUPABASE AUTH FIRST
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
    } catch (err: any) {
      console.warn('[LOGIN] Supabase SSR auth attempt note:', err.message);
    }

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
      } catch (directErr: any) {
        console.warn('[LOGIN] Direct Supabase auth attempt note:', directErr.message);
      }
    }

    let user = await userRepo.findByEmail(cleanEmail);

    if (supaAuthSuccess && supaUser) {
      // 2A. SUPABASE AUTH SUCCEEDED
      if (!user) {
        // Auto-provision user in local store from Supabase profile
        let supaProf: any = null;
        let adminClient: any = null;
        try {
          adminClient = createAdminClient();
          if (adminClient) {
            const { data: prof } = await adminClient.from('profiles').select('*').eq('id', supaUser.id).single();
            supaProf = prof;
          }
        } catch {}

        const userName = supaProf?.name || supaUser.user_metadata?.name || cleanEmail.split('@')[0];
        const userRole = supaProf?.role || supaUser.user_metadata?.role || 'owner';
        let orgId = supaProf?.current_org_id || undefined;

        user = await userRepo.create({
          id: supaUser.id,
          name: userName,
          email: cleanEmail,
          passwordHash: hashPassword(password),
          role: userRole,
          status: 'active',
          currentOrgId: orgId,
          lastActiveAt: new Date().toISOString(),
        });

        if (orgId && adminClient) {
          const existingOrg = await orgRepo.findById(orgId);
          if (!existingOrg) {
            try {
              const { data: orgRow } = await adminClient.from('organizations').select('*').eq('id', orgId).single();
              await orgRepo.create(
                {
                  id: orgId,
                  name: orgRow?.name || supaUser.user_metadata?.companyName || 'My Export Company',
                  businessType: orgRow?.business_type || 'Manufacturer & Exporter',
                  country: orgRow?.country || supaUser.user_metadata?.country || 'India',
                  ownerId: supaUser.id,
                },
                cleanEmail,
                userName
              );
            } catch {}
          }
        }
      } else {
        // Keep local password hash in sync with Supabase password
        await userRepo.update(user.id, {
          passwordHash: hashPassword(password),
          lastActiveAt: new Date().toISOString(),
        });
      }
    } else {
      // 2B. LOCAL VERIFICATION FALLBACK
      if (!user) {
        return NextResponse.json(
          { error: 'Invalid email address or password.' },
          { status: 401 }
        );
      }

      const isPasswordValid =
        (isBootstrapAdminAttempt && password === bootstrapConfig.secret) ||
        (user.passwordHash && verifyPassword(password, user.passwordHash));

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Invalid email address or password.' },
          { status: 401 }
        );
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User account could not be loaded.' },
        { status: 401 }
      );
    }

    if (user.status === 'suspended') {
      return NextResponse.json(
        { error: 'Your account has been suspended. Please contact support.' },
        { status: 403 }
      );
    }

    if (user.status === 'disabled') {
      return NextResponse.json(
        { error: 'Your account has been disabled.' },
        { status: 403 }
      );
    }

    // Determine or ensure organization
    let orgId = user.currentOrgId;
    if (!orgId) {
      const userOrgs = await orgRepo.listByUser(user.id);
      if (userOrgs.length > 0) {
        orgId = userOrgs[0].id;
        await userRepo.update(user.id, { currentOrgId: orgId });
      } else {
        // Auto-provision a default company so customer is never organization-less
        try {
          const newOrg = await orgRepo.create(
            {
              name: `${user.name}'s Exports`,
              businessType: 'Manufacturer & Exporter',
              country: 'India',
              ownerId: user.id,
            },
            user.email,
            user.name
          );
          orgId = newOrg.organization.id;
          await userRepo.update(user.id, { currentOrgId: orgId });
        } catch {}
      }
    }

    // Update lastActiveAt
    await userRepo.update(user.id, { lastActiveAt: new Date().toISOString() });

    // Check if user is Super Admin via user record or platformAdminRepo
    const platformAdmin = await platformAdminRepo.findByEmail(cleanEmail);
    const isSuperAdmin = (user.role === 'super_admin' || platformAdmin?.role === 'SUPER_ADMIN') && platformAdmin?.isActive !== false;

    const sessionData: SessionData = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: isSuperAdmin ? 'super_admin' : user.role,
      orgId,
    };

    // Establish cookie in next/headers store
    await setSessionCookie(sessionData);

    // Also sign in to Supabase SSR if not already done
    if (!supaAuthSuccess) {
      try {
        const supabase = await createSupabaseServerClient();
        if (supabase) {
          await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });
        }
      } catch {}
    }

    // Log Activity
    await adminRepo.logActivity({
      userId: user.id,
      userName: user.name,
      organizationId: orgId,
      action: 'USER_LOGIN',
      entity: 'AUTH',
      entityId: user.id,
      details: `User logged in from web client`,
    });

    const token = createSessionToken(sessionData);

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      redirectUrl: '/dashboard',
      isSuperAdmin: false,
    });

    // Explicitly attach Set-Cookie header directly to response
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: false, // Ensures cookie is sent on localhost and production without SSL drops
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error during login.' },
      { status: 500 }
    );
  }
}
