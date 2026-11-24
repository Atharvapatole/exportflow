import { NextResponse } from 'next/server';
import { requireSuperAdmin, getSession } from '@/lib/auth';
import { platformAdminRepo, userRepo } from '@/lib/db';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { infraConfig } from '@/config/infrastructure';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Never expose diagnostics publicly in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Diagnostics disabled in production' }, { status: 404 });
  }

  let supaUserDetected = false;
  let authUserId: string | null = null;
  let supaUserEmail: string | null = null;
  let profileRecordFound = false;
  let profileRole: string | null = null;

  try {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        supaUserDetected = true;
        authUserId = user.id;
        supaUserEmail = user.email || null;

        const { data: prof } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (prof) {
          profileRecordFound = true;
          profileRole = prof.role;
        }
      }
    }
  } catch {}

  const cookieSession = await getSession();
  const sessionValid = Boolean(cookieSession || supaUserDetected);

  const effectiveUserId = authUserId || cookieSession?.userId || null;
  const effectiveEmail = supaUserEmail || cookieSession?.email || null;

  let platformAdminRecordFound = false;
  let adminRole: 'SUPER_ADMIN' | 'PLATFORM_ADMIN' | 'OTHER' | 'MISSING' = 'MISSING';
  let accountActive = false;

  if (effectiveUserId || effectiveEmail) {
    let pa = effectiveUserId ? await platformAdminRepo.findByAuthUserId(effectiveUserId) : null;
    if (!pa && effectiveEmail) {
      pa = await platformAdminRepo.findByEmail(effectiveEmail);
    }

    if (pa) {
      platformAdminRecordFound = true;
      adminRole = pa.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : pa.role === 'PLATFORM_ADMIN' ? 'PLATFORM_ADMIN' : 'OTHER';
      accountActive = pa.isActive;
    } else if (cookieSession?.role === 'super_admin' || profileRole === 'super_admin') {
      adminRole = 'SUPER_ADMIN';
      accountActive = true;
    }
  }

  const authCheck = await requireSuperAdmin();

  // Mask user ID for safety: e.g. b86d...8062
  const maskedUserId = effectiveUserId
    ? `${effectiveUserId.slice(0, 4)}...${effectiveUserId.slice(-4)}`
    : null;

  return NextResponse.json({
    devAdminBypassEnabled: infraConfig.isDevAdminBypassEnabled(),
    authenticatedUserDetected: supaUserDetected || Boolean(cookieSession),
    authUserIdDetected: Boolean(effectiveUserId),
    maskedUserId,
    profileRecordFound,
    platformAdminRecordFound,
    adminRole,
    accountActive,
    sessionValid,
    authorizationResult: authCheck.authorized ? 'AUTHORIZED' : 'DENIED',
    details: {
      authMethod: supaUserDetected ? 'supabase_ssr' : cookieSession ? 'signed_cookie' : 'none',
      statusCode: authCheck.statusCode,
      reason: authCheck.error || 'Access Granted',
    },
    timestamp: new Date().toISOString(),
  });
}
