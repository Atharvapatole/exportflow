-- =============================================================================
-- EXPORTFLOW BY BENZWELL
-- Supabase Row Level Security (RLS) & Authorization Migration
-- Version: 20261121000002
-- =============================================================================

-- =============================================================================
-- 1. HELPER SECURITY FUNCTIONS
-- =============================================================================

-- Check if current authenticated user is a platform Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'super_admin'
  );
$$;

-- Get all organization IDs that the user is an active member of
CREATE OR REPLACE FUNCTION public.get_user_organizations(user_id UUID DEFAULT auth.uid())
RETURNS TABLE (org_id UUID)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT organization_id
  FROM public.organization_members
  WHERE user_id = get_user_organizations.user_id AND status = 'active';
$$;

-- Check if user has specific organization roles (e.g. 'owner', 'admin')
CREATE OR REPLACE FUNCTION public.has_org_role(
  org_id UUID,
  allowed_roles TEXT[],
  user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org_id
      AND user_id = has_org_role.user_id
      AND status = 'active'
      AND role = ANY(allowed_roles)
  );
$$;

-- =============================================================================
-- 2. ENABLE ROW LEVEL SECURITY ON ALL 45 TABLES
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proforma_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proforma_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commercial_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commercial_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packing_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packing_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 3. PROFILES POLICIES
-- =============================================================================

CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR public.is_super_admin(auth.uid())
  );

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id OR public.is_super_admin(auth.uid())
  );

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id OR public.is_super_admin(auth.uid())
  ) WITH CHECK (
    -- Normal users cannot elevate their own role to super_admin
    (auth.uid() = id AND role IS NOT DISTINCT FROM (SELECT role FROM public.profiles WHERE id = auth.uid()))
    OR public.is_super_admin(auth.uid())
  );

-- =============================================================================
-- 4. ORGANIZATIONS & MEMBERS POLICIES
-- =============================================================================

CREATE POLICY "organizations_select_members" ON public.organizations
  FOR SELECT USING (
    id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
    OR public.is_super_admin(auth.uid())
  );

CREATE POLICY "organizations_insert_authenticated" ON public.organizations
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
  );

CREATE POLICY "organizations_update_admin" ON public.organizations
  FOR UPDATE USING (
    public.has_org_role(id, ARRAY['owner', 'admin']) OR public.is_super_admin(auth.uid())
  );

CREATE POLICY "organizations_delete_owner" ON public.organizations
  FOR DELETE USING (
    public.has_org_role(id, ARRAY['owner']) OR public.is_super_admin(auth.uid())
  );

-- Organization Members
CREATE POLICY "org_members_select" ON public.organization_members
  FOR SELECT USING (
    organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
    OR user_id = auth.uid()
    OR public.is_super_admin(auth.uid())
  );

CREATE POLICY "org_members_insert" ON public.organization_members
  FOR INSERT WITH CHECK (
    public.has_org_role(organization_id, ARRAY['owner', 'admin'])
    OR public.is_super_admin(auth.uid())
    OR user_id = auth.uid() -- Allows user creating org to attach themselves as initial owner
  );

CREATE POLICY "org_members_update" ON public.organization_members
  FOR UPDATE USING (
    public.has_org_role(organization_id, ARRAY['owner', 'admin'])
    OR public.is_super_admin(auth.uid())
  );

CREATE POLICY "org_members_delete" ON public.organization_members
  FOR DELETE USING (
    public.has_org_role(organization_id, ARRAY['owner'])
    OR (user_id = auth.uid()) -- Leave org
    OR public.is_super_admin(auth.uid())
  );

-- =============================================================================
-- 5. REUSABLE MACROS / STANDARD TENANT POLICIES
-- =============================================================================

-- Organization Settings
CREATE POLICY "org_settings_all" ON public.organization_settings
  FOR ALL USING (
    organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
    OR public.is_super_admin(auth.uid())
  );

-- Company Profiles
CREATE POLICY "company_profiles_all" ON public.company_profiles
  FOR ALL USING (
    organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
    OR public.is_super_admin(auth.uid())
  );

-- Buyers
CREATE POLICY "buyers_all" ON public.buyers
  FOR ALL USING (
    organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
    OR public.is_super_admin(auth.uid())
  );

-- Products
CREATE POLICY "products_all" ON public.products
  FOR ALL USING (
    organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
    OR public.is_super_admin(auth.uid())
  );

-- Product Pricing
CREATE POLICY "product_pricing_all" ON public.product_pricing
  FOR ALL USING (
    organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
    OR public.is_super_admin(auth.uid())
  );

-- Inventory
CREATE POLICY "inventory_all" ON public.inventory
  FOR ALL USING (
    organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
    OR public.is_super_admin(auth.uid())
  );

-- Quotations
CREATE POLICY "quotations_member_all" ON public.quotations
  FOR ALL USING (
    organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
    OR public.is_super_admin(auth.uid())
  );

-- Quotation Items (joins parent quotation)
CREATE POLICY "quotation_items_all" ON public.quotation_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.quotations q
      WHERE q.id = quotation_items.quotation_id
        AND (q.organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid())) OR public.is_super_admin(auth.uid()))
    )
  );

-- Proforma Invoices
CREATE POLICY "proforma_invoices_member_all" ON public.proforma_invoices
  FOR ALL USING (
    organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
    OR public.is_super_admin(auth.uid())
  );

-- Proforma Invoice Items
CREATE POLICY "proforma_invoice_items_all" ON public.proforma_invoice_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.proforma_invoices pi
      WHERE pi.id = proforma_invoice_items.proforma_invoice_id
        AND (pi.organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid())) OR public.is_super_admin(auth.uid()))
    )
  );

-- Commercial Invoices
CREATE POLICY "commercial_invoices_member_all" ON public.commercial_invoices
  FOR ALL USING (
    organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
    OR public.is_super_admin(auth.uid())
  );

-- Commercial Invoice Items
CREATE POLICY "commercial_invoice_items_all" ON public.commercial_invoice_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.commercial_invoices ci
      WHERE ci.id = commercial_invoice_items.commercial_invoice_id
        AND (ci.organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid())) OR public.is_super_admin(auth.uid()))
    )
  );

-- Packing Lists
CREATE POLICY "packing_lists_member_all" ON public.packing_lists
  FOR ALL USING (
    organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
    OR public.is_super_admin(auth.uid())
  );

-- Packing List Items
CREATE POLICY "packing_list_items_all" ON public.packing_list_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.packing_lists pl
      WHERE pl.id = packing_list_items.packing_list_id
        AND (pl.organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid())) OR public.is_super_admin(auth.uid()))
    )
  );

-- Purchase Orders
CREATE POLICY "purchase_orders_all" ON public.purchase_orders
  FOR ALL USING (
    organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
    OR public.is_super_admin(auth.uid())
  );

-- Sales Orders
CREATE POLICY "sales_orders_all" ON public.sales_orders
  FOR ALL USING (
    organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
    OR public.is_super_admin(auth.uid())
  );

-- Delivery Notes
CREATE POLICY "delivery_notes_all" ON public.delivery_notes
  FOR ALL USING (
    organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
    OR public.is_super_admin(auth.uid())
  );

-- Debit Notes
CREATE POLICY "debit_notes_all" ON public.debit_notes
  FOR ALL USING (
    organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
    OR public.is_super_admin(auth.uid())
  );

-- Credit Notes
CREATE POLICY "credit_notes_all" ON public.credit_notes
  FOR ALL USING (
    organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
    OR public.is_super_admin(auth.uid())
  );

-- Document Sequences
CREATE POLICY "document_sequences_all" ON public.document_sequences
  FOR ALL USING (
    organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
    OR public.is_super_admin(auth.uid())
  );

-- Document Revisions
CREATE POLICY "document_revisions_all" ON public.document_revisions
  FOR ALL USING (
    organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
    OR public.is_super_admin(auth.uid())
  );

-- Document Files
CREATE POLICY "document_files_all" ON public.document_files
  FOR ALL USING (
    organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
    OR public.is_super_admin(auth.uid())
  );

-- Document Shares (Members can manage, anyone with active token can read)
CREATE POLICY "document_shares_member_manage" ON public.document_shares
  FOR ALL USING (
    organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
    OR public.is_super_admin(auth.uid())
  );

CREATE POLICY "document_shares_public_read" ON public.document_shares
  FOR SELECT USING (
    is_active = true AND (expires_at IS NULL OR expires_at > NOW())
  );

-- Document Events
CREATE POLICY "document_events_all" ON public.document_events
  FOR ALL USING (
    organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
    OR public.is_super_admin(auth.uid())
  );

-- Export Records
CREATE POLICY "export_records_all" ON public.export_records
  FOR ALL USING (
    organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
    OR public.is_super_admin(auth.uid())
  );

-- Shipments
CREATE POLICY "shipments_all" ON public.shipments
  FOR ALL USING (
    organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
    OR public.is_super_admin(auth.uid())
  );

-- Shipment Updates
CREATE POLICY "shipment_updates_all" ON public.shipment_updates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.shipments s
      WHERE s.id = shipment_updates.shipment_id
        AND (s.organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid())) OR public.is_super_admin(auth.uid()))
    )
  );

-- Payment Records
CREATE POLICY "payment_records_all" ON public.payment_records
  FOR ALL USING (
    organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
    OR public.is_super_admin(auth.uid())
  );

-- Enquiries
CREATE POLICY "enquiries_all" ON public.enquiries
  FOR ALL USING (
    organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
    OR public.is_super_admin(auth.uid())
  );

-- Follow Up Reminders
CREATE POLICY "follow_up_reminders_all" ON public.follow_up_reminders
  FOR ALL USING (
    organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
    OR public.is_super_admin(auth.uid())
  );

-- Notifications (User-targeted or Org-targeted)
CREATE POLICY "notifications_user_all" ON public.notifications
  FOR ALL USING (
    user_id = auth.uid()
    OR organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
    OR public.is_super_admin(auth.uid())
  );

-- AI Conversations
CREATE POLICY "ai_conversations_all" ON public.ai_conversations
  FOR ALL USING (
    organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
    OR user_id = auth.uid()
    OR public.is_super_admin(auth.uid())
  );

-- AI Messages
CREATE POLICY "ai_messages_all" ON public.ai_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.ai_conversations ac
      WHERE ac.id = ai_messages.conversation_id
        AND (
          ac.organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
          OR ac.user_id = auth.uid()
          OR public.is_super_admin(auth.uid())
        )
    )
  );

-- Support Tickets
CREATE POLICY "support_tickets_all" ON public.support_tickets
  FOR ALL USING (
    organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
    OR user_id = auth.uid()
    OR public.is_super_admin(auth.uid())
  );

-- Support Replies
CREATE POLICY "support_replies_all" ON public.support_replies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets st
      WHERE st.id = support_replies.ticket_id
        AND (
          st.organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
          OR st.user_id = auth.uid()
          OR public.is_super_admin(auth.uid())
        )
    )
  );

-- Invitations
CREATE POLICY "invitations_select" ON public.invitations
  FOR SELECT USING (
    organization_id IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
    OR email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    OR public.is_super_admin(auth.uid())
  );

CREATE POLICY "invitations_manage" ON public.invitations
  FOR ALL USING (
    public.has_org_role(organization_id, ARRAY['owner', 'admin'])
    OR public.is_super_admin(auth.uid())
  );

-- Announcements (All authenticated users can read, only super admins write)
CREATE POLICY "announcements_read_all" ON public.announcements
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "announcements_admin_write" ON public.announcements
  FOR ALL USING (public.is_super_admin(auth.uid()));

-- =============================================================================
-- 6. SUPER ADMIN EXCLUSIVE TABLES
-- =============================================================================

CREATE POLICY "platform_activity_admin" ON public.platform_activity
  FOR ALL USING (public.is_super_admin(auth.uid()));

CREATE POLICY "admin_audit_logs_admin" ON public.admin_audit_logs
  FOR ALL USING (public.is_super_admin(auth.uid()));

CREATE POLICY "platform_revenue_admin" ON public.platform_revenue
  FOR ALL USING (public.is_super_admin(auth.uid()));

CREATE POLICY "system_health_logs_admin" ON public.system_health_logs
  FOR ALL USING (public.is_super_admin(auth.uid()));

CREATE POLICY "usage_analytics_admin" ON public.usage_analytics
  FOR ALL USING (public.is_super_admin(auth.uid()));
