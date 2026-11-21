'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Download,
  Edit2,
  Trash2,
  AlertTriangle,
  ArrowUpDown,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/EmptyState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { SUPPORTED_CURRENCIES } from '@/config/constants';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: 'General',
    description: '',
    specifications: '',
    hsCode: '',
    countryOfOrigin: 'India',
    unit: 'PCS',
    defaultCurrency: 'USD',
    purchaseCost: 0,
    sellingPrice: 0,
    moq: 100,
    packagingDetails: 'Standard Export Carton',
    netWeight: 0,
    grossWeight: 0,
    cbm: 0,
    stockQuantity: 500,
    lowStockThreshold: 50,
  });

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add product');

      setIsAddModalOpen(false);
      setForm({
        name: '',
        sku: '',
        category: 'General',
        description: '',
        specifications: '',
        hsCode: '',
        countryOfOrigin: 'India',
        unit: 'PCS',
        defaultCurrency: 'USD',
        purchaseCost: 0,
        sellingPrice: 0,
        moq: 100,
        packagingDetails: 'Standard Export Carton',
        netWeight: 0,
        grossWeight: 0,
        cbm: 0,
        stockQuantity: 500,
        lowStockThreshold: 50,
      });
      loadProducts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to update product');

      setIsEditModalOpen(false);
      loadProducts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete product "${name}"?`)) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      loadProducts();
    } catch {
      alert('Failed to delete product');
    }
  };

  const openEdit = (p: Product) => {
    setSelectedProduct(p);
    setForm({
      name: p.name,
      sku: p.sku,
      category: p.category,
      description: p.description,
      specifications: p.specifications || '',
      hsCode: p.hsCode,
      countryOfOrigin: p.countryOfOrigin,
      unit: p.unit,
      defaultCurrency: p.defaultCurrency,
      purchaseCost: p.purchaseCost,
      sellingPrice: p.sellingPrice,
      moq: p.moq,
      packagingDetails: p.packagingDetails || '',
      netWeight: p.netWeight,
      grossWeight: p.grossWeight,
      cbm: p.cbm || 0,
      stockQuantity: p.stockQuantity,
      lowStockThreshold: p.lowStockThreshold,
    });
    setIsEditModalOpen(true);
  };

  const exportCsv = () => {
    if (products.length === 0) return;
    const headers = ['SKU', 'Product Name', 'Category', 'HS Code', 'Unit Price', 'Currency', 'Stock', 'Unit'];
    const rows = products.map((p) => [
      `"${p.sku}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      `"${p.hsCode}"`,
      p.sellingPrice,
      `"${p.defaultCurrency}"`,
      p.stockQuantity,
      `"${p.unit}"`,
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encoded = encodeURI(csv);
    const a = document.createElement('a');
    a.href = encoded;
    a.download = `exportflow_products_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.hsCode.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter ? p.category === categoryFilter : true;
    return matchSearch && matchCat;
  });

  const categories = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#172033] tracking-tight">Product Catalog & Master SKUs</h1>
          <p className="text-xs text-[#64748B]">Manage export goods, HS/HSN classifications, packaging specs, and FOB prices</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={products.length === 0}>
            <Download className="w-4 h-4 mr-1.5" />
            Export CSV
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filter and Search */}
      <Card className="p-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            placeholder="Search by name, SKU, or HS Code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { value: '', label: 'All Categories' },
              ...categories.map((c) => ({ value: c, label: c })),
            ]}
          />
        </div>
      </Card>

      {/* Product Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading catalog...</div>
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No products in catalog"
              description={
                products.length === 0
                  ? 'Add your export items with HS/HSN codes and export pricing to populate quotations and packing lists effortlessly.'
                  : 'No products match your filters.'
              }
              actionLabel={products.length === 0 ? 'Add First Product' : undefined}
              onAction={() => setIsAddModalOpen(true)}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[#64748B] font-semibold">
                    <th className="py-3 px-4">Product Details</th>
                    <th className="py-3 px-4">HS/HSN Code</th>
                    <th className="py-3 px-4">Selling Price</th>
                    <th className="py-3 px-4">Stock Level</th>
                    <th className="py-3 px-4">MOQ & Packaging</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    const isLowStock = p.stockQuantity <= p.lowStockThreshold;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#172033]">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                              <Package className="w-4 h-4" />
                            </div>
                            <div>
                              <span>{p.name}</span>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-normal">
                                <span>SKU: {p.sku}</span>
                                <span>•</span>
                                <span>{p.category}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-[#172033]">
                          {p.hsCode}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#172033]">
                          {formatCurrency(p.sellingPrice, p.defaultCurrency)} / {p.unit}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 font-semibold">
                            <span>{p.stockQuantity} {p.unit}</span>
                            {isLowStock && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-rose-50 text-rose-600 font-bold border border-rose-200" title="Low Stock Warning">
                                <AlertTriangle className="w-3 h-3" />
                                Low
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <div>MOQ: {p.moq} {p.unit}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                            {p.packagingDetails || 'Standard'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(p)}
                              className="p-1.5 rounded-md text-slate-400 hover:text-amber-600 hover:bg-slate-100"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id, p.name)}
                              className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-100"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ADD PRODUCT MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Product to Catalog"
        description="Enter product specifications, HS Code, and standard export pricing"
        maxWidth="2xl"
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-600">
            {error}
          </div>
        )}
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Product Name"
              name="name"
              required
              placeholder="e.g. Organic Black Pepper 550GL"
              value={form.name}
              onChange={handleChange}
            />
            <Input
              label="SKU Code"
              name="sku"
              required
              placeholder="e.g. OBP-550-EX"
              value={form.sku}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="HS / HSN Code"
              name="hsCode"
              required
              placeholder="e.g. 09041110"
              value={form.hsCode}
              onChange={handleChange}
            />
            <Input
              label="Category"
              name="category"
              required
              placeholder="e.g. Spices / Agro"
              value={form.category}
              onChange={handleChange}
            />
            <Input
              label="Measurement Unit"
              name="unit"
              required
              placeholder="e.g. KG, PCS, MT, BOX"
              value={form.unit}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Currency"
              name="defaultCurrency"
              value={form.defaultCurrency}
              onChange={handleChange}
              options={SUPPORTED_CURRENCIES.map((c) => ({
                value: c.code,
                label: `${c.code} (${c.name})`,
              }))}
            />
            <Input
              label="Selling Price"
              name="sellingPrice"
              type="number"
              step="any"
              required
              value={form.sellingPrice}
              onChange={handleChange}
            />
            <Input
              label="Purchase / Cost Price"
              name="purchaseCost"
              type="number"
              step="any"
              value={form.purchaseCost}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="MOQ (Min Order Qty)"
              name="moq"
              type="number"
              value={form.moq}
              onChange={handleChange}
            />
            <Input
              label="Initial Stock Quantity"
              name="stockQuantity"
              type="number"
              value={form.stockQuantity}
              onChange={handleChange}
            />
            <Input
              label="Low Stock Alert Threshold"
              name="lowStockThreshold"
              type="number"
              value={form.lowStockThreshold}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Net Weight (KG / Unit)"
              name="netWeight"
              type="number"
              step="any"
              value={form.netWeight}
              onChange={handleChange}
            />
            <Input
              label="Gross Weight (KG / Unit)"
              name="grossWeight"
              type="number"
              step="any"
              value={form.grossWeight}
              onChange={handleChange}
            />
            <Input
              label="CBM per Package"
              name="cbm"
              type="number"
              step="any"
              value={form.cbm}
              onChange={handleChange}
            />
          </div>

          <Textarea
            label="Product Description"
            name="description"
            placeholder="Detailed description printed in export document line items"
            value={form.description}
            onChange={handleChange}
            rows={2}
          />

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" size="sm" isLoading={isSubmitting}>
              Save Product
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT PRODUCT MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Product"
        maxWidth="2xl"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Product Name"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
            />
            <Input
              label="SKU Code"
              name="sku"
              required
              value={form.sku}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="HS Code"
              name="hsCode"
              required
              value={form.hsCode}
              onChange={handleChange}
            />
            <Input
              label="Category"
              name="category"
              required
              value={form.category}
              onChange={handleChange}
            />
            <Input
              label="Unit"
              name="unit"
              required
              value={form.unit}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Currency"
              name="defaultCurrency"
              value={form.defaultCurrency}
              onChange={handleChange}
              options={SUPPORTED_CURRENCIES.map((c) => ({
                value: c.code,
                label: `${c.code}`,
              }))}
            />
            <Input
              label="Selling Price"
              name="sellingPrice"
              type="number"
              step="any"
              required
              value={form.sellingPrice}
              onChange={handleChange}
            />
            <Input
              label="Purchase Cost"
              name="purchaseCost"
              type="number"
              step="any"
              value={form.purchaseCost}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Stock Quantity"
              name="stockQuantity"
              type="number"
              value={form.stockQuantity}
              onChange={handleChange}
            />
            <Input
              label="Low Stock Threshold"
              name="lowStockThreshold"
              type="number"
              value={form.lowStockThreshold}
              onChange={handleChange}
            />
            <Input
              label="MOQ"
              name="moq"
              type="number"
              value={form.moq}
              onChange={handleChange}
            />
          </div>

          <Textarea
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={2}
          />

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" size="sm" isLoading={isSubmitting}>
              Update Product
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
