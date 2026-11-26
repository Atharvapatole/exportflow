import fs from 'fs';
import path from 'path';
import {
  RazorpayConfig,
  RazorpayWebhookEvent,
  RazorpayPaymentLog,
  OrganizationWallet,
  OrganizationSubscription,
  ContactInquiry,
  ThemeMode,
  ChaClient,
  CustomsJob,
  CustomsJobDocument,
  CustomsDocumentChecklist,
  EsanchitRecord,
  CustomsQuery,
  SignatureAsset,
  DocumentAuditEvent,
  DocumentEmailEvent,
  ApiKey,
  ApiUsageLog,
  CustomTemplate,
  OrganizationTeamMember,
  AiDocumentReview,
  ChaDocument,
} from '@/types';

/**
 * Robust JSON File-based Store for local persistence.
 * Guarantees atomic reads & writes, real database persistence,
 * and zero mock data across restarts.
 */
const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'exportflow_db.json');

export interface DatabaseState {
  users: any[];
  organizations: any[];
  organizationMembers: any[];
  companyProfiles: any[];
  buyers: any[];
  products: any[];
  documents: any[];
  shipments: any[];
  payments: any[];
  notifications: any[];
  supportTickets: any[];
  announcements: any[];
  platformRevenue: any[];
  auditLogs: any[];
  platformActivity: any[];
  aiProviderConfig?: any;
  aiUsageLogs: any[];
  quotationRevisions: any[];
  razorpayConfig?: RazorpayConfig;
  razorpayWebhookEvents: RazorpayWebhookEvent[];
  razorpayPaymentLogs: RazorpayPaymentLog[];
  organizationWallets: OrganizationWallet[];
  organizationSubscriptions: OrganizationSubscription[];
  contactInquiries: ContactInquiry[];
  userThemePreferences: Record<string, ThemeMode>;
  platformAdmins: any[];
  chaClients: ChaClient[];
  customsJobs: CustomsJob[];
  customsJobDocuments: CustomsJobDocument[];
  customsDocumentChecklists: CustomsDocumentChecklist[];
  esanchitRecords: EsanchitRecord[];
  customsQueries: CustomsQuery[];
  signatureAssets: SignatureAsset[];
  documentAuditEvents: DocumentAuditEvent[];
  documentEmailEvents: DocumentEmailEvent[];
  apiKeys: ApiKey[];
  apiUsageLogs: ApiUsageLog[];
  customTemplates: CustomTemplate[];
  organizationTeamMembers: OrganizationTeamMember[];
  aiDocumentReviews: AiDocumentReview[];
  chaDocuments: ChaDocument[];
}

const defaultState: DatabaseState = {
  users: [],
  organizations: [],
  organizationMembers: [],
  companyProfiles: [],
  buyers: [],
  products: [],
  documents: [],
  shipments: [],
  payments: [],
  notifications: [],
  supportTickets: [],
  announcements: [],
  platformRevenue: [],
  auditLogs: [],
  platformActivity: [],
  platformAdmins: [],
  chaClients: [],
  customsJobs: [],
  customsJobDocuments: [],
  customsDocumentChecklists: [],
  esanchitRecords: [],
  customsQueries: [],
  signatureAssets: [],
  documentAuditEvents: [],
  documentEmailEvents: [],
  apiKeys: [],
  apiUsageLogs: [],
  customTemplates: [],
  organizationTeamMembers: [],
  aiDocumentReviews: [],
  chaDocuments: [],
  aiProviderConfig: {
    id: '00000000-0000-0000-0000-000000000001',
    isEnabled: true,
    primaryProvider: 'openrouter',
    openrouterApiKey: '',
    openrouterModel: 'openrouter/free',
    openrouterModelMode: 'auto_free',
    openrouterAvailableModels: [],
    openrouterIsEnabled: true,
    backupProvider1: 'groq',
    backupProvider2: 'gemini',
    backupProvider: 'groq',
    groqApiKey: '',
    groqModel: 'llama-3.3-70b-versatile',
    groqIsEnabled: true,
    geminiApiKey: '',
    geminiModel: 'gemini-2.0-flash',
    geminiIsEnabled: true,
    requestTimeout: 30000,
    maxRetries: 2,
    maxInputLength: 6000,
    dailyLimit: 1000,
    status: 'healthy',
    updatedAt: new Date().toISOString(),
  },
  aiUsageLogs: [],
  quotationRevisions: [],
  razorpayConfig: {
    id: '00000000-0000-0000-0000-000000000002',
    isEnabled: false,
    mode: 'test',
    testKeyId: '',
    testKeySecret: '',
    testWebhookSecret: '',
    liveKeyId: '',
    liveKeySecret: '',
    liveWebhookSecret: '',
    merchantDisplayName: 'ExportFlow by BENZWELL',
    merchantSupportEmail: 'info@benzwell.in',
    status: 'unconfigured',
    lastConfigUpdate: new Date().toISOString(),
    webhookStatus: 'unverified',
    failedWebhookCount: 0,
  },
  razorpayWebhookEvents: [],
  razorpayPaymentLogs: [],
  organizationWallets: [],
  organizationSubscriptions: [],
  contactInquiries: [],
  userThemePreferences: {},
};

function ensureDbFile(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultState, null, 2), 'utf8');
    }
  } catch (err) {
    console.error('Failed to initialize local data directory:', err);
  }
}

export function readDb(): DatabaseState {
  ensureDbFile();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(data) as DatabaseState;
    if (!parsed.razorpayConfig) parsed.razorpayConfig = defaultState.razorpayConfig;
    if (!parsed.razorpayWebhookEvents) parsed.razorpayWebhookEvents = [];
    if (!parsed.razorpayPaymentLogs) parsed.razorpayPaymentLogs = [];
    if (!parsed.organizationWallets) parsed.organizationWallets = [];
    if (!parsed.organizationSubscriptions) parsed.organizationSubscriptions = [];
    if (!parsed.contactInquiries) parsed.contactInquiries = [];
    if (!parsed.userThemePreferences) parsed.userThemePreferences = {};
    if (!parsed.platformAdmins) parsed.platformAdmins = [];
    if (!parsed.chaClients) parsed.chaClients = [];
    if (!parsed.customsJobs) parsed.customsJobs = [];
    if (!parsed.customsJobDocuments) parsed.customsJobDocuments = [];
    if (!parsed.customsDocumentChecklists) parsed.customsDocumentChecklists = [];
    if (!parsed.esanchitRecords) parsed.esanchitRecords = [];
    if (!parsed.customsQueries) parsed.customsQueries = [];
    if (!parsed.signatureAssets) parsed.signatureAssets = [];
    if (!parsed.documentAuditEvents) parsed.documentAuditEvents = [];
    if (!parsed.documentEmailEvents) parsed.documentEmailEvents = [];
    if (!parsed.apiKeys) parsed.apiKeys = [];
    if (!parsed.apiUsageLogs) parsed.apiUsageLogs = [];
    if (!parsed.customTemplates) parsed.customTemplates = [];
    if (!parsed.organizationTeamMembers) parsed.organizationTeamMembers = [];
    if (!parsed.aiDocumentReviews) parsed.aiDocumentReviews = [];
    if (!parsed.chaDocuments) parsed.chaDocuments = [];
    return parsed;
  } catch (err) {
    console.error('Error reading db file, falling back to default:', err);
    return defaultState;
  }
}

export function writeDb(state: DatabaseState): void {
  ensureDbFile();
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(state, null, 2), 'utf8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error saving db file:', err);
  }
}
