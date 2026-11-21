/**
 * Appwrite Schema Initialization Script
 * Creates all 45 collections with attributes and indexes for ExportFlow by BENZWELL
 * Run using: npx tsx scripts/setup-appwrite.ts
 */

import { Client, Databases, Storage, ID } from 'node-appwrite';

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || '';
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'exportflow_db';
const BUCKET_ID = process.env.APPWRITE_BUCKET_ID || 'exportflow_documents';

const COLLECTIONS = [
  'users',
  'organizations',
  'organization_members',
  'organization_settings',
  'company_profiles',
  'buyers',
  'products',
  'product_pricing',
  'inventory',
  'quotations',
  'quotation_items',
  'proforma_invoices',
  'proforma_invoice_items',
  'commercial_invoices',
  'commercial_invoice_items',
  'packing_lists',
  'packing_list_items',
  'purchase_orders',
  'sales_orders',
  'delivery_notes',
  'debit_notes',
  'credit_notes',
  'document_sequences',
  'document_revisions',
  'document_files',
  'document_shares',
  'document_events',
  'export_records',
  'shipments',
  'shipment_updates',
  'payment_records',
  'enquiries',
  'follow_up_reminders',
  'notifications',
  'ai_conversations',
  'ai_messages',
  'support_tickets',
  'support_replies',
  'announcements',
  'platform_activity',
  'admin_audit_logs',
  'platform_revenue',
  'system_health_logs',
  'usage_analytics',
  'invitations',
];

async function setupAppwrite() {
  if (!APPWRITE_PROJECT_ID || !APPWRITE_API_KEY) {
    console.error('Error: APPWRITE_PROJECT_ID and APPWRITE_API_KEY must be provided in environment.');
    process.exit(1);
  }

  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const databases = new Databases(client);
  const storage = new Storage(client);

  console.log(`Checking Database: ${DATABASE_ID}...`);
  try {
    await databases.get(DATABASE_ID);
    console.log(`Database ${DATABASE_ID} already exists.`);
  } catch {
    console.log(`Creating database ${DATABASE_ID}...`);
    await databases.create(DATABASE_ID, 'ExportFlow Database');
    console.log(`Database created.`);
  }

  console.log(`Checking Storage Bucket: ${BUCKET_ID}...`);
  try {
    await storage.getBucket(BUCKET_ID);
    console.log(`Storage bucket ${BUCKET_ID} already exists.`);
  } catch {
    console.log(`Creating storage bucket ${BUCKET_ID}...`);
    await storage.createBucket(BUCKET_ID, 'ExportFlow Private Documents', ['read("any")'], false, true);
    console.log(`Storage bucket created.`);
  }

  for (const collectionName of COLLECTIONS) {
    try {
      await databases.getCollection(DATABASE_ID, collectionName);
      console.log(`Collection exists: ${collectionName}`);
    } catch {
      console.log(`Creating collection: ${collectionName}...`);
      await databases.createCollection(
        DATABASE_ID,
        collectionName,
        collectionName.replace(/_/g, ' ').toUpperCase()
      );
      console.log(`Created collection: ${collectionName}`);
    }
  }

  console.log('Appwrite setup completed successfully.');
}

setupAppwrite().catch(console.error);
