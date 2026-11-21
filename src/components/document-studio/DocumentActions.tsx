'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Download,
  Share2,
  Copy,
  ArrowRightLeft,
  Edit2,
  Trash2,
  Check,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ConvertModal } from './ConvertModal';
import { BaseDocument } from '@/types';

interface DocumentActionsProps {
  document: BaseDocument;
}

export function DocumentActions({ document: doc }: DocumentActionsProps) {
  const router = useRouter();
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/quote/${doc.shareToken}`
    : `/quote/${doc.shareToken}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${doc.documentNumber}?`)) return;
    try {
      await fetch(`/api/documents/${doc.id}`, { method: 'DELETE' });
      router.push('/dashboard/documents');
      router.refresh();
    } catch {
      alert('Failed to delete document');
    }
  };

  const editPath =
    doc.type === 'quotation'
      ? `/dashboard/quotations/${doc.id}/edit`
      : `/dashboard/documents/${doc.id}/edit`;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs mb-6 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm uppercase">
            {doc.type === 'quotation' ? 'QT' : doc.type === 'proforma_invoice' ? 'PI' : 'CI'}
          </div>
          <div>
            <h1 className="text-base font-bold text-[#172033]">{doc.documentNumber}</h1>
            <p className="text-xs text-slate-500">
              {doc.buyerCompany} • {doc.currency} {doc.grandTotal.toLocaleString()} • {doc.status.toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {doc.shareToken && (
            <Button size="sm" variant="outline" onClick={handleCopyLink} className="gap-1.5">
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Link Copied!' : 'Share Buyer Portal'}</span>
            </Button>
          )}

          <Button size="sm" variant="outline" onClick={handlePrint} className="gap-1.5">
            <Download className="w-4 h-4" />
            <span>Download PDF / Print</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsConvertOpen(true)}
            className="gap-1.5 border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Convert Document</span>
          </Button>

          <Link href={editPath}>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Edit2 className="w-4 h-4" />
              <span>Edit</span>
            </Button>
          </Link>

          <Button size="sm" variant="ghost" onClick={handleDelete} className="text-rose-600 hover:bg-rose-50 p-2">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ConvertModal
        isOpen={isConvertOpen}
        onClose={() => setIsConvertOpen(false)}
        document={doc}
      />
    </>
  );
}
