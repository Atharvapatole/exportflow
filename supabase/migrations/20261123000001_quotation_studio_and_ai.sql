-- =============================================================================
-- EXPORTFLOW BY BENZWELL
-- Migration: Professional Export Quotation Studio & AI Document Assistant
-- Version: 20261123000001
-- =============================================================================

-- =============================================================================
-- 1. EXTEND QUOTATIONS TABLE FOR COMPREHENSIVE EXPORT TRADE FIELDS
-- =============================================================================

ALTER TABLE public.quotations
  ADD COLUMN IF NOT EXISTS inquiry_reference TEXT,
  ADD COLUMN IF NOT EXISTS inquiry_date DATE,
  ADD COLUMN IF NOT EXISTS buyer_po_reference TEXT,
  ADD COLUMN IF NOT EXISTS revision_number INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS prepared_by TEXT,
  ADD COLUMN IF NOT EXISTS salesperson TEXT,
  ADD COLUMN IF NOT EXISTS internal_reference TEXT,
  ADD COLUMN IF NOT EXISTS buyer_designation TEXT,
  ADD COLUMN IF NOT EXISTS buyer_state TEXT,
  ADD COLUMN IF NOT EXISTS buyer_city TEXT,
  ADD COLUMN IF NOT EXISTS buyer_postal_code TEXT,
  ADD COLUMN IF NOT EXISTS consignee_name TEXT,
  ADD COLUMN IF NOT EXISTS consignee_address TEXT,
  ADD COLUMN IF NOT EXISTS notify_party TEXT,
  ADD COLUMN IF NOT EXISTS ship_to_address TEXT,
  ADD COLUMN IF NOT EXISTS country_of_origin TEXT DEFAULT 'India',
  ADD COLUMN IF NOT EXISTS country_of_final_destination TEXT,
  ADD COLUMN IF NOT EXISTS place_of_delivery TEXT,
  ADD COLUMN IF NOT EXISTS final_destination TEXT,
  ADD COLUMN IF NOT EXISTS mode_of_transport TEXT DEFAULT 'Sea',
  ADD COLUMN IF NOT EXISTS incoterm_rule TEXT DEFAULT 'FOB',
  ADD COLUMN IF NOT EXISTS incoterm_version TEXT DEFAULT 'Incoterms 2020',
  ADD COLUMN IF NOT EXISTS named_place TEXT DEFAULT 'Nhava Sheva (INNSA), India',
  ADD COLUMN IF NOT EXISTS shipment_period TEXT,
  ADD COLUMN IF NOT EXISTS estimated_dispatch_date DATE,
  ADD COLUMN IF NOT EXISTS partial_shipment BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS transshipment BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS packing_type TEXT DEFAULT 'Standard Export Sea-worthy Packaging',
  ADD COLUMN IF NOT EXISTS marks_and_numbers TEXT,
  ADD COLUMN IF NOT EXISTS shipping_instructions TEXT,
  ADD COLUMN IF NOT EXISTS export_price_basis TEXT DEFAULT 'FOB',
  ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC(10, 4) DEFAULT 1.0000,
  ADD COLUMN IF NOT EXISTS product_discounts_total NUMERIC(15, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS overall_discount_percentage NUMERIC(5, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS overall_discount_amount NUMERIC(15, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS packing_charges NUMERIC(15, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS inland_transport_charges NUMERIC(15, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS customs_clearance_charges NUMERIC(15, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS documentation_charges NUMERIC(15, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS port_handling_charges NUMERIC(15, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS freight_charges NUMERIC(15, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS insurance_charges NUMERIC(15, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS inspection_charges NUMERIC(15, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS other_charges NUMERIC(15, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS tax_scheme TEXT DEFAULT 'GST',
  ADD COLUMN IF NOT EXISTS gst_treatment TEXT DEFAULT 'zero_rated_lut',
  ADD COLUMN IF NOT EXISTS gst_rate NUMERIC(5, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS lut_bond_number TEXT,
  ADD COLUMN IF NOT EXISTS tax_notes TEXT,
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'TT',
  ADD COLUMN IF NOT EXISTS balance_percentage NUMERIC(5, 2) DEFAULT 70.00,
  ADD COLUMN IF NOT EXISTS payment_due_date DATE,
  ADD COLUMN IF NOT EXISTS lc_details TEXT,
  ADD COLUMN IF NOT EXISTS tt_details TEXT,
  ADD COLUMN IF NOT EXISTS payment_against_bl BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS payment_against_documents BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS bank_charges_responsibility TEXT DEFAULT 'buyer',
  ADD COLUMN IF NOT EXISTS late_payment_conditions TEXT,
  ADD COLUMN IF NOT EXISTS other_payment_terms TEXT,
  ADD COLUMN IF NOT EXISTS delivery_schedule TEXT,
  ADD COLUMN IF NOT EXISTS shipment_conditions TEXT,
  ADD COLUMN IF NOT EXISTS packaging_conditions TEXT,
  ADD COLUMN IF NOT EXISTS quality_standards TEXT,
  ADD COLUMN IF NOT EXISTS inspection_requirements TEXT,
  ADD COLUMN IF NOT EXISTS sample_approval TEXT,
  ADD COLUMN IF NOT EXISTS certificate_requirements TEXT,
  ADD COLUMN IF NOT EXISTS insurance_conditions TEXT,
  ADD COLUMN IF NOT EXISTS force_majeure TEXT,
  ADD COLUMN IF NOT EXISTS claims_and_disputes TEXT,
  ADD COLUMN IF NOT EXISTS arbitration_jurisdiction TEXT,
  ADD COLUMN IF NOT EXISTS warranty_terms_text TEXT,
  ADD COLUMN IF NOT EXISTS quotation_validity_terms TEXT,
  ADD COLUMN IF NOT EXISTS cancellation_conditions TEXT,
  ADD COLUMN IF NOT EXISTS exporter_declaration TEXT,
  ADD COLUMN IF NOT EXISTS authorized_signatory_name TEXT,
  ADD COLUMN IF NOT EXISTS signatory_designation TEXT,
  ADD COLUMN IF NOT EXISTS authorized_signature_url TEXT,
  ADD COLUMN IF NOT EXISTS company_stamp_url TEXT,
  ADD COLUMN IF NOT EXISTS show_buyer_acceptance BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS buyer_acceptance_signature_url TEXT,
  ADD COLUMN IF NOT EXISTS buyer_accepted_by_name TEXT,
  ADD COLUMN IF NOT EXISTS buyer_accepted_date DATE,
  ADD COLUMN IF NOT EXISTS acceptance_remarks TEXT,
  ADD COLUMN IF NOT EXISTS show_bank_details BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_pan_gstin_iec BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_company_stamp BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_signature BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS branding_settings JSONB DEFAULT '{
    "logoPosition": "left",
    "primaryColor": "#10243A",
    "secondaryColor": "#2563EB",
    "fontFamily": "inter",
    "tableDesign": "striped"
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS locked_by UUID REFERENCES public.profiles(id);

-- =============================================================================
-- 2. CREATE AI PROVIDER CONFIGURATIONS TABLE (SUPER ADMIN ONLY)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.ai_provider_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  is_enabled BOOLEAN DEFAULT true,
  primary_provider TEXT NOT NULL DEFAULT 'groq',
  groq_api_key TEXT,
  groq_model TEXT NOT NULL DEFAULT 'llama-3.3-70b-versatile',
  backup_provider TEXT NOT NULL DEFAULT 'gemini',
  gemini_api_key TEXT,
  gemini_model TEXT NOT NULL DEFAULT 'gemini-2.0-flash',
  request_timeout INT NOT NULL DEFAULT 30000,
  max_retries INT NOT NULL DEFAULT 2,
  max_input_length INT NOT NULL DEFAULT 6000,
  daily_limit INT NOT NULL DEFAULT 1000,
  status TEXT NOT NULL DEFAULT 'healthy' CHECK (status IN ('healthy', 'degraded', 'unhealthy', 'disabled')),
  last_successful_request TIMESTAMPTZ,
  last_error TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id)
);

-- Ensure a single configuration singleton row exists
INSERT INTO public.ai_provider_configs (id, is_enabled, primary_provider, groq_model, backup_provider, gemini_model)
VALUES ('00000000-0000-0000-0000-000000000001', true, 'groq', 'llama-3.3-70b-versatile', 'gemini', 'gemini-2.0-flash')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 3. CREATE AI USAGE LOGS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt_tokens INT DEFAULT 0,
  completion_tokens INT DEFAULT 0,
  latency_ms INT DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('success', 'fallback_success', 'failed')),
  error_message TEXT,
  user_intent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_org ON public.ai_usage_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_date ON public.ai_usage_logs(created_at);

-- =============================================================================
-- 4. CREATE QUOTATION REVISIONS TABLE (LOCKED AUDIT TRAIL)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.quotation_revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  revision_number INT NOT NULL,
  document_snapshot JSONB NOT NULL,
  change_summary TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotation_revisions_doc ON public.quotation_revisions(quotation_id);

-- =============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

ALTER TABLE public.ai_provider_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_revisions ENABLE ROW LEVEL SECURITY;

-- AI Provider Configs: Super Admin only!
CREATE POLICY "ai_provider_configs_super_admin" ON public.ai_provider_configs
  FOR ALL USING (public.is_super_admin(auth.uid()));

-- AI Usage Logs: Organization members can view their own org's logs, Super Admin views all
CREATE POLICY "ai_usage_logs_org_select" ON public.ai_usage_logs
  FOR SELECT USING (
    organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
    OR public.is_super_admin(auth.uid())
  );

CREATE POLICY "ai_usage_logs_insert_authenticated" ON public.ai_usage_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Quotation Revisions: Members can view and insert revisions for their org
CREATE POLICY "quotation_revisions_all" ON public.quotation_revisions
  FOR ALL USING (
    organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
    OR public.is_super_admin(auth.uid())
  );
