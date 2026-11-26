'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calculator,
  FileCheck,
  FileText,
  ShieldCheck,
  ArrowLeft,
  Printer,
  Download,
  Building2,
  Ship,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ChaClient, CustomsJob } from '@/types';

interface WorksheetsStudioProps {
  clients: ChaClient[];
  jobs: CustomsJob[];
  initialTool: string;
  selectedJob: CustomsJob | null;
  chaFirmName: string;
  chaLicenseNumber: string;
}

export function WorksheetsStudio({
  clients,
  jobs,
  initialTool = 'boe',
  selectedJob,
  chaFirmName,
  chaLicenseNumber,
}: WorksheetsStudioProps) {
  const [activeTool, setActiveTool] = useState(initialTool);

  // BoE State
  const [cifAmount, setCifAmount] = useState<number>(selectedJob?.invoiceValue || 25000);
  const [currency, setCurrency] = useState(selectedJob?.currency || 'USD');
  const [exchangeRate, setExchangeRate] = useState<number>(86.5);
  const [bcdRate, setBcdRate] = useState<number>(7.5);
  const [swsRate, setSwsRate] = useState<number>(10); // 10% of BCD
  const [igstRate, setIgstRate] = useState<number>(18);
  const [cessRate, setCessRate] = useState<number>(0);

  // GATT Valuation State
  const [gattData, setGattData] = useState({
    importerName: selectedJob?.clientName || (clients[0]?.companyName || 'Bharat Agrotech Pvt Ltd'),
    supplierName: 'Global Industrial Supplies Ltd (Tokyo, Japan)',
    invoiceNo: selectedJob?.invoiceNumber || 'INV-JPN-2026-99',
    invoiceDate: new Date().toISOString().split('T')[0],
    isRelated: 'no',
    hasRoyalties: 'no',
    hasAssists: 'no',
    valuationMethod: 'Rule 3 - Transaction Value',
  });

  // Shipping Bill State
  const [sbData, setSbData] = useState({
    exporterName: selectedJob?.clientName || (clients[0]?.companyName || 'Bharat Agrotech Pvt Ltd'),
    fobValue: selectedJob?.invoiceValue || 50000,
    sbExchangeRate: 86.5,
    lutNumber: 'AD270425000123M',
    rodtepRate: 1.5,
    goodsDescription: selectedJob?.goodsDescription || 'Precision Machined Stainless Steel Flanges',
    port: selectedJob?.customsStation || 'Nhava Sheva (INNSA1)',
  });

  // Calculations for BoE
  const assessableValueInr = Math.round(cifAmount * exchangeRate);
  const bcdAmount = Math.round(assessableValueInr * (bcdRate / 100));
  const swsAmount = Math.round(bcdAmount * (swsRate / 100));
  const preIgstTotal = assessableValueInr + bcdAmount + swsAmount;
  const igstAmount = Math.round(preIgstTotal * (igstRate / 100));
  const cessAmount = Math.round(preIgstTotal * (cessRate / 100));
  const totalDutyPayable = bcdAmount + swsAmount + igstAmount + cessAmount;
  const totalLandedCost = assessableValueInr + totalDutyPayable;

  // Calculation for SB RoDTEP
  const fobInr = Math.round(sbData.fobValue * sbData.sbExchangeRate);
  const rodtepInr = Math.round(fobInr * (sbData.rodtepRate / 100));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top back nav */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <Link
            href="/cha/dashboard/documents"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Customs Calculation & Declaration Studio</h1>
            <p className="text-xs text-slate-400">
              Interactive assessment worksheets compliant with Indian Customs Tariff & Valuation Rules
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handlePrint}
            variant="outline"
            className="border-slate-700 text-slate-200 hover:bg-slate-800 text-xs px-3.5 py-1.5"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            Print / Save PDF
          </Button>
        </div>
      </div>

      {/* Tool Selector Buttons */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs no-print">
        <button
          type="button"
          onClick={() => setActiveTool('boe')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            activeTool === 'boe'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Bill of Entry (BoE) Duty Worksheet</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTool('gatt')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            activeTool === 'gatt'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>GATT Valuation Form (Rule 10)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTool('sb')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            activeTool === 'sb'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Shipping Bill & RoDTEP Worksheet</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTool('auth')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            activeTool === 'auth'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>CHA Authorization Letter</span>
        </button>
      </div>

      {/* TOOL 1: Bill of Entry Duty Worksheet */}
      {activeTool === 'boe' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inputs Panel */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 no-print">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Import Valuation Parameters
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Invoice CIF Value"
                type="number"
                value={cifAmount}
                onChange={(e) => setCifAmount(parseFloat(e.target.value) || 0)}
                className="bg-slate-950 border-slate-800 text-white font-mono"
              />

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                  <option value="AED">AED</option>
                </select>
              </div>
            </div>

            <Input
              label="CBIC Notification Exchange Rate (INR)"
              type="number"
              step="0.05"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)}
              className="bg-slate-950 border-slate-800 text-white font-mono"
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Basic Customs Duty (BCD %)"
                type="number"
                step="0.5"
                value={bcdRate}
                onChange={(e) => setBcdRate(parseFloat(e.target.value) || 0)}
                className="bg-slate-950 border-slate-800 text-white font-mono"
              />

              <Input
                label="SWS (% of BCD)"
                type="number"
                value={swsRate}
                onChange={(e) => setSwsRate(parseFloat(e.target.value) || 0)}
                className="bg-slate-950 border-slate-800 text-white font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Integrated GST (IGST %)"
                type="number"
                value={igstRate}
                onChange={(e) => setIgstRate(parseFloat(e.target.value) || 0)}
                className="bg-slate-950 border-slate-800 text-white font-mono"
              />

              <Input
                label="Compensation Cess (%)"
                type="number"
                value={cessRate}
                onChange={(e) => setCessRate(parseFloat(e.target.value) || 0)}
                className="bg-slate-950 border-slate-800 text-white font-mono"
              />
            </div>
          </div>

          {/* Assessment Output Worksheet */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  INDIAN CUSTOMS BILL OF ENTRY ASSESSMENT WORKSHEET
                </h3>
                <p className="text-[11px] text-slate-400">
                  Customs Station: {selectedJob?.customsStation || 'Nhava Sheva (INNSA1)'} • Broker: {chaFirmName}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Customs Tariff Act 1975
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Declared Invoice Value:</span>
                <span className="font-mono text-white font-semibold">
                  {currency} {cifAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">CBIC Customs Exchange Rate:</span>
                <span className="font-mono text-white">₹{exchangeRate.toFixed(2)} per {currency}</span>
              </div>

              <div className="flex items-center justify-between py-2.5 bg-slate-950/60 px-3 rounded-xl">
                <span className="font-semibold text-white">Customs Assessable Value (AV):</span>
                <span className="font-mono font-bold text-base text-amber-400">
                  ₹{assessableValueInr.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-slate-300">
                  <span>1. Basic Customs Duty (BCD @ {bcdRate}% on AV):</span>
                  <span className="font-mono">₹{bcdAmount.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span>2. Social Welfare Surcharge (SWS @ {swsRate}% of BCD):</span>
                  <span className="font-mono">₹{swsAmount.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center justify-between text-slate-400 text-[11px] pl-3">
                  <span>• Subtotal before IGST (AV + BCD + SWS):</span>
                  <span className="font-mono">₹{preIgstTotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span>3. Integrated GST (IGST @ {igstRate}% on Subtotal):</span>
                  <span className="font-mono">₹{igstAmount.toLocaleString('en-IN')}</span>
                </div>

                {cessAmount > 0 && (
                  <div className="flex items-center justify-between text-slate-300">
                    <span>4. Compensation Cess (@ {cessRate}%):</span>
                    <span className="font-mono">₹{cessAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between mt-4">
                <div>
                  <span className="text-xs text-amber-300 font-bold block">
                    TOTAL ESTIMATED CUSTOMS DUTY PAYABLE
                  </span>
                  <span className="text-[10px] text-amber-400/80">Payable via ICEGATE ECL / Net Banking</span>
                </div>
                <span className="text-2xl font-bold font-mono text-amber-400">
                  ₹{totalDutyPayable.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 text-slate-400 text-xs">
                <span>Total Estimated Landed Cost to Importer:</span>
                <span className="font-mono font-semibold text-white">
                  ₹{totalLandedCost.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOOL 2: GATT Valuation Declaration (Rule 10) */}
      {activeTool === 'gatt' && (
        <div className="max-w-4xl mx-auto p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 text-xs text-slate-300">
          <div className="text-center border-b border-slate-800 pb-4 space-y-1">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              DECLARATION UNDER RULE 10 OF CUSTOMS VALUATION (DETERMINATION OF VALUE OF IMPORTED GOODS) RULES, 2007
            </h2>
            <p className="text-[11px] text-slate-400">
              Prescribed under Notification No. 94/2007-Customs (N.T.) as amended
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-500 text-[11px] block">Importer Name & IEC</span>
              <span className="font-semibold text-white">{gattData.importerName}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Overseas Seller / Supplier</span>
              <span className="font-semibold text-white">{gattData.supplierName}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Invoice No & Date</span>
              <span className="font-mono text-white">{gattData.invoiceNo} dated {gattData.invoiceDate}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Port of Importation</span>
              <span className="text-white">{selectedJob?.customsStation || 'Nhava Sheva (INNSA1)'}</span>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="font-bold text-white uppercase text-xs">Questionnaire on Relationship & Additions:</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span>1. Are the buyer and seller related under Rule 2(2) of Customs Valuation Rules?</span>
                <span className="font-bold text-amber-400 uppercase">{gattData.isRelated}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span>2. Are there any royalties or license fees payable as a condition of sale?</span>
                <span className="font-bold text-amber-400 uppercase">{gattData.hasRoyalties}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span>3. Are there assists, tooling, or engineering provided free or at reduced cost?</span>
                <span className="font-bold text-amber-400 uppercase">{gattData.hasAssists}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white">Declaration & Undertaking:</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              I/We hereby declare that the particulars given above are true, complete and correct. The transaction value declared reflects the total payment actually made or to be made for the imported goods, and no part of the proceeds of any subsequent resale, disposal or use of the goods will accrue directly or indirectly to the seller.
            </p>
          </div>

          <div className="pt-6 grid grid-cols-2 gap-8">
            <div>
              <span className="text-slate-500 block text-[11px]">Signature of Authorized Importer</span>
              <div className="h-12 border-b border-slate-700 mt-2" />
              <span className="text-[10px] text-slate-500">Name & Company Stamp</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">Customs Broker Certification</span>
              <div className="h-12 border-b border-slate-700 mt-2" />
              <span className="text-[10px] text-slate-500">
                {chaFirmName} (Lic: {chaLicenseNumber})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TOOL 3: Shipping Bill & RoDTEP Worksheet */}
      {activeTool === 'sb' && (
        <div className="max-w-4xl mx-auto p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 text-xs text-slate-300">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              EXPORT SHIPPING BILL WORK SHEET & RoDTEP BENEFIT COMPUTATION
            </h2>
            <p className="text-[11px] text-slate-400">
              For Filing Under Section 50 of the Customs Act, 1962 (LUT Zero-Rated Export)
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-slate-500 text-[11px]">FOB Consignment Value</span>
              <p className="text-xl font-bold font-mono text-white mt-1">
                USD {sbData.fobValue.toLocaleString()}
              </p>
            </div>

            <div>
              <span className="text-slate-500 text-[11px]">FOB Value in INR</span>
              <p className="text-xl font-bold font-mono text-amber-400 mt-1">
                ₹{fobInr.toLocaleString('en-IN')}
              </p>
            </div>

            <div>
              <span className="text-slate-500 text-[11px]">RoDTEP Incentive Rate</span>
              <p className="text-xl font-bold text-emerald-400 mt-1">{sbData.rodtepRate}%</p>
            </div>

            <div>
              <span className="text-slate-500 text-[11px]">Estimated RoDTEP Credit</span>
              <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
                ₹{rodtepInr.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-semibold text-white block">GST LUT Zero-Rated Details</span>
            <p className="text-slate-400 text-[11px]">
              Export under Bond / Letter of Undertaking ARN: <span className="font-mono text-white font-bold">{sbData.lutNumber}</span>. No IGST payment is required at export; full duty drawback and RoDTEP scrip eligible through ICEGATE electronic ledger.
            </p>
          </div>
        </div>
      )}

      {/* TOOL 4: CHA Authorization Letter */}
      {activeTool === 'auth' && (
        <div className="max-w-3xl mx-auto p-8 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-xl space-y-6 text-xs">
          <div className="text-center border-b border-slate-300 pb-4 space-y-1">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
              AUTHORIZATION LETTER FOR CUSTOMS HOUSE AGENT (CHA)
            </h2>
            <p className="text-[11px] text-slate-600">
              Under Section 146 of the Customs Act, 1962 & Customs Brokers Licensing Regulations (CBLR 2018)
            </p>
          </div>

          <div className="flex justify-between text-xs">
            <div>
              <p className="font-semibold">To,</p>
              <p>The Principal Commissioner / Commissioner of Customs,</p>
              <p>{selectedJob?.customsStation || 'Customs House, Nhava Sheva (INNSA1)'}</p>
            </div>
            <div className="text-right">
              <p>Date: {new Date().toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          <p className="leading-relaxed">
            Dear Sir/Madam,
          </p>

          <p className="leading-relaxed">
            We hereby authorize <strong>{chaFirmName}</strong>, holding valid Customs Broker License No. <strong>{chaLicenseNumber}</strong>, to act as our authorized Customs House Agent for processing, submitting, and clearance of all our Import and Export consignments arriving at or departing from your Customs Station.
          </p>

          <p className="leading-relaxed">
            They are authorized to file declarations (Bill of Entry / Shipping Bill), present documents through e-SANCHIT, attend physical examination of cargo, pay customs duties / charges on our behalf, and receive cargo deliveries / Let Export Orders.
          </p>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-800">Importer / Exporter Details:</span>
            <p>Firm Legal Name: <strong>{gattData.importerName}</strong></p>
            <p>IEC Number: <strong>{clients[0]?.iecNumber || '0511012345'}</strong></p>
            <p>GSTIN: <strong>{clients[0]?.gstin || '27AAACB0000A1Z5'}</strong></p>
          </div>

          <div className="pt-8 grid grid-cols-2 gap-12">
            <div>
              <p className="font-semibold">Accepted by Customs Broker:</p>
              <div className="h-16 border-b border-slate-400 mt-2" />
              <p className="mt-1 font-bold">{chaFirmName}</p>
              <p className="text-[10px] text-slate-600">License: {chaLicenseNumber}</p>
            </div>

            <div>
              <p className="font-semibold">Authorized Signatory (Importer/Exporter):</p>
              <div className="h-16 border-b border-slate-400 mt-2" />
              <p className="mt-1 font-bold">{gattData.importerName}</p>
              <p className="text-[10px] text-slate-600">With Official Seal & Designation</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
