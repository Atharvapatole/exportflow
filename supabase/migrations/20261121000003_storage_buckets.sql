-- =============================================================================
-- EXPORTFLOW BY BENZWELL
-- Supabase Storage Buckets & Storage Policies Migration
-- Version: 20261121000003
-- =============================================================================

-- =============================================================================
-- 1. CREATE STORAGE BUCKETS
-- =============================================================================

-- Public Buckets (Logos, branding assets, product catalog pictures)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('company-logos', 'company-logos', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']),
  ('company-assets', 'company-assets', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']),
  ('product-images', 'product-images', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Private Buckets (Generated PDFs, export shipment docs, digital signatures, company seals)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('document-pdfs', 'document-pdfs', false, 20971520, ARRAY['application/pdf']),
  ('document-attachments', 'document-attachments', false, 31457280, ARRAY['application/pdf', 'image/png', 'image/jpeg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']),
  ('signatures', 'signatures', false, 5242880, ARRAY['image/png', 'image/jpeg', 'image/svg+xml']),
  ('stamps', 'stamps', false, 5242880, ARRAY['image/png', 'image/jpeg', 'image/svg+xml'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =============================================================================
-- 2. STORAGE ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- A. PUBLIC BUCKETS READ POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Public Buckets Public Read" ON storage.objects
  FOR SELECT USING (
    bucket_id IN ('company-logos', 'company-assets', 'product-images')
  );

-- -----------------------------------------------------------------------------
-- B. AUTHENTICATED UPLOAD POLICIES FOR PUBLIC BUCKETS
-- -----------------------------------------------------------------------------
CREATE POLICY "Authenticated Upload To Public Buckets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id IN ('company-logos', 'company-assets', 'product-images')
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated Update/Delete Public Buckets" ON storage.objects
  FOR ALL USING (
    bucket_id IN ('company-logos', 'company-assets', 'product-images')
    AND (
      auth.uid() = owner
      OR public.is_super_admin(auth.uid())
    )
  );

-- -----------------------------------------------------------------------------
-- C. PRIVATE BUCKETS POLICIES (document-pdfs, document-attachments, signatures, stamps)
-- Folders are conventionally organized as: <organization_id>/<file_name>
-- -----------------------------------------------------------------------------
CREATE POLICY "Private Buckets Organization Member Read" ON storage.objects
  FOR SELECT USING (
    bucket_id IN ('document-pdfs', 'document-attachments', 'signatures', 'stamps')
    AND (
      public.is_super_admin(auth.uid())
      OR (
        -- Check if user is a member of the organization identified by the first path segment
        (storage.foldername(name))[1]::uuid IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
      )
    )
  );

CREATE POLICY "Private Buckets Organization Member Write" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id IN ('document-pdfs', 'document-attachments', 'signatures', 'stamps')
    AND (
      public.is_super_admin(auth.uid())
      OR (
        auth.role() = 'authenticated'
        AND (storage.foldername(name))[1]::uuid IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
      )
    )
  );

CREATE POLICY "Private Buckets Organization Member Modify" ON storage.objects
  FOR UPDATE USING (
    bucket_id IN ('document-pdfs', 'document-attachments', 'signatures', 'stamps')
    AND (
      public.is_super_admin(auth.uid())
      OR (
        (storage.foldername(name))[1]::uuid IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
      )
    )
  );

CREATE POLICY "Private Buckets Organization Member Delete" ON storage.objects
  FOR DELETE USING (
    bucket_id IN ('document-pdfs', 'document-attachments', 'signatures', 'stamps')
    AND (
      public.is_super_admin(auth.uid())
      OR (
        (storage.foldername(name))[1]::uuid IN (SELECT org_id FROM public.get_user_organizations(auth.uid()))
      )
    )
  );
