'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, FileCheck, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/EmptyState';
import { BaseDocument, DocumentType } from '@/types';

interface ConvertModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: BaseDocument;
}

export function ConvertModal({ isOpen, onClose, document: doc }: ConvertModalProps) {
  const router = useRouter();
  const [targetType, setTargetType] = useState<DocumentType>(
    doc.type === 'quotation'
      ? 'proforma_invoice'
      : doc.type === 'proforma_invoice'
      ? 'commercial_invoice'
      : 'packing_list'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConvert = async () => {
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/documents/${doc.id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType }),
      });

      const newDoc = await res.json();
      if (!res.ok) throw new Error(newDoc.error || 'Failed to convert document');

      onClose();
      const redirectPath =
        targetType === 'proforma_invoice'
          ? `/dashboard/proforma-invoices/${newDoc.id}`
          : targetType === 'commercial_invoice'
          ? `/dashboard/commercial-invoices/${newDoc.id}`
          : targetType === 'packing_list'
          ? `/dashboard/packing-lists/${newDoc.id}`
          : `/dashboard/documents/${newDoc.id}`;

      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const options = [
    {
      type: 'proforma_invoice' as DocumentType,
      title: 'Proforma Invoice (PI)',
      desc: 'Creates formal binding PI for buyer advance wire transfer or Letter of Credit opening.',
    },
    {
      type: 'commercial_invoice' as DocumentType,
      title: 'Commercial Invoice (CI)',
      desc: 'Creates official shipping invoice for customs clearance and port dispatch.',
    },
    {
      type: 'packing_list' as DocumentType,
      title: 'Export Packing List (PL)',
      desc: 'Auto-calculates cartons, net/gross weights, and total CBM from line items.',
    },
    {
      type: 'sales_order' as DocumentType,
      title: 'Sales Order Confirmation',
      desc: 'Internal order voucher for factory production and dispatch scheduling.',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Convert Document Workflow"
      description={`1-Click convert ${doc.type.toUpperCase()} (${doc.documentNumber}) into next trade stage`}
      maxWidth="md"
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      <div className="space-y-3 mb-6">
        {options.map((opt) => (
          <div
            key={opt.type}
            onClick={() => setTargetType(opt.type)}
            className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
              targetType === opt.type
                ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#172033]">{opt.title}</span>
              {targetType === opt.type && (
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{opt.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="secondary" size="sm" onClick={handleConvert} isLoading={isLoading}>
          Convert Document
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Modal>
  );
}
