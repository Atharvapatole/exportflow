# Supabase Setup Guide — ExportFlow by BENZWELL

This document provides complete instructions for setting up and connecting Supabase with **ExportFlow by BENZWELL**.

---

## 1. Prerequisites

1. Create a [Supabase](https://supabase.com) account.
2. Create a new Supabase Project:
   - **Project Name:** `ExportFlow` (or your preferred name)
   - **Database Password:** Choose a strong password and save it securely.
   - **Region:** Choose the region closest to your primary user base (e.g., *South Asia (Mumbai)* for Indian exporters).

---

## 2. Environment Variables Configuration

Copy `.env.example` to `.env.local` if you haven't already:

```bash
cp .env.example .env.local
```

Retrieve your Supabase API credentials from **Project Settings -> API** in the Supabase Dashboard:

1. **Project URL:**
   - Put into `NEXT_PUBLIC_SUPABASE_URL`
2. **Project API keys -> `anon` / `public`:**
   - Put into `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Project API keys -> `service_role` (secret):**
   - Put into `SUPABASE_SERVICE_ROLE_KEY` (Keep server-side only; never expose to browser!)

Your `.env.local` Supabase section will look like:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

# SUPABASE CONFIGURATION
NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 3. Database Migrations Execution

All database structures, Row Level Security (RLS) policies, and storage configurations are versioned in `supabase/migrations/`.

Run these migrations in order using either the **Supabase SQL Editor** or the **Supabase CLI**.

### Method A: Via Supabase Dashboard SQL Editor (Quickest)

1. Open your Supabase Dashboard and click **SQL Editor** on the left menu.
2. Click **New query**.
3. Copy and execute each file in order:

#### Step 1: Execute Table Schema & Functions
- Open `supabase/migrations/20261121000001_initial_schema.sql`
- Paste into SQL Editor and click **Run**.
- *This creates all 45 tables (profiles, organizations, buyers, products, quotations, invoices, shipments, analytics, etc.), triggers, indexes, and automated document sequence generators.*

#### Step 2: Execute Row Level Security (RLS)
- Open `supabase/migrations/20261121000002_row_level_security.sql`
- Paste into SQL Editor and click **Run**.
- *This enforces tenant isolation: users can only view and modify documents and data belonging to their respective organizations, while preserving secure public link sharing for quotations.*

#### Step 3: Execute Storage Buckets & Policies
- Open `supabase/migrations/20261121000003_storage_buckets.sql`
- Paste into SQL Editor and click **Run**.
- *This provisions 7 storage buckets and applies access policies.*

---

### Method B: Via Supabase CLI (Optional)

```bash
# Link to your Supabase project
npx supabase link --project-ref your-project-ref

# Push the migrations
npx supabase db push
```

---

## 4. Storage Buckets Verification

After executing the migrations, verify that the following 7 buckets exist under **Storage** in the Supabase Dashboard:

| Bucket Name | Privacy | Allowed MIME Types | Max Size | Description |
| :--- | :--- | :--- | :--- | :--- |
| `company-logos` | **Public** | PNG, JPEG, SVG, WebP | 5 MB | Exporter company logos for document letterheads |
| `company-assets` | **Public** | PNG, JPEG, SVG, WebP | 10 MB | General exporter company assets & marketing collateral |
| `product-images` | **Public** | PNG, JPEG, WebP | 10 MB | Export product photos & catalog thumbnails |
| `document-pdfs` | **Private** | PDF | 20 MB | Generated export documents (Quotations, Invoices, Packing Lists) |
| `document-attachments` | **Private** | PDF, DOC, XLS, Images | 30 MB | Supporting shipment files, customs declarations, lab certificates |
| `signatures` | **Private** | PNG, JPEG, SVG | 5 MB | Authorized signatory digital signatures |
| `stamps` | **Private** | PNG, JPEG, SVG | 5 MB | Authorized company seals / customs stamps |

---

## 5. Supabase Authentication Setup

In the Supabase Dashboard, go to **Authentication -> URL Configuration**:

1. **Site URL:** Set to `http://localhost:3000` (or your production Vercel URL).
2. **Redirect URLs:** Add:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/dashboard`
   - `https://your-domain.vercel.app/auth/callback`
   - `https://your-domain.vercel.app/dashboard`

Under **Authentication -> Providers**:
- Ensure **Email** is enabled.
- (Optional for development) You can disable "Confirm email" during initial local testing to sign in immediately after registration.

---

## 6. Super Admin Bootstrap

To elevate your first user to **Super Admin**:

1. Register an account through `/register` or `/login`.
2. In Supabase Dashboard, go to **Table Editor -> profiles**.
3. Locate your user record and update `role` from `'exporter'` to `'super_admin'`.
4. You now have full access to `/admin` and privileged platform management tools!

---

## 7. Zero-Config Local Development Fallback

ExportFlow contains an automated dual-mode repository:
- When `NEXT_PUBLIC_SUPABASE_URL` is empty or during local onboarding before credentials are provided, the system seamlessly operates with zero configuration using the encrypted file-backed persistent database (`.data/exportflow_db.json`).
- As soon as your Supabase credentials are added to `.env.local`, the application transitions to Supabase PostgreSQL, Authentication, and Storage.

---

## 8. Verification Checklist

- [ ] All 45 tables present in Table Editor.
- [ ] RLS is enabled on all tables (look for the green shield icon next to each table).
- [ ] 7 storage buckets created with appropriate public/private badges.
- [ ] Next.js app builds cleanly (`npm run build`).
- [ ] Login, registration, document creation, and PDF downloads operate smoothly.
