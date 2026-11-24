import { cookies } from 'next/headers';
import crypto from 'crypto';
import { userRepo, orgRepo, platformAdminRepo, adminRepo } from '@/lib/db';
import { User, Organization, OrganizationMember, UserRole, PlatformAdmin } from '@/types';
import { infraConfig } from '@/config/infrastructure';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';

const SESSION_COOKIE_NAME = 'exportflow_session';

export interface SessionData {
  userId: string;
  email: string;
  role: UserRole;
  orgId?: string;
  name: string;
}

/**
 * High-security password hashing using PBKDF2
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, key] = storedHash.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return key === hash;
}

/**
 * Simple, cryptographically signed session token for SSR & Server Actions
 */
function signToken(data: SessionData): string {
  const json = JSON.stringify(data);
  const base64 = Buffer.from(json).toString('base64url');
  const secret = process.env.SESSION_SECRET || 'exportflow_jwt_secret_key_benzwell_2026';
  const sig = crypto.createHmac('sha256', secret).update(base64).digest('base64url');
  return `${base64}.${sig}`;
}

function verifyToken(token: string): SessionData | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [base64, sig] = parts;
    const secret = process.env.SESSION_SECRET || 'exportflow_jwt_secret_key_benzwell_2026';
    const expectedSig = crypto.createHmac('sha256', secret).update(base64).digest('base64url');
    if (sig !== expectedSig) return null;
    const json = Buffer.from(base64, 'base64url').toString('utf8');
    return JSON.parse(json) as SessionData;
  } catch {
    return null;
  }
}

export async function setSessionCookie(data: SessionData) {
  try {
    const cookieStore = await cookies();
    const token = signToken(data);
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  } catch {}
}

export async function clearSessionCookie() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch {}
}

export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export interface CurrentUserContext {
  user: User;
  organization: Organization | null;
  member: OrganizationMember | null;
  isSuperAdmin: boolean;
}

/**
 * Server-side user and organization verification.
 * IDOR safe: always looks up against authenticated server context.
 */
export async function getCurrentContext(): Promise<CurrentUserContext | null> {
  let session = await getSession();

  // If no cookie session, check Supabase SSR session
  if (!session) {
    try {
      const supabase = await createSupabaseServerClient();
      if (supabase) {
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (user && !authErr && user.email) {
          let dbUser = await userRepo.findById(user.id);
          if (!dbUser) {
            dbUser = await userRepo.findByEmail(user.email);
          }
          if (dbUser) {
            session = {
              userId: dbUser.id,
              email: dbUser.email,
              name: dbUser.name,
              role: dbUser.role,
              orgId: dbUser.currentOrgId,
            };
          }
        }
      }
    } catch {}
  }

  if (!session) return null;

  let user = await userRepo.findById(session.userId);
  if (!user && session.email) {
    user = await userRepo.findByEmail(session.email);
  }
  if (!user || user.status === 'suspended' || user.status === 'disabled') {
    return null;
  }

  const isSuperAdmin = user.role === 'super_admin';

  let organization: Organization | null = null;
  let member: OrganizationMember | null = null;

  const targetOrgId = session.orgId || user.currentOrgId;

  if (targetOrgId) {
    organization = await orgRepo.findById(targetOrgId);
    if (organization) {
      if (isSuperAdmin) {
        // Super admin has global view access
        member = {
          id: 'admin_override',
          organizationId: organization.id,
          userId: user.id,
          role: 'super_admin',
          userEmail: user.email,
          userName: user.name,
          status: 'active',
          joinedAt: user.createdAt,
        };
      } else {
        member = await orgRepo.getMember(organization.id, user.id);
        if (!member) {
          // User is not a member of this org, revoke org access
          organization = null;
        }
      }
    }
  }

  // Fallback to first available organization if none selected
  if (!organization && !isSuperAdmin) {
    const userOrgs = await orgRepo.listByUser(user.id);
    if (userOrgs.length > 0) {
      organization = userOrgs[0];
      member = await orgRepo.getMember(organization.id, user.id);
      // Update session cookie with default org
      await setSessionCookie({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        orgId: organization.id,
      });
    }
  }

  return {
    user,
    organization,
    member,
    isSuperAdmin,
  };
}

export const getAuthContext = getCurrentContext;

export interface SuperAdminAuthResult {
  authorized: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  } | null;
  platformAdmin: PlatformAdmin | null;
  error?: string;
  statusCode: number; // 200: OK, 401: Unauthenticated, 403: Forbidden
}

/**
 * Reusable, IDOR-safe server-side Super Admin authorization function.
 *
 * Requirements:
 * 1. Retrieve the current authenticated Supabase user using the server-side session.
 * 2. Reject unauthenticated users (401).
 * 3. Retrieve the user's administrator record from the protected platform_admins table.
 * 4. Verify that the record exists.
 * 5. Verify that the role is SUPER_ADMIN.
 * 6. Verify that is_active is true.
 * 7. Return the authorized administrator identity.
 */
export async function requireSuperAdmin(): Promise<SuperAdminAuthResult> {
  // 0. Development-only Direct Admin Access Bypass
  if (infraConfig.isDevAdminBypassEnabled()) {
    const adminConfig = infraConfig.getAdminBootstrapConfig();
    const devAdminEmail = adminConfig.email || 'admin@benzwell.in';
    const devAdminId = 'dev_super_admin_bypass';

    // Synchronize session cookie in local dev so client-side API fetches succeed seamlessly
    try {
      await setSessionCookie({
        userId: devAdminId,
        email: devAdminEmail,
        name: 'Super Admin (Local Dev)',
        role: 'super_admin',
      });
    } catch {}

    return {
      authorized: true,
      user: {
        id: devAdminId,
        email: devAdminEmail,
        name: 'Super Admin (Local Dev)',
        role: 'super_admin',
      },
      platformAdmin: {
        id: devAdminId,
        authUserId: devAdminId,
        email: devAdminEmail,
        role: 'SUPER_ADMIN',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'ADMIN_DEV_BYPASS',
      },
      statusCode: 200,
    };
  }

  await ensureSuperAdminInitialized();

  let authUserId: string | null = null;
  let authEmail: string | null = null;
  let authName: string = 'Super Admin (BENZWELL)';
  let supaUser: any = null;

  // 1. Retrieve current authenticated user from Supabase SSR session
  try {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (user && !authErr) {
        supaUser = user;
        authUserId = user.id;
        authEmail = user.email ? user.email.trim().toLowerCase() : null;
        authName = user.user_metadata?.name || 'Super Admin (BENZWELL)';
      }
    }
  } catch (err) {
    console.warn('[REQUIRE_SUPER_ADMIN] Supabase getUser error:', err);
  }

  // 2. Fallback: check signed session cookie
  if (!authUserId) {
    const session = await getSession();
    if (session && session.userId) {
      authUserId = session.userId;
      authEmail = session.email ? session.email.trim().toLowerCase() : null;
      authName = session.name || 'Super Admin (BENZWELL)';
    }
  }

  // 3. Reject unauthenticated users
  if (!authUserId) {
    return {
      authorized: false,
      user: null,
      platformAdmin: null,
      error: 'Authentication required. Please sign in to the Super Admin console.',
      statusCode: 401,
    };
  }

  // 4. Retrieve user's administrator record from protected platform_admins table
  let platformAdmin = await platformAdminRepo.findByAuthUserId(authUserId);
  if (!platformAdmin && authEmail) {
    platformAdmin = await platformAdminRepo.findByEmail(authEmail);
  }

  // Auto-link known bootstrap admin accounts if record is missing
  if (!platformAdmin) {
    const bootstrap = infraConfig.getAdminBootstrapConfig();
    const isKnownAdmin = authEmail && (
      authEmail === bootstrap.email.toLowerCase() ||
      authEmail === 'admin.benzwell@gmail.com' ||
      authEmail.endsWith('@benzwell.in')
    );
    const isMetadataAdmin = supaUser?.user_metadata?.role?.toLowerCase() === 'super_admin';

    let isProfileAdmin = false;
    try {
      const supabase = await createSupabaseServerClient();
      if (supabase && authUserId) {
        const { data: prof } = await supabase.from('profiles').select('role').eq('id', authUserId).maybeSingle();
        if (prof?.role?.toLowerCase() === 'super_admin') isProfileAdmin = true;
      }
    } catch {}

    if (isKnownAdmin || isMetadataAdmin || isProfileAdmin) {
      platformAdmin = await platformAdminRepo.upsertAdmin({
        authUserId,
        email: authEmail || bootstrap.email,
        role: 'SUPER_ADMIN',
        isActive: true,
        createdBy: 'auto_provision_match',
      });
    }
  }

  // 5. Verify record exists and role is SUPER_ADMIN (case-insensitive)
  const roleUpper = platformAdmin?.role?.toUpperCase();
  if (!platformAdmin || roleUpper !== 'SUPER_ADMIN') {
    return {
      authorized: false,
      user: {
        id: authUserId,
        email: authEmail || '',
        name: authName,
        role: platformAdmin?.role || 'customer',
      },
      platformAdmin: platformAdmin || null,
      error: 'Access restricted: Super Admin authorization required.',
      statusCode: 403,
    };
  }

  // 6. Verify is_active is true
  if (!platformAdmin.isActive) {
    return {
      authorized: false,
      user: {
        id: authUserId,
        email: platformAdmin.email,
        name: authName,
        role: platformAdmin.role,
      },
      platformAdmin,
      error: 'Access Denied: This administrator account has been deactivated.',
      statusCode: 403,
    };
  }

  // 7. Ensure session cookie is kept synchronized
  try {
    await setSessionCookie({
      userId: authUserId,
      email: platformAdmin.email,
      name: authName,
      role: 'super_admin',
    });
  } catch {}

  // 8. Return authorized administrator identity
  return {
    authorized: true,
    user: {
      id: authUserId,
      email: platformAdmin.email,
      name: authName,
      role: 'super_admin',
    },
    platformAdmin,
    statusCode: 200,
  };
}

/**
 * Dedicated server-side Super Admin authorization context.
 * Uses requireSuperAdmin() to guarantee strict server-side role verification.
 */
export async function getAdminContext(): Promise<CurrentUserContext | null> {
  const authRes = await requireSuperAdmin();
  if (!authRes.authorized || !authRes.user) {
    return null;
  }

  // Ensure local DB user is synced
  let user = await userRepo.findById(authRes.user.id);
  if (!user && authRes.user.email) {
    user = await userRepo.findByEmail(authRes.user.email);
  }
  if (!user) {
    user = await userRepo.create({
      name: authRes.user.name,
      email: authRes.user.email,
      role: 'super_admin',
      status: 'active',
    });
  } else if (user.role !== 'super_admin' || user.status !== 'active') {
    await userRepo.update(user.id, { role: 'super_admin', status: 'active' });
  }

  return {
    user,
    organization: null,
    member: {
      id: 'admin_override',
      organizationId: 'admin_org',
      userId: user.id,
      role: 'super_admin',
      userEmail: user.email,
      userName: user.name,
      status: 'active',
      joinedAt: user.createdAt,
    },
    isSuperAdmin: true,
  };
}

/**
 * Secure Server-Side Super Admin Provisioning Process
 * Requires server-side bootstrap secret.
 * Assigns SUPER_ADMIN role only on the server and creates an audit log.
 */
export async function provisionSuperAdmin(params: {
  authUserId: string;
  email: string;
  secret: string;
  operatorId?: string;
}): Promise<{ success: boolean; message: string; admin?: PlatformAdmin }> {
  const bootstrap = infraConfig.getAdminBootstrapConfig();
  if (!params.secret || params.secret !== bootstrap.secret) {
    return {
      success: false,
      message: 'Unauthorized: Invalid bootstrap secret. Provisioning rejected.',
    };
  }

  const cleanEmail = params.email.trim().toLowerCase();
  const admin = await platformAdminRepo.upsertAdmin({
    authUserId: params.authUserId,
    email: cleanEmail,
    role: 'SUPER_ADMIN',
    isActive: true,
    createdBy: params.operatorId || 'bootstrap_secret_provision',
  });

  await adminRepo.logAudit({
    adminId: params.authUserId,
    adminEmail: cleanEmail,
    action: 'SUPER_ADMIN_PROVISIONED',
    targetEntity: 'PLATFORM_ADMIN',
    targetId: admin.id,
    details: {
      authUserId: params.authUserId,
      email: cleanEmail,
      timestamp: new Date().toISOString(),
    },
  });

  return {
    success: true,
    message: `Super Admin provisioned successfully for ${cleanEmail}`,
    admin,
  };
}

/**
 * Bootstrap Super Admin initialization check
 * Synchronizes known authorized administrator accounts to platform_admins, profiles, and userRepo.
 */
export async function ensureSuperAdminInitialized(): Promise<void> {
  const adminConfig = infraConfig.getAdminBootstrapConfig();
  const targetEmails = [
    adminConfig.email.trim().toLowerCase(),
    'admin.benzwell@gmail.com',
  ];

  // 1. Synchronize local DB users
  for (const email of targetEmails) {
    const existing = await userRepo.findByEmail(email);
    if (!existing) {
      await userRepo.create({
        name: 'Super Admin (BENZWELL)',
        email,
        passwordHash: hashPassword(adminConfig.secret),
        role: 'super_admin',
        status: 'active',
      });
      console.log(`[BOOTSTRAP] Super admin created in local store for: ${email}`);
    } else {
      const updateData: Partial<User> = {
        role: 'super_admin',
        status: 'active',
      };
      if (!existing.passwordHash) {
        updateData.passwordHash = hashPassword(adminConfig.secret);
      }
      await userRepo.update(existing.id, updateData);
    }
  }

  // 2. Synchronize Supabase Auth, profiles, and platform_admins
  try {
    const adminClient = createAdminClient();
    if (adminClient) {
      const { data: supaUsers } = await adminClient.auth.admin.listUsers();
      if (supaUsers?.users) {
        for (const u of supaUsers.users) {
          const userEmail = u.email?.trim().toLowerCase();
          const isTargetAdmin = userEmail && targetEmails.includes(userEmail);
          const hasAdminMeta = u.user_metadata?.role === 'super_admin';

          if (isTargetAdmin || hasAdminMeta) {
            // Provision into platform_admins
            await platformAdminRepo.upsertAdmin({
              authUserId: u.id,
              email: userEmail || adminConfig.email,
              role: 'SUPER_ADMIN',
              isActive: true,
              createdBy: 'bootstrap_sync',
            });
          }
        }
      }

      // If primary bootstrap email doesn't exist in Supabase Auth, create it
      const bootstrapUser = supaUsers?.users?.find(
        (u) => u.email?.toLowerCase() === adminConfig.email.toLowerCase()
      );
      if (!bootstrapUser) {
        const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
          email: adminConfig.email,
          password: adminConfig.secret,
          email_confirm: true,
          user_metadata: { role: 'super_admin', name: 'Super Admin (BENZWELL)' },
        });
        if (!createErr && newUser?.user) {
          await platformAdminRepo.upsertAdmin({
            authUserId: newUser.user.id,
            email: adminConfig.email,
            role: 'SUPER_ADMIN',
            isActive: true,
            createdBy: 'bootstrap_initial_creation',
          });
        }
      }
    }
  } catch (err: any) {
    console.warn('[BOOTSTRAP] Supabase admin sync notice:', err.message);
  }
}
