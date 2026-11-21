'use client';

import React, { useState, useEffect } from 'react';
import {
  Ship,
  Plus,
  Search,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Anchor,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/EmptyState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Shipment, ShipmentStatus } from '@/types';
import { SHIPMENT_STATUSES } from '@/config/constants';
import { formatDate } from '@/lib/utils';

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Shipment Form
  const [form, setForm] = useState({
    shipmentReference: '',
    buyerCompany: '',
    originPort: 'Nhava Sheva (JNPT), India',
    destinationPort: 'Port of Rotterdam, Netherlands',
    shippingLine: 'Maersk Line',
    vesselName: 'Maersk Mc-Kinney Moller / 042E',
    containerNumber: 'MSKU9876543',
    containerType: '20ft' as any,
    etd: new Date().toISOString().split('T')[0],
    eta: new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
    status: 'booked' as ShipmentStatus,
    freightDetails: 'Ocean Freight Prepaid under CIF terms',
    notes: '',
  });

  // Milestone Update Form
  const [updateStatus, setUpdateStatus] = useState<ShipmentStatus>('in_transit');
  const [updateLocation, setUpdateLocation] = useState('High Seas / Indian Ocean');
  const [updateComment, setUpdateComment] = useState('Vessel departed on schedule, transit normal');

  const loadShipments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/shipments');
      if (res.ok) setShipments(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShipments();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        loadShipments();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTrackingUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/shipments/${selectedShipment.id}/tracking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: updateStatus,
          location: updateLocation,
          comment: updateComment,
        }),
      });
      if (res.ok) {
        setIsUpdateModalOpen(false);
        loadShipments();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#172033] tracking-tight">Shipment & Container Tracker</h1>
          <p className="text-xs text-[#64748B]">Real-time ocean freight, container movement, ports of discharge & ETDs</p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Shipment
        </Button>
      </div>

      {/* Shipments List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading shipments...</div>
          ) : shipments.length === 0 ? (
            <EmptyState
              icon={Ship}
              title="No shipments recorded"
              description="Track container movements, ocean booking references, vessel departure and arrival milestones."
              actionLabel="Add First Shipment"
              onAction={() => setIsAddModalOpen(true)}
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {shipments.map((shp) => {
                const statusObj =
                  SHIPMENT_STATUSES.find((s) => s.id === shp.status) || SHIPMENT_STATUSES[0];

                return (
                  <div key={shp.id} className="p-5 hover:bg-slate-50/60 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          <Ship className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-[#172033] block">
                            {shp.shipmentReference} • {shp.buyerCompany}
                          </span>
                          <span className="text-xs text-slate-500">
                            {shp.shippingLine} • Vessel: {shp.vesselName || 'TBA'} • Container: {shp.containerNumber || 'TBA'} ({shp.containerType})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusObj.color}`}>
                          {statusObj.label}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedShipment(shp);
                            setIsUpdateModalOpen(true);
                          }}
                        >
                          + Log Milestone
                        </Button>
                      </div>
                    </div>

                    {/* Routing Bar */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <Anchor className="w-4 h-4 text-slate-400" />
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Port of Loading</span>
                          <span className="font-semibold text-[#172033]">{shp.originPort}</span>
                          <span className="text-slate-400 text-[10px] block">ETD: {formatDate(shp.etd)}</span>
                        </div>
                      </div>

                      <div className="flex-1 max-w-xs flex items-center justify-center">
                        <div className="w-full h-1 bg-slate-200 rounded-full relative">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{
                              width:
                                shp.status === 'delivered'
                                  ? '100%'
                                  : shp.status === 'arrived'
                                  ? '85%'
                                  : shp.status === 'in_transit'
                                  ? '50%'
                                  : '20%',
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-right">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Port of Discharge</span>
                          <span className="font-semibold text-[#172033]">{shp.destinationPort}</span>
                          <span className="text-slate-400 text-[10px] block">ETA: {formatDate(shp.eta)}</span>
                        </div>
                        <MapPin className="w-4 h-4 text-emerald-500" />
                      </div>
                    </div>

                    {/* Tracking Updates Timeline */}
                    {shp.updates && shp.updates.length > 0 && (
                      <div className="mt-3 pl-4 border-l-2 border-blue-200 space-y-1.5 text-xs text-slate-600">
                        {shp.updates.map((u, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400">{formatDate(u.date)}:</span>
                            <span className="font-bold text-[#172033] uppercase text-[10px]">{u.status.replace(/_/g, ' ')}</span>
                            <span>•</span>
                            <span>{u.location}: {u.comment}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Shipment Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Export Shipment"
        description="Record booking, vessel, and container routing details"
        maxWidth="2xl"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Shipment Reference / Booking No."
              required
              placeholder="e.g. SHP-2026-0042"
              value={form.shipmentReference}
              onChange={(e) => setForm({ ...form, shipmentReference: e.target.value })}
            />
            <Input
              label="Buyer / Consignee"
              required
              placeholder="e.g. EuroTrade GmbH"
              value={form.buyerCompany}
              onChange={(e) => setForm({ ...form, buyerCompany: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Port of Loading"
              required
              value={form.originPort}
              onChange={(e) => setForm({ ...form, originPort: e.target.value })}
            />
            <Input
              label="Port of Discharge"
              required
              value={form.destinationPort}
              onChange={(e) => setForm({ ...form, destinationPort: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Shipping Line / Carrier"
              value={form.shippingLine}
              onChange={(e) => setForm({ ...form, shippingLine: e.target.value })}
            />
            <Input
              label="Vessel & Voyage"
              value={form.vesselName}
              onChange={(e) => setForm({ ...form, vesselName: e.target.value })}
            />
            <Select
              label="Container Type"
              value={form.containerType}
              onChange={(e) => setForm({ ...form, containerType: e.target.value as any })}
              options={[
                { value: '20ft', label: "20' Standard GP" },
                { value: '40ft', label: "40' Standard GP" },
                { value: '40ft_hc', label: "40' High Cube" },
                { value: 'lcl', label: 'LCL (Less than Container)' },
                { value: 'air', label: 'Air Freight' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Container Number"
              placeholder="MSKU1234567"
              value={form.containerNumber}
              onChange={(e) => setForm({ ...form, containerNumber: e.target.value })}
            />
            <Input
              label="Estimated Departure (ETD)"
              type="date"
              required
              value={form.etd}
              onChange={(e) => setForm({ ...form, etd: e.target.value })}
            />
            <Input
              label="Estimated Arrival (ETA)"
              type="date"
              required
              value={form.eta}
              onChange={(e) => setForm({ ...form, eta: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" size="sm" isLoading={isSubmitting}>
              Save Shipment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Update Tracking Modal */}
      {selectedShipment && (
        <Modal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          title={`Log Tracking Milestone: ${selectedShipment.shipmentReference}`}
          maxWidth="md"
        >
          <form onSubmit={handleAddTrackingUpdate} className="space-y-4">
            <Select
              label="Current Milestone Status"
              value={updateStatus}
              onChange={(e) => setUpdateStatus(e.target.value as any)}
              options={SHIPMENT_STATUSES.map((s) => ({ value: s.id, label: s.label }))}
            />
            <Input
              label="Current Location"
              value={updateLocation}
              onChange={(e) => setUpdateLocation(e.target.value)}
            />
            <Input
              label="Status Comment / Details"
              value={updateComment}
              onChange={(e) => setUpdateComment(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsUpdateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="secondary" size="sm" isLoading={isSubmitting}>
                Save Milestone
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
