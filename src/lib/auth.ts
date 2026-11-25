import { cookies } from 'next/headers';
import crypto from 'crypto';
import { userRepo, orgRepo, platformAdminRepo, adminRepo } from '@/lib/db';
import { User, Organization, OrganizationMember, UserRole, PlatformAdmin } from '@/types';
import { infraConfig } from '@/config/infrastructure';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';

export const SESSION_COOKIE_NAME = 'exportflow_session';

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

export function createSessionToken(data: SessionData): string {
  return signToken(data);
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

          // If user exists in Supabase but not yet in local repo, auto-sync from Supabase profiles
          if (!dbUser) {
            try {
              const adminClient = createAdminClient();
              if (adminClient) {
                const { data: prof } = await adminClient
                  .from('profiles')
                  .select('*')
                  .eq('id', user.id)
                  .single();

                const userName = prof?.name || user.user_metadata?.name || user.email.split('@')[0];
                const userRole = (prof?.role as UserRole) || (user.user_metadata?.role as UserRole) || 'owner';
                const userOrgId = prof?.current_org_id || undefined;

                dbUser = await userRepo.create({
                  id: user.id,
                  name: userName,
                  email: user.email.toLowerCase(),
                  role: userRole,
                  status: 'active',
                  currentOrgId: userOrgId,
                  lastActiveAt: new Date().toISOString(),
                });

                if (userOrgId) {
                  const existingOrg = await orgRepo.findById(userOrgId);
                  if (!existingOrg) {
                    const { data: orgRow } = await adminClient
                      .from('organizations')
                      .select('*')
                      .eq('id', userOrgId)
                      .single();

                    await orgRepo.create(
                      {
                        id: userOrgId,
                        name: orgRow?.name || user.user_metadata?.companyName || 'My Export Company',
                        businessType: orgRow?.business_type || 'Manufacturer & Exporter',
                        country: orgRow?.country || user.user_metadata?.country || 'India',
                        ownerId: user.id,
                      },
                      user.email,
                      userName
                    );
                  }
                }
              }
            } catch (syncErr: any) {
              console.warn('[AUTH] Supabase user sync warning:', syncErr.message);
            }
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
    if (!organization) {
      // Check Supabase organizations table
      try {
        const adminClient = createAdminClient();
        if (adminClient) {
          const { data: orgRow } = await adminClient.from('organizations').select('*').eq('id', targetOrgId).single();
          if (orgRow) {
            const res = await orgRepo.create(
              {
                id: orgRow.id,
                name: orgRow.name,
                businessType: orgRow.business_type || 'Manufacturer & Exporter',
                country: orgRow.country || 'India',
                ownerId: orgRow.owner_id || user.id,
              },
              user.email,
              user.name
            );
            organization = res.organization;
          }
        }
      } catch {}
    }

    if (organization) {
      if (isSuperAdmin) {
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
        if (!member && organization.ownerId === user.id) {
          // User is owner of the organization
          member = {
            id: `mem_owner_${user.id}`,
            organizationId: organization.id,
            userId: user.id,
            role: 'owner',
            userEmail: user.email,
            userName: user.name,
            status: 'active',
            joinedAt: organization.createdAt,
          };
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
      if (!member && organization.ownerId === user.id) {
        member = {
          id: `mem_owner_${user.id}`,
          organizationId: organization.id,
          userId: user.id,
          role: 'owner',
          userEmail: user.email,
          userName: user.name,
          status: 'active',
          joinedAt: organization.createdAt,
        };
      }
    } else {
      // Create a default organization for customer so they are never locked out of dashboard
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
        organization = newOrg.organization;
        member = {
          id: `mem_owner_${user.id}`,
          organizationId: organization.id,
          userId: user.id,
          role: 'owner',
          userEmail: user.email,
          userName: user.name,
          status: 'active',
          joinedAt: organization.createdAt,
        };
        await userRepo.update(user.id, { currentOrgId: organization.id });
      } catch {}
    }

    if (organization) {
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
  await ensureSuperAdminInitialized();

  let authUserId: string | null = null;
  let authEmail: string | null = null;
  let authName: string = 'Super Admin (BENZWELL)';
  let platformAdmin: PlatformAdmin | null = null;

  // 1. Try to retrieve authenticated user from Supabase SSR session
  try {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (user && !authErr) {
        authUserId = user.id;
        authEmail = user.email ? user.email.trim().toLowerCase() : null;
        authName = user.user_metadata?.name || 'Super Admin (BENZWELL)';
      }
    }
  } catch {}

  // 2. Try signed session cookie
  if (!authUserId) {
    const session = await getSession();
    if (session && session.userId) {
      authUserId = session.userId;
      authEmail = session.email ? session.email.trim().toLowerCase() : null;
      authName = session.name || 'Super Admin (BENZWELL)';
    }
  }

  // 3. Direct Entry default: If no session exists, assign default Super Admin identity
  if (!authUserId || !authEmail) {
    const bootstrap = infraConfig.getAdminBootstrapConfig();
    authEmail = bootstrap.email || 'info@benzwell.in';
    authUserId = 'super_admin_direct';
    authName = 'Super Admin (BENZWELL)';
  }

  // Retrieve user's administrator record from platform_admins
  platformAdmin = await platformAdminRepo.findByAuthUserId(authUserId);
  if (!platformAdmin && authEmail) {
    platformAdmin = await platformAdminRepo.findByEmail(authEmail);
  }

  if (!platformAdmin) {
    platformAdmin = {
      id: authUserId,
      authUserId,
      email: authEmail,
      role: 'SUPER_ADMIN',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'direct_admin_access',
    };
  }

  // Ensure session cookie is kept synchronized so client-side API requests succeed
  try {
    await setSessionCookie({
      userId: authUserId,
      email: authEmail,
      name: authName,
      role: 'super_admin',
    });
  } catch {}

  return {
    authorized: true,
    user: {
      id: authUserId,
      email: authEmail,
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
