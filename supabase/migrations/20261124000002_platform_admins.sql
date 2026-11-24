-- =============================================================================
-- EXPORTFLOW BY BENZWELL
-- Migration: Dedicated Platform Administrator Architecture & RLS
-- Version: 20261124000002
-- Description: Creates the platform_admins table, indexes, security functions,
-- and strict Row Level Security policies to separate Super Admin authority
-- from customer profiles.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. PLATFORM ADMINS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.platform_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'SUPER_ADMIN' CHECK (role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT NOT NULL DEFAULT 'system_bootstrap',
  CONSTRAINT platform_admins_auth_user_id_key UNIQUE (auth_user_id)
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_platform_admins_auth_user_id ON public.platform_admins(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_platform_admins_email ON public.platform_admins(email);
CREATE INDEX IF NOT EXISTS idx_platform_admins_active ON public.platform_admins(is_active);

-- Auto-update timestamp trigger
DROP TRIGGER IF EXISTS set_platform_admins_updated_at ON public.platform_admins;
CREATE TRIGGER set_platform_admins_updated_at
  BEFORE UPDATE ON public.platform_admins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- -----------------------------------------------------------------------------
-- 2. SECURITY DEFINER HELPER FUNCTION
-- Locked search_path to prevent privilege escalation
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_super_admin(check_uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF check_uid IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE auth_user_id = check_uid
      AND role = 'SUPER_ADMIN'
      AND is_active = true
  );
END;
$$;

-- Grant execution only to authenticated users and service_role
REVOKE ALL ON FUNCTION public.is_super_admin(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_super_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin(UUID) TO service_role;

-- -----------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY ON platform_admins
-- -----------------------------------------------------------------------------
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "platform_admins_select_own" ON public.platform_admins;
DROP POLICY IF EXISTS "platform_admins_admin_full" ON public.platform_admins;

-- An authenticated admin can view their own record
CREATE POLICY "platform_admins_select_own" ON public.platform_admins
  FOR SELECT TO authenticated
  USING (
    auth_user_id = auth.uid()
  );

-- An active SUPER_ADMIN can view all platform admin records
CREATE POLICY "platform_admins_super_admin_view" ON public.platform_admins
  FOR SELECT TO authenticated
  USING (
    public.is_super_admin(auth.uid())
  );

-- Mutation (INSERT, UPDATE, DELETE) is restricted to service_role (server-side only)
-- Normal users and customers have zero write access to platform_admins

-- -----------------------------------------------------------------------------
-- 4. HARDEN PROFILES ROLE UPDATES
-- Ensure customers cannot modify their own or another user's role to super_admin
-- -----------------------------------------------------------------------------
-- Drop prior profile update policies if needed
DROP POLICY IF EXISTS "profiles_update_role_protection" ON public.profiles;

CREATE POLICY "profiles_update_role_protection" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    -- Can only update if own profile OR caller is an active Super Admin
    id = auth.uid() OR public.is_super_admin(auth.uid())
  )
  WITH CHECK (
    -- If updating own profile, role cannot be set to 'super_admin' unless caller is already a Super Admin
    (id = auth.uid() AND (role = 'owner' OR role = 'admin' OR role = 'manager' OR role = 'employee' OR role = 'viewer' OR public.is_super_admin(auth.uid())))
    OR
    public.is_super_admin(auth.uid())
  );

-- -----------------------------------------------------------------------------
-- 5. SEED INITIAL PLATFORM ADMINISTRATORS FROM EXISTING ACCOUNTS
-- Automatically seeds known authorized administrator accounts if present in auth.users
-- -----------------------------------------------------------------------------
INSERT INTO public.platform_admins (auth_user_id, email, role, is_active, created_by)
SELECT id, email, 'SUPER_ADMIN', true, 'migration_seed'
FROM auth.users
WHERE email IN ('admin.benzwell@gmail.com', 'info@benzwell.in')
ON CONFLICT (auth_user_id) DO UPDATE
SET
  role = 'SUPER_ADMIN',
  is_active = true,
  updated_at = NOW();

-- Also ensure corresponding profiles records exist with super_admin role
INSERT INTO public.profiles (id, email, name, role, status)
SELECT id, email, COALESCE(raw_user_meta_data->>'name', 'Super Admin (BENZWELL)'), 'super_admin', 'active'
FROM auth.users
WHERE email IN ('admin.benzwell@gmail.com', 'info@benzwell.in')
ON CONFLICT (id) DO UPDATE
SET
  role = 'super_admin',
  status = 'active',
  updated_at = NOW();
