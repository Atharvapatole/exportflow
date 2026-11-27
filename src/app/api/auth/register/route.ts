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
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  companyName: z.string().min(2, 'Company name is required'),
  country: z.string().min(2, 'Country is required'),
});

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await ensureSuperAdminInitialized();
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: (result.error as any).issues?.[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { name, email, password, companyName, country } = result.data;
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

    // 1. SAVE USER IN SUPABASE AUTH & SUPABASE DATABASE TABLES
    try {
      const adminClient = createAdminClient();
      if (adminClient) {
        // Check if user already exists in Supabase Auth
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

        // Create in Supabase Auth
        const { data: supaAuthData, error: supaAuthErr } = await adminClient.auth.admin.createUser({
          email: cleanEmail,
          password,
          email_confirm: true,
          user_metadata: {
            name,
            companyName,
            country,
            role: 'owner',
          },
        });

        if (supaAuthErr) {
          console.error('[SUPABASE REGISTER ERROR]', supaAuthErr);
          return NextResponse.json(
            { error: supaAuthErr.message || 'Failed to create account in Supabase' },
            { status: 400 }
          );
        }

        if (supaAuthData?.user) {
          supaUserId = supaAuthData.user.id;

          // Save to public.profiles in Supabase
          const now = new Date().toISOString();
          const { error: profErr } = await adminClient.from('profiles').upsert({
            id: supaUserId,
            email: cleanEmail,
            name,
            role: 'owner',
            status: 'active',
            last_active_at: now,
            created_at: now,
            updated_at: now,
          });

          if (profErr) {
            console.warn('[SUPABASE PROFILES INSERT NOTICE]', profErr.message);
          }

          // Save to public.organizations in Supabase
          const slug =
            companyName
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '')
              .slice(0, 50) || 'org';

          const { data: orgData, error: orgErr } = await adminClient
            .from('organizations')
            .insert({
              name: companyName,
              slug,
              owner_id: supaUserId,
              country,
              business_type: 'Manufacturer & Exporter',
            })
            .select()
            .maybeSingle();

          if (orgErr) {
            console.warn('[SUPABASE ORG INSERT NOTICE]', orgErr.message);
          } else if (orgData) {
            supaOrgId = orgData.id;

            // Save to public.organization_members in Supabase
            await adminClient.from('organization_members').insert({
              organization_id: supaOrgId,
              user_id: supaUserId,
              role: 'owner',
              status: 'active',
            });

            // Update profile with current_org_id in Supabase
            await adminClient
              .from('profiles')
              .update({ current_org_id: supaOrgId })
              .eq('id', supaUserId);
          }
        }
      }
    } catch (err: any) {
      console.error('[SUPABASE SYNC WARNING]', err.message);
    }

    // 2. SAVE IN LOCAL REPOSITORY WITH MATCHING IDS
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
        name: companyName,
        businessType: 'Export Business',
        country,
        ownerId: newUser.id,
      },
      newUser.email,
      newUser.name
    );

    // Update currentOrgId on user if not already set
    if (!newUser.currentOrgId) {
      await userRepo.update(newUser.id, { currentOrgId: organization.id });
    }

    // 3. Log Platform Activity
    await adminRepo.logActivity({
      userId: newUser.id,
      userName: newUser.name,
      organizationId: organization.id,
      action: 'USER_REGISTERED',
      entity: 'USER',
      entityId: newUser.id,
      details: `New company registered: ${companyName} (${country}) [Supabase ID: ${newUser.id}]`,
    });

    // 4. ESTABLISH SESSIONS (SUPABASE SSR COOKIES & SIGNED APPLICATION COOKIE)
    try {
      const supabaseServer = await createSupabaseServerClient();
      if (supabaseServer) {
        await supabaseServer.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
      }
    } catch {}

    const sessionData: SessionData = {
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      orgId: organization.id,
    };

    await setSessionCookie(sessionData);

    const token = createSessionToken(sessionData);

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully and saved in Supabase',
      redirectUrl: '/activate-trial',
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error during registration.' },
      { status: 500 }
    );
  }
}
