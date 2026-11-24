-- =============================================================================
-- EXPORTFLOW BY BENZWELL
-- Migration: OpenRouter Primary AI Provider & Super Admin Security Architecture
-- Version: 20261123000002
-- =============================================================================

-- =============================================================================
-- 1. EXTEND AI PROVIDER CONFIGS FOR OPENROUTER & 3-TIER PRIORITY
-- =============================================================================

ALTER TABLE public.ai_provider_configs
  ADD COLUMN IF NOT EXISTS openrouter_api_key TEXT,
  ADD COLUMN IF NOT EXISTS openrouter_model TEXT NOT NULL DEFAULT 'openrouter/free',
  ADD COLUMN IF NOT EXISTS openrouter_model_mode TEXT NOT NULL DEFAULT 'auto_free',
  ADD COLUMN IF NOT EXISTS openrouter_available_models JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS openrouter_last_model_refresh TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS openrouter_last_successful_connection TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS openrouter_is_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS backup_provider_1 TEXT NOT NULL DEFAULT 'groq',
  ADD COLUMN IF NOT EXISTS backup_provider_2 TEXT NOT NULL DEFAULT 'gemini',
  ADD COLUMN IF NOT EXISTS groq_is_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS gemini_is_enabled BOOLEAN DEFAULT true;

-- Update singleton row default to OpenRouter Primary, Groq Backup 1, Gemini Backup 2
UPDATE public.ai_provider_configs
SET
  primary_provider = 'openrouter',
  openrouter_model = 'openrouter/free',
  openrouter_model_mode = 'auto_free',
  backup_provider_1 = 'groq',
  backup_provider_2 = 'gemini',
  updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000001';

-- =============================================================================
-- 2. REINFORCE STRICT RLS: SUPER ADMIN ONLY FOR AI CONFIGURATION
-- =============================================================================

-- Verify RLS is enabled
ALTER TABLE public.ai_provider_configs ENABLE ROW LEVEL SECURITY;

-- Drop any accidental public/customer read policies on ai_provider_configs
DROP POLICY IF EXISTS "ai_provider_configs_super_admin" ON public.ai_provider_configs;
DROP POLICY IF EXISTS "ai_provider_configs_read" ON public.ai_provider_configs;

-- Only authenticated users with super_admin role can access or modify ai_provider_configs
CREATE POLICY "ai_provider_configs_super_admin" ON public.ai_provider_configs
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
    )
  );
