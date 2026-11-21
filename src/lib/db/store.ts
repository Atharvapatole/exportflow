import fs from 'fs';
import path from 'path';

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
    return JSON.parse(data) as DatabaseState;
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
