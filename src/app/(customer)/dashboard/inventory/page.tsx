'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  AlertTriangle,
  ArrowUpDown,
  Plus,
  Minus,
  CheckCircle,
  TrendingDown,
  DollarSign,
  BarChart2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Modal } from '@/components/ui/EmptyState';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('Stock replenishment');
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || adjustDelta === 0) return;
    setIsSubmitting(true);

    try {
      const newStock = Math.max(0, selectedProduct.stockQuantity + adjustDelta);
      const res = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockQuantity: newStock }),
      });
      if (res.ok) {
        setIsAdjustModalOpen(false);
        setAdjustDelta(0);
        loadProducts();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalUnits = products.reduce((acc, p) => acc + (p.stockQuantity || 0), 0);
  const totalValuation = products.reduce((acc, p) => acc + (p.stockQuantity || 0) * (p.purchaseCost || 0), 0);
  const lowStockCount = products.filter((p) => p.stockQuantity <= p.lowStockThreshold).length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-[#172033] tracking-tight">Warehouse & Stock Inventory</h1>
        <p className="text-xs text-[#64748B]">Real-time stock ledger, physical stock counts, and valuation</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Stock Units"
          value={totalUnits.toLocaleString()}
          subtitle={`${products.length} distinct product lines`}
          icon={Package}
          color="blue"
        />
        <StatCard
          title="Inventory Cost Valuation"
          value={formatCurrency(totalValuation, 'USD')}
          subtitle="Based on recorded unit purchase costs"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Low Stock Alerts"
          value={lowStockCount}
          subtitle={lowStockCount > 0 ? 'Requires supplier reordering' : 'All stock levels healthy'}
          icon={AlertTriangle}
          color={lowStockCount > 0 ? 'amber' : 'slate'}
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Physical Inventory Ledger</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[#64748B] font-semibold">
                  <th className="py-3 px-4">SKU / Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Threshold</th>
                  <th className="py-3 px-4">Unit Cost</th>
                  <th className="py-3 px-4">Stock Valuation</th>
                  <th className="py-3 px-4 text-right">Adjustment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const isLow = p.stockQuantity <= p.lowStockThreshold;
                  const itemVal = (p.stockQuantity || 0) * (p.purchaseCost || 0);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4">
                        <span className="font-bold text-[#172033] block">{p.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{p.category}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-[#172033]">
                          <span>{p.stockQuantity} {p.unit}</span>
                          {isLow && (
                            <span className="text-[10px] bg-rose-50 text-rose-600 px-1.5 py-0.2 rounded border border-rose-200">
                              Low Stock
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{p.lowStockThreshold} {p.unit}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {formatCurrency(p.purchaseCost, p.defaultCurrency)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#172033]">
                        {formatCurrency(itemVal, p.defaultCurrency)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => {
                            setSelectedProduct(p);
                            setAdjustDelta(0);
                            setIsAdjustModalOpen(true);
                          }}
                        >
                          <ArrowUpDown className="w-3.5 h-3.5 mr-1 text-slate-500" />
                          Adjust
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Adjust Modal */}
      {selectedProduct && (
        <Modal
          isOpen={isAdjustModalOpen}
          onClose={() => setIsAdjustModalOpen(false)}
          title={`Adjust Stock: ${selectedProduct.name}`}
          description={`Current on-hand stock: ${selectedProduct.stockQuantity} ${selectedProduct.unit}`}
          maxWidth="sm"
        >
          <form onSubmit={handleAdjustStock} className="space-y-4">
            <Input
              label="Quantity Adjustment (+ to add, - to deduct)"
              type="number"
              required
              value={adjustDelta}
              onChange={(e) => setAdjustDelta(Number(e.target.value))}
              helperText={`Resulting stock will be: ${Math.max(0, selectedProduct.stockQuantity + adjustDelta)} ${selectedProduct.unit}`}
            />
            <Input
              label="Reason for Adjustment"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              placeholder="e.g. Received shipment, Damaged goods, Stock audit"
            />
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAdjustModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="secondary" size="sm" isLoading={isSubmitting}>
                Save Adjustment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
