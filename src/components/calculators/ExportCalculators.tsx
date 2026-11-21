'use client';

import React, { useState } from 'react';
import {
  Calculator,
  Percent,
  Coins,
  Package,
  Container,
  Scale,
  TrendingUp,
  Tag,
  CreditCard,
  Ship,
  Check,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { roundToTwo, formatCurrency } from '@/lib/utils';
import { SUPPORTED_CURRENCIES } from '@/config/constants';

export function ExportCalculators() {
  const [activeTab, setActiveTab] = useState<
    | 'gst'
    | 'pricing'
    | 'cbm'
    | 'container'
    | 'weight'
    | 'margin'
    | 'discount'
    | 'currency'
    | 'payment'
    | 'landed'
  >('pricing');

  // ================= 1. GST CALCULATOR STATE =================
  const [gstAmount, setGstAmount] = useState<number>(10000);
  const [gstRate, setGstRate] = useState<number>(18);
  const [gstMode, setGstMode] = useState<'exclusive' | 'inclusive'>('exclusive');
  const [gstScenario, setGstScenario] = useState<'intra' | 'inter' | 'lut_zero' | 'igst_export'>('lut_zero');

  let gstTaxable = 0;
  let gstTotalTax = 0;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  let gstFinalTotal = 0;

  if (gstScenario === 'lut_zero') {
    gstTaxable = gstAmount;
    gstTotalTax = 0;
    gstFinalTotal = gstAmount;
  } else if (gstMode === 'exclusive') {
    gstTaxable = gstAmount;
    gstTotalTax = roundToTwo((gstAmount * gstRate) / 100);
    gstFinalTotal = roundToTwo(gstTaxable + gstTotalTax);
    if (gstScenario === 'intra') {
      cgst = roundToTwo(gstTotalTax / 2);
      sgst = roundToTwo(gstTotalTax / 2);
    } else {
      igst = gstTotalTax;
    }
  } else {
    // Inclusive
    gstTaxable = roundToTwo((gstAmount * 100) / (100 + gstRate));
    gstTotalTax = roundToTwo(gstAmount - gstTaxable);
    gstFinalTotal = gstAmount;
    if (gstScenario === 'intra') {
      cgst = roundToTwo(gstTotalTax / 2);
      sgst = roundToTwo(gstTotalTax / 2);
    } else {
      igst = gstTotalTax;
    }
  }

  // ================= 2. EXPORT PRICING CALCULATOR =================
  const [pricingQty, setPricingQty] = useState<number>(500);
  const [purchaseCost, setPurchaseCost] = useState<number>(15);
  const [packagingCost, setPackagingCost] = useState<number>(1.2);
  const [labourHandling, setLabourHandling] = useState<number>(0.8);
  const [inlandFreight, setInlandFreight] = useState<number>(350); // Total shipment
  const [customsDocumentation, setCustomsDocumentation] = useState<number>(200); // Total
  const [oceanFreight, setOceanFreight] = useState<number>(1800); // Total
  const [marineInsurance, setMarineInsurance] = useState<number>(150); // Total
  const [profitMarginPct, setProfitMarginPct] = useState<number>(20);
  const [pricingCurrency, setPricingCurrency] = useState<string>('USD');

  const unitFactoryBase = purchaseCost + packagingCost + labourHandling;
  const totalFactoryBase = unitFactoryBase * pricingQty;
  const exwTotal = roundToTwo(totalFactoryBase * (1 + profitMarginPct / 100));
  const exwPerUnit = roundToTwo(exwTotal / (pricingQty || 1));

  const fobTotal = roundToTwo(exwTotal + inlandFreight + customsDocumentation);
  const fobPerUnit = roundToTwo(fobTotal / (pricingQty || 1));

  const cfrTotal = roundToTwo(fobTotal + oceanFreight);
  const cfrPerUnit = roundToTwo(cfrTotal / (pricingQty || 1));

  const cifTotal = roundToTwo(cfrTotal + marineInsurance);
  const cifPerUnit = roundToTwo(cifTotal / (pricingQty || 1));

  const estimatedProfit = roundToTwo(exwTotal - totalFactoryBase);

  // ================= 3. CBM CALCULATOR =================
  const [cbmLength, setCbmLength] = useState<number>(50);
  const [cbmWidth, setCbmWidth] = useState<number>(40);
  const [cbmHeight, setCbmHeight] = useState<number>(30);
  const [cbmUnit, setCbmUnit] = useState<'cm' | 'inch' | 'm'>('cm');
  const [cbmPackages, setCbmPackages] = useState<number>(120);

  let cbmPerPkg = 0;
  if (cbmUnit === 'cm') {
    cbmPerPkg = (cbmLength * cbmWidth * cbmHeight) / 1000000;
  } else if (cbmUnit === 'inch') {
    cbmPerPkg = (cbmLength * cbmWidth * cbmHeight) / 61023.7;
  } else {
    cbmPerPkg = cbmLength * cbmWidth * cbmHeight;
  }
  cbmPerPkg = roundToTwo(cbmPerPkg);
  const totalCbm = roundToTwo(cbmPerPkg * cbmPackages);

  // ================= 4. CONTAINER LOADING ESTIMATOR =================
  const containerSpecs = {
    '20ft': { name: "20' General Purpose", usableCbm: 28, maxWeightKg: 21800 },
    '40ft': { name: "40' Standard", usableCbm: 58, maxWeightKg: 26600 },
    '40hc': { name: "40' High Cube", usableCbm: 68, maxWeightKg: 26500 },
  };

  // ================= 5. WEIGHT CALCULATOR =================
  const [weightPerUnitNet, setWeightPerUnitNet] = useState<number>(0.85);
  const [weightTareCarton, setWeightTareCarton] = useState<number>(0.6);
  const [weightUnitsPerCarton, setWeightUnitsPerCarton] = useState<number>(24);
  const [weightCartonCount, setWeightCartonCount] = useState<number>(150);

  const totalNetWeight = roundToTwo(weightPerUnitNet * weightUnitsPerCarton * weightCartonCount);
  const totalTareWeight = roundToTwo(weightTareCarton * weightCartonCount);
  const totalGrossWeight = roundToTwo(totalNetWeight + totalTareWeight);

  // ================= 6. PROFIT MARGIN & MARKUP =================
  const [marginCost, setMarginCost] = useState<number>(120);
  const [marginSell, setMarginSell] = useState<number>(180);
  const profitAmt = roundToTwo(marginSell - marginCost);
  const marginPct = marginSell > 0 ? roundToTwo((profitAmt / marginSell) * 100) : 0;
  const markupPct = marginCost > 0 ? roundToTwo((profitAmt / marginCost) * 100) : 0;

  // ================= 7. CURRENCY CONVERTER =================
  const [currFrom, setCurrFrom] = useState<string>('USD');
  const [currTo, setCurrTo] = useState<string>('INR');
  const [currAmt, setCurrAmt] = useState<number>(1000);
  const [manualRate, setManualRate] = useState<number>(86.5);

  const convertedResult = roundToTwo(currAmt * manualRate);

  const navItems = [
    { id: 'pricing', label: 'Export Pricing (Incoterms)', icon: Ship },
    { id: 'gst', label: 'GST & LUT Tax', icon: Percent },
    { id: 'cbm', label: 'CBM Volume', icon: Package },
    { id: 'container', label: 'Container Loading', icon: Container },
    { id: 'weight', label: 'Net / Gross Weight', icon: Scale },
    { id: 'margin', label: 'Profit & Markup', icon: TrendingUp },
    { id: 'currency', label: 'Currency Converter', icon: Coins },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-[#172033] tracking-tight">Smart Export Calculators</h1>
        <p className="text-xs text-[#64748B]">Real, mathematically validated calculations for international trade quotations & shipments</p>
      </div>

      {/* Calculator Tab Pills */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        {navItems.map((n) => {
          const Icon = n.icon;
          const isActive = activeTab === n.id;
          return (
            <button
              key={n.id}
              onClick={() => setActiveTab(n.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{n.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. EXPORT PRICING CALCULATOR */}
      {activeTab === 'pricing' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-150">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Incoterms 2020 Cost Stack Inputs</CardTitle>
              <p className="text-xs text-slate-500">Configure each component to compute realistic EXW, FOB, CFR and CIF prices</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Total Shipment Units"
                  type="number"
                  value={pricingQty}
                  onChange={(e) => setPricingQty(Number(e.target.value))}
                />
                <Input
                  label="Product Purchase Cost (Unit)"
                  type="number"
                  step="any"
                  value={purchaseCost}
                  onChange={(e) => setPurchaseCost(Number(e.target.value))}
                />
                <Select
                  label="Pricing Currency"
                  value={pricingCurrency}
                  onChange={(e) => setPricingCurrency(e.target.value)}
                  options={SUPPORTED_CURRENCIES.map((c) => ({ value: c.code, label: c.code }))}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Export Packaging per Unit"
                  type="number"
                  step="any"
                  value={packagingCost}
                  onChange={(e) => setPackagingCost(Number(e.target.value))}
                />
                <Input
                  label="Labour & Stuffing per Unit"
                  type="number"
                  step="any"
                  value={labourHandling}
                  onChange={(e) => setLabourHandling(Number(e.target.value))}
                />
              </div>

              <div className="border-t border-slate-100 pt-3">
                <span className="text-xs font-bold text-slate-700 block mb-2">Freight & Port Expenses (Entire Lot)</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Inland Transport to Port"
                    type="number"
                    value={inlandFreight}
                    onChange={(e) => setInlandFreight(Number(e.target.value))}
                  />
                  <Input
                    label="Customs Clearance / Port CFS"
                    type="number"
                    value={customsDocumentation}
                    onChange={(e) => setCustomsDocumentation(Number(e.target.value))}
                  />
                  <Input
                    label="Ocean Freight to Destination"
                    type="number"
                    value={oceanFreight}
                    onChange={(e) => setOceanFreight(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <Input
                  label="Marine Cargo Insurance (All Risk)"
                  type="number"
                  value={marineInsurance}
                  onChange={(e) => setMarineInsurance(Number(e.target.value))}
                />
                <Input
                  label="Desired Exporter Profit Margin (%)"
                  type="number"
                  value={profitMarginPct}
                  onChange={(e) => setProfitMarginPct(Number(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing Results Summary */}
          <Card className="bg-slate-50 border-slate-300">
            <CardHeader>
              <CardTitle>Calculated Incoterm Quotations</CardTitle>
              <p className="text-xs text-slate-500">Unit rate and total consignment value</p>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-500">EXW (Ex Works)</span>
                  <span className="text-xs font-black text-[#172033]">{formatCurrency(exwPerUnit, pricingCurrency)} / unit</span>
                </div>
                <div className="text-[11px] text-slate-400">Total: {formatCurrency(exwTotal, pricingCurrency)}</div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 shadow-2xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-blue-800">FOB (Free on Board Port)</span>
                  <span className="text-xs font-black text-blue-700">{formatCurrency(fobPerUnit, pricingCurrency)} / unit</span>
                </div>
                <div className="text-[11px] text-blue-600">Total: {formatCurrency(fobTotal, pricingCurrency)}</div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-500">CFR (Cost & Freight)</span>
                  <span className="text-xs font-black text-[#172033]">{formatCurrency(cfrPerUnit, pricingCurrency)} / unit</span>
                </div>
                <div className="text-[11px] text-slate-400">Total: {formatCurrency(cfrTotal, pricingCurrency)}</div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 shadow-2xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-emerald-800">CIF (Cost, Insurance & Freight)</span>
                  <span className="text-xs font-black text-emerald-700">{formatCurrency(cifPerUnit, pricingCurrency)} / unit</span>
                </div>
                <div className="text-[11px] text-emerald-600">Total: {formatCurrency(cifTotal, pricingCurrency)}</div>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Profit Expected:</span>
                  <strong className="text-emerald-700">{formatCurrency(estimatedProfit, pricingCurrency)}</strong>
                </div>
                <div className="flex justify-between text-slate-600 mt-1">
                  <span>Margin:</span>
                  <strong>{profitMarginPct}%</strong>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 2. GST & LUT CALCULATOR */}
      {activeTab === 'gst' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-150">
          <Card>
            <CardHeader>
              <CardTitle>GST & Export Tax Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Base Amount"
                type="number"
                value={gstAmount}
                onChange={(e) => setGstAmount(Number(e.target.value))}
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="GST Slab Rate"
                  value={gstRate.toString()}
                  onChange={(e) => setGstRate(Number(e.target.value))}
                  options={[
                    { value: '0', label: '0% (Exempt)' },
                    { value: '5', label: '5%' },
                    { value: '12', label: '12%' },
                    { value: '18', label: '18%' },
                    { value: '28', label: '28%' },
                  ]}
                />
                <Select
                  label="Calculation Mode"
                  value={gstMode}
                  onChange={(e) => setGstMode(e.target.value as any)}
                  options={[
                    { value: 'exclusive', label: 'Tax Exclusive (Add GST)' },
                    { value: 'inclusive', label: 'Tax Inclusive' },
                  ]}
                />
              </div>

              <Select
                label="Transaction Type / Export Scheme"
                value={gstScenario}
                onChange={(e) => setGstScenario(e.target.value as any)}
                options={[
                  { value: 'lut_zero', label: 'Zero-Rated Export under LUT / Bond (0% GST)' },
                  { value: 'igst_export', label: 'Export with Payment of IGST (Refund route)' },
                  { value: 'intra', label: 'Domestic Intra-State (CGST + SGST)' },
                  { value: 'inter', label: 'Domestic Inter-State (IGST)' },
                ]}
              />

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                <strong>Tax Compliance Note:</strong> Direct exports of physical goods under Letter of Undertaking (LUT) are zero-rated under Section 16 of the IGST Act, requiring 0% GST liability.
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-50">
            <CardHeader>
              <CardTitle>Tax Breakdown Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-500">Taxable Value:</span>
                <span className="font-bold text-[#172033]">{formatCurrency(gstTaxable, 'INR')}</span>
              </div>
              {cgst > 0 && (
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span className="text-slate-500">CGST ({gstRate / 2}%):</span>
                  <span className="font-medium text-[#172033]">{formatCurrency(cgst, 'INR')}</span>
                </div>
              )}
              {sgst > 0 && (
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span className="text-slate-500">SGST ({gstRate / 2}%):</span>
                  <span className="font-medium text-[#172033]">{formatCurrency(sgst, 'INR')}</span>
                </div>
              )}
              {igst > 0 && (
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span className="text-slate-500">IGST ({gstRate}%):</span>
                  <span className="font-medium text-[#172033]">{formatCurrency(igst, 'INR')}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-slate-200 font-bold">
                <span>Total Tax Component:</span>
                <span className="text-rose-600">{formatCurrency(gstTotalTax, 'INR')}</span>
              </div>
              <div className="flex justify-between py-3 text-sm font-black text-blue-700 bg-white p-3 rounded-lg border border-slate-200">
                <span>Final Invoice Amount:</span>
                <span>{formatCurrency(gstFinalTotal, 'INR')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 3. CBM CALCULATOR */}
      {activeTab === 'cbm' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-150">
          <Card>
            <CardHeader>
              <CardTitle>Package Dimensions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Length"
                  type="number"
                  value={cbmLength}
                  onChange={(e) => setCbmLength(Number(e.target.value))}
                />
                <Input
                  label="Width"
                  type="number"
                  value={cbmWidth}
                  onChange={(e) => setCbmWidth(Number(e.target.value))}
                />
                <Input
                  label="Height"
                  type="number"
                  value={cbmHeight}
                  onChange={(e) => setCbmHeight(Number(e.target.value))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Unit of Measurement"
                  value={cbmUnit}
                  onChange={(e) => setCbmUnit(e.target.value as any)}
                  options={[
                    { value: 'cm', label: 'Centimeters (cm)' },
                    { value: 'inch', label: 'Inches (in)' },
                    { value: 'm', label: 'Meters (m)' },
                  ]}
                />
                <Input
                  label="Number of Cartons / Packages"
                  type="number"
                  value={cbmPackages}
                  onChange={(e) => setCbmPackages(Number(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-50 flex flex-col justify-center text-center p-8">
            <span className="text-xs uppercase font-bold text-slate-400">Total Cargo Volume</span>
            <div className="text-5xl font-black text-blue-600 my-2">{totalCbm} CBM</div>
            <p className="text-xs text-slate-500 mb-6">
              Volume per package: <strong>{cbmPerPkg} m³</strong> across {cbmPackages} packages
            </p>

            <div className="grid grid-cols-3 gap-3 text-left text-xs bg-white p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">In 20ft Container</span>
                <div className="font-bold text-[#172033] mt-0.5">
                  {Math.round((totalCbm / 28) * 100)}% Capacity
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">In 40ft Container</span>
                <div className="font-bold text-[#172033] mt-0.5">
                  {Math.round((totalCbm / 58) * 100)}% Capacity
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">In 40ft HC</span>
                <div className="font-bold text-[#172033] mt-0.5">
                  {Math.round((totalCbm / 68) * 100)}% Capacity
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 4. CONTAINER LOADING ESTIMATOR */}
      {activeTab === 'container' && (
        <Card className="animate-in fade-in duration-150">
          <CardHeader>
            <CardTitle>Standard Shipping Container Specifications</CardTitle>
            <p className="text-xs text-slate-500">Estimates for ocean cargo planning (ISO Intermodal Standards)</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(containerSpecs).map(([key, spec]) => (
                <div key={key} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-xs font-bold text-blue-700 block mb-1">{spec.name}</span>
                  <div className="text-2xl font-black text-[#172033] mb-2">{spec.usableCbm} CBM</div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p><strong>Max Payload:</strong> {spec.maxWeightKg.toLocaleString()} KG</p>
                    <p><strong>Usable Utilization:</strong> ~85% packing factor</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 5. WEIGHT CALCULATOR */}
      {activeTab === 'weight' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-150">
          <Card>
            <CardHeader>
              <CardTitle>Unit & Packaging Weights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Product Net Weight per Piece (KG)"
                type="number"
                step="any"
                value={weightPerUnitNet}
                onChange={(e) => setWeightPerUnitNet(Number(e.target.value))}
              />
              <Input
                label="Pieces per Outer Carton"
                type="number"
                value={weightUnitsPerCarton}
                onChange={(e) => setWeightUnitsPerCarton(Number(e.target.value))}
              />
              <Input
                label="Empty Carton Packaging Tare Weight (KG)"
                type="number"
                step="any"
                value={weightTareCarton}
                onChange={(e) => setWeightTareCarton(Number(e.target.value))}
              />
              <Input
                label="Total Outer Cartons"
                type="number"
                value={weightCartonCount}
                onChange={(e) => setWeightCartonCount(Number(e.target.value))}
              />
            </CardContent>
          </Card>

          <Card className="bg-slate-50 p-6 flex flex-col justify-center space-y-4 text-xs">
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Total Consignment Net Weight</span>
              <div className="text-3xl font-black text-[#172033] mt-1">{totalNetWeight} KG</div>
              <span className="text-slate-400 text-[11px]">({(totalNetWeight / 1000).toFixed(2)} Metric Tons)</span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Total Consignment Gross Weight</span>
              <div className="text-3xl font-black text-emerald-600 mt-1">{totalGrossWeight} KG</div>
              <span className="text-slate-400 text-[11px]">Includes {totalTareWeight} KG carton packaging</span>
            </div>
          </Card>
        </div>
      )}

      {/* 6. PROFIT MARGIN & MARKUP */}
      {activeTab === 'margin' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-150">
          <Card>
            <CardHeader>
              <CardTitle>Unit Pricing Inputs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Landed Cost / Unit Purchase Cost"
                type="number"
                value={marginCost}
                onChange={(e) => setMarginCost(Number(e.target.value))}
              />
              <Input
                label="Export Selling Price"
                type="number"
                value={marginSell}
                onChange={(e) => setMarginSell(Number(e.target.value))}
              />
            </CardContent>
          </Card>

          <Card className="bg-slate-50 p-6 flex flex-col justify-center space-y-4 text-xs">
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Profit Margin %</span>
              <div className="text-4xl font-black text-blue-600 mt-1">{marginPct}%</div>
              <p className="text-slate-500 mt-1">Profit Amount: ${profitAmt} per unit</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Cost Markup %</span>
              <div className="text-4xl font-black text-emerald-600 mt-1">{markupPct}%</div>
            </div>
          </Card>
        </div>
      )}

      {/* 7. CURRENCY CONVERTER */}
      {activeTab === 'currency' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-150">
          <Card>
            <CardHeader>
              <CardTitle>Currency Conversion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Amount"
                type="number"
                value={currAmt}
                onChange={(e) => setCurrAmt(Number(e.target.value))}
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="From Currency"
                  value={currFrom}
                  onChange={(e) => setCurrFrom(e.target.value)}
                  options={SUPPORTED_CURRENCIES.map((c) => ({ value: c.code, label: c.code }))}
                />
                <Select
                  label="To Currency"
                  value={currTo}
                  onChange={(e) => setCurrTo(e.target.value)}
                  options={SUPPORTED_CURRENCIES.map((c) => ({ value: c.code, label: c.code }))}
                />
              </div>
              <Input
                label={`Custom Exchange Rate (1 ${currFrom} = X ${currTo})`}
                type="number"
                step="any"
                value={manualRate}
                onChange={(e) => setManualRate(Number(e.target.value))}
              />
            </CardContent>
          </Card>

          <Card className="bg-slate-50 flex flex-col justify-center text-center p-8">
            <span className="text-xs uppercase font-bold text-slate-400">Converted Value</span>
            <div className="text-4xl font-black text-blue-700 my-2">
              {formatCurrency(convertedResult, currTo)}
            </div>
            <p className="text-xs text-slate-500">
              {currAmt} {currFrom} @ rate of {manualRate}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
