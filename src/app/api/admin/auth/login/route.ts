import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { userRepo, adminRepo } from '@/lib/db';
import { verifyPassword, hashPassword, setSessionCookie, ensureSuperAdminInitialized } from '@/lib/auth';
import { infraConfig } from '@/config/infrastructure';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const adminLoginSchema = z.object({
  email: z.string().email('Valid administrator email is required'),
  password: z.string().min(1, 'Administrator password is required'),
});

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await ensureSuperAdminInitialized();
    const body = await req.json();
    const parsed = adminLoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: (parsed.error as any).issues?.[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const cleanEmail = email.trim().toLowerCase();

    const bootstrapConfig = infraConfig.getAdminBootstrapConfig();
    const isBootstrapAttempt = cleanEmail === bootstrapConfig.email.toLowerCase();

    let authenticatedAdminId: string | null = null;
    let authenticatedAdminName = 'Super Admin';
    let authMethod = 'password_hash';

    // 1. First Attempt: Supabase Authentication
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { data: supaAuth, error: supaErr } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (!supaErr && supaAuth?.user) {
        // Authenticated in Supabase! Now verify Super Admin role server-side
        const supaUser = supaAuth.user;
        let isSuperAdmin = supaUser.user_metadata?.role === 'super_admin';

        // Also check profiles table
        if (!isSuperAdmin) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', supaUser.id)
            .maybeSingle();

          if (profile?.role === 'super_admin') {
            isSuperAdmin = true;
          }
        }

        // Also check local DB user role
        const localUser = await userRepo.findByEmail(cleanEmail);
        if (localUser?.role === 'super_admin') {
          isSuperAdmin = true;
        }

        if (!isSuperAdmin) {
          // User is authenticated in Supabase, but is a normal customer, NOT a Super Admin!
          await supabase.auth.signOut();
          await adminRepo.logActivity({
            userId: supaUser.id,
            userName: supaUser.user_metadata?.name || 'Customer',
            action: 'UNAUTHORIZED_ADMIN_LOGIN_ATTEMPT',
            entity: 'SECURITY',
            entityId: supaUser.id,
            details: `Customer account (${cleanEmail}) attempted to login via private Super Admin portal. Access blocked.`,
          });

          return NextResponse.json(
            { error: 'Access Denied: This console is strictly restricted to Super Administrators. Customer accounts cannot access the management panel.' },
            { status: 403 }
          );
        }

        authenticatedAdminId = localUser?.id || supaUser.id;
        authenticatedAdminName = localUser?.name || supaUser.user_metadata?.name || 'Super Admin';
        authMethod = 'supabase_auth';

        // Keep local DB password hash synchronized so offline fallback remains in sync
        if (localUser) {
          await userRepo.update(localUser.id, {
            passwordHash: hashPassword(password),
            lastActiveAt: new Date().toISOString(),
            status: 'active',
          });
        }
      }
    }

    // 2. Fallback Attempt: Local PBKDF2 hash or Bootstrap secret
    if (!authenticatedAdminId) {
      const user = await userRepo.findByEmail(cleanEmail);

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid administrator credentials.' },
          { status: 401 }
        );
      }

      if (user.role !== 'super_admin') {
        return NextResponse.json(
          { error: 'Access Denied: This console is strictly restricted to Super Administrators.' },
          { status: 403 }
        );
      }

      if (user.status === 'suspended' || user.status === 'disabled') {
        return NextResponse.json(
          { error: 'Administrator account has been disabled or suspended.' },
          { status: 403 }
        );
      }

      const isBootstrapMatch = isBootstrapAttempt && password === bootstrapConfig.secret;
      const isLocalHashMatch = user.passwordHash && verifyPassword(password, user.passwordHash);

      if (!isBootstrapMatch && !isLocalHashMatch) {
        return NextResponse.json(
          { error: 'Invalid administrator credentials.' },
          { status: 401 }
        );
      }

      authenticatedAdminId = user.id;
      authenticatedAdminName = user.name;
      authMethod = isBootstrapMatch ? 'bootstrap_secret' : 'local_password_hash';

      // If logging in via bootstrap secret, synchronize Supabase Auth password too
      if (isBootstrapMatch) {
        try {
          const adminClient = createAdminClient();
          if (adminClient) {
            const { data: supaUsers } = await adminClient.auth.admin.listUsers();
            const supaUser = supaUsers?.users?.find((u) => u.email?.toLowerCase() === cleanEmail);
            if (supaUser) {
              await adminClient.auth.admin.updateUserById(supaUser.id, { password });
            }
          }
        } catch (e) {
          console.warn('[ADMIN LOGIN] Could not sync bootstrap password to Supabase:', e);
        }
      }

      await userRepo.update(user.id, { lastActiveAt: new Date().toISOString() });
    }

    // Establish signed server session cookie
    await setSessionCookie({
      userId: authenticatedAdminId,
      email: cleanEmail,
      name: authenticatedAdminName,
      role: 'super_admin',
    });

    // Log admin audit
    await adminRepo.logAudit({
      adminId: authenticatedAdminId,
      adminEmail: cleanEmail,
      action: 'SUPER_ADMIN_AUTHENTICATED',
      targetEntity: 'ADMIN_CONSOLE',
      targetId: authenticatedAdminId,
      details: {
        timestamp: new Date().toISOString(),
        authMethod,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Super Admin authentication successful',
      redirectUrl: '/admin',
    });
  } catch (error: any) {
    console.error('Super Admin login error:', error);
    return NextResponse.json(
      { error: error?.message || 'Server error during administrative authentication.' },
      { status: 500 }
    );
  }
}
