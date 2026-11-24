-- =============================================================================
-- EXPORTFLOW BY BENZWELL
-- Migration: Razorpay Payments, Free Trial, Wallets, Inquiries & Dark Mode
-- Version: 20261124000001
-- =============================================================================

-- =============================================================================
-- 1. RAZORPAY CONFIGURATIONS TABLE (SUPER ADMIN ONLY)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.razorpay_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  is_enabled BOOLEAN DEFAULT false,
  mode TEXT NOT NULL DEFAULT 'test' CHECK (mode IN ('test', 'live')),
  test_key_id TEXT,
  test_key_secret TEXT,
  test_webhook_secret TEXT,
  live_key_id TEXT,
  live_key_secret TEXT,
  live_webhook_secret TEXT,
  merchant_display_name TEXT DEFAULT 'ExportFlow by BENZWELL',
  merchant_support_email TEXT DEFAULT 'info@benzwell.in',
  status TEXT NOT NULL DEFAULT 'unconfigured' CHECK (status IN ('active', 'inactive', 'unconfigured')),
  last_successful_connection TIMESTAMPTZ,
  last_config_update TIMESTAMPTZ DEFAULT NOW(),
  webhook_status TEXT NOT NULL DEFAULT 'unverified' CHECK (webhook_status IN ('verified', 'unverified', 'error')),
  last_received_webhook TIMESTAMPTZ,
  last_successful_webhook TIMESTAMPTZ,
  failed_webhook_count INT DEFAULT 0
);

INSERT INTO public.razorpay_configurations (id, is_enabled, mode, merchant_display_name, merchant_support_email)
VALUES ('00000000-0000-0000-0000-000000000002', false, 'test', 'ExportFlow by BENZWELL', 'info@benzwell.in')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 2. RAZORPAY WEBHOOK EVENTS & AUDIT LOGS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.razorpay_webhook_events (
  id TEXT PRIMARY KEY, -- Razorpay event id (e.g. evt_xxxx)
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  signature TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('processed', 'failed', 'ignored')),
  error_message TEXT,
  received_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rzp_webhook_events_type ON public.razorpay_webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_rzp_webhook_events_date ON public.razorpay_webhook_events(received_at);

CREATE TABLE IF NOT EXISTS public.razorpay_payment_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  order_id TEXT NOT NULL,
  payment_id TEXT,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded')),
  item_type TEXT NOT NULL CHECK (item_type IN ('credit_pack', 'subscription')),
  item_id TEXT NOT NULL,
  description TEXT,
  credits_added JSONB,
  error_details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rzp_payment_logs_order ON public.razorpay_payment_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_rzp_payment_logs_org ON public.razorpay_payment_logs(organization_id);

-- =============================================================================
-- 3. ORGANIZATION DOCUMENT WALLET & SUBSCRIPTION TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.organization_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
  lifetime_credits JSONB NOT NULL DEFAULT '{"quotations": 1, "proformaInvoices": 0, "commercialInvoices": 0, "packingLists": 0}'::jsonb,
  subscription_credits JSONB NOT NULL DEFAULT '{"quotations": 0, "proformaInvoices": 0, "commercialInvoices": 0, "packingLists": 0}'::jsonb,
  used_counts JSONB NOT NULL DEFAULT '{"quotations": 0, "proformaInvoices": 0, "commercialInvoices": 0, "packingLists": 0}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.organization_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL DEFAULT 'free' CHECK (plan_id IN ('free', 'starter', 'growth', 'business')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trial', 'expired', 'cancelled')),
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'annual')),
  trial_start_date TIMESTAMPTZ,
  trial_end_date TIMESTAMPTZ,
  has_used_trial BOOLEAN DEFAULT false,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  razorpay_subscription_id TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 4. CONTACT INQUIRIES & ADMIN INBOX TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inquiry_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('general', 'sales', 'billing', 'technical', 'ai', 'partnership', 'other')),
  message TEXT NOT NULL,
  consent_privacy BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'waiting_for_customer', 'resolved', 'closed')),
  admin_notes TEXT,
  assigned_admin UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON public.contact_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_date ON public.contact_inquiries(created_at);

-- =============================================================================
-- 5. USER THEME PREFERENCES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_theme_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  theme_mode TEXT NOT NULL DEFAULT 'system' CHECK (theme_mode IN ('light', 'dark', 'system')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 6. ROW LEVEL SECURITY POLICIES
-- =============================================================================

ALTER TABLE public.razorpay_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.razorpay_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.razorpay_payment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_theme_preferences ENABLE ROW LEVEL SECURITY;

-- Razorpay Config: Super Admin Only
CREATE POLICY "razorpay_config_super_admin" ON public.razorpay_configurations
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
    )
  );

-- Webhook events: Super Admin Only
CREATE POLICY "razorpay_webhook_events_super_admin" ON public.razorpay_webhook_events
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
    )
  );

-- Payment logs: Org members view their own org's payment logs, Super Admin views all
CREATE POLICY "razorpay_payment_logs_org_select" ON public.razorpay_payment_logs
  FOR SELECT TO authenticated
  USING (
    organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
    )
  );

-- Organization Wallets: Org members view their wallet, Super Admin views all
CREATE POLICY "organization_wallets_org_select" ON public.organization_wallets
  FOR SELECT TO authenticated
  USING (
    organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
    )
  );

-- Organization Subscriptions: Org members view their subscription, Super Admin views all
CREATE POLICY "organization_subscriptions_org_select" ON public.organization_subscriptions
  FOR SELECT TO authenticated
  USING (
    organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
    )
  );

-- Contact Inquiries: Anyone can insert (public contact form), Super Admin views/manages all
CREATE POLICY "contact_inquiries_insert" ON public.contact_inquiries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "contact_inquiries_super_admin_all" ON public.contact_inquiries
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
    )
  );

-- Theme Preferences: User can manage their own preference
CREATE POLICY "user_theme_preferences_user" ON public.user_theme_preferences
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
