# ExportFlow by BENZWELL

> **Tagline:** "Simplify Your Export Business."  
> **Brand:** BENZWELL  
> **Initial Release:** Free Launch Edition (All Features Free)

ExportFlow by BENZWELL is an all-in-one, production-grade business management platform designed specifically for exporters, merchant exporters, manufacturers, and international trading enterprises.

The platform eliminates the need to use Canva, Excel, Word, and scattered spreadsheets for preparing multi-currency Export Quotations, Proforma Invoices, Commercial Invoices, Packing Lists, Incoterms export calculations, buyer relationship management (CRM), warehouse inventory, and container shipment tracking.

---

## 🌟 Key Capabilities

### 1. Document Studio & Multi-Template PDF Engine
- **Quotation Builder:** Auto-retrieves company regulatory registrations (GSTIN, IEC, PAN, CIN, LUT), buyer billing/shipping addresses, and catalog items. Supports decimal-safe monetary arithmetic, multi-currency pricing, and Incoterms 2020.
- **Proforma Invoice (PI) Builder:** Generates formal binding PIs for overseas buyer wire advances or Letter of Credit (L/C) opening.
- **Commercial Invoice (CI) Generator:** Draft verification safeguards, consignee/notify party routing, HS codes, and container details.
- **Packing List (PL) Generator:** Automatic carton count, total units, net weight, gross weight, and CBM volumetric calculations.
- **5 Professional Design Templates:**
  1. *Classic Corporate*
  2. *Modern Minimal*
  3. *International Trade* (Customs boxed grid layout)
  4. *Premium Professional*
  5. *Compact Business*
- **1-Click Document Conversion Engine:** Converts Quotation → Accepted → Proforma Invoice → Sales Order → Commercial Invoice → Packing List → Shipment while maintaining relationships and full revision history.
- **Public Quotation Acceptance Portal (`/quote/[token]`):** Shareable, cryptographically signed token URLs allowing buyers to review, download PDF, accept, or request revisions.

### 2. Smart Export Calculators
- **GST & LUT Calculator:** Intra-state (CGST+SGST), Inter-state (IGST), inclusive/exclusive, and Zero-Rated Export under LUT/Bond (0% GST).
- **Export Pricing Calculator:** Calculates EXW, FOB, CFR, and CIF prices from unit purchase costs, export packaging, inland transport, port CFS handling, ocean freight, marine insurance, and exporter profit margin.
- **CBM & Container Loading Estimator:** Computes cubic meters (m³) and utilization for 20' GP, 40' GP, and 40' High-Cube containers.
- **Weight Calculator:** Net weight, carton tare weight, and total gross consignment weight.
- **Profit Margin & Markup Calculator:** Accurately distinguishes margin % from markup %.
- **Multi-Currency Converter:** Real-time exchange rate engine supporting USD, EUR, INR, GBP, AED, SAR, SGD, BDT, VND, JPY, CAD, and AUD with custom quotation rate overrides.

### 3. Exporter CRM & Catalog
- **Buyer CRM:** Complete contact database, RFQs, tax IDs, shipping destinations, status pipeline, and CSV import/export.
- **Product Catalog & Master SKUs:** Technical specifications, HS/HSN codes, unit costs, export selling prices, MOQs, packaging details, and low-stock alerts.
- **Physical Inventory Ledger:** Stock delta adjustments with audit reason logging.

### 4. Shipment & Sales Management
- **Ocean Container Tracker:** Carrier bookings, vessel/voyage, container numbers, ETD, ETA, and chronological milestone updates.
- **Sales & Payment Ledger:** Inward bank remittance (TT/Wire, LC) records and invoice reconciliation.
- **Documentation Center:** Statutory pre-shipment, customs clearance, and post-shipment compliance checklists.

### 5. AI Export Trade Assistant
- Powered by OpenRouter with configurable model selection (`OPENROUTER_MODEL`).
- Scoped strictly to the exporter's isolated catalog, buyer directory, and active quotations.
- Drafts formal buyer correspondence, negotiation messages, quotation cover emails, and explains Incoterms 2020 responsibilities.

### 6. BENZWELL Super Admin Control Center (`/admin`)
- **Server-Side Protected:** Zero access for regular customer accounts.
- **Platform Analytics:** Real platform-wide statistics from database records.
- **User & Company Management:** Suspend, reactivate, or audit tenant organizations.
- **Separation of Revenue:** Strict separation between BENZWELL's actual platform income (consulting, custom development, setup services) and customer export trade volumes.
- **System Health Center:** Real-time connectivity checks for Appwrite, Database, Storage, ImageKit, Resend, and AI engines.
- **Admin Audit Logs:** Immutable audit trail of administrative actions.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 15+ (App Router, Server Actions, Route Handlers)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS with Custom International Trade Design System
- **Icons:** Lucide React
- **Forms & Validation:** React Hook Form & Zod
- **Backend / BaaS:** Appwrite Database, Appwrite Authentication, Appwrite Storage
- **Media CDN:** ImageKit
- **Transactional Email:** Resend
- **AI Engine:** OpenRouter API
- **Decimal Math:** High-precision monetary utilities (`src/lib/utils.ts`)

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/benzwell/exportflow.git
cd exportflow
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your credentials:
```env
APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Super Admin Bootstrap Credentials
ADMIN_BOOTSTRAP_EMAIL=admin@benzwell.com
ADMIN_BOOTSTRAP_SECRET=BenzwellAdmin2026!SecureKey

# Appwrite Cloud (Optional for local development; automatic persistent storage fallback included)
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key

# ImageKit (Optional)
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=your_endpoint

# Resend Email (Optional)
RESEND_API_KEY=your_resend_api_key

# OpenRouter AI (Optional)
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct
```

### 3. Run Unit Tests
```bash
npm test
```
Tests decimal precision, GST & LUT calculations, Incoterms pricing, CBM calculations, number-to-words generator, and document numbering.

### 4. Setup Appwrite Database Collections (Optional)
To programmatically create all 45 collections in your Appwrite instance:
```bash
npm run setup:appwrite
```

### 5. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Default Credentials

- **Super Admin Panel (`/admin`):**
  - Email: `admin@benzwell.com`
  - Password: `BenzwellAdmin2026!SecureKey`
- **Customer Registration (`/register`):**
  - Register any company name and email to access your isolated workspace. All features are 100% free.

---

## 🚢 Deployment (Vercel)

1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Set the environment variables in the Vercel Dashboard under **Settings → Environment Variables**.
4. Deploy! Next.js App Router will build and optimize all routes automatically.

---

## 📄 License & Attribution

Product Name: **ExportFlow**  
Brand: **BENZWELL**  
Tagline: **"Simplify Your Export Business."**  
All rights reserved © 2026 BENZWELL.
