'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  CheckCircle,
  FileText,
  Download,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/EmptyState';
import { DocumentRenderer } from '@/components/document-studio/DocumentRenderer';
import { BaseDocument } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BrandLogo } from '@/components/layout/BrandLogo';

export default function PublicQuotationAcceptancePage() {
  const params = useParams();
  const token = params.token as string;

  const [doc, setDoc] = useState<BaseDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionDone, setActionDone] = useState<string | null>(null);

  // Modals
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionMessage, setRevisionMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadQuote() {
      try {
        setLoading(true);
        const res = await fetch(`/api/quote/${token}`);
        if (!res.ok) {
          throw new Error('This quotation link is invalid, expired, or has been revoked.');
        }
        const data = await res.json();
        setDoc(data);
        if (data.status === 'accepted') setActionDone('accepted');
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (token) loadQuote();
  }, [token]);

  const handleAccept = async () => {
    if (!confirm('Confirm acceptance of this export quotation? The exporter will prepare a Proforma Invoice.')) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/quote/${token}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      });
      if (res.ok) {
        setActionDone('accepted');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionMessage.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/quote/${token}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revise', message: revisionMessage }),
      });
      if (res.ok) {
        setIsRevisionModalOpen(false);
        setActionDone('revised');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <BrandLogo size="md" className="justify-center" />
          <p className="text-xs text-slate-500">Securely verifying international quotation link...</p>
        </div>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-4">
        <div className="max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-200 text-center">
          <BrandLogo size="md" className="justify-center mb-4" />
          <h2 className="text-lg font-bold text-[#172033] mb-2">Quotation Not Available</h2>
          <p className="text-xs text-slate-500 mb-6">{error || 'This link is no longer accessible.'}</p>
          <a href="/">
            <Button size="sm" variant="outline">
              Return to ExportFlow Home
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col pb-12">
      {/* Top Buyer Bar */}
      <header className="bg-[#10243A] text-white py-4 px-6 md:px-12 sticky top-0 z-30 shadow-md no-print">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
              QT
            </div>
            <div>
              <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider block">
                Official Export Quotation
              </span>
              <div className="text-sm font-black flex items-center gap-2">
                <span>{doc.documentNumber}</span>
                <span className="text-xs font-normal text-slate-300">
                  ({doc.currency} {doc.grandTotal.toLocaleString()})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href={`/api/documents/${doc.id}/pdf`}
              download={`ExportFlow_Quotation_${doc.documentNumber}.pdf`}
              className="inline-flex items-center justify-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-white border border-slate-600 hover:bg-slate-700 transition-colors shadow-2xs"
            >
              <Download className="w-4 h-4 mr-1.5" />
              Download PDF
            </a>

            {actionDone === 'accepted' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold">
                <CheckCircle className="w-4 h-4" />
                Quotation Accepted
              </span>
            ) : actionDone === 'revised' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-bold">
                <Clock className="w-4 h-4" />
                Revision Submitted
              </span>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsRevisionModalOpen(true)}
                  className="bg-slate-800 text-white border-slate-600 hover:bg-slate-700"
                >
                  <MessageSquare className="w-4 h-4 mr-1.5" />
                  Request Change
                </Button>
                <Button
                  size="sm"
                  variant="emerald"
                  onClick={handleAccept}
                  isLoading={isSubmitting}
                >
                  <CheckCircle className="w-4 h-4 mr-1.5" />
                  Accept Quotation
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto w-full px-4 pt-8">
        {actionDone === 'accepted' && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs no-print">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Thank you! You have accepted this quotation.</p>
              <p className="text-emerald-700 mt-0.5">
                The seller ({doc.sellerDetails?.legalName}) has been notified to issue your formal Proforma Invoice.
              </p>
            </div>
          </div>
        )}

        <DocumentRenderer doc={doc} />
      </main>

      {/* Revision Modal */}
      <Modal
        isOpen={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
        title="Request Quotation Revision"
        description="Submit your proposed price, quantity, or shipping term adjustments directly to the exporter"
        maxWidth="md"
      >
        <form onSubmit={handleRequestRevision} className="space-y-4">
          <Textarea
            label="Revision Details"
            required
            rows={4}
            placeholder="e.g. Please update quantity to 200 units, or adjust Incoterms to CIF Hamburg..."
            value={revisionMessage}
            onChange={(e) => setRevisionMessage(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsRevisionModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" size="sm" isLoading={isSubmitting}>
              Send Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
