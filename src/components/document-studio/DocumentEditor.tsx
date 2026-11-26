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
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Ship,
  ShieldCheck,
  CreditCard,
  Layers,
  Settings2,
  Palette,
  FileCheck,
  Undo2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { DocumentRenderer } from './DocumentRenderer';
import { AiQuotationAssistant } from './AiQuotationAssistant';
import { BaseDocument, Buyer, Product, DocumentItem, DocumentType } from '@/types';
import {
  INCOTERMS_2020,
  SUPPORTED_CURRENCIES,
  DOCUMENT_TEMPLATES,
  EXPORT_UNITS,
} from '@/config/constants';
import { roundToTwo, numberToWords, formatCurrency, safeAdd, safeMul } from '@/lib/utils';
import { downloadDocumentPdf, openIsolatedPrintWindow } from '@/lib/pdf/downloadDocument';

interface DocumentEditorProps {
  initialDoc?: Partial<BaseDocument>;
  docType: DocumentType;
}

export function DocumentEditor({ initialDoc, docType }: DocumentEditorProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [availableSignatures, setAvailableSignatures] = useState<any[]>([]);
  const [companyProfile, setCompanyProfile] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isAiOpen, setIsAiOpen] = useState(false);

  // Undo history for AI edits
  const [history, setHistory] = useState<any[]>([]);

  // Section collapse states
  const [collapsed, setCollapsed] = useState({
    exporter: false,
    quotation: false,
    buyer: false,
    shipment: false,
    products: false,
    pricing: false,
    tax: false,
    payment: false,
    commercial: true,
    declaration: false,
    styling: true,
  });

  const toggleSection = (sec: keyof typeof collapsed) => {
    setCollapsed((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  // Form State
  const [docData, setDocData] = useState<any>({
    type: docType,
    documentNumber: initialDoc?.documentNumber || '',
    referenceNumber: initialDoc?.referenceNumber || '',
    inquiryReference: initialDoc?.inquiryReference || '',
    inquiryDate: initialDoc?.inquiryDate || '',
    buyerPoReference: initialDoc?.buyerPoReference || '',
    revisionNumber: initialDoc?.revisionNumber || 1,
    preparedBy: initialDoc?.preparedBy || '',
    salesperson: initialDoc?.salesperson || '',
    internalReference: initialDoc?.internalReference || '',
    date: initialDoc?.date || new Date().toISOString().split('T')[0],
    validityDate:
      initialDoc?.validityDate ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    buyerId: initialDoc?.buyerId || '',
    buyerCompany: initialDoc?.buyerCompany || '',
    buyerContactPerson: initialDoc?.buyerContactPerson || '',
    buyerDesignation: initialDoc?.buyerDesignation || '',
    buyerEmail: initialDoc?.buyerEmail || '',
    buyerPhone: initialDoc?.buyerPhone || '',
    buyerCountry: initialDoc?.buyerCountry || 'United States',
    buyerState: initialDoc?.buyerState || '',
    buyerCity: initialDoc?.buyerCity || '',
    buyerPostalCode: initialDoc?.buyerPostalCode || '',
    buyerBillingAddress: initialDoc?.buyerBillingAddress || '',
    buyerShippingAddress: initialDoc?.buyerShippingAddress || '',
    buyerTaxId: initialDoc?.buyerTaxId || '',
    consigneeName: initialDoc?.consigneeName || '',
    consigneeAddress: initialDoc?.consigneeAddress || '',
    notifyParty: initialDoc?.notifyParty || '',
    shipToAddress: initialDoc?.shipToAddress || '',
    countryOfOrigin: initialDoc?.countryOfOrigin || 'India',
    countryOfFinalDestination: initialDoc?.countryOfFinalDestination || '',
    currency: initialDoc?.currency || 'USD',
    exchangeRate: initialDoc?.exchangeRate || 1.0,
    incoterm: initialDoc?.incoterm || 'FOB',
    incotermRule: initialDoc?.incotermRule || 'FOB',
    incotermVersion: initialDoc?.incotermVersion || 'Incoterms 2020',
    namedPlace: initialDoc?.namedPlace || 'Nhava Sheva (INNSA), India',
    originPort: initialDoc?.originPort || 'Nhava Sheva / JNPT, Mumbai',
    destinationPort: initialDoc?.destinationPort || 'Port of Los Angeles / Long Beach',
    placeOfDelivery: initialDoc?.placeOfDelivery || '',
    finalDestination: initialDoc?.finalDestination || '',
    modeOfTransport: initialDoc?.modeOfTransport || 'Sea',
    shipmentPeriod: initialDoc?.shipmentPeriod || 'Within 21 days of advance receipt',
    estimatedDispatchDate: initialDoc?.estimatedDispatchDate || '',
    partialShipment: initialDoc?.partialShipment ?? true,
    transshipment: initialDoc?.transshipment ?? false,
    packingType: initialDoc?.packingType || 'Standard Sea-worthy Export Pallets',
    marksAndNumbers: initialDoc?.marksAndNumbers || '',
    shippingInstructions: initialDoc?.shippingInstructions || '',
    exportPriceBasis: initialDoc?.exportPriceBasis || 'FOB',
    taxScheme: initialDoc?.taxScheme || 'GST',
    taxType: initialDoc?.taxType || 'zero_rated_export',
    gstTreatment: initialDoc?.gstTreatment || 'zero_rated_lut',
    gstRate: initialDoc?.gstRate || 0,
    lutBondNumber: initialDoc?.lutBondNumber || '',
    taxNotes: initialDoc?.taxNotes || 'Supply meant for export under Bond/LUT without payment of integrated tax.',
    paymentMethod: initialDoc?.paymentMethod || 'TT',
    paymentTerms: initialDoc?.paymentTerms || '30% Advance TT, 70% against Bill of Lading copy',
    advancePercentage: initialDoc?.advancePercentage || 30,
    balancePercentage: initialDoc?.balancePercentage || 70,
    paymentDueDate: initialDoc?.paymentDueDate || '',
    lcDetails: initialDoc?.lcDetails || '',
    ttDetails: initialDoc?.ttDetails || '',
    paymentAgainstBl: initialDoc?.paymentAgainstBl ?? true,
    bankChargesResponsibility: initialDoc?.bankChargesResponsibility || 'buyer',
    latePaymentConditions: initialDoc?.latePaymentConditions || '',
    otherPaymentTerms: initialDoc?.otherPaymentTerms || '',
    deliveryTime: initialDoc?.deliveryTime || 'Within 21 days from order confirmation',
    deliverySchedule: initialDoc?.deliverySchedule || '',
    shipmentConditions: initialDoc?.shipmentConditions || '',
    packagingConditions: initialDoc?.packagingConditions || '',
    qualityStandards: initialDoc?.qualityStandards || '',
    inspectionRequirements: initialDoc?.inspectionRequirements || 'Pre-shipment inspection by buyer / authorized agency',
    sampleApproval: initialDoc?.sampleApproval || '',
    certificateRequirements: initialDoc?.certificateRequirements || 'Certificate of Origin, Packing List, Commercial Invoice, Inspection Report',
    insuranceConditions: initialDoc?.insuranceConditions || '',
    forceMajeure: initialDoc?.forceMajeure || 'Standard ICC Force Majeure clause applies.',
    claimsAndDisputes: initialDoc?.claimsAndDisputes || 'Claims must be lodged within 14 days of goods arrival at destination port.',
    arbitrationJurisdiction: initialDoc?.arbitrationJurisdiction || 'International Chamber of Commerce (ICC) arbitration rules apply.',
    warrantyTermsText: initialDoc?.warrantyTermsText || 'Standard 12 months manufacturer warranty against manufacturing defects.',
    quotationValidityTerms: initialDoc?.quotationValidityTerms || 'Prices firm for acceptance within 30 days from date of quotation.',
    cancellationConditions: initialDoc?.cancellationConditions || '',
    exporterDeclaration:
      initialDoc?.exporterDeclaration ||
      'We declare that this quotation shows the actual prices of the goods described and that all particulars are true and correct.',
    authorizedSignatoryName: initialDoc?.authorizedSignatoryName || '',
    signatoryDesignation: initialDoc?.signatoryDesignation || '',
    authorizedSignatureUrl: initialDoc?.authorizedSignatureUrl || '',
    companyStampUrl: initialDoc?.companyStampUrl || '',
    showBuyerAcceptance: initialDoc?.showBuyerAcceptance ?? false,
    acceptanceRemarks: initialDoc?.acceptanceRemarks || '',
    showBankDetails: initialDoc?.showBankDetails ?? false,
    showPanGstinIec: initialDoc?.showPanGstinIec ?? true,
    showCompanyStamp: initialDoc?.showCompanyStamp ?? true,
    showSignature: initialDoc?.showSignature ?? true,
    overallDiscountPercentage: initialDoc?.overallDiscountPercentage || 0,
    overallDiscountAmount: initialDoc?.overallDiscountAmount || 0,
    packingCharges: initialDoc?.packingCharges || 0,
    inlandTransportCharges: initialDoc?.inlandTransportCharges || 0,
    customsClearanceCharges: initialDoc?.customsClearanceCharges || 0,
    documentationCharges: initialDoc?.documentationCharges || 0,
    portHandlingCharges: initialDoc?.portHandlingCharges || 0,
    freightCharges: initialDoc?.freightCharges || 0,
    insuranceCharges: initialDoc?.insuranceCharges || 0,
    inspectionCharges: initialDoc?.inspectionCharges || 0,
    otherCharges: initialDoc?.otherCharges || 0,
    templateId: initialDoc?.templateId || 'premium-international',
    brandingSettings: initialDoc?.brandingSettings || {
      logoPosition: 'left',
      primaryColor: '#10243A',
      secondaryColor: '#2563EB',
      fontFamily: 'inter',
      tableDesign: 'striped',
    },
    notes: initialDoc?.notes || '',
    termsAndConditions:
      initialDoc?.termsAndConditions ||
      '1. Goods are shipped in sea-worthy export standard packaging.\n2. Force Majeure conditions apply.\n3. Inspection by SGS / buyer appointed agency at loading port.\n4. Dispute jurisdiction subject to international arbitration.',
    status: initialDoc?.status || 'draft',
    isLocked: initialDoc?.isLocked || false,
    items: initialDoc?.items || [
      {
        id: 'item_1',
        itemNumber: 1,
        productName: 'Sample Export Grade Precision Bearings',
        description: 'Engineered chrome steel precision bearings model 6204-2RS',
        specifications: 'ISO 9001 certified, C3 clearance, rubber sealed both sides',
        category: 'Machinery Components',
        sku: 'BRG-6204-2RS',
        brand: 'Benzwell Precision',
        modelGrade: 'Grade ABEC-5',
        countryOfOrigin: 'India',
        hsCode: '8482.10.20',
        quantity: 1000,
        unit: 'PCS',
        unitPrice: 3.5,
        discountPercentage: 0,
        discountAmount: 0,
        taxRate: 0,
        taxAmount: 0,
        lineTotal: 3500,
        packageCount: 10,
        packageType: 'Cartons',
        netWeight: 120,
        grossWeight: 135,
      },
    ],
    sellerDetails: initialDoc?.sellerDetails || {},
  });

  // Load Initial Metadata (Buyers, Products, Settings)
  useEffect(() => {
    async function loadMeta() {
      try {
        const [bRes, pRes, sRes, sigRes] = await Promise.all([
          fetch('/api/buyers'),
          fetch('/api/products'),
          fetch('/api/settings'),
          fetch('/api/signatures'),
        ]);

        if (sigRes.ok) {
          const sigData = await sigRes.json();
          if (sigData.signatures) {
            setAvailableSignatures(sigData.signatures);
            if (!initialDoc?.authorizedSignatureUrl && sigData.signatures.length > 0) {
              const active = sigData.signatures.find((s: any) => s.isActive) || sigData.signatures[0];
              setDocData((prev: any) => ({
                ...prev,
                authorizedSignatureUrl: active.processedPngUrl,
                authorizedSignatoryName: prev.authorizedSignatoryName || active.signatoryName,
                signatoryDesignation: prev.signatoryDesignation || active.designation,
              }));
            }
          }
        }

        if (bRes.ok) {
          const bData = await bRes.json();
          setBuyers(bData.buyers || []);
        }
        if (pRes.ok) {
          const pData = await pRes.json();
          setProducts(pData.products || []);
        }
        if (sRes.ok) {
          const sData = await sRes.json();
          const profile = sData.profile || {};
          setCompanyProfile(profile);

          // Auto-fill exporter details if new document
          if (!initialDoc?.id) {
            setDocData((prev: any) => ({
              ...prev,
              sellerDetails: {
                ...profile,
                ...prev.sellerDetails,
              },
              authorizedSignatoryName: prev.authorizedSignatoryName || profile.primaryContactName || '',
              signatoryDesignation: prev.signatoryDesignation || profile.designation || 'Export Manager',
              authorizedSignatureUrl: profile.authorizedSignatureUrl || prev.authorizedSignatureUrl,
              companyStampUrl: profile.companyStampUrl || prev.companyStampUrl,
              documentNumber: prev.documentNumber || `QT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
            }));
          }
        }
      } catch (err) {
        console.error('Error loading metadata in DocumentEditor:', err);
      }
    }
    loadMeta();
  }, [initialDoc]);

  // Recalculate line totals and document grand total
  const calculatedTotals = React.useMemo(() => {
    let subtotal = 0;
    let productDiscountsTotal = 0;

    const recalculatedItems = (docData.items || []).map((item: DocumentItem, index: number) => {
      const qty = Number(item.quantity) || 0;
      const rate = Number(item.unitPrice) || 0;
      const discPct = Number(item.discountPercentage) || 0;

      const gross = safeMul(qty, rate);
      const discAmt = discPct > 0 ? roundToTwo((gross * discPct) / 100) : 0;
      const lineTotal = roundToTwo(gross - discAmt);

      subtotal = safeAdd(subtotal, lineTotal);
      productDiscountsTotal = safeAdd(productDiscountsTotal, discAmt);

      return {
        ...item,
        itemNumber: index + 1,
        discountAmount: discAmt,
        lineTotal,
      };
    });

    // Overall discount
    let overallDiscountAmount = Number(docData.overallDiscountAmount) || 0;
    if (docData.overallDiscountPercentage && docData.overallDiscountPercentage > 0) {
      overallDiscountAmount = roundToTwo((subtotal * docData.overallDiscountPercentage) / 100);
    }
    const totalDiscounts = safeAdd(productDiscountsTotal, overallDiscountAmount);

    // Sum additional charges
    const extraCharges = safeAdd(
      Number(docData.packingCharges) || 0,
      safeAdd(
        Number(docData.inlandTransportCharges) || 0,
        safeAdd(
          Number(docData.customsClearanceCharges) || 0,
          safeAdd(
            Number(docData.documentationCharges) || 0,
            safeAdd(
              Number(docData.portHandlingCharges) || 0,
              safeAdd(
                Number(docData.freightCharges) || 0,
                safeAdd(
                  Number(docData.insuranceCharges) || 0,
                  safeAdd(Number(docData.inspectionCharges) || 0, Number(docData.otherCharges) || 0)
                )
              )
            )
          )
        )
      )
    );

    const taxableAmount = Math.max(0, subtotal - overallDiscountAmount + extraCharges);

    // Taxes
    let taxTotal = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (docData.gstTreatment === 'igst_paid' || docData.taxType === 'igst_export') {
      const rate = Number(docData.gstRate) || 18;
      taxTotal = roundToTwo((taxableAmount * rate) / 100);
      igst = taxTotal;
    } else if (docData.gstTreatment === 'domestic_gst') {
      const rate = Number(docData.gstRate) || 18;
      taxTotal = roundToTwo((taxableAmount * rate) / 100);
      cgst = roundToTwo(taxTotal / 2);
      sgst = roundToTwo(taxTotal / 2);
    } // Zero-rated LUT has taxTotal = 0

    const grandTotal = roundToTwo(taxableAmount + taxTotal);
    const amountInWords = numberToWords(Math.round(grandTotal), docData.currency);

    return {
      items: recalculatedItems,
      subtotal,
      productDiscountsTotal,
      overallDiscountAmount,
      totalDiscounts,
      extraCharges,
      taxableAmount,
      taxTotal,
      cgst,
      sgst,
      igst,
      grandTotal,
      amountInWords,
    };
  }, [
    docData.items,
    docData.overallDiscountPercentage,
    docData.overallDiscountAmount,
    docData.packingCharges,
    docData.inlandTransportCharges,
    docData.customsClearanceCharges,
    docData.documentationCharges,
    docData.portHandlingCharges,
    docData.freightCharges,
    docData.insuranceCharges,
    docData.inspectionCharges,
    docData.otherCharges,
    docData.gstTreatment,
    docData.taxType,
    docData.gstRate,
    docData.currency,
  ]);

  // Completion score calculation
  const completionScore = React.useMemo(() => {
    let requiredTotal = 4;
    let requiredDone = 0;
    if (docData.documentNumber) requiredDone++;
    if (docData.buyerCompany) requiredDone++;
    if (docData.items?.length > 0 && docData.items[0].productName) requiredDone++;
    if (docData.currency) requiredDone++;

    let recommendedTotal = 6;
    let recommendedDone = 0;
    if (docData.namedPlace || docData.originPort) recommendedDone++;
    if (docData.destinationPort) recommendedDone++;
    if (docData.paymentTerms) recommendedDone++;
    if (docData.validityDate) recommendedDone++;
    if (docData.sellerDetails?.iec || docData.sellerDetails?.gstin) recommendedDone++;
    if (docData.sellerDetails?.bankName) recommendedDone++;

    const reqPct = Math.round((requiredDone / requiredTotal) * 100);
    const recPct = Math.round((recommendedDone / recommendedTotal) * 100);

    return {
      reqPct,
      recPct,
      isReadyToIssue: reqPct === 100,
    };
  }, [docData]);

  // Handle Buyer Selection from CRM
  const handleBuyerSelect = (buyerId: string) => {
    const selected = buyers.find((b) => b.id === buyerId);
    if (!selected) return;
    setDocData((prev: any) => ({
      ...prev,
      buyerId: selected.id,
      buyerCompany: selected.companyName,
      buyerContactPerson: selected.contactPerson,
      buyerEmail: selected.email,
      buyerPhone: selected.phone,
      buyerCountry: selected.country,
      buyerCity: selected.city,
      buyerBillingAddress: selected.billingAddress,
      buyerShippingAddress: selected.shippingAddress,
      buyerTaxId: selected.taxId || prev.buyerTaxId,
      consigneeName: prev.consigneeName || selected.companyName,
      consigneeAddress: prev.consigneeAddress || selected.shippingAddress,
    }));
  };

  // Handle Product Selection into Row
  const handleProductSelect = (index: number, productId: string) => {
    const p = products.find((prod) => prod.id === productId);
    if (!p) return;
    const newItems = [...docData.items];
    newItems[index] = {
      ...newItems[index],
      productId: p.id,
      productName: p.name,
      description: p.description || '',
      specifications: p.specifications || '',
      hsCode: p.hsCode || '',
      unit: p.unit || 'PCS',
      unitPrice: p.sellingPrice || 0,
      sku: p.sku || '',
      category: p.category || '',
      countryOfOrigin: p.countryOfOrigin || docData.countryOfOrigin || 'India',
      netWeight: p.netWeight || 0,
      grossWeight: p.grossWeight || 0,
    };
    setDocData({ ...docData, items: newItems });
  };

  // Item Row Operations
  const handleAddItem = () => {
    const nextIdx = docData.items.length + 1;
    const newItem: DocumentItem = {
      id: `item_${Date.now()}_${nextIdx}`,
      itemNumber: nextIdx,
      productName: '',
      description: '',
      specifications: '',
      hsCode: '',
      quantity: 1,
      unit: 'PCS',
      unitPrice: 0,
      discountPercentage: 0,
      discountAmount: 0,
      taxRate: 0,
      taxAmount: 0,
      lineTotal: 0,
    };
    setDocData({ ...docData, items: [...docData.items, newItem] });
  };

  const handleRemoveItem = (index: number) => {
    if (docData.items.length <= 1) return;
    const newItems = docData.items.filter((_: any, i: number) => i !== index);
    setDocData({ ...docData, items: newItems });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...docData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setDocData({ ...docData, items: newItems });
  };

  // AI Assistant Change Handler with Undo Tracking
  const handleApplyAiChanges = (changes: Partial<BaseDocument>) => {
    setHistory((prev) => [...prev, docData]); // save current to history
    setDocData((prev: any) => ({
      ...prev,
      ...changes,
      brandingSettings: {
        ...prev.brandingSettings,
        ...(changes.brandingSettings || {}),
      },
      sellerDetails: {
        ...prev.sellerDetails,
        ...(changes.sellerDetails || {}),
      },
    }));
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setDocData(previous);
  };

  // Save / Issue Handler
  const handleSave = async (targetStatus: 'draft' | 'sent') => {
    setIsSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const payload: BaseDocument = {
        ...docData,
        ...calculatedTotals,
        status: targetStatus,
        isLocked: targetStatus === 'sent',
      };

      const url = initialDoc?.id ? `/api/documents/${initialDoc.id}` : '/api/documents';
      const method = initialDoc?.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save quotation');
      }

      setSuccessMsg(
        targetStatus === 'sent'
          ? 'Quotation finalized and officially issued!'
          : 'Quotation draft saved successfully.'
      );

      if (!initialDoc?.id && data.document?.id) {
        router.push(`/dashboard/quotations/${data.document.id}`);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Error saving quotation');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Instant Direct PDF Download (Client or Server Vector Streaming)
  const handleDirectPdfDownload = async () => {
    const previewDoc: BaseDocument = {
      ...docData,
      ...calculatedTotals,
      sellerDetails: {
        ...companyProfile,
        ...docData.sellerDetails,
      },
    };
    await downloadDocumentPdf(previewDoc);
  };

  // Full Preview Doc Object
  const previewDoc: BaseDocument = {
    ...docData,
    ...calculatedTotals,
    sellerDetails: {
      ...companyProfile,
      ...docData.sellerDetails,
    },
  };

  return (
    <div className="space-y-6">
      {/* Top Floating Command & Action Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#10243A] text-white flex items-center justify-center font-bold text-sm">
            QT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#172033]">
                {docData.documentNumber || 'New Export Quotation'}
              </h1>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  docData.status === 'sent'
                    ? 'bg-emerald-100 text-emerald-800'
                    : docData.status === 'accepted'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {docData.status}
              </span>
              {docData.revisionNumber > 1 && (
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono font-bold">
                  Rev #{docData.revisionNumber}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {docData.buyerCompany || 'Customer Not Selected'} • {docData.currency} {calculatedTotals.grandTotal.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Completion Progress Indicator */}
        <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <div>
            <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500 font-semibold uppercase">
              <span>Required: {completionScore.reqPct}%</span>
              <span>Recommended: {completionScore.recPct}%</span>
            </div>
            <div className="w-36 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1 flex">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${completionScore.reqPct * 0.6 + completionScore.recPct * 0.4}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* AI Assistant Trigger Button */}
          <Button
            size="sm"
            onClick={() => setIsAiOpen(true)}
            className="bg-amber-500/10 border border-amber-500/40 text-amber-700 hover:bg-amber-500/20 gap-1.5 text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>AI Assistant</span>
          </Button>

          {/* Direct PDF Vector Download */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleDirectPdfDownload}
            className="gap-1.5 border-slate-300 text-slate-700 text-xs font-medium"
            title="Download pure A4 PDF document without website chrome"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </Button>

          {/* Form vs Preview Tab Switcher */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'edit' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Document Form
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'preview' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Live Preview
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSave('draft')}
            disabled={isSubmitting}
            className="text-xs"
          >
            <Save className="w-3.5 h-3.5 mr-1" />
            Save Draft
          </Button>

          <Button
            size="sm"
            onClick={() => handleSave('sent')}
            disabled={isSubmitting || !completionScore.isReadyToIssue}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-xs"
          >
            <FileCheck className="w-3.5 h-3.5 mr-1" />
            Finalize & Issue
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* FORM TAB */}
      {activeTab === 'edit' && (
        <div className="space-y-6">
          {/* SECTION A: EXPORTER INFORMATION & CONFIDENTIALITY TOGGLES */}
          <Card>
            <CardHeader
              className="cursor-pointer hover:bg-slate-50/50 transition-colors py-4 flex flex-row items-center justify-between"
              onClick={() => toggleSection('exporter')}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-blue-600" />
                <div>
                  <CardTitle className="text-base">Section A — Exporter Information & Branding</CardTitle>
                  <p className="text-xs text-slate-500">Auto-populated from company profile with privacy controls</p>
                </div>
              </div>
              <div className="text-slate-400">
                {collapsed.exporter ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </div>
            </CardHeader>

            {!collapsed.exporter && (
              <CardContent className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Legal Company Name *"
                    value={docData.sellerDetails?.legalName || ''}
                    onChange={(e) =>
                      setDocData({
                        ...docData,
                        sellerDetails: { ...docData.sellerDetails, legalName: e.target.value },
                      })
                    }
                  />
                  <Input
                    label="Brand / Trading Name"
                    value={docData.sellerDetails?.tradingName || ''}
                    onChange={(e) =>
                      setDocData({
                        ...docData,
                        sellerDetails: { ...docData.sellerDetails, tradingName: e.target.value },
                      })
                    }
                  />
                  <Input
                    label="Country of Origin *"
                    value={docData.countryOfOrigin || 'India'}
                    onChange={(e) => setDocData({ ...docData, countryOfOrigin: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Textarea
                    label="Registered Office Address"
                    rows={2}
                    value={docData.sellerDetails?.registeredAddress || ''}
                    onChange={(e) =>
                      setDocData({
                        ...docData,
                        sellerDetails: { ...docData.sellerDetails, registeredAddress: e.target.value },
                      })
                    }
                  />
                  <Textarea
                    label="Factory / Manufacturing Address (Optional)"
                    rows={2}
                    value={docData.sellerDetails?.factoryAddress || ''}
                    onChange={(e) =>
                      setDocData({
                        ...docData,
                        sellerDetails: { ...docData.sellerDetails, factoryAddress: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <Input
                    label="IEC Code"
                    value={docData.sellerDetails?.iec || ''}
                    onChange={(e) =>
                      setDocData({
                        ...docData,
                        sellerDetails: { ...docData.sellerDetails, iec: e.target.value },
                      })
                    }
                  />
                  <Input
                    label="GSTIN"
                    value={docData.sellerDetails?.gstin || ''}
                    onChange={(e) =>
                      setDocData({
                        ...docData,
                        sellerDetails: { ...docData.sellerDetails, gstin: e.target.value },
                      })
                    }
                  />
                  <Input
                    label="PAN"
                    value={docData.sellerDetails?.pan || ''}
                    onChange={(e) =>
                      setDocData({
                        ...docData,
                        sellerDetails: { ...docData.sellerDetails, pan: e.target.value },
                      })
                    }
                  />
                  <Input
                    label="AD Code"
                    value={docData.sellerDetails?.adCode || ''}
                    onChange={(e) =>
                      setDocData({
                        ...docData,
                        sellerDetails: { ...docData.sellerDetails, adCode: e.target.value },
                      })
                    }
                  />
                </div>

                {/* Privacy & Display Toggles */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center gap-6 text-xs text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={docData.showPanGstinIec !== false}
                      onChange={(e) => setDocData({ ...docData, showPanGstinIec: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    <span>Display IEC, GSTIN & PAN on quotation</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-blue-900">
                    <input
                      type="checkbox"
                      checked={docData.showBankDetails === true}
                      onChange={(e) => setDocData({ ...docData, showBankDetails: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    <span>Include Bank Wire Transfer Details (Keep unchecked for secrecy)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={docData.showCompanyStamp !== false}
                      onChange={(e) => setDocData({ ...docData, showCompanyStamp: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    <span>Include Authorized Signatory & Stamp</span>
                  </label>
                </div>
              </CardContent>
            )}
          </Card>

          {/* SECTION B: QUOTATION METADATA */}
          <Card>
            <CardHeader
              className="cursor-pointer hover:bg-slate-50/50 transition-colors py-4 flex flex-row items-center justify-between"
              onClick={() => toggleSection('quotation')}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <CardTitle className="text-base">Section B — Quotation Information</CardTitle>
                  <p className="text-xs text-slate-500">Document numbering, dates, and inquiry references</p>
                </div>
              </div>
              <div className="text-slate-400">
                {collapsed.quotation ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </div>
            </CardHeader>

            {!collapsed.quotation && (
              <CardContent className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <Input
                    label="Quotation Number *"
                    value={docData.documentNumber}
                    onChange={(e) => setDocData({ ...docData, documentNumber: e.target.value })}
                  />
                  <Input
                    label="Quotation Date *"
                    type="date"
                    value={docData.date}
                    onChange={(e) => setDocData({ ...docData, date: e.target.value })}
                  />
                  <Input
                    label="Valid Until Date *"
                    type="date"
                    value={docData.validityDate}
                    onChange={(e) => setDocData({ ...docData, validityDate: e.target.value })}
                  />
                  <Input
                    label="Revision Number"
                    type="number"
                    value={docData.revisionNumber}
                    onChange={(e) => setDocData({ ...docData, revisionNumber: Number(e.target.value) })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Buyer Inquiry / RFQ Ref"
                    placeholder="e.g. RFQ-DE-8821"
                    value={docData.inquiryReference}
                    onChange={(e) => setDocData({ ...docData, inquiryReference: e.target.value })}
                  />
                  <Input
                    label="Buyer Purchase Order Ref (if any)"
                    placeholder="e.g. PO-99120"
                    value={docData.buyerPoReference}
                    onChange={(e) => setDocData({ ...docData, buyerPoReference: e.target.value })}
                  />
                  <Input
                    label="Prepared By / Salesperson"
                    placeholder="e.g. Rahul Sharma"
                    value={docData.preparedBy}
                    onChange={(e) => setDocData({ ...docData, preparedBy: e.target.value })}
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* SECTION C: BUYER & CONSIGNEE INFORMATION */}
          <Card>
            <CardHeader
              className="cursor-pointer hover:bg-slate-50/50 transition-colors py-4 flex flex-row items-center justify-between"
              onClick={() => toggleSection('buyer')}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <CardTitle className="text-base">Section C — Buyer & Consignee Information</CardTitle>
                  <p className="text-xs text-slate-500">Select saved buyer or enter international consignee</p>
                </div>
              </div>
              <div className="text-slate-400">
                {collapsed.buyer ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </div>
            </CardHeader>

            {!collapsed.buyer && (
              <CardContent className="space-y-4 pt-2">
                {buyers.length > 0 && (
                  <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200">
                    <label className="text-xs font-bold text-blue-900 block mb-1">
                      Quick Fill from Buyer CRM:
                    </label>
                    <Select
                      value={docData.buyerId}
                      onChange={(e) => handleBuyerSelect(e.target.value)}
                      className="text-xs bg-white"
                    >
                      <option value="">-- Choose existing buyer --</option>
                      {buyers.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.companyName} ({b.country}) — {b.contactPerson}
                        </option>
                      ))}
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Buyer Legal Company Name *"
                    value={docData.buyerCompany}
                    onChange={(e) => setDocData({ ...docData, buyerCompany: e.target.value })}
                  />
                  <Input
                    label="Contact Person *"
                    value={docData.buyerContactPerson}
                    onChange={(e) => setDocData({ ...docData, buyerContactPerson: e.target.value })}
                  />
                  <Input
                    label="Designation / Department"
                    placeholder="e.g. Head of Procurement"
                    value={docData.buyerDesignation}
                    onChange={(e) => setDocData({ ...docData, buyerDesignation: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Email Address *"
                    type="email"
                    value={docData.buyerEmail}
                    onChange={(e) => setDocData({ ...docData, buyerEmail: e.target.value })}
                  />
                  <Input
                    label="Phone Number"
                    value={docData.buyerPhone}
                    onChange={(e) => setDocData({ ...docData, buyerPhone: e.target.value })}
                  />
                  <Input
                    label="Tax ID / VAT Registration Number"
                    placeholder="e.g. VAT DE998877665"
                    value={docData.buyerTaxId}
                    onChange={(e) => setDocData({ ...docData, buyerTaxId: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Textarea
                    label="Buyer Billing Address"
                    rows={2}
                    value={docData.buyerBillingAddress}
                    onChange={(e) => setDocData({ ...docData, buyerBillingAddress: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Destination Country *"
                      value={docData.buyerCountry}
                      onChange={(e) => setDocData({ ...docData, buyerCountry: e.target.value })}
                    />
                    <Input
                      label="City / Port"
                      value={docData.buyerCity}
                      onChange={(e) => setDocData({ ...docData, buyerCity: e.target.value })}
                    />
                  </div>
                </div>

                {/* Independent Consignee / Ship-To Configuration */}
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700">Separate Consignee & Notify Party</span>
                    <span className="text-[10px] text-slate-400">Optional if different from buyer</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Consignee Company Name"
                      placeholder="Leave blank if same as buyer"
                      value={docData.consigneeName}
                      onChange={(e) => setDocData({ ...docData, consigneeName: e.target.value })}
                    />
                    <Input
                      label="Notify Party"
                      placeholder="e.g. Customs Broker / Forwarder"
                      value={docData.notifyParty}
                      onChange={(e) => setDocData({ ...docData, notifyParty: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* SECTION D: SHIPMENT AND TRADE INFORMATION */}
          <Card>
            <CardHeader
              className="cursor-pointer hover:bg-slate-50/50 transition-colors py-4 flex flex-row items-center justify-between"
              onClick={() => toggleSection('shipment')}
            >
              <div className="flex items-center gap-2.5">
                <Ship className="w-5 h-5 text-blue-600" />
                <div>
                  <CardTitle className="text-base">Section D — Shipment & Incoterms 2020</CardTitle>
                  <p className="text-xs text-slate-500">Incoterms rule with mandatory named place and transport mode</p>
                </div>
              </div>
              <div className="text-slate-400">
                {collapsed.shipment ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </div>
            </CardHeader>

            {!collapsed.shipment && (
              <CardContent className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Select
                    label="Incoterms 2020 Rule *"
                    value={docData.incoterm}
                    onChange={(e) => {
                      const rule = e.target.value;
                      setDocData({
                        ...docData,
                        incoterm: rule,
                        incotermRule: rule,
                      });
                    }}
                  >
                    {INCOTERMS_2020.map((term) => (
                      <option key={term.code} value={term.code}>
                        {term.code} — {term.name}
                      </option>
                    ))}
                  </Select>

                  <Input
                    label="Named Port / Place / Point *"
                    placeholder="e.g. Nhava Sheva (INNSA), India"
                    value={docData.namedPlace}
                    onChange={(e) => setDocData({ ...docData, namedPlace: e.target.value })}
                  />

                  <Select
                    label="Mode of Transport *"
                    value={docData.modeOfTransport}
                    onChange={(e) => setDocData({ ...docData, modeOfTransport: e.target.value })}
                  >
                    <option value="Sea">Sea Freight (Ocean Vessel)</option>
                    <option value="Air">Air Freight</option>
                    <option value="Road">Road Transportation</option>
                    <option value="Rail">Rail Freight</option>
                    <option value="Courier">Express Courier (DHL/FedEx)</option>
                  </Select>
                </div>

                {/* Contextual Incoterm Guidance Box */}
                <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-xs text-slate-700 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-blue-900">
                      {docData.incoterm} — {INCOTERMS_2020.find((t) => t.code === docData.incoterm)?.name} (Incoterms 2020)
                    </span>
                    <p className="text-slate-600 mt-0.5">
                      {INCOTERMS_2020.find((t) => t.code === docData.incoterm)?.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Port of Loading (POL)"
                    placeholder="e.g. Nhava Sheva / JNPT, Mumbai"
                    value={docData.originPort}
                    onChange={(e) => setDocData({ ...docData, originPort: e.target.value })}
                  />
                  <Input
                    label="Port of Discharge (POD)"
                    placeholder="e.g. Port of Rotterdam / Hamburg"
                    value={docData.destinationPort}
                    onChange={(e) => setDocData({ ...docData, destinationPort: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Shipment Period"
                    placeholder="e.g. Within 21 days of advance receipt"
                    value={docData.shipmentPeriod}
                    onChange={(e) => setDocData({ ...docData, shipmentPeriod: e.target.value })}
                  />
                  <Select
                    label="Partial Shipment"
                    value={docData.partialShipment ? 'true' : 'false'}
                    onChange={(e) => setDocData({ ...docData, partialShipment: e.target.value === 'true' })}
                  >
                    <option value="true">Allowed</option>
                    <option value="false">Not Allowed</option>
                  </Select>
                  <Select
                    label="Transshipment"
                    value={docData.transshipment ? 'true' : 'false'}
                    onChange={(e) => setDocData({ ...docData, transshipment: e.target.value === 'true' })}
                  >
                    <option value="false">Not Allowed</option>
                    <option value="true">Allowed</option>
                  </Select>
                </div>
              </CardContent>
            )}
          </Card>

          {/* SECTION E: PRODUCT / GOODS INFORMATION */}
          <Card>
            <CardHeader
              className="cursor-pointer hover:bg-slate-50/50 transition-colors py-4 flex flex-row items-center justify-between"
              onClick={() => toggleSection('products')}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-blue-600" />
                <div>
                  <CardTitle className="text-base">Section E — Product Line Items ({docData.items?.length || 0})</CardTitle>
                  <p className="text-xs text-slate-500">Unlimited item rows with technical specs, HS codes and weights</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddItem();
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs h-7 gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Product
                </Button>
                <div className="text-slate-400">
                  {collapsed.products ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                </div>
              </div>
            </CardHeader>

            {!collapsed.products && (
              <CardContent className="space-y-4 pt-2">
                {docData.items.map((item: any, idx: number) => (
                  <div key={item.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#10243A] text-white flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {item.productName || `Item #${idx + 1}`}
                        </span>
                      </div>

                      {products.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500">Import:</span>
                          <Select
                            value={item.productId || ''}
                            onChange={(e) => handleProductSelect(idx, e.target.value)}
                            className="text-xs h-7 py-0 bg-white"
                          >
                            <option value="">Select from Catalog</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.sku})
                              </option>
                            ))}
                          </Select>
                        </div>
                      )}

                      {docData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1 text-xs"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-2">
                        <Input
                          label="Product Name *"
                          value={item.productName}
                          onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                        />
                      </div>
                      <Input
                        label="HS Code / ITC-HS *"
                        placeholder="e.g. 8482.10.20"
                        value={item.hsCode}
                        onChange={(e) => handleItemChange(idx, 'hsCode', e.target.value)}
                      />
                      <Input
                        label="SKU / Part Code"
                        placeholder="e.g. BRG-6204"
                        value={item.sku || ''}
                        onChange={(e) => handleItemChange(idx, 'sku', e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <Input
                        label="Quantity *"
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                      />
                      <Select
                        label="Unit of Measurement *"
                        value={item.unit}
                        onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                      >
                        {EXPORT_UNITS.map((u) => (
                          <option key={u.code} value={u.code}>
                            {u.code} — {u.name}
                          </option>
                        ))}
                      </Select>
                      <Input
                        label={`Unit Rate (${docData.currency}) *`}
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                      />
                      <Input
                        label="Discount %"
                        type="number"
                        min="0"
                        max="100"
                        value={item.discountPercentage || 0}
                        onChange={(e) => handleItemChange(idx, 'discountPercentage', Number(e.target.value))}
                      />
                    </div>

                    <Textarea
                      label="Technical Specifications & Export Grade Details"
                      rows={2}
                      placeholder="Grade, tolerances, finish, test certificates, packaging specs..."
                      value={item.specifications || ''}
                      onChange={(e) => handleItemChange(idx, 'specifications', e.target.value)}
                    />

                    <div className="flex justify-between items-center text-xs font-semibold text-slate-700 pt-1 border-t border-slate-200">
                      <span className="text-slate-500 font-normal">
                        Package: {item.packageCount || 1} {item.packageType || 'Packages'} • Net: {item.netWeight || 0} Kg
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        Line Total: {docData.currency} {formatCurrency(item.lineTotal || 0, docData.currency, false)}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>

          {/* SECTION F: PRICING AND CHARGES BREAKDOWN */}
          <Card>
            <CardHeader
              className="cursor-pointer hover:bg-slate-50/50 transition-colors py-4 flex flex-row items-center justify-between"
              onClick={() => toggleSection('pricing')}
            >
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <div>
                  <CardTitle className="text-base">Section F — Pricing, Commercial Charges & Currency</CardTitle>
                  <p className="text-xs text-slate-500">Freight, insurance, handling and decimal-safe calculations</p>
                </div>
              </div>
              <div className="text-slate-400">
                {collapsed.pricing ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </div>
            </CardHeader>

            {!collapsed.pricing && (
              <CardContent className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Select
                    label="Transaction Currency *"
                    value={docData.currency}
                    onChange={(e) => setDocData({ ...docData, currency: e.target.value })}
                  >
                    {SUPPORTED_CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.symbol}) — {c.name}
                      </option>
                    ))}
                  </Select>

                  <Input
                    label="Overall Quotation Discount %"
                    type="number"
                    min="0"
                    max="100"
                    value={docData.overallDiscountPercentage || 0}
                    onChange={(e) => setDocData({ ...docData, overallDiscountPercentage: Number(e.target.value) })}
                  />

                  <Input
                    label="Ocean / Air Freight Charges"
                    type="number"
                    value={docData.freightCharges || 0}
                    onChange={(e) => setDocData({ ...docData, freightCharges: Number(e.target.value) })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <Input
                    label="Transit Insurance Charges"
                    type="number"
                    value={docData.insuranceCharges || 0}
                    onChange={(e) => setDocData({ ...docData, insuranceCharges: Number(e.target.value) })}
                  />
                  <Input
                    label="Packing / Palletization"
                    type="number"
                    value={docData.packingCharges || 0}
                    onChange={(e) => setDocData({ ...docData, packingCharges: Number(e.target.value) })}
                  />
                  <Input
                    label="Inland Transport / Cartage"
                    type="number"
                    value={docData.inlandTransportCharges || 0}
                    onChange={(e) => setDocData({ ...docData, inlandTransportCharges: Number(e.target.value) })}
                  />
                  <Input
                    label="Inspection / SGS Charges"
                    type="number"
                    value={docData.inspectionCharges || 0}
                    onChange={(e) => setDocData({ ...docData, inspectionCharges: Number(e.target.value) })}
                  />
                </div>

                {/* Real-time Financial Summary Box */}
                <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Grand Total</span>
                    <div className="text-2xl font-black text-emerald-400">
                      {docData.currency} {formatCurrency(calculatedTotals.grandTotal, docData.currency, false)}
                    </div>
                    <span className="text-xs text-slate-300 italic">{calculatedTotals.amountInWords}</span>
                  </div>
                  <div className="text-right text-xs text-slate-300 space-y-1">
                    <div>Product Subtotal: {docData.currency} {formatCurrency(calculatedTotals.subtotal, docData.currency, false)}</div>
                    <div>Additional Charges: {docData.currency} {formatCurrency(calculatedTotals.extraCharges, docData.currency, false)}</div>
                    <div>Total Deductions: -{docData.currency} {formatCurrency(calculatedTotals.totalDiscounts, docData.currency, false)}</div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* SECTION G & H: TAX & PAYMENT TERMS */}
          <Card>
            <CardHeader
              className="cursor-pointer hover:bg-slate-50/50 transition-colors py-4 flex flex-row items-center justify-between"
              onClick={() => toggleSection('payment')}
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <div>
                  <CardTitle className="text-base">Section G & H — Tax Treatment & Payment Terms</CardTitle>
                  <p className="text-xs text-slate-500">Zero-rated LUT export, advance/balance split, and wire instructions</p>
                </div>
              </div>
              <div className="text-slate-400">
                {collapsed.payment ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </div>
            </CardHeader>

            {!collapsed.payment && (
              <CardContent className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Select
                    label="GST Export Treatment *"
                    value={docData.gstTreatment}
                    onChange={(e) => setDocData({ ...docData, gstTreatment: e.target.value })}
                  >
                    <option value="zero_rated_lut">Zero-Rated Export under LUT / Bond (0% GST)</option>
                    <option value="igst_paid">Export on Payment of IGST (Refundable)</option>
                    <option value="domestic_gst">Domestic GST Applicable</option>
                    <option value="exempt">Exempt / Non-GST Goods</option>
                  </Select>

                  <Input
                    label="LUT / Bond Reference Number"
                    placeholder="e.g. AD270324001234F"
                    value={docData.lutBondNumber}
                    onChange={(e) => setDocData({ ...docData, lutBondNumber: e.target.value })}
                  />

                  <Select
                    label="Payment Method *"
                    value={docData.paymentMethod}
                    onChange={(e) => setDocData({ ...docData, paymentMethod: e.target.value })}
                  >
                    <option value="TT">Telegraphic Transfer (Bank Wire TT)</option>
                    <option value="LC">Irrevocable Letter of Credit (LC at Sight)</option>
                    <option value="DP">Documents Against Payment (DP)</option>
                    <option value="DA">Documents Against Acceptance (DA)</option>
                    <option value="Advance">100% Advance Payment</option>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Advance Payment %"
                    type="number"
                    min="0"
                    max="100"
                    value={docData.advancePercentage}
                    onChange={(e) => {
                      const adv = Number(e.target.value);
                      setDocData({
                        ...docData,
                        advancePercentage: adv,
                        balancePercentage: Math.max(0, 100 - adv),
                      });
                    }}
                  />
                  <Input
                    label="Balance Payment % (Must sum to 100%)"
                    type="number"
                    min="0"
                    max="100"
                    value={docData.balancePercentage}
                    onChange={(e) => setDocData({ ...docData, balancePercentage: Number(e.target.value) })}
                  />
                  <Select
                    label="Bank Charges Responsibility"
                    value={docData.bankChargesResponsibility}
                    onChange={(e) => setDocData({ ...docData, bankChargesResponsibility: e.target.value })}
                  >
                    <option value="buyer">All outside sender bank to Buyer</option>
                    <option value="shared">Shared (71A SHA standard)</option>
                    <option value="seller">Seller pays all charges (OUR)</option>
                  </Select>
                </div>

                <Input
                  label="Commercial Payment Clause (Printed on quotation)"
                  value={docData.paymentTerms}
                  onChange={(e) => setDocData({ ...docData, paymentTerms: e.target.value })}
                />
              </CardContent>
            )}
          </Card>

          {/* SECTION I & J: COMMERCIAL TERMS, DECLARATION & SIGNATURE */}
          <Card>
            <CardHeader
              className="cursor-pointer hover:bg-slate-50/50 transition-colors py-4 flex flex-row items-center justify-between"
              onClick={() => toggleSection('declaration')}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <CardTitle className="text-base">Section I & J — Commercial Terms & Signatures</CardTitle>
                  <p className="text-xs text-slate-500">Dispute resolution, authorized signatory, and buyer acceptance toggle</p>
                </div>
              </div>
              <div className="text-slate-400">
                {collapsed.declaration ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </div>
            </CardHeader>

            {!collapsed.declaration && (
              <CardContent className="space-y-4 pt-2">
                <Textarea
                  label="Terms & Conditions (Printed on Document)"
                  rows={4}
                  value={docData.termsAndConditions}
                  onChange={(e) => setDocData({ ...docData, termsAndConditions: e.target.value })}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Authorized Signatory Name *"
                    value={docData.authorizedSignatoryName}
                    onChange={(e) => setDocData({ ...docData, authorizedSignatoryName: e.target.value })}
                  />
                  <Input
                    label="Signatory Designation"
                    value={docData.signatoryDesignation}
                    onChange={(e) => setDocData({ ...docData, signatoryDesignation: e.target.value })}
                  />
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Include Buyer Acceptance Signature Section</span>
                    <span className="text-[10px] text-slate-500">Adds an acceptance signature box for the importer to sign & stamp</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={docData.showBuyerAcceptance}
                    onChange={(e) => setDocData({ ...docData, showBuyerAcceptance: e.target.checked })}
                    className="rounded text-blue-600 h-4 w-4"
                  />
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Include Transparent Signature & Seal</span>
                      <span className="text-[10px] text-slate-500">Prints your isolated signature/rubber stamp on the export document</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={docData.showSignature}
                      onChange={(e) => setDocData({ ...docData, showSignature: e.target.checked })}
                      className="rounded text-blue-600 h-4 w-4"
                    />
                  </div>

                  {docData.showSignature && availableSignatures.length > 0 && (
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Select Signature Asset from Library
                      </label>
                      <select
                        value={docData.authorizedSignatureUrl}
                        onChange={(e) => {
                          const chosen = availableSignatures.find((s: any) => s.processedPngUrl === e.target.value);
                          setDocData({
                            ...docData,
                            authorizedSignatureUrl: e.target.value,
                            authorizedSignatoryName: chosen?.signatoryName || docData.authorizedSignatoryName,
                            signatoryDesignation: chosen?.designation || docData.signatoryDesignation,
                          });
                        }}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="">-- Choose Signature from Studio --</option>
                        {availableSignatures.map((s: any) => (
                          <option key={s.id} value={s.processedPngUrl}>
                            {s.signatoryName} ({s.designation}) - {s.assetType}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          {/* TEMPLATE & BRANDING STYLING SECTION */}
          <Card>
            <CardHeader
              className="cursor-pointer hover:bg-slate-50/50 transition-colors py-4 flex flex-row items-center justify-between"
              onClick={() => toggleSection('styling')}
            >
              <div className="flex items-center gap-2.5">
                <Palette className="w-5 h-5 text-purple-600" />
                <div>
                  <CardTitle className="text-base">Document Template & Custom Branding</CardTitle>
                  <p className="text-xs text-slate-500">Choose between 5 premium international B2B layouts</p>
                </div>
              </div>
              <div className="text-slate-400">
                {collapsed.styling ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </div>
            </CardHeader>

            {!collapsed.styling && (
              <CardContent className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Selected Quotation Template *"
                    value={docData.templateId}
                    onChange={(e) => setDocData({ ...docData, templateId: e.target.value })}
                  >
                    {DOCUMENT_TEMPLATES.map((tmpl) => (
                      <option key={tmpl.id} value={tmpl.id}>
                        {tmpl.name}
                      </option>
                    ))}
                  </Select>

                  <Select
                    label="Company Logo Alignment"
                    value={docData.brandingSettings?.logoPosition || 'left'}
                    onChange={(e) =>
                      setDocData({
                        ...docData,
                        brandingSettings: { ...docData.brandingSettings, logoPosition: e.target.value },
                      })
                    }
                  >
                    <option value="left">Left Aligned</option>
                    <option value="right">Right Aligned</option>
                  </Select>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}

      {/* PREVIEW TAB */}
      {activeTab === 'preview' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-wrap items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 no-print gap-3 shadow-2xs">
            <div className="text-xs text-slate-600">
              Active Template: <strong>{DOCUMENT_TEMPLATES.find((t) => t.id === docData.templateId)?.name}</strong>
              <span className="text-slate-400 ml-2">| A4 Print-Isolated Format</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleDirectPdfDownload}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => openIsolatedPrintWindow(initialDoc?.id || 'preview', true)}
                className="text-xs text-slate-700"
              >
                Standalone Preview
              </Button>
            </div>
          </div>
          <DocumentRenderer doc={previewDoc} />
        </div>
      )}

      {/* AI Assistant Slide-Over Drawer */}
      <AiQuotationAssistant
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        currentDoc={previewDoc}
        onApplyChanges={handleApplyAiChanges}
        onUndoLastChange={handleUndo}
        canUndo={history.length > 0}
      />
    </div>
  );
}
