-- =============================================================================
-- EXPORTFLOW BY BENZWELL — SUPABASE INITIAL DATABASE SCHEMA
-- Migration: 20261121000001_initial_schema.sql
-- Description: Creates all 45 production tables with UUID primary keys,
-- foreign keys, indexes, decimal precision, and updated_at triggers.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- Helper Function: Update timestamps
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- 1. PROFILES (Extends Supabase auth.users)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('super_admin', 'owner', 'admin', 'manager', 'employee', 'viewer')),
  current_org_id UUID,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'disabled', 'pending')),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2. ORGANIZATIONS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  country TEXT NOT NULL DEFAULT 'India',
  business_type TEXT NOT NULL DEFAULT 'Manufacturer & Exporter',
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. ORGANIZATION MEMBERS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('super_admin', 'owner', 'admin', 'manager', 'employee', 'viewer')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'disabled')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- -----------------------------------------------------------------------------
-- 4. ORGANIZATION SETTINGS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organization_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
  default_currency TEXT NOT NULL DEFAULT 'USD',
  default_incoterms TEXT NOT NULL DEFAULT 'FOB',
  default_validity_days INT NOT NULL DEFAULT 15,
  default_payment_terms TEXT DEFAULT '30% Advance TT, 70% against BL copy',
  preferred_template TEXT NOT NULL DEFAULT 'classic-corporate',
  quotation_prefix TEXT NOT NULL DEFAULT 'QT',
  pi_prefix TEXT NOT NULL DEFAULT 'PI',
  ci_prefix TEXT NOT NULL DEFAULT 'CI',
  pl_prefix TEXT NOT NULL DEFAULT 'PL',
  so_prefix TEXT NOT NULL DEFAULT 'SO',
  po_prefix TEXT NOT NULL DEFAULT 'PO',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 5. COMPANY PROFILES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.company_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
  legal_name TEXT NOT NULL,
  trading_name TEXT,
  logo_url TEXT,
  business_type TEXT,
  country TEXT NOT NULL DEFAULT 'India',
  registered_address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  website TEXT,
  gstin TEXT,
  pan TEXT,
  iec TEXT,
  cin TEXT,
  lut_number TEXT,
  primary_contact_name TEXT,
  primary_contact_phone TEXT,
  primary_contact_email TEXT,
  designation TEXT,
  bank_name TEXT,
  account_holder_name TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  swift_bic TEXT,
  bank_branch_address TEXT,
  bank_currency TEXT DEFAULT 'USD',
  authorized_signature_url TEXT,
  company_stamp_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 6. BUYERS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.buyers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  website TEXT,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  billing_address TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  tax_id TEXT,
  buyer_type TEXT,
  industry TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'interested', 'negotiating', 'converted', 'inactive', 'lost')),
  notes TEXT,
  tags TEXT[],
  total_order_value NUMERIC(15, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 7. PRODUCTS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT DEFAULT '',
  specifications TEXT,
  hs_code TEXT NOT NULL,
  country_of_origin TEXT DEFAULT 'India',
  unit TEXT NOT NULL DEFAULT 'PCS',
  default_currency TEXT NOT NULL DEFAULT 'USD',
  purchase_cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  selling_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  moq INT NOT NULL DEFAULT 1,
  packaging_details TEXT,
  net_weight NUMERIC(10, 3) DEFAULT 0.000,
  gross_weight NUMERIC(10, 3) DEFAULT 0.000,
  cbm NUMERIC(10, 4) DEFAULT 0.0000,
  stock_quantity INT NOT NULL DEFAULT 0,
  low_stock_threshold INT NOT NULL DEFAULT 10,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 8. PRODUCT PRICING (Tiered & Custom Market Rates)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  currency TEXT NOT NULL,
  price NUMERIC(15, 2) NOT NULL,
  min_quantity INT NOT NULL DEFAULT 1,
  buyer_id UUID REFERENCES public.buyers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 9. INVENTORY (Stock ledger and adjustments)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity_delta INT NOT NULL,
  resulting_quantity INT NOT NULL,
  reason TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 10. QUOTATIONS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  document_number TEXT NOT NULL,
  reference_number TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  validity_date DATE,
  buyer_id UUID REFERENCES public.buyers(id) ON DELETE SET NULL,
  buyer_company TEXT NOT NULL,
  buyer_contact_person TEXT,
  buyer_email TEXT,
  buyer_phone TEXT,
  buyer_country TEXT,
  buyer_billing_address TEXT,
  buyer_shipping_address TEXT,
  buyer_tax_id TEXT,
  seller_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  currency TEXT NOT NULL DEFAULT 'USD',
  incoterm TEXT NOT NULL DEFAULT 'FOB',
  origin_port TEXT,
  destination_port TEXT,
  subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  discount_total NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  taxable_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  tax_type TEXT NOT NULL DEFAULT 'zero_rated_export',
  cgst_total NUMERIC(15, 2) DEFAULT 0.00,
  sgst_total NUMERIC(15, 2) DEFAULT 0.00,
  igst_total NUMERIC(15, 2) DEFAULT 0.00,
  tax_total NUMERIC(15, 2) DEFAULT 0.00,
  grand_total NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  amount_in_words TEXT,
  payment_terms TEXT,
  advance_percentage NUMERIC(5, 2) DEFAULT 30.00,
  advance_amount NUMERIC(15, 2) DEFAULT 0.00,
  balance_amount NUMERIC(15, 2) DEFAULT 0.00,
  delivery_time TEXT,
  freight_terms TEXT,
  packaging_details TEXT,
  insurance_terms TEXT,
  warranty_terms TEXT,
  bank_details TEXT,
  notes TEXT,
  terms_and_conditions TEXT,
  template_id TEXT NOT NULL DEFAULT 'classic-corporate',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'revised', 'converted', 'cancelled')),
  share_token TEXT UNIQUE,
  share_token_expires_at TIMESTAMPTZ,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 11. QUOTATION ITEMS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quotation_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  item_number INT NOT NULL,
  product_name TEXT NOT NULL,
  description TEXT,
  specifications TEXT,
  hs_code TEXT NOT NULL,
  quantity NUMERIC(15, 2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'PCS',
  unit_price NUMERIC(15, 2) NOT NULL,
  discount_percentage NUMERIC(5, 2) DEFAULT 0.00,
  discount_amount NUMERIC(15, 2) DEFAULT 0.00,
  tax_rate NUMERIC(5, 2) DEFAULT 0.00,
  cgst_amount NUMERIC(15, 2) DEFAULT 0.00,
  sgst_amount NUMERIC(15, 2) DEFAULT 0.00,
  igst_amount NUMERIC(15, 2) DEFAULT 0.00,
  tax_amount NUMERIC(15, 2) DEFAULT 0.00,
  line_total NUMERIC(15, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 12. PROFORMA INVOICES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.proforma_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  document_number TEXT NOT NULL,
  reference_number TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  validity_date DATE,
  buyer_id UUID REFERENCES public.buyers(id) ON DELETE SET NULL,
  buyer_company TEXT NOT NULL,
  buyer_contact_person TEXT,
  buyer_email TEXT,
  buyer_phone TEXT,
  buyer_country TEXT,
  buyer_billing_address TEXT,
  buyer_shipping_address TEXT,
  buyer_tax_id TEXT,
  seller_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  currency TEXT NOT NULL DEFAULT 'USD',
  incoterm TEXT NOT NULL DEFAULT 'FOB',
  origin_port TEXT,
  destination_port TEXT,
  subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  discount_total NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  taxable_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  tax_type TEXT NOT NULL DEFAULT 'zero_rated_export',
  tax_total NUMERIC(15, 2) DEFAULT 0.00,
  grand_total NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  amount_in_words TEXT,
  payment_terms TEXT,
  advance_percentage NUMERIC(5, 2) DEFAULT 30.00,
  delivery_time TEXT,
  bank_details TEXT,
  notes TEXT,
  terms_and_conditions TEXT,
  template_id TEXT NOT NULL DEFAULT 'classic-corporate',
  status TEXT NOT NULL DEFAULT 'draft',
  converted_from_id UUID,
  converted_from_type TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 13. PROFORMA INVOICE ITEMS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.proforma_invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proforma_invoice_id UUID NOT NULL REFERENCES public.proforma_invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  item_number INT NOT NULL,
  product_name TEXT NOT NULL,
  description TEXT,
  hs_code TEXT NOT NULL,
  quantity NUMERIC(15, 2) NOT NULL,
  unit TEXT NOT NULL,
  unit_price NUMERIC(15, 2) NOT NULL,
  line_total NUMERIC(15, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 14. COMMERCIAL INVOICES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.commercial_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  document_number TEXT NOT NULL,
  reference_number TEXT,
  pi_reference TEXT,
  po_reference TEXT,
  vessel_flight_no TEXT,
  container_no TEXT,
  is_draft BOOLEAN DEFAULT false,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  buyer_id UUID REFERENCES public.buyers(id) ON DELETE SET NULL,
  buyer_company TEXT NOT NULL,
  buyer_country TEXT,
  buyer_billing_address TEXT,
  buyer_shipping_address TEXT,
  seller_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  currency TEXT NOT NULL DEFAULT 'USD',
  incoterm TEXT NOT NULL DEFAULT 'FOB',
  origin_port TEXT,
  destination_port TEXT,
  subtotal NUMERIC(15, 2) NOT NULL,
  discount_total NUMERIC(15, 2) DEFAULT 0.00,
  taxable_amount NUMERIC(15, 2) NOT NULL,
  tax_total NUMERIC(15, 2) DEFAULT 0.00,
  grand_total NUMERIC(15, 2) NOT NULL,
  amount_in_words TEXT,
  payment_terms TEXT,
  bank_details TEXT,
  notes TEXT,
  terms_and_conditions TEXT,
  template_id TEXT NOT NULL DEFAULT 'classic-corporate',
  status TEXT NOT NULL DEFAULT 'draft',
  converted_from_id UUID,
  converted_from_type TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 15. COMMERCIAL INVOICE ITEMS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.commercial_invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  commercial_invoice_id UUID NOT NULL REFERENCES public.commercial_invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  item_number INT NOT NULL,
  product_name TEXT NOT NULL,
  description TEXT,
  hs_code TEXT NOT NULL,
  quantity NUMERIC(15, 2) NOT NULL,
  unit TEXT NOT NULL,
  unit_price NUMERIC(15, 2) NOT NULL,
  line_total NUMERIC(15, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 16. PACKING LISTS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.packing_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  document_number TEXT NOT NULL,
  invoice_reference TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  buyer_id UUID REFERENCES public.buyers(id) ON DELETE SET NULL,
  buyer_company TEXT NOT NULL,
  buyer_country TEXT,
  total_cartons INT NOT NULL DEFAULT 0,
  total_units NUMERIC(15, 2) NOT NULL DEFAULT 0,
  total_net_weight NUMERIC(12, 3) NOT NULL DEFAULT 0,
  total_gross_weight NUMERIC(12, 3) NOT NULL DEFAULT 0,
  total_cbm NUMERIC(12, 4) NOT NULL DEFAULT 0,
  seller_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  template_id TEXT NOT NULL DEFAULT 'compact-business',
  status TEXT NOT NULL DEFAULT 'draft',
  converted_from_id UUID,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 17. PACKING LIST ITEMS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.packing_list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  packing_list_id UUID NOT NULL REFERENCES public.packing_lists(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  package_number TEXT,
  package_type TEXT DEFAULT 'Carton',
  product_name TEXT NOT NULL,
  quantity NUMERIC(15, 2) NOT NULL,
  net_weight NUMERIC(10, 3),
  gross_weight NUMERIC(10, 3),
  cbm NUMERIC(10, 4),
  dimensions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 18. PURCHASE ORDERS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  document_number TEXT NOT NULL,
  supplier_name TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  currency TEXT NOT NULL DEFAULT 'USD',
  grand_total NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 19. SALES ORDERS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sales_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  document_number TEXT NOT NULL,
  buyer_company TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  currency TEXT NOT NULL DEFAULT 'USD',
  grand_total NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 20. DELIVERY NOTES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.delivery_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  document_number TEXT NOT NULL,
  buyer_company TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'issued',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 21. DEBIT NOTES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.debit_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  document_number TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 22. CREDIT NOTES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.credit_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  document_number TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 23. DOCUMENT SEQUENCES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.document_sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  current_sequence INT NOT NULL DEFAULT 0,
  year INT NOT NULL,
  UNIQUE(organization_id, document_type, year)
);

-- -----------------------------------------------------------------------------
-- 24. DOCUMENT REVISIONS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.document_revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  document_id UUID NOT NULL,
  document_type TEXT NOT NULL,
  revision_number INT NOT NULL,
  document_snapshot JSONB NOT NULL,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 25. DOCUMENT FILES (Private Storage Metadata)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.document_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  document_id UUID,
  bucket_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INT,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 26. DOCUMENT SHARES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.document_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  document_id UUID NOT NULL,
  share_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ,
  views_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 27. DOCUMENT EVENTS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.document_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  document_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  actor_email TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 28. EXPORT RECORDS (Statutory checklist tracking)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.export_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  shipping_bill_number TEXT,
  bl_number TEXT,
  ebrc_number TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 29. SHIPMENTS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  shipment_reference TEXT NOT NULL,
  buyer_id UUID REFERENCES public.buyers(id) ON DELETE SET NULL,
  buyer_company TEXT NOT NULL,
  order_reference TEXT,
  invoice_reference TEXT,
  origin_port TEXT NOT NULL,
  destination_port TEXT NOT NULL,
  shipping_line TEXT NOT NULL DEFAULT 'Maersk Line',
  vessel_name TEXT,
  container_number TEXT,
  container_type TEXT NOT NULL DEFAULT '20ft',
  etd DATE NOT NULL,
  eta DATE NOT NULL,
  actual_departure DATE,
  actual_arrival DATE,
  status TEXT NOT NULL DEFAULT 'booked' CHECK (status IN ('preparing', 'ready_for_dispatch', 'booked', 'in_transit', 'arrived', 'delivered', 'delayed', 'cancelled')),
  freight_details TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 30. SHIPMENT UPDATES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shipment_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  location TEXT NOT NULL,
  comment TEXT,
  date TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 31. PAYMENT RECORDS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES public.buyers(id) ON DELETE SET NULL,
  buyer_company TEXT NOT NULL,
  invoice_reference TEXT,
  amount NUMERIC(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_date DATE NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'wire_transfer',
  transaction_reference TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('pending', 'partially_paid', 'paid', 'overdue', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 32. ENQUIRIES (RFQs)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES public.buyers(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 33. FOLLOW UP REMINDERS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.follow_up_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES public.buyers(id) ON DELETE CASCADE,
  reminder_date DATE NOT NULL,
  note TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 34. NOTIFICATIONS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 35. AI CONVERSATIONS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Export Consultation',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 36. AI MESSAGES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 37. SUPPORT TICKETS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  company_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('bug_report', 'feature_request', 'account_issue', 'general_inquiry')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_for_customer', 'resolved', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 38. SUPPORT REPLIES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.support_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL CHECK (author_role IN ('admin', 'user')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 39. ANNOUNCEMENTS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'feature' CHECK (type IN ('feature', 'maintenance', 'update', 'notice')),
  active BOOLEAN NOT NULL DEFAULT true,
  target_audience TEXT NOT NULL DEFAULT 'all',
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 40. PLATFORM ACTIVITY
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.platform_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 41. ADMIN AUDIT LOGS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  target_entity TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 42. PLATFORM REVENUE (BENZWELL Income)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.platform_revenue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('custom_development', 'setup_services', 'consulting', 'custom_integrations', 'other')),
  amount NUMERIC(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  date_received DATE NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_reference TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 43. SYSTEM HEALTH LOGS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.system_health_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_name TEXT NOT NULL,
  status TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 44. USAGE ANALYTICS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.usage_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC(15, 2) NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 45. INVITATIONS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'manager', 'employee', 'viewer')),
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- TRIGGERS FOR UPDATED_AT
-- -----------------------------------------------------------------------------
CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizations_modtime BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_profiles_modtime BEFORE UPDATE ON public.company_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_buyers_modtime BEFORE UPDATE ON public.buyers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_modtime BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotations_modtime BEFORE UPDATE ON public.quotations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_proforma_invoices_modtime BEFORE UPDATE ON public.proforma_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_commercial_invoices_modtime BEFORE UPDATE ON public.commercial_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_packing_lists_modtime BEFORE UPDATE ON public.packing_lists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shipments_modtime BEFORE UPDATE ON public.shipments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
