import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { userRepo, orgRepo, adminRepo, platformAdminRepo } from '@/lib/db';
import { verifyPassword, setSessionCookie, ensureSuperAdminInitialized } from '@/lib/auth';
import { infraConfig } from '@/config/infrastructure';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

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

    let user = await userRepo.findByEmail(cleanEmail);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email address or password.' },
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

    // Verify password
    const isPasswordValid =
      (isBootstrapAdminAttempt && password === bootstrapConfig.secret) ||
      (user.passwordHash && verifyPassword(password, user.passwordHash));

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email address or password.' },
        { status: 401 }
      );
    }

    // Determine current organization
    let orgId = user.currentOrgId;
    if (!orgId) {
      const userOrgs = await orgRepo.listByUser(user.id);
      if (userOrgs.length > 0) {
        orgId = userOrgs[0].id;
        await userRepo.update(user.id, { currentOrgId: orgId });
      }
    }

    // Update lastActiveAt
    await userRepo.update(user.id, { lastActiveAt: new Date().toISOString() });

    // Also sign in to Supabase SSR client to establish Supabase session cookies
    try {
      const supabase = await createSupabaseServerClient();
      if (supabase) {
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
      }
    } catch {}

    // Check if user is Super Admin via user record or platformAdminRepo
    const platformAdmin = await platformAdminRepo.findByEmail(cleanEmail);
    const isSuperAdmin = (user.role === 'super_admin' || platformAdmin?.role === 'SUPER_ADMIN') && platformAdmin?.isActive !== false;

    // Establish session cookie
    await setSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: isSuperAdmin ? 'super_admin' : user.role,
      orgId,
    });

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

    const redirectUrl = '/dashboard';

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      redirectUrl,
      isSuperAdmin: false,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error during login.' },
      { status: 500 }
    );
  }
}
