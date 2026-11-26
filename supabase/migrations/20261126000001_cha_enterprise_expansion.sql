-- =============================================================================
-- EXPORTFLOW 2026: CHA WORKSPACE, ENTERPRISE EXPANSION & SIGNATURES MIGRATION
-- =============================================================================

-- 1. Extend organizations with CHA fields and White-label configurations
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS org_type TEXT NOT NULL DEFAULT 'exporter' CHECK (org_type IN ('exporter', 'cha')),
  ADD COLUMN IF NOT EXISTS cha_license_number TEXT,
  ADD COLUMN IF NOT EXISTS cha_license_authority TEXT,
  ADD COLUMN IF NOT EXISTS cha_license_status TEXT NOT NULL DEFAULT 'unverified' CHECK (cha_license_status IN ('unverified', 'pending', 'verified', 'rejected')),
  ADD COLUMN IF NOT EXISTS authorized_personnel TEXT,
  ADD COLUMN IF NOT EXISTS stamp_url TEXT,
  ADD COLUMN IF NOT EXISTS signature_url TEXT,
  ADD COLUMN IF NOT EXISTS whitelabel_config JSONB DEFAULT '{}'::jsonb;

-- 2. CHA Clients Table (Multi-Client CRM)
CREATE TABLE IF NOT EXISTS public.cha_clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cha_org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  business_type TEXT DEFAULT 'Importer/Exporter',
  client_type TEXT CHECK (client_type IN ('importer', 'exporter', 'both')) DEFAULT 'both',
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  iec TEXT,
  gstin TEXT,
  pan TEXT,
  billing_info JSONB DEFAULT '{}'::jsonb,
  kyc_status TEXT CHECK (kyc_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
  status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cha_clients_org ON public.cha_clients(cha_org_id);
CREATE INDEX IF NOT EXISTS idx_cha_clients_status ON public.cha_clients(status);

-- 3. Customs Jobs Table
CREATE TABLE IF NOT EXISTS public.customs_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_number TEXT NOT NULL UNIQUE,
  cha_org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.cha_clients(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL CHECK (job_type IN ('import_clearance', 'export_clearance', 're_export', 'transshipment', 'other')),
  shipment_reference TEXT,
  invoice_reference TEXT,
  bl_awb_number TEXT,
  port_of_loading TEXT,
  port_of_discharge TEXT,
  country_of_origin TEXT,
  country_of_destination TEXT,
  vessel_flight_details TEXT,
  expected_date DATE,
  assigned_employee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN (
    'new', 'awaiting_documents', 'documents_received', 'under_review',
    'ready_for_filing', 'submitted_externally', 'customs_query_received',
    'examination_pending', 'duty_payment_pending', 'customs_cleared',
    'completed', 'on_hold', 'cancelled'
  )) DEFAULT 'new',
  filing_references JSONB DEFAULT '{}'::jsonb,
  expenses NUMERIC(12, 2) DEFAULT 0,
  client_charges NUMERIC(12, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customs_jobs_org ON public.customs_jobs(cha_org_id);
CREATE INDEX IF NOT EXISTS idx_customs_jobs_client ON public.customs_jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_customs_jobs_status ON public.customs_jobs(status);

-- 4. Customs Job Documents Table
CREATE TABLE IF NOT EXISTS public.customs_job_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.customs_jobs(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.cha_clients(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  document_number TEXT,
  file_url TEXT,
  status TEXT CHECK (status IN ('required', 'recommended', 'received', 'under_review', 'verified', 'rejected', 'not_applicable')) DEFAULT 'received',
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_docs_job ON public.customs_job_documents(job_id);

-- 5. Customs Document Checklists Table
CREATE TABLE IF NOT EXISTS public.customs_document_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.customs_jobs(id) ON DELETE CASCADE,
  item_code TEXT NOT NULL,
  item_label TEXT NOT NULL,
  category TEXT DEFAULT 'mandatory',
  status TEXT CHECK (status IN ('required', 'recommended', 'conditional', 'received', 'under_review', 'verified', 'rejected', 'not_applicable')) DEFAULT 'required',
  document_id UUID REFERENCES public.customs_job_documents(id) ON DELETE SET NULL,
  notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_job_checklists_job ON public.customs_document_checklists(job_id);

-- 6. e-SANCHIT Supporting Document Register
CREATE TABLE IF NOT EXISTS public.esanchit_document_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.customs_jobs(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.cha_clients(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_reference TEXT,
  issue_date DATE,
  irn TEXT,
  drn TEXT,
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  file_url TEXT,
  verification_status TEXT CHECK (verification_status IN ('uploaded', 'verified', 'rejected', 'pending')) DEFAULT 'uploaded',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_esanchit_job ON public.esanchit_document_records(job_id);
CREATE INDEX IF NOT EXISTS idx_esanchit_client ON public.esanchit_document_records(client_id);

-- 7. Customs Queries Table
CREATE TABLE IF NOT EXISTS public.customs_queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.customs_jobs(id) ON DELETE CASCADE,
  query_number TEXT,
  query_date TIMESTAMPTZ DEFAULT NOW(),
  customs_officer TEXT,
  query_text TEXT NOT NULL,
  reply_text TEXT,
  reply_date TIMESTAMPTZ,
  replied_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('open', 'replied', 'resolved')) DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Signature & Stamp Assets Table
CREATE TABLE IF NOT EXISTS public.signature_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  signatory_name TEXT NOT NULL,
  designation TEXT NOT NULL,
  image_url TEXT NOT NULL,
  stamp_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signatures_org ON public.signature_assets(organization_id);

-- 9. Document Audit Events Table (Immutable Document History)
CREATE TABLE IF NOT EXISTS public.document_audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  document_id TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_email TEXT,
  user_name TEXT,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doc_audit_doc ON public.document_audit_events(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_audit_org ON public.document_audit_events(organization_id);

-- 10. API Keys Table
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  key_name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  permissions TEXT[] DEFAULT ARRAY['documents:read', 'documents:write', 'buyers:read', 'buyers:write', 'products:read', 'products:write'],
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_org ON public.api_keys(organization_id);

-- 11. API Usage Logs Table
CREATE TABLE IF NOT EXISTS public.api_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Custom Document Templates Table
CREATE TABLE IF NOT EXISTS public.custom_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  config JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Organization Team Members Table (Enterprise RBAC)
CREATE TABLE IF NOT EXISTS public.organization_team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'documentation_executive', 'accounts_executive', 'viewer')) DEFAULT 'documentation_executive',
  status TEXT CHECK (status IN ('active', 'invited', 'suspended')) DEFAULT 'active',
  invited_email TEXT,
  invited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_team_members_org ON public.organization_team_members(organization_id);
