export type UserRole = 'super_admin' | 'owner' | 'admin' | 'manager' | 'employee' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  currentOrgId?: string;
  avatarUrl?: string;
  status: 'active' | 'suspended' | 'disabled' | 'pending';
  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  country: string;
  businessType: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: UserRole;
  userEmail: string;
  userName: string;
  status: 'active' | 'invited' | 'disabled';
  joinedAt: string;
}

export interface CompanyProfile {
  id: string;
  organizationId: string;
  legalName: string;
  tradingName: string;
  logoUrl?: string;
  businessType: string;
  country: string;
  registeredAddress: string;
  city: string;
  state?: string;
  postalCode?: string;
  website?: string;
  gstin?: string;
  pan?: string;
  iec?: string;
  cin?: string;
  lutNumber?: string;
  taxRegistrationNumber?: string;
  primaryContactName: string;
  primaryContactPhone: string;
  primaryContactEmail: string;
  designation?: string;
  factoryAddress?: string;
  adCode?: string;
  rcmcDetails?: string;
  bankBeneficiaryName?: string;
  bankBranch?: string;
  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  swiftBic?: string;
  bankBranchAddress?: string;
  bankCurrency?: string;
  authorizedSignatureUrl?: string;
  companyStampUrl?: string;
  defaultCurrency: string;
  defaultPaymentTerms?: string;
  defaultIncoterms?: string;
  defaultValidityDays?: number;
  documentPrefixes?: {
    quotation?: string;
    proformaInvoice?: string;
    commercialInvoice?: string;
    packingList?: string;
    purchaseOrder?: string;
    salesOrder?: string;
  };
  preferredTemplate: string;
  updatedAt: string;
}

export type BuyerStatus = 'new' | 'contacted' | 'interested' | 'negotiating' | 'converted' | 'inactive' | 'lost';

export interface Buyer {
  id: string;
  organizationId: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  website?: string;
  country: string;
  city: string;
  billingAddress: string;
  shippingAddress: string;
  taxId?: string;
  buyerType?: string;
  industry?: string;
  status: BuyerStatus;
  notes?: string;
  tags?: string[];
  totalOrderValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  organizationId: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  specifications?: string;
  hsCode: string;
  countryOfOrigin: string;
  unit: string;
  defaultCurrency: string;
  purchaseCost: number;
  sellingPrice: number;
  moq: number;
  packagingDetails?: string;
  netWeight: number;
  grossWeight: number;
  length?: number;
  width?: number;
  height?: number;
  cbm?: number;
  stockQuantity: number;
  lowStockThreshold: number;
  imageUrl?: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface DocumentItem {
  id: string;
  productId?: string;
  itemNumber: number;
  productName: string;
  description: string;
  specifications?: string;
  category?: string;
  sku?: string;
  brand?: string;
  modelGrade?: string;
  countryOfOrigin?: string;
  hsCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountPercentage: number;
  discountAmount: number;
  taxRate: number;
  cgstRate?: number;
  cgstAmount?: number;
  sgstRate?: number;
  sgstAmount?: number;
  igstRate?: number;
  igstAmount?: number;
  taxAmount: number;
  lineTotal: number;
  packageCount?: number;
  packageType?: string;
  netWeight?: number;
  grossWeight?: number;
  cbm?: number;
  dimensions?: string;
  productImage?: string;
  notes?: string;
}

export type DocumentType =
  | 'quotation'
  | 'proforma_invoice'
  | 'commercial_invoice'
  | 'packing_list'
  | 'purchase_order'
  | 'sales_order'
  | 'delivery_note';

export type DocumentStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'revised' | 'converted' | 'cancelled';

export interface BaseDocument {
  id: string;
  organizationId: string;
  type: DocumentType;
  documentNumber: string;
  referenceNumber?: string;
  date: string;
  validityDate?: string;
  buyerId?: string;
  buyerCompany: string;
  buyerContactPerson: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerCountry: string;
  buyerBillingAddress: string;
  buyerShippingAddress: string;
  buyerTaxId?: string;
  buyerDesignation?: string;
  buyerState?: string;
  buyerCity?: string;
  buyerPostalCode?: string;
  consigneeName?: string;
  consigneeAddress?: string;
  notifyParty?: string;
  shipToAddress?: string;
  sellerDetails: Partial<CompanyProfile>;
  showBankDetails?: boolean;
  showPanGstinIec?: boolean;
  showCompanyStamp?: boolean;
  showSignature?: boolean;
  inquiryReference?: string;
  inquiryDate?: string;
  buyerPoReference?: string;
  revisionNumber?: number;
  preparedBy?: string;
  salesperson?: string;
  internalReference?: string;
  currency: string;
  incoterm: string;
  originPort?: string;
  destinationPort?: string;
  countryOfOrigin?: string;
  countryOfFinalDestination?: string;
  placeOfDelivery?: string;
  finalDestination?: string;
  modeOfTransport?: 'Sea' | 'Air' | 'Road' | 'Rail' | 'Courier';
  incotermRule?: string;
  incotermVersion?: string;
  namedPlace?: string;
  shipmentPeriod?: string;
  estimatedDispatchDate?: string;
  partialShipment?: boolean;
  transshipment?: boolean;
  packingType?: string;
  marksAndNumbers?: string;
  shippingInstructions?: string;
  exportPriceBasis?: string;
  exchangeRate?: number;
  items: DocumentItem[];
  subtotal: number;
  productDiscountsTotal?: number;
  overallDiscountPercentage?: number;
  overallDiscountAmount?: number;
  packingCharges?: number;
  inlandTransportCharges?: number;
  customsClearanceCharges?: number;
  documentationCharges?: number;
  portHandlingCharges?: number;
  freightCharges?: number;
  insuranceCharges?: number;
  inspectionCharges?: number;
  otherCharges?: number;
  discountTotal: number;
  taxableAmount: number;
  taxType: 'domestic_gst' | 'zero_rated_export' | 'lut_bond' | 'igst_export' | 'exempt';
  taxScheme?: string;
  gstTreatment?: 'zero_rated_lut' | 'igst_paid' | 'domestic_gst' | 'exempt' | 'other';
  gstRate?: number;
  lutBondNumber?: string;
  taxNotes?: string;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  taxTotal: number;
  grandTotal: number;
  amountInWords: string;
  paymentTerms: string;
  paymentMethod?: string;
  advancePercentage?: number;
  advanceAmount?: number;
  balancePercentage?: number;
  balanceAmount?: number;
  paymentDueDate?: string;
  lcDetails?: string;
  ttDetails?: string;
  paymentAgainstBl?: boolean;
  paymentAgainstDocuments?: boolean;
  bankChargesResponsibility?: 'buyer' | 'seller' | 'shared';
  latePaymentConditions?: string;
  otherPaymentTerms?: string;
  deliveryTime?: string;
  deliverySchedule?: string;
  shipmentConditions?: string;
  packagingConditions?: string;
  qualityStandards?: string;
  inspectionRequirements?: string;
  sampleApproval?: string;
  certificateRequirements?: string;
  insuranceConditions?: string;
  forceMajeure?: string;
  claimsAndDisputes?: string;
  arbitrationJurisdiction?: string;
  warrantyTermsText?: string;
  quotationValidityTerms?: string;
  cancellationConditions?: string;
  exporterDeclaration?: string;
  authorizedSignatoryName?: string;
  signatoryDesignation?: string;
  authorizedSignatureUrl?: string;
  companyStampUrl?: string;
  showBuyerAcceptance?: boolean;
  buyerAcceptanceSignatureUrl?: string;
  buyerAcceptedByName?: string;
  buyerAcceptedDate?: string;
  acceptanceRemarks?: string;
  freightTerms?: string;
  packagingDetails?: string;
  insuranceTerms?: string;
  warrantyTerms?: string;
  bankDetails?: string;
  notes?: string;
  termsAndConditions?: string;
  templateId: string;
  brandingSettings?: {
    logoPosition?: 'left' | 'center' | 'right';
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: 'inter' | 'helvetica' | 'merriweather' | 'playfair';
    tableDesign?: 'bordered' | 'striped' | 'minimal' | 'compact';
    visibleSections?: Record<string, boolean>;
  };
  isLocked?: boolean;
  lockedAt?: string;
  lockedBy?: string;
  status: DocumentStatus;
  shareToken?: string;
  shareTokenExpiresAt?: string;
  convertedFromId?: string;
  convertedFromType?: DocumentType;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type Quotation = BaseDocument;
export type ProformaInvoice = BaseDocument;
export type CommercialInvoice = BaseDocument & {
  piReference?: string;
  poReference?: string;
  vesselFlightNo?: string;
  containerNo?: string;
  isDraft: boolean;
};

export type PackingList = BaseDocument & {
  invoiceReference?: string;
  totalCartons: number;
  totalUnits: number;
  totalNetWeight: number;
  totalGrossWeight: number;
  totalCbm: number;
};

export type ShipmentStatus =
  | 'preparing'
  | 'ready_for_dispatch'
  | 'booked'
  | 'in_transit'
  | 'arrived'
  | 'delivered'
  | 'delayed'
  | 'cancelled';

export interface Shipment {
  id: string;
  organizationId: string;
  shipmentReference: string;
  buyerId?: string;
  buyerCompany: string;
  orderReference?: string;
  invoiceReference?: string;
  originPort: string;
  destinationPort: string;
  shippingLine: string;
  vesselName: string;
  containerNumber: string;
  containerType: '20ft' | '40ft' | '40ft_hc' | 'lcl' | 'air';
  etd: string;
  eta: string;
  actualDeparture?: string;
  actualArrival?: string;
  status: ShipmentStatus;
  freightDetails?: string;
  notes?: string;
  updates: Array<{
    id: string;
    date: string;
    status: ShipmentStatus;
    location: string;
    comment: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  organizationId: string;
  buyerId?: string;
  buyerCompany: string;
  invoiceReference?: string;
  amount: number;
  currency: string;
  paymentDate: string;
  paymentMethod: 'wire_transfer' | 'lc' | 'advance' | 'card' | 'cheque' | 'other';
  transactionReference: string;
  notes?: string;
  status: 'pending' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
  createdAt: string;
}

export interface Notification {
  id: string;
  organizationId: string;
  userId?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  organizationId: string;
  userId: string;
  userName: string;
  userEmail: string;
  companyName: string;
  category: 'bug_report' | 'feature_request' | 'account_issue' | 'general_inquiry';
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_for_customer' | 'resolved' | 'closed';
  replies: Array<{
    id: string;
    authorName: string;
    authorRole: 'admin' | 'user';
    message: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'feature' | 'maintenance' | 'update' | 'notice';
  active: boolean;
  targetAudience: 'all' | 'specific_country';
  publishedAt: string;
  createdAt: string;
}

export interface PlatformRevenueRecord {
  id: string;
  reference: string;
  customerName: string;
  category: 'custom_development' | 'setup_services' | 'consulting' | 'custom_integrations' | 'other';
  amount: number;
  currency: string;
  dateReceived: string;
  paymentMethod: string;
  transactionReference: string;
  description: string;
  status: 'completed' | 'pending' | 'refunded';
  createdAt: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetEntity: string;
  targetId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  timestamp: string;
}

export interface PlatformActivity {
  id: string;
  organizationId?: string;
  userId?: string;
  userName?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

// ================= AI PROVIDER & DOCUMENT ASSISTANT TYPES =================
export interface OpenRouterModelInfo {
  id: string;
  name: string;
  description?: string;
  contextLength?: number;
  pricing: {
    prompt: string | number;
    completion: string | number;
    request?: string | number;
    image?: string | number;
  };
  architecture?: {
    modality?: string;
    tokenizer?: string;
    instruct_type?: string;
  };
  topProvider?: {
    context_length?: number;
    max_completion_tokens?: number;
    is_moderated?: boolean;
  };
  isFree: boolean;
  isChatCapable: boolean;
  lastVerified?: string;
}

export interface AiProviderConfig {
  id: string;
  isEnabled: boolean;
  primaryProvider: 'openrouter' | 'groq' | 'gemini';
  openrouterApiKey?: string;
  openrouterModel: string;
  openrouterModelMode: 'auto_free' | 'specific_free';
  openrouterAvailableModels?: OpenRouterModelInfo[];
  openrouterLastModelRefresh?: string;
  openrouterLastSuccessfulConnection?: string;
  openrouterIsEnabled?: boolean;
  backupProvider1: 'groq' | 'gemini' | 'openrouter';
  backupProvider2: 'gemini' | 'groq' | 'openrouter';
  backupProvider?: 'gemini' | 'groq' | 'openrouter';
  groqApiKey?: string;
  groqModel: string;
  groqIsEnabled?: boolean;
  geminiApiKey?: string;
  geminiModel: string;
  geminiIsEnabled?: boolean;
  requestTimeout: number;
  maxRetries: number;
  maxInputLength: number;
  dailyLimit: number;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'disabled';
  lastSuccessfulRequest?: string;
  lastError?: string;
  updatedAt: string;
}

export interface AiUsageLog {
  id: string;
  organizationId?: string;
  userId?: string;
  quotationId?: string;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
  status: 'success' | 'fallback_success' | 'failed';
  errorMessage?: string;
  userIntent?: string;
  createdAt: string;
}

export interface AiQuotationChangeProposal {
  summary: string;
  explanation: string;
  changes: Partial<BaseDocument>;
  highlightedCommercialChanges?: {
    field: string;
    oldValue: any;
    newValue: any;
    reason: string;
  }[];
  clarificationNeeded?: string;
}

export interface QuotationRevision {
  id: string;
  quotationId: string;
  organizationId: string;
  revisionNumber: number;
  documentSnapshot: BaseDocument;
  changeSummary?: string;
  createdBy?: string;
  createdAt: string;
}

// ================= RAZORPAY & PAYMENTS TYPES =================
export interface RazorpayConfig {
  id: string;
  isEnabled: boolean;
  mode: 'test' | 'live';
  testKeyId: string;
  testKeySecret?: string;
  testWebhookSecret?: string;
  liveKeyId: string;
  liveKeySecret?: string;
  liveWebhookSecret?: string;
  merchantDisplayName: string;
  merchantSupportEmail: string;
  status: 'active' | 'inactive' | 'unconfigured';
  lastSuccessfulConnection?: string;
  lastConfigUpdate: string;
  webhookStatus: 'verified' | 'unverified' | 'error';
  lastReceivedWebhook?: string;
  lastSuccessfulWebhook?: string;
  failedWebhookCount: number;
}

export interface RazorpayWebhookEvent {
  id: string;
  eventType: string;
  payload: Record<string, any>;
  signature: string;
  status: 'processed' | 'failed' | 'ignored';
  errorMessage?: string;
  receivedAt: string;
}

export interface RazorpayPaymentLog {
  id: string;
  organizationId: string;
  userId: string;
  orderId: string;
  paymentId?: string;
  amount: number; // in INR
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';
  itemType: 'credit_pack' | 'subscription';
  itemId: string;
  description: string;
  creditsAdded?: DocumentAllowance;
  errorDetails?: string;
  createdAt: string;
  updatedAt: string;
}

// ================= WALLET & HYBRID PRICING TYPES =================
export interface DocumentAllowance {
  quotations: number;
  proformaInvoices: number;
  commercialInvoices: number;
  packingLists: number;
}

export interface OrganizationWallet {
  id: string;
  organizationId: string;
  lifetimeCredits: DocumentAllowance;
  subscriptionCredits: DocumentAllowance;
  usedCounts: DocumentAllowance;
  updatedAt: string;
}

export interface OrganizationSubscription {
  id: string;
  organizationId: string;
  planId: 'free' | 'starter' | 'growth' | 'business';
  status: 'active' | 'trial' | 'expired' | 'cancelled';
  billingCycle?: 'monthly' | 'annual';
  trialStartDate?: string;
  trialEndDate?: string;
  hasUsedTrial: boolean;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  razorpaySubscriptionId?: string;
  updatedAt: string;
}

// ================= CONTACT INQUIRY TYPES =================
export interface ContactInquiry {
  id: string;
  inquiryNumber: string;
  name: string;
  companyName?: string;
  email: string;
  phone?: string;
  subject: string;
  category: 'general' | 'sales' | 'billing' | 'technical' | 'ai' | 'partnership' | 'other';
  message: string;
  consentPrivacy: boolean;
  status: 'new' | 'read' | 'in_progress' | 'waiting_for_customer' | 'resolved' | 'closed' | 'archived';
  adminNotes?: string;
  assignedAdmin?: string;
  createdAt: string;
  updatedAt: string;
}

// ================= THEME TYPES =================
export type ThemeMode = 'light' | 'dark' | 'system';
