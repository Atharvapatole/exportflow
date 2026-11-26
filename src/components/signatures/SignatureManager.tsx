'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  PenTool,
  Upload,
  Sliders,
  CheckCircle2,
  Trash2,
  ShieldAlert,
  Sparkles,
  Save,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SignatureAsset } from '@/types';

interface SignatureManagerProps {
  initialSignatures: SignatureAsset[];
  theme?: 'dark' | 'light';
}

export function SignatureManager({
  initialSignatures,
  theme = 'dark',
}: SignatureManagerProps) {
  const [signatures, setSignatures] = useState<SignatureAsset[]>(initialSignatures);
  const [signatoryName, setSignatoryName] = useState('');
  const [designation, setDesignation] = useState('Authorized Signatory');
  const [assetType, setAssetType] = useState<'signature' | 'company_stamp' | 'both'>('signature');

  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [processedPng, setProcessedPng] = useState<string | null>(null);
  const [threshold, setThreshold] = useState<number>(200); // 0 - 255
  const [contrastBoost, setContrastBoost] = useState<number>(1.2); // 1.0 - 2.0
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle Image File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setRawImageSrc(src);
    };
    reader.readAsDataURL(file);
  };

  // Process image with background removal on canvas
  useEffect(() => {
    if (!rawImageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Limit max dimensions for performance and crispness
      const maxDim = 800;
      let width = img.width;
      let height = img.height;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      // Alpha threshold algorithm:
      // Luminance = 0.299*R + 0.587*G + 0.114*B
      // White paper -> alpha = 0 (transparent)
      // Dark ink -> alpha = 255, boost contrast
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

        if (luminance >= threshold) {
          // Transparent background
          data[i + 3] = 0;
        } else {
          // Calculate ink opacity smoothly
          const factor = (threshold - luminance) / threshold;
          const alpha = Math.min(255, Math.round(factor * 255 * contrastBoost));
          data[i + 3] = alpha;

          // Preserve pen color but enhance richness (darken ink)
          data[i] = Math.max(0, Math.round(r * 0.8));
          data[i + 1] = Math.max(0, Math.round(g * 0.8));
          data[i + 2] = Math.max(0, Math.round(b * 0.8));
        }
      }

      ctx.putImageData(imgData, 0, 0);
      const resultDataUrl = canvas.toDataURL('image/png');
      setProcessedPng(resultDataUrl);
    };
    img.src = rawImageSrc;
  }, [rawImageSrc, threshold, contrastBoost]);

  // Save Signature Asset
  const handleSaveSignature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!processedPng || !signatoryName.trim()) return;

    setIsSaving(true);
    setSuccessMessage('');

    try {
      const res = await fetch('/api/signatures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signatoryName,
          designation,
          assetType,
          originalImageUrl: rawImageSrc || undefined,
          processedPngUrl: processedPng,
          isActive: true,
          cropSettings: {
            threshold,
            contrast: contrastBoost,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.asset) {
        setSignatures([data.asset, ...signatures]);
        setSuccessMessage('Signature saved to library successfully');
        setRawImageSrc(null);
        setProcessedPng(null);
        setSignatoryName('');
      }
    } catch {} finally {
      setIsSaving(false);
    }
  };

  // Delete Signature
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/signatures/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSignatures(signatures.filter((s) => s.id !== id));
      }
    } catch {}
  };

  const isDark = theme === 'dark';

  return (
    <div className="space-y-8">
      {/* Legal & Regulatory Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-amber-300">
            Legal Status: Graphical Signature / Stamp Studio
          </p>
          <p className="text-[11px] text-amber-200/80 leading-relaxed">
            The saved signature and stamp images below are reusable graphical assets intended for visual placement on Commercial Invoices, Packing Lists, and Quotations. This does <strong>NOT</strong> constitute a cryptographic Digital Signature Certificate (DSC) or Aadhaar eSign under Section 3 of the Information Technology Act, 2000. For ICEGATE filings, continue using your hardware crypto USB token.
          </p>
        </div>
      </div>

      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Studio Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step 1: Upload & Adjust */}
        <div className={`p-6 rounded-2xl border space-y-5 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-amber-400' : 'text-blue-600'}`}>
              <PenTool className="w-4 h-4" /> 1. Upload & Transparent Cutout Engine
            </h3>
            <span className="text-[10px] text-slate-500">Auto White-Paper Removal</span>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
              rawImageSrc
                ? 'border-emerald-500/40 bg-emerald-500/5'
                : isDark
                ? 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
                : 'border-slate-300 hover:border-blue-400 bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {rawImageSrc ? 'Change Photo of Signature / Stamp' : 'Upload Photo of Signature / Rubber Stamp'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Sign on a plain white paper with blue/black pen and upload a clear photo
                </p>
              </div>
            </div>
          </div>

          {/* Sliders for Threshold & Contrast */}
          {rawImageSrc && (
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                    Background White Cutoff Threshold: <strong>{threshold}</strong>
                  </span>
                  <span className="text-[10px] text-slate-500">Lower = Keeps more ink</span>
                </div>
                <input
                  type="range"
                  min="120"
                  max="245"
                  value={threshold}
                  onChange={(e) => setThreshold(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                    Ink Richness / Contrast Boost: <strong>{contrastBoost.toFixed(1)}x</strong>
                  </span>
                  <span className="text-[10px] text-slate-500">Enhance pen stroke density</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="2.5"
                  step="0.1"
                  value={contrastBoost}
                  onChange={(e) => setContrastBoost(parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
          )}

          {/* Form Details */}
          {processedPng && (
            <form onSubmit={handleSaveSignature} className="space-y-3 pt-3 border-t border-slate-800">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Signatory Full Name"
                  required
                  placeholder="e.g. Vikram Sharma"
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  className={isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300'}
                />

                <Input
                  label="Designation / Title"
                  required
                  placeholder="e.g. Authorized Signatory"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className={isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300'}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Asset Type</label>
                <select
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value as any)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                  }`}
                >
                  <option value="signature">Handwritten Signature</option>
                  <option value="company_stamp">Round Rubber Stamp / Seal</option>
                  <option value="both">Combined Signature & Stamp</option>
                </select>
              </div>

              <Button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border-0 text-xs py-2.5 mt-2 shadow-lg shadow-amber-500/20"
                isLoading={isSaving}
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Save to Transparent Asset Library
              </Button>
            </form>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-medium">
              {successMessage}
            </div>
          )}
        </div>

        {/* Step 2: Live Transparent Preview */}
        <div className={`p-6 rounded-2xl border space-y-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-amber-400' : 'text-blue-600'}`}>
              <ImageIcon className="w-4 h-4" /> 2. Live Transparent Cutout Preview
            </h3>
            <span className="text-[10px] text-slate-500">Checkered = Transparent</span>
          </div>

          {processedPng ? (
            <div className="space-y-4">
              {/* Checkered pattern container to visualize true alpha transparency */}
              <div
                className="h-64 rounded-2xl flex items-center justify-center p-4 border border-slate-700/60 overflow-hidden"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #1e293b 25%, transparent 25%), linear-gradient(-45deg, #1e293b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1e293b 75%), linear-gradient(-45deg, transparent 75%, #1e293b 75%)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                  backgroundColor: '#0f172a',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={processedPng}
                  alt="Processed signature"
                  className="max-h-full max-w-full object-contain filter drop-shadow-md"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Paper background completely removed. Dark ink isolated and optimized for crisp high-DPI export printing.
                </span>
              </div>
            </div>
          ) : (
            <div className="h-64 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col items-center justify-center p-6 text-center text-xs text-slate-500">
              <PenTool className="w-8 h-8 text-slate-700 mb-2" />
              <span>Upload a signature on the left to see the live transparent cutout here</span>
            </div>
          )}
        </div>
      </div>

      {/* Library of Saved Assets */}
      <div className="space-y-4">
        <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Active Signature & Stamp Library ({signatures.length})
        </h3>

        {signatures.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
            No saved signature assets found. Upload your first signature or company stamp above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {signatures.map((sig) => (
              <div
                key={sig.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between gap-4 ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white truncate max-w-[150px]">
                      {sig.signatoryName}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                      {(sig.assetType || 'signature').replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block">{sig.designation}</span>
                </div>

                {/* Thumbnail on transparent checkered background */}
                <div
                  className="h-28 rounded-xl flex items-center justify-center p-2 border border-slate-800 overflow-hidden"
                  style={{
                    backgroundImage:
                      'linear-gradient(45deg, #1e293b 25%, transparent 25%), linear-gradient(-45deg, #1e293b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1e293b 75%), linear-gradient(-45deg, transparent 75%, #1e293b 75%)',
                    backgroundSize: '16px 16px',
                    backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                    backgroundColor: '#0f172a',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sig.processedPngUrl}
                    alt={sig.signatoryName}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                  <span className="text-slate-500">Ready for Document Studio</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(sig.id)}
                    className="text-rose-400 hover:text-rose-300 p-1 transition-colors"
                    title="Remove signature asset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
