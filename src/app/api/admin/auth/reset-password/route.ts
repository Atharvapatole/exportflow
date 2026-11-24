import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { userRepo, adminRepo } from '@/lib/db';
import { hashPassword, setSessionCookie } from '@/lib/auth';

const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(12, 'Password must be at least 12 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: (parsed.error as any).issues?.[0]?.message || 'Password does not meet complexity requirements' },
        { status: 400 }
      );
    }

    const { newPassword } = parsed.data;

    // 1. Verify that a valid authenticated session exists in Supabase
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase authentication service is unavailable' },
        { status: 500 }
      );
    }

    const { data: { user }, error: userErr } = await supabase.auth.getUser();

    if (userErr || !user || !user.email) {
      return NextResponse.json(
        { error: 'No active password recovery session found. Your reset link may be invalid or expired.' },
        { status: 401 }
      );
    }

    const userEmail = user.email.toLowerCase().trim();

    // 2. Strict Server-Side Super Admin Role Verification:
    // Password recovery must NEVER promote a normal customer to Super Admin!
    let isSuperAdmin = user.user_metadata?.role === 'super_admin';

    if (!isSuperAdmin) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.role === 'super_admin') {
        isSuperAdmin = true;
      }
    }

    // Also cross-reference against local DB records
    const localUser = await userRepo.findByEmail(userEmail);
    if (localUser?.role === 'super_admin') {
      isSuperAdmin = true;
    }

    if (!isSuperAdmin) {
      await adminRepo.logActivity({
        userId: user.id,
        userName: user.user_metadata?.name || 'Customer',
        action: 'PRIVILEGE_ESCALATION_ATTEMPT_BLOCKED',
        entity: 'SECURITY',
        entityId: user.id,
        details: `Customer account (${userEmail}) attempted to access Super Admin password reset workflow. Blocked.`,
      });

      return NextResponse.json(
        { error: 'Access Denied: You do not possess Super Admin authorization. Normal customer accounts cannot access the admin panel.' },
        { status: 403 }
      );
    }

    // 3. Update the password in Supabase Auth
    const { error: updateErr } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateErr) {
      console.error('[RESET PASSWORD] Supabase updateUser error:', updateErr);
      return NextResponse.json(
        { error: updateErr.message || 'Failed to update password in Supabase Auth' },
        { status: 400 }
      );
    }

    // 4. Synchronize the local DB password hash so fallback login matches
    const newHash = hashPassword(newPassword);
    if (localUser) {
      await userRepo.update(localUser.id, {
        passwordHash: newHash,
        lastActiveAt: new Date().toISOString(),
        status: 'active',
      });
    }

    // 5. Establish the signed application session cookie for Super Admin
    await setSessionCookie({
      userId: localUser?.id || user.id,
      email: userEmail,
      name: localUser?.name || user.user_metadata?.name || 'Super Admin',
      role: 'super_admin',
    });

    // 6. Log admin audit trail
    await adminRepo.logAudit({
      adminId: localUser?.id || user.id,
      adminEmail: userEmail,
      action: 'SUPER_ADMIN_PASSWORD_RESET',
      targetEntity: 'ADMIN_SECURITY',
      targetId: user.id,
      details: {
        timestamp: new Date().toISOString(),
        authMethod: 'supabase_recovery_flow',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Your Super Admin password has been updated successfully.',
      redirectUrl: '/admin',
    });
  } catch (error: any) {
    console.error('Password reset handler error:', error);
    return NextResponse.json(
      { error: error?.message || 'Server error while resetting password.' },
      { status: 500 }
    );
  }
}
