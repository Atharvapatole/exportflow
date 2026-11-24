import { BaseDocument } from '@/types';
import { generateDocumentPdf, DOCUMENT_TITLES } from './generateDocumentPdf';

/**
 * Client-side direct PDF file download
 * Generates and downloads a pure, vector-sharp PDF document directly.
 * Guaranteed 0% website navigation, 0% headers, 0% sidebars, 0% localhost URLs, and 0% browser chrome.
 */
export async function downloadDocumentPdf(doc: BaseDocument): Promise<void> {
  const docTypeTitle = DOCUMENT_TITLES[doc.type] || doc.type.replace(/_/g, ' ').toUpperCase();
  const cleanType = docTypeTitle.replace(/\s+/g, '_');
  const cleanDocNum = (doc.documentNumber || 'Draft').replace(/[\/\\]/g, '-');
  const filename = `ExportFlow_${cleanType}_${cleanDocNum}.pdf`;

  try {
    // Generate the pure vector PDF bytes directly using the shared engine
    const pdfBytes = generateDocumentPdf(doc);
    const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 3000);
  } catch (err) {
    console.warn('Direct client vector generation failed, falling back to server API stream:', err);
    // Fallback to server API route if client generation encounters an unexpected environment issue
    if (doc.id) {
      const link = document.createElement('a');
      link.href = `/api/documents/${doc.id}/pdf`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

/**
 * Open the isolated standalone document rendering page.
 * Completely free of dashboard layouts, sidebars, headers, and UI controls.
 */
export function openIsolatedPrintWindow(docId: string, autoPrint = true): void {
  const url = `/standalone/document/${docId}${autoPrint ? '?print=true' : ''}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
