export const APP_NAME = 'ExportFlow';
export const BRAND_NAME = 'BENZWELL';
export const FULL_BRAND = 'ExportFlow by BENZWELL';
export const TAGLINE = 'Simplify Your Export Business.';

export const INCOTERMS_2020 = [
  { code: 'EXW', name: 'Ex Works', description: 'Seller delivers when goods are made available at seller premises.' },
  { code: 'FCA', name: 'Free Carrier', description: 'Seller delivers to carrier nominated by buyer at named place.' },
  { code: 'CPT', name: 'Carriage Paid To', description: 'Seller pays carriage to named destination.' },
  { code: 'CIP', name: 'Carriage and Insurance Paid To', description: 'Seller pays carriage and maximum insurance to named destination.' },
  { code: 'DAP', name: 'Delivered at Place', description: 'Seller delivers goods ready for unloading at named place.' },
  { code: 'DPU', name: 'Delivered at Place Unloaded', description: 'Seller delivers and unloads goods at named destination.' },
  { code: 'DDP', name: 'Delivered Duty Paid', description: 'Seller delivers cleared for import, bearing all risks and costs.' },
  { code: 'FAS', name: 'Free Alongside Ship', description: 'Seller delivers goods placed alongside vessel at named port of shipment.' },
  { code: 'FOB', name: 'Free on Board', description: 'Seller delivers goods on board vessel nominated by buyer at named port.' },
  { code: 'CFR', name: 'Cost and Freight', description: 'Seller pays costs and freight to bring goods to named port of destination.' },
  { code: 'CIF', name: 'Cost, Insurance and Freight', description: 'Seller pays costs, minimum insurance, and freight to named destination port.' },
] as const;

export const EXPORT_UNITS = [
  { code: 'PCS', name: 'Pieces' },
  { code: 'KG', name: 'Kilograms' },
  { code: 'MT', name: 'Metric Tons' },
  { code: 'GM', name: 'Grams' },
  { code: 'BOX', name: 'Boxes' },
  { code: 'CTN', name: 'Cartons' },
  { code: 'BAG', name: 'Bags' },
  { code: 'LTR', name: 'Litres' },
  { code: 'SET', name: 'Sets' },
  { code: 'ROL', name: 'Rolls' },
  { code: 'MTR', name: 'Meters' },
  { code: 'PRS', name: 'Pairs' },
  { code: 'DRM', name: 'Drums' },
  { code: 'PLT', name: 'Pallets' },
  { code: 'CTR', name: 'Containers' },
] as const;

export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rateToUSD: 1.0 },
  { code: 'EUR', symbol: '€', name: 'Euro', rateToUSD: 1.08 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateToUSD: 0.012 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rateToUSD: 1.28 },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', rateToUSD: 0.272 },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal', rateToUSD: 0.267 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rateToUSD: 0.76 },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', rateToUSD: 0.0083 },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', rateToUSD: 0.000039 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateToUSD: 0.0065 },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rateToUSD: 0.72 },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', rateToUSD: 0.65 },
] as const;

export const DOCUMENT_TYPES = {
  QUOTATION: 'quotation',
  PROFORMA_INVOICE: 'proforma_invoice',
  COMMERCIAL_INVOICE: 'commercial_invoice',
  PACKING_LIST: 'packing_list',
  PURCHASE_ORDER: 'purchase_order',
  SALES_ORDER: 'sales_order',
  DELIVERY_NOTE: 'delivery_note',
  DEBIT_NOTE: 'debit_note',
  CREDIT_NOTE: 'credit_note',
  SHIPPING_INSTRUCTIONS: 'shipping_instructions',
  CERTIFICATE_OF_ORIGIN: 'certificate_of_origin',
} as const;

export const DOCUMENT_TEMPLATES = [
  { id: 'classic-corporate', name: 'Classic Corporate', description: 'Clean, structured corporate layout with distinguished header and formal borders.' },
  { id: 'modern-minimal', name: 'Modern Minimal', description: 'Sleek, minimalist aesthetic focusing on clarity, whitespace, and sharp typography.' },
  { id: 'premium-international', name: 'Premium International', description: 'Executive dark navy styling with Incoterms 2020 banner and comprehensive trade specifications.' },
  { id: 'international-trade', name: 'International Trade', description: 'Standard global customs & trade layout with prominent Incoterms, ports, and vessel details.' },
  { id: 'compact-business', name: 'Compact Business', description: 'Space-efficient format optimized for high-item invoices and packing listings.' },
] as const;

export const BUYER_STATUSES = [
  { id: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
  { id: 'contacted', label: 'Contacted', color: 'bg-purple-100 text-purple-800' },
  { id: 'interested', label: 'Interested', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'negotiating', label: 'Negotiating', color: 'bg-amber-100 text-amber-800' },
  { id: 'converted', label: 'Converted', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800' },
  { id: 'lost', label: 'Lost', color: 'bg-rose-100 text-rose-800' },
] as const;

export const SHIPMENT_STATUSES = [
  { id: 'preparing', label: 'Preparing', color: 'bg-slate-100 text-slate-800' },
  { id: 'ready_for_dispatch', label: 'Ready for Dispatch', color: 'bg-cyan-100 text-cyan-800' },
  { id: 'booked', label: 'Booked', color: 'bg-blue-100 text-blue-800' },
  { id: 'in_transit', label: 'In Transit', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'arrived', label: 'Arrived', color: 'bg-purple-100 text-purple-800' },
  { id: 'delivered', label: 'Delivered', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'delayed', label: 'Delayed', color: 'bg-amber-100 text-amber-800' },
  { id: 'cancelled', label: 'Cancelled', color: 'bg-rose-100 text-rose-800' },
] as const;

export const PAYMENT_STATUSES = [
  { id: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-800' },
  { id: 'partially_paid', label: 'Partially Paid', color: 'bg-blue-100 text-blue-800' },
  { id: 'paid', label: 'Paid', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'overdue', label: 'Overdue', color: 'bg-rose-100 text-rose-800' },
  { id: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-800' },
] as const;

export const CUSTOMER_NAVIGATION = [
  { name: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  {
    name: 'Document Studio',
    href: '/dashboard/documents',
    icon: 'FileText',
    children: [
      { name: 'All Documents', href: '/dashboard/documents' },
      { name: 'Quotations', href: '/dashboard/quotations' },
      { name: 'Proforma Invoices', href: '/dashboard/proforma-invoices' },
      { name: 'Commercial Invoices', href: '/dashboard/commercial-invoices' },
      { name: 'Packing Lists', href: '/dashboard/packing-lists' },
      { name: 'Purchase Orders', href: '/dashboard/purchase-orders' },
      { name: 'Sales Orders', href: '/dashboard/sales-orders' },
      { name: 'Delivery Notes', href: '/dashboard/delivery-notes' },
    ],
  },
  { name: 'Buyer CRM', href: '/dashboard/buyers', icon: 'Users' },
  {
    name: 'Catalog & Inventory',
    href: '/dashboard/products',
    icon: 'Package',
    children: [
      { name: 'Products', href: '/dashboard/products' },
      { name: 'Inventory', href: '/dashboard/inventory' },
    ],
  },
  { name: 'Calculators', href: '/dashboard/calculators', icon: 'Calculator' },
  { name: 'Documentation Center', href: '/dashboard/exports', icon: 'FileCheck' },
  { name: 'Shipment Tracker', href: '/dashboard/shipments', icon: 'Ship' },
  { name: 'Sales & Payments', href: '/dashboard/payments', icon: 'CreditCard' },
  { name: 'AI Export Assistant', href: '/dashboard/ai-assistant', icon: 'Sparkles' },
  { name: 'Reports & Analytics', href: '/dashboard/reports', icon: 'BarChart3' },
  { name: 'Team Management', href: '/dashboard/team', icon: 'UserCheck' },
  { name: 'Company Settings', href: '/dashboard/settings', icon: 'Settings' },
];

export const ADMIN_NAVIGATION = [
  { name: 'Overview', href: '/admin', icon: 'LayoutDashboard' },
  { name: 'Users', href: '/admin/users', icon: 'Users' },
  { name: 'Companies', href: '/admin/companies', icon: 'Building2' },
  { name: 'Documents Analytics', href: '/admin/documents', icon: 'FileText' },
  { name: 'Razorpay Gateway', href: '/admin/settings/payments/razorpay', icon: 'CreditCard' },
  { name: 'Platform Revenue', href: '/admin/revenue', icon: 'DollarSign' },
  { name: 'Platform Activity', href: '/admin/activity', icon: 'Activity' },
  { name: 'Contact Inquiries', href: '/admin/contact-inquiries', icon: 'Mail' },
  { name: 'Support Tickets', href: '/admin/support', icon: 'LifeBuoy' },
  { name: 'Announcements', href: '/admin/announcements', icon: 'Megaphone' },
  { name: 'System Health', href: '/admin/system', icon: 'Server' },
  { name: 'AI Engine & Providers', href: '/admin/settings/ai', icon: 'Sparkles' },
  { name: 'Integrations', href: '/admin/integrations', icon: 'Cpu' },
  { name: 'Audit Logs', href: '/admin/audit-logs', icon: 'ShieldAlert' },
  { name: 'Admin Settings', href: '/admin/settings', icon: 'Settings' },
];

// ================= CENTRALIZED OFFICIAL PRICING & PLAN CATALOG =================
export const PRICING_CATALOG = {
  free: {
    id: 'free',
    name: 'Free Plan',
    priceInr: 0,
    allowances: { quotations: 1, proformaInvoices: 0, commercialInvoices: 0, packingLists: 0 },
    features: [
      '1 Quotation',
      '1 Successful Initial PDF Issuance',
      'Basic Quotation Template',
      'Company Profile Management',
      'Buyer Directory & CRM',
      'Product Catalog',
      'Basic Export Calculations',
    ],
  },
  creditPacks: [
    {
      id: 'starter_pack',
      name: 'Starter Credit Pack',
      priceInr: 499,
      credits: { quotations: 2, proformaInvoices: 1, commercialInvoices: 0, packingLists: 0 },
      isLifetime: true,
      description: '2 Quotations + 1 Proforma Invoice',
      features: ['2 Quotations', '1 Proforma Invoice', 'Lifetime Validity', 'Never Expires'],
    },
    {
      id: 'business_pack',
      name: 'Business Credit Pack',
      priceInr: 999,
      credits: { quotations: 5, proformaInvoices: 3, commercialInvoices: 2, packingLists: 2 },
      isLifetime: true,
      popular: true,
      description: '5 Quotes + 3 PIs + 2 CIs + 2 Packing Lists',
      features: ['5 Quotations', '3 Proforma Invoices', '2 Commercial Invoices', '2 Packing Lists', 'Lifetime Validity'],
    },
    {
      id: 'professional_pack',
      name: 'Professional Credit Pack',
      priceInr: 1999,
      credits: { quotations: 15, proformaInvoices: 10, commercialInvoices: 10, packingLists: 10 },
      isLifetime: true,
      description: '15 Quotes + 10 PIs + 10 CIs + 10 Packing Lists',
      features: ['15 Quotations', '10 Proforma Invoices', '10 Commercial Invoices', '10 Packing Lists', 'Lifetime Validity', 'Priority PDF Generation'],
    },
  ],
  subscriptions: [
    {
      id: 'starter',
      name: 'Starter',
      monthlyPriceInr: 499,
      annualPriceInr: 4990,
      allowances: { quotations: 10, proformaInvoices: 5, commercialInvoices: 5, packingLists: 5 },
      features: [
        '10 Quotations per cycle',
        '5 Proforma Invoices',
        '5 Commercial Invoices',
        '5 Packing Lists',
        'Standard Templates',
        'Buyer CRM',
        'Basic AI Assistance',
      ],
    },
    {
      id: 'growth',
      name: 'Growth',
      monthlyPriceInr: 999,
      annualPriceInr: 9990,
      popular: true,
      trialEligible: true,
      allowances: { quotations: 30, proformaInvoices: 20, commercialInvoices: 20, packingLists: 20 },
      features: [
        '30 Quotations per cycle',
        '20 Proforma Invoices',
        '20 Commercial Invoices',
        '20 Packing Lists',
        'Premium International Templates',
        'AI Document Assistant (Natural Language)',
        '10 Smart Export Calculators',
        'Buyer Follow-ups & Notes',
        'Document Revision Snapshots',
        'Priority Support',
      ],
    },
    {
      id: 'business',
      name: 'Business',
      monthlyPriceInr: 2499,
      annualPriceInr: 24990,
      allowances: { quotations: 100, proformaInvoices: 75, commercialInvoices: 75, packingLists: 75 },
      features: [
        'Higher Configurable Document Allowances',
        'Multiple Team Members (Multi-user)',
        'Advanced Buyer CRM Pipeline',
        'Shipment & Vessel Tracking',
        'Advanced Multi-Provider AI Assistant',
        'Document Approval Workflows',
        'Platform Revenue & Analytics',
        'Custom Brand Kits',
        'Dedicated Support Manager',
      ],
    },
  ],
};
