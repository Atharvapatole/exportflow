'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Download,
  Upload,
  Eye,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/EmptyState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Buyer, BuyerStatus } from '@/types';
import { BUYER_STATUSES } from '@/config/constants';

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    country: 'United States',
    city: 'New York',
    billingAddress: '',
    shippingAddress: '',
    website: '',
    taxId: '',
    buyerType: 'Importer / Wholesaler',
    industry: 'Consumer Goods',
    status: 'new' as BuyerStatus,
    notes: '',
  });

  const loadBuyers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/buyers');
      if (res.ok) {
        const data = await res.json();
        setBuyers(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuyers();
  }, []);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/buyers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add buyer');

      setIsAddModalOpen(false);
      setForm({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        country: 'United States',
        city: 'New York',
        billingAddress: '',
        shippingAddress: '',
        website: '',
        taxId: '',
        buyerType: 'Importer / Wholesaler',
        industry: 'Consumer Goods',
        status: 'new',
        notes: '',
      });
      loadBuyers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuyer) return;
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/buyers/${selectedBuyer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to update buyer');

      setIsEditModalOpen(false);
      loadBuyers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBuyer = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete buyer "${name}"?`)) return;

    try {
      await fetch(`/api/buyers/${id}`, { method: 'DELETE' });
      loadBuyers();
    } catch {
      alert('Failed to delete buyer');
    }
  };

  const openEditModal = (b: Buyer) => {
    setSelectedBuyer(b);
    setForm({
      companyName: b.companyName,
      contactPerson: b.contactPerson,
      email: b.email,
      phone: b.phone,
      country: b.country,
      city: b.city,
      billingAddress: b.billingAddress,
      shippingAddress: b.shippingAddress,
      website: b.website || '',
      taxId: b.taxId || '',
      buyerType: b.buyerType || 'Importer / Wholesaler',
      industry: b.industry || '',
      status: b.status,
      notes: b.notes || '',
    });
    setIsEditModalOpen(true);
  };

  // CSV Export
  const exportToCsv = () => {
    if (buyers.length === 0) return;
    const headers = ['Company Name', 'Contact Person', 'Email', 'Phone', 'Country', 'City', 'Status', 'Tax ID'];
    const rows = buyers.map((b) => [
      `"${b.companyName.replace(/"/g, '""')}"`,
      `"${b.contactPerson.replace(/"/g, '""')}"`,
      `"${b.email}"`,
      `"${b.phone}"`,
      `"${b.country}"`,
      `"${b.city}"`,
      `"${b.status}"`,
      `"${b.taxId || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `exportflow_buyers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter buyers
  const filteredBuyers = buyers.filter((b) => {
    const matchSearch =
      b.companyName.toLowerCase().includes(search.toLowerCase()) ||
      b.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      b.email.toLowerCase().includes(search.toLowerCase()) ||
      b.country.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? b.status === statusFilter : true;
    const matchCountry = countryFilter ? b.country === countryFilter : true;
    return matchSearch && matchStatus && matchCountry;
  });

  const uniqueCountries = Array.from(new Set(buyers.map((b) => b.country))).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Top Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#172033] tracking-tight">Buyer CRM & Importer Directory</h1>
          <p className="text-xs text-[#64748B]">Manage international clients, RFQs, billing destinations, and communications</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportToCsv} disabled={buyers.length === 0}>
            <Download className="w-4 h-4 mr-1.5" />
            Export CSV
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Buyer
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Search by company, contact, email or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Statuses' },
              ...BUYER_STATUSES.map((s) => ({ value: s.id, label: s.label })),
            ]}
          />
          <Select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            options={[
              { value: '', label: 'All Countries' },
              ...uniqueCountries.map((c) => ({ value: c, label: c })),
            ]}
          />
        </div>
      </Card>

      {/* Buyers Data Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading buyers...</div>
          ) : filteredBuyers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No buyers found"
              description={
                buyers.length === 0
                  ? "You haven't added any international buyers or clients yet. Add your first buyer to quickly autofill quotations and invoices."
                  : 'No buyers match your search and filter criteria.'
              }
              actionLabel={buyers.length === 0 ? 'Add First Buyer' : undefined}
              onAction={() => setIsAddModalOpen(true)}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[#64748B] font-semibold">
                    <th className="py-3 px-4">Company Name</th>
                    <th className="py-3 px-4">Contact Person</th>
                    <th className="py-3 px-4">Country & City</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Total Orders</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBuyers.map((buyer) => {
                    const statusConfig =
                      BUYER_STATUSES.find((s) => s.id === buyer.status) || BUYER_STATUSES[0];

                    return (
                      <tr key={buyer.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#172033]">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                              {buyer.companyName.charAt(0)}
                            </div>
                            <div>
                              <span>{buyer.companyName}</span>
                              {buyer.industry && (
                                <span className="block text-[10px] text-slate-400 font-normal">
                                  {buyer.industry}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#172033]">
                          <div className="font-medium">{buyer.contactPerson}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            <span>{buyer.email}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <div className="flex items-center gap-1 font-medium text-[#172033]">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{buyer.city}, {buyer.country}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusConfig.color}`}
                          >
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#172033]">
                          ${buyer.totalOrderValue.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setSelectedBuyer(buyer);
                                setIsDetailsModalOpen(true);
                              }}
                              className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-100"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(buyer)}
                              className="p-1.5 rounded-md text-slate-400 hover:text-amber-600 hover:bg-slate-100"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBuyer(buyer.id, buyer.companyName)}
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

      {/* ADD BUYER MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add International Buyer"
        description="Enter client company details for automated quotations and shipment documents"
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
              label="Company Name"
              name="companyName"
              required
              placeholder="e.g. EuroTrade GmbH"
              value={form.companyName}
              onChange={handleFormChange}
            />
            <Input
              label="Contact Person"
              name="contactPerson"
              required
              placeholder="e.g. Hans Zimmer"
              value={form.contactPerson}
              onChange={handleFormChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              name="email"
              type="email"
              required
              placeholder="buyer@eurotrade.de"
              value={form.email}
              onChange={handleFormChange}
            />
            <Input
              label="Phone / WhatsApp"
              name="phone"
              required
              placeholder="+49 151 2345678"
              value={form.phone}
              onChange={handleFormChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Country"
              name="country"
              required
              placeholder="e.g. Germany"
              value={form.country}
              onChange={handleFormChange}
            />
            <Input
              label="City"
              name="city"
              required
              placeholder="e.g. Hamburg"
              value={form.city}
              onChange={handleFormChange}
            />
            <Input
              label="Buyer Tax ID / VAT / EIN"
              name="taxId"
              placeholder="DE123456789"
              value={form.taxId}
              onChange={handleFormChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textarea
              label="Official Billing Address"
              name="billingAddress"
              required
              placeholder="Full invoice billing address"
              value={form.billingAddress}
              onChange={handleFormChange}
              rows={2}
            />
            <Textarea
              label="Shipping / Delivery Address"
              name="shippingAddress"
              required
              placeholder="Port or warehouse delivery address"
              value={form.shippingAddress}
              onChange={handleFormChange}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Buyer Status"
              name="status"
              value={form.status}
              onChange={handleFormChange}
              options={BUYER_STATUSES.map((s) => ({ value: s.id, label: s.label }))}
            />
            <Input
              label="Industry / Sector"
              name="industry"
              placeholder="e.g. Textiles, Spices, Engineering"
              value={form.industry}
              onChange={handleFormChange}
            />
          </div>

          <Textarea
            label="Internal Notes / Commercial Terms Agreed"
            name="notes"
            placeholder="Special packaging requests, credit preferences, etc."
            value={form.notes}
            onChange={handleFormChange}
            rows={2}
          />

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" size="sm" isLoading={isSubmitting}>
              Save Buyer
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT BUYER MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Buyer Information"
        maxWidth="2xl"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Company Name"
              name="companyName"
              required
              value={form.companyName}
              onChange={handleFormChange}
            />
            <Input
              label="Contact Person"
              name="contactPerson"
              required
              value={form.contactPerson}
              onChange={handleFormChange}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleFormChange}
            />
            <Input
              label="Phone"
              name="phone"
              required
              value={form.phone}
              onChange={handleFormChange}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Country"
              name="country"
              required
              value={form.country}
              onChange={handleFormChange}
            />
            <Input
              label="City"
              name="city"
              required
              value={form.city}
              onChange={handleFormChange}
            />
            <Input
              label="Tax ID / VAT"
              name="taxId"
              value={form.taxId}
              onChange={handleFormChange}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textarea
              label="Billing Address"
              name="billingAddress"
              required
              value={form.billingAddress}
              onChange={handleFormChange}
              rows={2}
            />
            <Textarea
              label="Shipping Address"
              name="shippingAddress"
              required
              value={form.shippingAddress}
              onChange={handleFormChange}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Status"
              name="status"
              value={form.status}
              onChange={handleFormChange}
              options={BUYER_STATUSES.map((s) => ({ value: s.id, label: s.label }))}
            />
            <Input
              label="Industry"
              name="industry"
              value={form.industry}
              onChange={handleFormChange}
            />
          </div>
          <Textarea
            label="Internal Notes"
            name="notes"
            value={form.notes}
            onChange={handleFormChange}
            rows={2}
          />
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" size="sm" isLoading={isSubmitting}>
              Update Buyer
            </Button>
          </div>
        </form>
      </Modal>

      {/* BUYER DETAILS MODAL */}
      {selectedBuyer && (
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title={selectedBuyer.companyName}
          description={`Registered client • ${selectedBuyer.country}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
              <div>
                <span className="text-slate-400 block font-semibold">Contact Person</span>
                <span className="text-sm font-bold text-[#172033]">{selectedBuyer.contactPerson}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Tax ID / VAT</span>
                <span className="text-sm font-bold text-[#172033]">{selectedBuyer.taxId || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Email</span>
                <span className="text-[#172033]">{selectedBuyer.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Phone</span>
                <span className="text-[#172033]">{selectedBuyer.phone}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block font-semibold mb-1">Billing Address</span>
              <p className="p-2.5 bg-white border border-slate-200 rounded-lg text-[#172033]">
                {selectedBuyer.billingAddress}
              </p>
            </div>

            <div>
              <span className="text-slate-400 block font-semibold mb-1">Shipping Address</span>
              <p className="p-2.5 bg-white border border-slate-200 rounded-lg text-[#172033]">
                {selectedBuyer.shippingAddress}
              </p>
            </div>

            {selectedBuyer.notes && (
              <div>
                <span className="text-slate-400 block font-semibold mb-1">Internal Notes</span>
                <p className="p-2.5 bg-amber-50/60 border border-amber-200 text-amber-900 rounded-lg">
                  {selectedBuyer.notes}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
