'use client';

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Printer, ArrowLeft, Download, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PrintControlsProps {
  documentNumber: string;
  documentType: string;
}

export function PrintControls({ documentNumber, documentType }: PrintControlsProps) {
  const searchParams = useSearchParams();
  const autoPrint = searchParams.get('print') === 'true';

  useEffect(() => {
    if (autoPrint) {
      // Small timeout to allow images and styles to paint before opening print dialog
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.close();
    }
  };

  return (
    <div className="no-print bg-[#10243A] text-white py-3 px-6 sticky top-0 z-50 shadow-md border-b border-slate-700 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          onClick={handleBack}
          className="border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white gap-1.5 h-8 text-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </Button>
        <div className="border-l border-slate-700 pl-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white tracking-wide uppercase">
              {documentType.replace(/_/g, ' ')}
            </span>
            <span className="text-xs text-blue-300 font-mono font-semibold">
              {documentNumber}
            </span>
          </div>
          <p className="text-[10px] text-slate-400">
            Dedicated print-isolated layout • Clean document-only export
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>A4 Format Ready (14mm Margins)</span>
        </div>

        <Button
          size="sm"
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm gap-1.5 h-8"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Save as PDF</span>
        </Button>
      </div>
    </div>
  );
}
