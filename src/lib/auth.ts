import { cookies } from 'next/headers';
import crypto from 'crypto';
import { userRepo, orgRepo } from '@/lib/db';
import { User, Organization, OrganizationMember, UserRole } from '@/types';
import { infraConfig } from '@/config/infrastructure';
import { createAdminClient } from '@/lib/supabase/admin';

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
  const cookieStore = await cookies();
  const token = signToken(data);
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
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
  const session = await getSession();
  if (!session) return null;

  const user = await userRepo.findById(session.userId);
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

/**
 * Dedicated server-side Super Admin authorization context.
 * In local development (NODE_ENV !== 'production'):
 * Automatically provides direct, immediate access to the Super Admin Dashboard without requiring any login screen.
 * In production (NODE_ENV === 'production'):
 * Strictly enforces server-side Super Admin session verification.
 */
export async function getAdminContext(): Promise<CurrentUserContext | null> {
  const ctx = await getCurrentContext();
  if (ctx && ctx.isSuperAdmin) {
    return ctx;
  }

  // Local development direct access:
  // Automatically provision and return Super Admin context without any login screen
  if (process.env.NODE_ENV !== 'production') {
    await ensureSuperAdminInitialized();
    const adminConfig = infraConfig.getAdminBootstrapConfig();
    const adminUser = await userRepo.findByEmail(adminConfig.email);
    if (adminUser) {
      // In local development, also ensure the session cookie is set so client-side API requests succeed seamlessly
      try {
        await setSessionCookie({
          userId: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: 'super_admin',
        });
      } catch {}

      return {
        user: adminUser,
        organization: null,
        member: {
          id: 'admin_override',
          organizationId: 'admin_org',
          userId: adminUser.id,
          role: 'super_admin',
          userEmail: adminUser.email,
          userName: adminUser.name,
          status: 'active',
          joinedAt: adminUser.createdAt,
        },
        isSuperAdmin: true,
      };
    }
  }

  return null;
}

/**
 * Bootstrap Super Admin initialization check
 */
export async function ensureSuperAdminInitialized(): Promise<void> {
  const adminConfig = infraConfig.getAdminBootstrapConfig();
  const targetEmail = adminConfig.email.trim().toLowerCase();

  // 1. Check local DB
  const existing = await userRepo.findByEmail(targetEmail);
  if (!existing) {
    // If old admin@benzwell.com exists, migrate it cleanly
    const oldAdmin = await userRepo.findByEmail('admin@benzwell.com');
    if (oldAdmin) {
      await userRepo.update(oldAdmin.id, {
        email: targetEmail,
        name: 'Super Admin (BENZWELL)',
        role: 'super_admin',
        passwordHash: hashPassword(adminConfig.secret),
        status: 'active',
      });
      console.log(`[BOOTSTRAP] Super admin migrated from admin@benzwell.com to ${targetEmail}`);
    } else {
      await userRepo.create({
        name: 'Super Admin (BENZWELL)',
        email: targetEmail,
        passwordHash: hashPassword(adminConfig.secret),
        role: 'super_admin',
        status: 'active',
      });
      console.log(`[BOOTSTRAP] Super admin created for: ${targetEmail}`);
    }
  } else {
    // Ensure role is super_admin and status active, but DO NOT overwrite custom/reset passwordHash
    const updateData: Partial<User> = {
      role: 'super_admin',
      status: 'active',
    };
    if (!existing.passwordHash) {
      updateData.passwordHash = hashPassword(adminConfig.secret);
    }
    await userRepo.update(existing.id, updateData);
  }

  // 2. Also ensure Supabase Auth and public.profiles have info@benzwell.in
  try {
    const adminClient = createAdminClient();
    if (adminClient) {
      const { data: supaUsers } = await adminClient.auth.admin.listUsers();
      const supaUser = supaUsers?.users?.find((u) => u.email?.toLowerCase() === targetEmail);
      if (!supaUser) {
        const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
          email: targetEmail,
          password: adminConfig.secret,
          email_confirm: true,
          user_metadata: { role: 'super_admin', name: 'Super Admin (BENZWELL)' },
        });
        if (!createErr && newUser?.user) {
          await adminClient.from('profiles').upsert({
            id: newUser.user.id,
            email: targetEmail,
            name: 'Super Admin (BENZWELL)',
            role: 'super_admin',
            updated_at: new Date().toISOString(),
          });
        }
      } else {
        // Ensure metadata and profile have super_admin role, but do not overwrite updated password
        await adminClient.auth.admin.updateUserById(supaUser.id, {
          user_metadata: { role: 'super_admin', name: 'Super Admin (BENZWELL)' },
        });
        await adminClient.from('profiles').upsert({
          id: supaUser.id,
          email: targetEmail,
          name: 'Super Admin (BENZWELL)',
          role: 'super_admin',
          updated_at: new Date().toISOString(),
        });
      }
    }
  } catch (err: any) {
    console.warn('[BOOTSTRAP] Supabase admin sync warning:', err.message);
  }
}
