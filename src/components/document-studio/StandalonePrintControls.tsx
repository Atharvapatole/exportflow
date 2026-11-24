'use client';

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Download, Printer, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BaseDocument } from '@/types';
import { downloadDocumentPdf } from '@/lib/pdf/downloadDocument';

export function StandalonePrintControls({ doc }: { doc: BaseDocument }) {
  const searchParams = useSearchParams();
  const autoPrint = searchParams.get('print') === 'true';

  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  const handleDownload = () => {
    downloadDocumentPdf(doc);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.close();
    }
  };

  return (
    <aside
      aria-label="Document Controls"
      className="no-print fixed bottom-6 right-6 z-50 flex items-center gap-2 p-2 bg-[#10243A]/95 backdrop-blur-md text-white rounded-full shadow-2xl border border-slate-700 select-none"
    >
      <Button
        size="sm"
        onClick={handleDownload}
        className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-full px-3.5 h-8 gap-1.5 shadow-sm"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Download PDF</span>
      </Button>

      <Button
        size="sm"
        onClick={handlePrint}
        className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-full px-3.5 h-8 gap-1.5 shadow-sm"
      >
        <Printer className="w-3.5 h-3.5" />
        <span>Print</span>
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={handleClose}
        className="text-slate-300 hover:text-white hover:bg-slate-800 rounded-full w-8 h-8 p-0"
        title="Close Preview"
      >
        <X className="w-4 h-4" />
      </Button>
    </aside>
  );
}
