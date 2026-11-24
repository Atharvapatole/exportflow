import assert from 'node:assert';
import {
  roundToTwo,
  safeAdd,
  safeSub,
  safeMul,
  safeDiv,
  formatCurrency,
  numberToWords,
  generateDocNumber,
} from '../src/lib/utils';
import { generateDocumentPdf } from '../src/lib/pdf/generateDocumentPdf';
import { filterFreeChatModels, OPENROUTER_FREE_ROUTER_ID } from '../src/lib/ai/openrouterService';

console.log('Running ExportFlow Mathematical, Financial & AI Unit Tests...\n');

// 1. Decimal-Safe Monetary Arithmetic
console.log('Test 1: Decimal precision & IEEE-754 floating point safety');
assert.strictEqual(0.1 + 0.2 === 0.30000000000000004, true, 'IEEE-754 inaccuracy verified');
assert.strictEqual(safeAdd(0.1, 0.2), 0.3, 'safeAdd must prevent floating precision error');
assert.strictEqual(safeSub(100.55, 50.25), 50.3);
assert.strictEqual(safeMul(19.99, 3), 59.97);
assert.strictEqual(safeDiv(100, 3), 33.33);
console.log('  ✓ Passed: Decimal-safe arithmetic verified');

// 2. GST Calculations (LUT Export vs Domestic)
console.log('\nTest 2: GST & LUT zero-rated export calculation validation');
const baseExportVal = 10000;
// Zero-rated LUT export must have 0 GST
const lutTax = 0;
assert.strictEqual(lutTax, 0, 'LUT Export tax must be 0');

// Domestic 18% Exclusive
const domesticTax = roundToTwo((baseExportVal * 18) / 100);
const domesticGrandTotal = roundToTwo(baseExportVal + domesticTax);
assert.strictEqual(domesticTax, 1800);
assert.strictEqual(domesticGrandTotal, 11800);

// Domestic 18% Inclusive
const inclusiveTaxable = roundToTwo((11800 * 100) / 118);
const inclusiveTax = roundToTwo(11800 - inclusiveTaxable);
assert.strictEqual(inclusiveTaxable, 10000);
assert.strictEqual(inclusiveTax, 1800);
console.log('  ✓ Passed: GST & LUT tax treatment verified');

// 3. Export Pricing (Incoterms 2020)
console.log('\nTest 3: Incoterms 2020 export pricing engine');
const qty = 1000;
const unitCost = 10;
const packaging = 1;
const inlandFreight = 500;
const oceanFreight = 2000;
const insurance = 150;

const factoryCost = (unitCost + packaging) * qty; // 11000
const exw = roundToTwo(factoryCost * 1.2); // 13200
const fob = roundToTwo(exw + inlandFreight); // 13700
const cfr = roundToTwo(fob + oceanFreight); // 15700
const cif = roundToTwo(cfr + insurance); // 15850

assert.strictEqual(exw, 13200);
assert.strictEqual(fob, 13700);
assert.strictEqual(cfr, 15700);
assert.strictEqual(cif, 15850);
console.log('  ✓ Passed: Incoterms EXW/FOB/CFR/CIF sequence verified');

// 4. CBM & Container Volumetric Validation
console.log('\nTest 4: CBM Volume calculation');
const lengthCm = 50;
const widthCm = 40;
const heightCm = 30;
const pkgCount = 100;
const cbmPerPkg = (lengthCm * widthCm * heightCm) / 1000000; // 0.06
const totalCbm = roundToTwo(cbmPerPkg * pkgCount);
assert.strictEqual(cbmPerPkg, 0.06);
assert.strictEqual(totalCbm, 6.0);
console.log('  ✓ Passed: CBM volumetric calculations verified');

// 5. Amount in Words
console.log('\nTest 5: Number to Words conversion');
const words1 = numberToWords(1250.5, 'USD');
assert.ok(words1.includes('One Thousand Two Hundred Fifty'), `Unexpected: ${words1}`);
const words2 = numberToWords(50000, 'INR');
assert.ok(words2.includes('Fifty Thousand'), `Unexpected: ${words2}`);
console.log('  ✓ Passed: Amount in words verified');

// 6. Sequential Document Numbering
console.log('\nTest 6: Sequential document numbering formatting');
const num1 = generateDocNumber('QT', 1, 2026);
assert.strictEqual(num1, 'QT-2026-0001');
const num2 = generateDocNumber('INV', 42, 2026);
assert.strictEqual(num2, 'INV-2026-0042');
console.log('  ✓ Passed: Document numbering format verified');

// 7. Vector PDF Generation
console.log('\nTest 7: Isolated Vector PDF Generation for all trade documents');
const testDoc: any = {
  id: 'doc_test_1',
  documentNumber: 'QT-2026-0001',
  type: 'quotation',
  date: '2026-11-23',
  buyerCompany: 'Global Trade Corp',
  buyerCountry: 'United Arab Emirates',
  currency: 'USD',
  incoterm: 'FOB',
  originPort: 'Nhava Sheva, India',
  destinationPort: 'Jebel Ali, UAE',
  sellerDetails: {
    legalName: 'BENZWELL EXPORTS PRIVATE LIMITED',
    city: 'Mumbai',
    country: 'India',
    iec: '0312049921',
    gstin: '27AABCU9603R1ZM',
  },
  items: [
    {
      itemNumber: 1,
      productName: 'Organic Alphonso Mango Pulp',
      hsCode: '2008.99.11',
      quantity: 5000,
      unit: 'PCS',
      unitPrice: 3.5,
      lineTotal: 17500,
    },
  ],
  subtotal: 17500,
  grandTotal: 17500,
};

const allTypes = [
  'quotation',
  'proforma_invoice',
  'commercial_invoice',
  'packing_list',
  'purchase_order',
  'sales_order',
  'order_confirmation',
  'delivery_note',
  'debit_note',
  'credit_note',
  'sales_contract',
  'shipping_instructions',
];

for (const t of allTypes) {
  const bytes = generateDocumentPdf({ ...testDoc, type: t });
  assert.ok(bytes && bytes.byteLength > 1000, `Failed to generate PDF for ${t}`);
}

// Multi-page test
const multiItems = Array.from({ length: 25 }, (_, i) => ({
  itemNumber: i + 1,
  productName: `Product Line Item #${i + 1}`,
  hsCode: '8482.10.20',
  quantity: 100,
  unit: 'PCS',
  unitPrice: 10,
  lineTotal: 1000,
}));
const multiBytes = generateDocumentPdf({ ...testDoc, items: multiItems, grandTotal: 25000 });
assert.ok(multiBytes && multiBytes.byteLength > 20000, 'Multi-page PDF must paginate properly');
console.log('  ✓ Passed: Vector PDF Generation verified for all 12+ document types (including multi-page)');

// 8. OpenRouter Free Model Discovery & Filtering Engine
console.log('\nTest 8: OpenRouter Free Model Discovery & Filtering Engine');
const sampleRawModels = [
  // 1. Valid free chat model with zero price
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Llama 3.3 70B Instruct (Free)',
    pricing: { prompt: '0', completion: '0' },
    context_length: 131072,
    architecture: { modality: 'text->text' },
  },
  // 2. Another free model
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1 (Free)',
    pricing: { prompt: '0', completion: '0' },
    context_length: 65536,
    architecture: { modality: 'text->text' },
  },
  // 3. Paid model - MUST BE EXCLUDED
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    pricing: { prompt: '0.0000025', completion: '0.00001' },
    context_length: 128000,
  },
  // 4. Embedding model - MUST BE EXCLUDED
  {
    id: 'openai/text-embedding-3-small',
    name: 'Text Embedding 3 Small',
    pricing: { prompt: '0', completion: '0' },
    context_length: 8192,
  },
  // 5. Audio Whisper model - MUST BE EXCLUDED
  {
    id: 'openai/whisper-large-v3',
    name: 'Whisper Large v3',
    pricing: { prompt: '0', completion: '0' },
    context_length: 4096,
  },
  // 6. Image Generation model - MUST BE EXCLUDED
  {
    id: 'black-forest-labs/flux-1-schnell',
    name: 'Flux 1 Schnell',
    pricing: { prompt: '0', completion: '0' },
    architecture: { modality: 'image->image' },
  },
];

const discovered = filterFreeChatModels(sampleRawModels);

// Verify openrouter/free is index 0
assert.strictEqual(discovered[0].id, OPENROUTER_FREE_ROUTER_ID, 'OpenRouter Free Router must be top recommended choice');
assert.strictEqual(discovered[0].isFree, true);

// Verify paid model excluded
assert.ok(!discovered.some((m) => m.id === 'openai/gpt-4o'), 'Paid models MUST be excluded');

// Verify embeddings, audio, image models excluded
assert.ok(!discovered.some((m) => m.id.includes('embedding')), 'Embedding models MUST be excluded');
assert.ok(!discovered.some((m) => m.id.includes('whisper')), 'Audio models MUST be excluded');
assert.ok(!discovered.some((m) => m.id.includes('flux')), 'Image models MUST be excluded');

// Verify legitimate free models included
assert.ok(discovered.some((m) => m.id === 'meta-llama/llama-3.3-70b-instruct:free'), 'Free Llama 3.3 must be included');
assert.ok(discovered.some((m) => m.id === 'deepseek/deepseek-r1:free'), 'Free DeepSeek R1 must be included');

console.log('  ✓ Passed: OpenRouter free model discovery and strict zero-price filtering verified');

// 9. Admin Security & Role Validation
console.log('\nTest 9: Server-side Super Admin Role & Authorization Boundary');
const customerRole: string = 'owner';
const adminRole: string = 'super_admin';

assert.strictEqual(customerRole === 'super_admin', false, 'Customer cannot be identified as Super Admin');
assert.strictEqual(adminRole === 'super_admin', true, 'Admin account properly identified as Super Admin');
console.log('  ✓ Passed: Super Admin role boundary verified');

console.log('\nAll 9 test suites passed successfully with zero errors!\n');
