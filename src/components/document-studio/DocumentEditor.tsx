'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  Eye,
  Plus,
  Trash2,
  Building2,
  FileText,
  DollarSign,
  ArrowRight,
  Sparkles,
  Calculator,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { DocumentRenderer } from './DocumentRenderer';
import { BaseDocument, Buyer, Product, DocumentItem, DocumentType } from '@/types';
import {
  INCOTERMS_2020,
  SUPPORTED_CURRENCIES,
  DOCUMENT_TEMPLATES,
} from '@/config/constants';
import { roundToTwo, numberToWords, formatCurrency } from '@/lib/utils';

interface DocumentEditorProps {
  initialDoc?: Partial<BaseDocument>;
  docType: DocumentType;
}

export function DocumentEditor({ initialDoc, docType }: DocumentEditorProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [docData, setDocData] = useState<any>({
    type: docType,
    documentNumber: initialDoc?.documentNumber || '',
    referenceNumber: initialDoc?.referenceNumber || '',
    date: initialDoc?.date || new Date().toISOString().split('T')[0],
    validityDate: initialDoc?.validityDate || '',
    buyerId: initialDoc?.buyerId || '',
    buyerCompany: initialDoc?.buyerCompany || '',
    buyerContactPerson: initialDoc?.buyerContactPerson || '',
    buyerEmail: initialDoc?.buyerEmail || '',
    buyerPhone: initialDoc?.buyerPhone || '',
    buyerCountry: initialDoc?.buyerCountry || 'United States',
    buyerBillingAddress: initialDoc?.buyerBillingAddress || '',
    buyerShippingAddress: initialDoc?.buyerShippingAddress || '',
    buyerTaxId: initialDoc?.buyerTaxId || '',
    currency: initialDoc?.currency || 'USD',
    incoterm: initialDoc?.incoterm || 'FOB',
    originPort: initialDoc?.originPort || 'Nhava Sheva / JNPT, Mumbai',
    destinationPort: initialDoc?.destinationPort || 'Port of Los Angeles / Long Beach',
    taxType: initialDoc?.taxType || 'zero_rated_export',
    isInterState: false,
    paymentTerms: initialDoc?.paymentTerms || '30% Advance TT, 70% against BL copy',
    advancePercentage: initialDoc?.advancePercentage || 30,
    deliveryTime: initialDoc?.deliveryTime || 'Within 15 days of order confirmation',
    templateId: initialDoc?.templateId || 'classic-corporate',
    notes: initialDoc?.notes || '',
    termsAndConditions:
      initialDoc?.termsAndConditions ||
      '1. Goods are shipped in sea-worthy export standard packaging.\n2. Force Majeure conditions apply.\n3. Inspection by SGS / buyer appointed agency at loading port.\n4. Dispute jurisdiction subject to international arbitration.',
    status: initialDoc?.status || 'draft',
    items: initialDoc?.items || [
      {
        itemNumber: 1,
        productName: 'Sample Export Grade Item',
        description: 'Commercial grade product with technical export specs',
        hsCode: '09041110',
        quantity: 100,
        unit: 'KG',
        unitPrice: 25,
        discountPercentage: 0,
        discountAmount: 0,
        taxRate: 0,
        taxAmount: 0,
        lineTotal: 2500,
      },
    ],
  });

  // Load registered buyers and products for auto-fill
  useEffect(() => {
    async function loadData() {
      try {
        const [bRes, pRes] = await Promise.all([
          fetch('/api/buyers'),
          fetch('/api/products'),
        ]);
        if (bRes.ok) setBuyers(await bRes.json());
        if (pRes.ok) setProducts(await pRes.json());
      } catch (err) {
        console.error('Failed to load buyers/products', err);
      }
    }
    loadData();
  }, []);

  // When buyer is selected from dropdown
  const handleBuyerSelect = (buyerId: string) => {
    const selected = buyers.find((b) => b.id === buyerId);
    if (selected) {
      setDocData((prev: any) => ({
        ...prev,
        buyerId: selected.id,
        buyerCompany: selected.companyName,
        buyerContactPerson: selected.contactPerson,
        buyerEmail: selected.email,
        buyerPhone: selected.phone,
        buyerCountry: selected.country,
        buyerBillingAddress: selected.billingAddress,
        buyerShippingAddress: selected.shippingAddress,
        buyerTaxId: selected.taxId || '',
      }));
    }
  };

  // Add line item
  const handleAddItem = (product?: Product) => {
    const newItem: DocumentItem = {
      id: `item_${Date.now()}`,
      itemNumber: docData.items.length + 1,
      productId: product?.id,
      productName: product?.name || 'New Product Item',
      description: product?.description || '',
      specifications: product?.specifications || '',
      hsCode: product?.hsCode || '00000000',
      quantity: product?.moq || 1,
      unit: product?.unit || 'PCS',
      unitPrice: product?.sellingPrice || 100,
      discountPercentage: 0,
      discountAmount: 0,
      taxRate: 0,
      taxAmount: 0,
      lineTotal: roundToTwo((product?.moq || 1) * (product?.sellingPrice || 100)),
    };

    setDocData((prev: any) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  // Update line item
  const handleItemChange = (idx: number, field: string, value: any) => {
    const items = [...docData.items];
    items[idx] = { ...items[idx], [field]: value };

    // Recalculate line total
    const qty = Number(items[idx].quantity) || 0;
    const price = Number(items[idx].unitPrice) || 0;
    const discPct = Number(items[idx].discountPercentage) || 0;
    const base = roundToTwo(qty * price);
    const disc = roundToTwo((base * discPct) / 100);
    const taxable = roundToTwo(base - disc);

    const taxRate = Number(items[idx].taxRate) || 0;
    const tax = docData.taxType === 'domestic_gst' ? roundToTwo((taxable * taxRate) / 100) : 0;
    const total = roundToTwo(taxable + tax);

    items[idx].discountAmount = disc;
    items[idx].taxAmount = tax;
    items[idx].lineTotal = total;

    setDocData((prev: any) => ({ ...prev, items }));
  };

  // Remove line item
  const handleRemoveItem = (idx: number) => {
    if (docData.items.length <= 1) return;
    const items = docData.items.filter((_: any, i: number) => i !== idx);
    setDocData((prev: any) => ({ ...prev, items }));
  };

  // Calculate live totals
  let subtotal = 0;
  let discountTotal = 0;
  let taxableAmount = 0;
  let taxTotal = 0;

  docData.items.forEach((it: DocumentItem) => {
    const qty = Number(it.quantity) || 0;
    const price = Number(it.unitPrice) || 0;
    const base = roundToTwo(qty * price);
    const disc = Number(it.discountAmount) || 0;
    subtotal = roundToTwo(subtotal + base);
    discountTotal = roundToTwo(discountTotal + disc);
    taxableAmount = roundToTwo(taxableAmount + (base - disc));
    taxTotal = roundToTwo(taxTotal + (it.taxAmount || 0));
  });

  const grandTotal = roundToTwo(taxableAmount + taxTotal);
  const words = numberToWords(grandTotal, docData.currency);

  const previewDoc: BaseDocument = {
    ...docData,
    subtotal,
    discountTotal,
    taxableAmount,
    cgstTotal: roundToTwo(taxTotal / 2),
    sgstTotal: roundToTwo(taxTotal / 2),
    igstTotal: taxTotal,
    taxTotal,
    grandTotal,
    amountInWords: words,
  };

  // Submit Handler
  const handleSave = async (status: 'draft' | 'sent') => {
    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        ...docData,
        status,
        subtotal,
        discountTotal,
        taxableAmount,
        taxTotal,
        grandTotal,
        amountInWords: words,
      };

      const endpoint = initialDoc?.id ? `/api/documents/${initialDoc.id}` : '/api/documents';
      const method = initialDoc?.id ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const saved = await res.json();
      if (!res.ok) throw new Error(saved.error || 'Failed to save document');

      const redirectPath =
        docType === 'quotation'
          ? `/dashboard/quotations/${saved.id}`
          : docType === 'proforma_invoice'
          ? `/dashboard/proforma-invoices/${saved.id}`
          : docType === 'commercial_invoice'
          ? `/dashboard/commercial-invoices/${saved.id}`
          : `/dashboard/packing-lists/${saved.id}`;

      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#172033]">
              {initialDoc?.id ? 'Edit' : 'Create'} {docType.replace(/_/g, ' ').toUpperCase()}
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold uppercase border border-blue-200">
              {docData.incoterm}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {docData.currency} • Decimal-safe financial accuracy • 5 Export Templates
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Tabs */}
          <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'edit' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Document Form
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'preview' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              <Eye className="w-3.5 h-3.5 inline mr-1" />
              Live Preview
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSave('draft')}
            isLoading={isSubmitting}
          >
            <Save className="w-4 h-4 mr-1" />
            Save Draft
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => handleSave('sent')}
            isLoading={isSubmitting}
          >
            Finalize & Issue
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      {/* EDIT TAB */}
      {activeTab === 'edit' && (
        <div className="space-y-6">
          {/* Section 1: Document Basics & Buyer Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Buyer Selection */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle>Buyer / Consignee Information</CardTitle>
                {buyers.length > 0 && (
                  <div className="w-56">
                    <Select
                      value={docData.buyerId}
                      onChange={(e) => handleBuyerSelect(e.target.value)}
                      options={[
                        { value: '', label: 'Select Saved Buyer...' },
                        ...buyers.map((b) => ({ value: b.id, label: b.companyName })),
                      ]}
                    />
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Buyer Company Name"
                    required
                    value={docData.buyerCompany}
                    onChange={(e) => setDocData({ ...docData, buyerCompany: e.target.value })}
                  />
                  <Input
                    label="Contact Person / Department"
                    value={docData.buyerContactPerson}
                    onChange={(e) => setDocData({ ...docData, buyerContactPerson: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Buyer Country"
                    value={docData.buyerCountry}
                    onChange={(e) => setDocData({ ...docData, buyerCountry: e.target.value })}
                  />
                  <Input
                    label="Buyer Email"
                    type="email"
                    value={docData.buyerEmail}
                    onChange={(e) => setDocData({ ...docData, buyerEmail: e.target.value })}
                  />
                  <Input
                    label="Buyer Tax ID / VAT"
                    value={docData.buyerTaxId}
                    onChange={(e) => setDocData({ ...docData, buyerTaxId: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Textarea
                    label="Billing Address"
                    rows={2}
                    value={docData.buyerBillingAddress}
                    onChange={(e) => setDocData({ ...docData, buyerBillingAddress: e.target.value })}
                  />
                  <Textarea
                    label="Shipping Address"
                    rows={2}
                    value={docData.buyerShippingAddress}
                    onChange={(e) => setDocData({ ...docData, buyerShippingAddress: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Right: Document Parameters */}
            <Card>
              <CardHeader>
                <CardTitle>Trade Parameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Doc Date"
                    type="date"
                    value={docData.date}
                    onChange={(e) => setDocData({ ...docData, date: e.target.value })}
                  />
                  <Input
                    label="Validity Date"
                    type="date"
                    value={docData.validityDate}
                    onChange={(e) => setDocData({ ...docData, validityDate: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Select
                    label="Currency"
                    value={docData.currency}
                    onChange={(e) => setDocData({ ...docData, currency: e.target.value })}
                    options={SUPPORTED_CURRENCIES.map((c) => ({ value: c.code, label: c.code }))}
                  />
                  <Select
                    label="Incoterms 2020"
                    value={docData.incoterm}
                    onChange={(e) => setDocData({ ...docData, incoterm: e.target.value })}
                    options={INCOTERMS_2020.map((i) => ({ value: i.code, label: i.code }))}
                  />
                </div>

                <Input
                  label="Port of Loading"
                  value={docData.originPort}
                  onChange={(e) => setDocData({ ...docData, originPort: e.target.value })}
                />
                <Input
                  label="Port of Discharge"
                  value={docData.destinationPort}
                  onChange={(e) => setDocData({ ...docData, destinationPort: e.target.value })}
                />

                <Select
                  label="Tax Treatment"
                  value={docData.taxType}
                  onChange={(e) => setDocData({ ...docData, taxType: e.target.value })}
                  options={[
                    { value: 'zero_rated_export', label: 'Zero-Rated Export (LUT / Bond)' },
                    { value: 'igst_export', label: 'Export on Payment of IGST' },
                    { value: 'domestic_gst', label: 'Domestic GST (CGST/SGST or IGST)' },
                    { value: 'exempt', label: 'Exempt / Non-Taxable' },
                  ]}
                />

                <Select
                  label="Document Template"
                  value={docData.templateId}
                  onChange={(e) => setDocData({ ...docData, templateId: e.target.value })}
                  options={DOCUMENT_TEMPLATES.map((t) => ({ value: t.id, label: t.name }))}
                />
              </CardContent>
            </Card>
          </div>

          {/* Section 2: Line Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Product Line Items</CardTitle>
                <p className="text-xs text-slate-500">Add products from catalog or enter custom line items</p>
              </div>

              {/* Add from catalog dropdown */}
              <div className="flex items-center gap-2">
                {products.length > 0 && (
                  <select
                    className="text-xs rounded-lg border border-slate-200 px-3 py-1.5 bg-slate-50"
                    onChange={(e) => {
                      const prod = products.find((p) => p.id === e.target.value);
                      if (prod) handleAddItem(prod);
                      e.target.value = '';
                    }}
                  >
                    <option value="">+ Pick from Catalog...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                )}
                <Button size="sm" variant="outline" onClick={() => handleAddItem()}>
                  <Plus className="w-4 h-4 mr-1" />
                  Custom Row
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-slate-600 font-semibold">
                      <th className="py-2.5 px-3 w-8 text-center">#</th>
                      <th className="py-2.5 px-3 min-w-[200px]">Product / Description</th>
                      <th className="py-2.5 px-3 w-28">HS Code</th>
                      <th className="py-2.5 px-3 w-24">Qty</th>
                      <th className="py-2.5 px-3 w-20">Unit</th>
                      <th className="py-2.5 px-3 w-28">Price ({docData.currency})</th>
                      <th className="py-2.5 px-3 w-20">Disc %</th>
                      <th className="py-2.5 px-3 w-28 text-right">Line Total</th>
                      <th className="py-2.5 px-3 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {docData.items.map((item: DocumentItem, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                        <td className="py-2 px-3 space-y-1">
                          <input
                            type="text"
                            className="w-full p-1 border border-slate-200 rounded font-semibold text-xs"
                            value={item.productName}
                            onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                            placeholder="Product name"
                          />
                          <input
                            type="text"
                            className="w-full p-1 border border-slate-200 rounded text-[11px] text-slate-500"
                            value={item.description}
                            onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                            placeholder="Specifications / Description"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            className="w-full p-1 border border-slate-200 rounded text-xs font-mono"
                            value={item.hsCode}
                            onChange={(e) => handleItemChange(idx, 'hsCode', e.target.value)}
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            className="w-full p-1 border border-slate-200 rounded text-xs"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            className="w-full p-1 border border-slate-200 rounded text-xs"
                            value={item.unit}
                            onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            step="any"
                            className="w-full p-1 border border-slate-200 rounded text-xs"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            className="w-full p-1 border border-slate-200 rounded text-xs"
                            value={item.discountPercentage}
                            onChange={(e) => handleItemChange(idx, 'discountPercentage', e.target.value)}
                          />
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-xs text-[#172033]">
                          {formatCurrency(item.lineTotal, docData.currency, false)}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-slate-300 hover:text-rose-500 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Calculation Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  <span>Amount in Words: </span>
                  <span className="font-bold text-[#172033]">{words}</span>
                </div>
                <div className="flex items-center gap-6 text-xs">
                  <div>Subtotal: <strong>{formatCurrency(subtotal, docData.currency)}</strong></div>
                  {discountTotal > 0 && <div>Disc: <strong className="text-rose-600">-{formatCurrency(discountTotal, docData.currency)}</strong></div>}
                  {taxTotal > 0 && <div>Tax: <strong>{formatCurrency(taxTotal, docData.currency)}</strong></div>}
                  <div className="text-sm font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                    Grand Total ({docData.incoterm}): {formatCurrency(grandTotal, docData.currency)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Commercial Terms & Conditions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Commercial Payment Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Payment Terms"
                  value={docData.paymentTerms}
                  onChange={(e) => setDocData({ ...docData, paymentTerms: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Advance Payment %"
                    type="number"
                    value={docData.advancePercentage}
                    onChange={(e) => setDocData({ ...docData, advancePercentage: Number(e.target.value) })}
                  />
                  <Input
                    label="Delivery Schedule"
                    value={docData.deliveryTime}
                    onChange={(e) => setDocData({ ...docData, deliveryTime: e.target.value })}
                  />
                </div>
                <Textarea
                  label="Internal Exporter Notes"
                  rows={2}
                  value={docData.notes}
                  onChange={(e) => setDocData({ ...docData, notes: e.target.value })}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Terms, Declarations & Dispute Resolution</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  label="Terms & Conditions (Printed on Document)"
                  rows={6}
                  value={docData.termsAndConditions}
                  onChange={(e) => setDocData({ ...docData, termsAndConditions: e.target.value })}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* PREVIEW TAB */}
      {activeTab === 'preview' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-500">
              Selected Template: <strong>{DOCUMENT_TEMPLATES.find((t) => t.id === docData.templateId)?.name}</strong>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => window.print()}>
                <Download className="w-4 h-4 mr-1" />
                Print / Save PDF
              </Button>
            </div>
          </div>
          <DocumentRenderer doc={previewDoc} />
        </div>
      )}
    </div>
  );
}
