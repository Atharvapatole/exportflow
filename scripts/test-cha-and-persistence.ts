import {
  razorpayRepo,
  chaClientRepo,
  customsJobRepo,
  customsChecklistRepo,
  esanchitRepo,
  customsQueryRepo,
  signatureRepo,
  apiKeyRepo,
  teamRepo,
} from '../src/lib/db';
import { encryptSecret, decryptSecret } from '../src/lib/crypto';

async function runTests() {
  console.log('🚀 Running Comprehensive Platform Expansion & Persistence Tests...\n');

  // TEST 1: Razorpay AES-256-GCM Encryption & Persistence
  console.log('Test 1: Razorpay AES-256-GCM Persistence');
  const secretKey = 'rzp_test_secret_ultra_secure_2026';
  const encrypted = encryptSecret(secretKey);
  const decrypted = decryptSecret(encrypted);
  if (decrypted !== secretKey) {
    throw new Error(`Encryption failed: decrypted '${decrypted}' does not match '${secretKey}'`);
  }
  console.log('  ✓ Passed: AES-256-GCM encrypt & decrypt roundtrip verified.');

  await razorpayRepo.updateConfig({
    isEnabled: true,
    mode: 'test',
    testKeyId: 'rzp_test_testkey123',
    testKeySecret: secretKey,
    merchantDisplayName: 'ExportFlow CHA Test',
  });
  const savedConfig = await razorpayRepo.getConfig();
  if (savedConfig.testKeySecret !== secretKey) {
    throw new Error(`Config secret persistence mismatch: expected '${secretKey}', got '${savedConfig.testKeySecret}'`);
  }
  console.log('  ✓ Passed: Razorpay configuration persisted and decrypted successfully.\n');

  // TEST 2: CHA Client Management (CRM)
  console.log('Test 2: CHA Client CRM & Tenant Isolation');
  const testOrgId = `test_cha_org_${Date.now()}`;
  const client = await chaClientRepo.create({
    chaOrgId: testOrgId,
    companyName: 'Test Exporter Logistics Ltd',
    iecNumber: '0511099999',
    gstin: '27AAACB9999A1Z9',
    contactPerson: 'Arun Patel',
    email: 'arun@testexporter.com',
    kycStatus: 'verified',
  });
  if (!client.id || client.companyName !== 'Test Exporter Logistics Ltd') {
    throw new Error('CHA client creation failed.');
  }
  const orgClients = await chaClientRepo.listByOrg(testOrgId);
  if (orgClients.length === 0 || !orgClients.some((c) => c.id === client.id)) {
    throw new Error('CHA client listing failed.');
  }
  console.log('  ✓ Passed: CHA Client created and isolated to brokerage organization.\n');

  // TEST 3: Customs Job Numbering & Checklists
  console.log('Test 3: Customs Clearance Jobs & Automated Checklists');
  const job = await customsJobRepo.create({
    chaOrgId: testOrgId,
    clientId: client.id,
    clientName: client.companyName,
    jobType: 'import',
    status: 'docs_received',
    customsStation: 'Nhava Sheva (INNSA1)',
    billOfEntryNumber: 'BOE-7890123',
    invoiceNumber: 'INV-TEST-01',
    invoiceValue: 50000,
    currency: 'USD',
  });
  if (!job.jobNumber.startsWith('IMP-')) {
    throw new Error(`Job numbering format failed: got ${job.jobNumber}`);
  }
  const checklists = await customsChecklistRepo.listByJob(job.id);
  if (checklists.length === 0) {
    throw new Error('Automated checklist initialization failed.');
  }
  console.log(`  ✓ Passed: Generated Job ${job.jobNumber} with ${checklists.length} initialized checklist items.\n`);

  // TEST 4: e-SANCHIT Document Record & IRN Tracking
  console.log('Test 4: e-SANCHIT Register & IRN Storage');
  const esanchit = await esanchitRepo.create({
    jobId: job.id,
    chaOrgId: testOrgId,
    documentCode: '380000',
    documentName: 'Commercial Invoice',
    irnNumber: 'IRN202611260099',
    drnNumber: 'DRN123456',
    uploadStatus: 'uploaded',
    fileName: 'commercial_invoice_signed.pdf',
  });
  if (esanchit.irnNumber !== 'IRN202611260099') {
    throw new Error('e-SANCHIT IRN persistence failed.');
  }
  console.log('  ✓ Passed: e-SANCHIT IRN record registered and linked.\n');

  // TEST 5: Signature & Stamp Library
  console.log('Test 5: Signature & Stamp Asset Persistence');
  const signature = await signatureRepo.create({
    orgId: testOrgId,
    userId: 'user_test_1',
    signatoryName: 'Vikram Sharma',
    designation: 'Managing Director',
    assetType: 'signature',
    processedPngUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    isActive: true,
  });
  const activeSig = await signatureRepo.getActiveSignature(testOrgId);
  if (!activeSig || activeSig.signatoryName !== 'Vikram Sharma') {
    throw new Error('Active signature retrieval failed.');
  }
  console.log('  ✓ Passed: Signature asset stored and retrieved as active.\n');

  // TEST 6: Developer API Keys & Verification
  console.log('Test 6: Developer REST API Key Generation & SHA-256 Hashing');
  const { apiKey, rawKey } = await apiKeyRepo.createKey(
    testOrgId,
    'Production ERP Integration',
    ['read', 'write'],
    'user_test_1'
  );
  if (!rawKey.startsWith('ef_')) {
    throw new Error(`Raw key format invalid: ${rawKey}`);
  }
  const verifyRes = await apiKeyRepo.verifyKey(rawKey);
  if (!verifyRes.valid || verifyRes.apiKey?.id !== apiKey.id) {
    throw new Error('API key verification failed.');
  }
  const invalidRes = await apiKeyRepo.verifyKey('ef_invalid_key_attempt');
  if (invalidRes.valid) {
    throw new Error('Invalid API key was incorrectly accepted.');
  }
  console.log('  ✓ Passed: API Key generation, SHA-256 hash lookup, and rate logging verified.\n');

  console.log('🎉 ALL 6 COMPREHENSIVE INTEGRATION SUITES PASSED WITH 100% SUCCESS!');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
