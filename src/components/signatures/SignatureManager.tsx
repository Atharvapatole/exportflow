'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  PenTool,
  Upload,
  CheckCircle2,
  Trash2,
  ShieldAlert,
  Sparkles,
  Save,
  Image as ImageIcon,
  RotateCcw,
  Eraser,
  Sliders,
  Palette,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SignatureAsset } from '@/types';

interface SignatureManagerProps {
  initialSignatures: SignatureAsset[];
  theme?: 'dark' | 'light';
}

const PEN_COLORS = [
  { name: 'Royal Blue (Ballpoint)', value: '#0D3B8E' },
  { name: 'Executive Black', value: '#111827' },
  { name: 'Customs Seal Red', value: '#BE123C' },
  { name: 'Agency Violet (Stamp)', value: '#6B21A8' },
];

export function SignatureManager({
  initialSignatures,
  theme = 'dark',
}: SignatureManagerProps) {
  const [signatures, setSignatures] = useState<SignatureAsset[]>(initialSignatures);
  const [creationMode, setCreationMode] = useState<'draw' | 'upload'>('draw');

  // Metadata
  const [signatoryName, setSignatoryName] = useState('');
  const [designation, setDesignation] = useState('Authorized Signatory');
  const [assetType, setAssetType] = useState<'signature' | 'company_stamp' | 'both'>('signature');

  // Drawing Pad state
  const [penColor, setPenColor] = useState('#0D3B8E');
  const [penWidth, setPenWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Upload & Cutout Engine state
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [threshold, setThreshold] = useState<number>(215); // 0 - 255
  const [contrastBoost, setContrastBoost] = useState<number>(1.3);
  const [inkMode, setInkMode] = useState<'auto' | 'blue_pen' | 'black_pen' | 'stamp'>('auto');

  // Output
  const [processedPng, setProcessedPng] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const processCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Drawing Pad Canvas
  useEffect(() => {
    if (creationMode !== 'draw') return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = 600;
    canvas.height = 240;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
  }, [creationMode]);

  // Update Drawing Stroke Styles
  useEffect(() => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
  }, [penColor, penWidth]);

  // Start Drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.beginPath();
    ctx.moveTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
  };

  // Draw Stroke
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.lineTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
    ctx.stroke();
  };

  // End Drawing & Capture Transparent PNG
  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    setProcessedPng(canvas.toDataURL('image/png'));
  };

  // Clear Drawing Canvas
  const clearDrawing = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setProcessedPng(null);
  };

  // Handle Photo / File Selection
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

  // Advanced Adaptive Ink Cutout Processing
  const processImageCutout = useCallback(() => {
    if (!rawImageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = processCanvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const maxDim = 900;
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

      // 1. Sample corner pixels to calculate true paper background tone
      let sampleR = 0;
      let sampleG = 0;
      let sampleB = 0;
      const cornerPoints = [
        0, // top-left
        (width - 1) * 4, // top-right
        ((height - 1) * width) * 4, // bottom-left
        ((height - 1) * width + (width - 1)) * 4, // bottom-right
      ];

      cornerPoints.forEach((idx) => {
        sampleR += data[idx];
        sampleG += data[idx + 1];
        sampleB += data[idx + 2];
      });

      const paperR = sampleR / 4;
      const paperG = sampleG / 4;
      const paperB = sampleB / 4;
      const paperLum = 0.299 * paperR + 0.587 * paperG + 0.114 * paperB;
      const effectiveThreshold = Math.min(threshold, paperLum - 5);

      // 2. Iterate pixels with color-difference ink isolation
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        // Check for ink chromaticity
        const isBlueInk = (b > r + 15 || b > g + 15) && lum < 220;
        const isStampColor = (r > g + 25 || (r > 120 && b > 100 && g < 100)) && lum < 225;
        const isDarkInk = lum < effectiveThreshold;

        let isInk = false;
        if (inkMode === 'blue_pen') {
          isInk = isBlueInk || (lum < 160);
        } else if (inkMode === 'stamp') {
          isInk = isStampColor || isBlueInk || (lum < 170);
        } else if (inkMode === 'black_pen') {
          isInk = lum < effectiveThreshold;
        } else {
          // Auto mode: detects blue pen, rubber stamps, and dark signatures
          isInk = isBlueInk || isStampColor || isDarkInk;
        }

        if (!isInk || lum >= threshold) {
          // Transparent background
          data[i + 3] = 0;
        } else {
          // Smooth anti-aliased alpha
          const diff = Math.max(0, effectiveThreshold - lum);
          const alphaFactor = Math.min(1, diff / 40);
          const alpha = Math.min(255, Math.round(alphaFactor * 255 * contrastBoost));
          data[i + 3] = alpha;

          // Preserve rich ink pigment while boosting contrast
          if (isBlueInk) {
            // Enhance rich deep blue ballpoint ink
            data[i] = Math.max(10, Math.round(r * 0.7));
            data[i + 1] = Math.max(30, Math.round(g * 0.75));
            data[i + 2] = Math.min(240, Math.round(b * 1.15));
          } else if (isStampColor) {
            // Enhance crisp red/violet stamp impression
            data[i] = Math.min(240, Math.round(r * 1.1));
            data[i + 1] = Math.max(10, Math.round(g * 0.65));
            data[i + 2] = Math.max(20, Math.round(b * 0.85));
          } else {
            // Dark pen ink
            data[i] = Math.max(0, Math.round(r * 0.75));
            data[i + 1] = Math.max(0, Math.round(g * 0.75));
            data[i + 2] = Math.max(0, Math.round(b * 0.75));
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      setProcessedPng(canvas.toDataURL('image/png'));
    };
    img.src = rawImageSrc;
  }, [rawImageSrc, threshold, contrastBoost, inkMode]);

  useEffect(() => {
    if (creationMode === 'upload' && rawImageSrc) {
      processImageCutout();
    }
  }, [creationMode, rawImageSrc, processImageCutout]);

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
          imageUrl: processedPng,
          stampImageUrl: assetType !== 'signature' ? processedPng : undefined,
          isActive: true,
          cropSettings: {
            mode: creationMode,
            threshold,
            contrast: contrastBoost,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.asset) {
        setSignatures([data.asset, ...signatures]);
        setSuccessMessage('Signature / Stamp asset saved to library successfully!');
        setRawImageSrc(null);
        setProcessedPng(null);
        clearDrawing();
        setSignatoryName('');
      }
    } catch {} finally {
      setIsSaving(false);
    }
  };

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
            ExportFlow Signature & Agency Stamp Studio (CBLR 2018 Regulation 10)
          </p>
          <p className="text-[11px] text-amber-200/80 leading-relaxed">
            Create transparent visual signatures and circular rubber stamps for automated placement on export documents, Bills of Entry worksheets, and declarations.
          </p>
        </div>
      </div>

      {/* Hidden processing canvas */}
      <canvas ref={processCanvasRef} className="hidden" />

      {/* Studio Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Creator Pad */}
        <div className={`p-6 rounded-2xl border space-y-5 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          {/* Mode Switch Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
              <button
                type="button"
                onClick={() => setCreationMode('draw')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  creationMode === 'draw'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Draw with Digital Pen</span>
              </button>
              <button
                type="button"
                onClick={() => setCreationMode('upload')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  creationMode === 'upload'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Photo / Scan</span>
              </button>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> 100% Ink Isolation
            </span>
          </div>

          {/* MODE 1: INTERACTIVE PEN DRAWING PAD */}
          {creationMode === 'draw' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Pen Ink Color Picker */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-semibold text-[11px]">Pen Ink:</span>
                  <div className="flex items-center gap-1.5">
                    {PEN_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setPenColor(c.value)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                          penColor === c.value ? 'scale-110 border-white shadow-md' : 'border-transparent opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c.value }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Stroke Thickness */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-semibold text-[11px]">Tip:</span>
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                    {[2, 3.5, 5].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setPenWidth(w)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          penWidth === w ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {w === 2 ? 'Fine' : w === 3.5 ? 'Medium' : 'Bold'}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={clearDrawing}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
                    title="Clear signature pad"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              {/* Drawing Canvas */}
              <div className="relative rounded-2xl border-2 border-dashed border-slate-700 bg-white shadow-inner overflow-hidden cursor-crosshair">
                <canvas
                  ref={drawCanvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-44 touch-none block"
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 text-xs">
                    <PenTool className="w-5 h-5 text-slate-400 mb-1" />
                    <span>Sign or draw your stamp here using mouse, stylus, or finger</span>
                    <span className="text-[10px] text-slate-400/80 font-mono mt-0.5">Smooth high-resolution pen capture</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MODE 2: UPLOAD PHOTO & ADAPTIVE CUTOUT ENGINE */}
          {creationMode === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                  rawImageSrc
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      {rawImageSrc ? 'Choose Different Signature / Stamp Image' : 'Upload Photo of Signature or Rubber Stamp'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Works on photos of white paper, scanned seals, blue ink, black gel pens, and official rubber stamps
                    </p>
                  </div>
                </div>
              </div>

              {rawImageSrc && (
                <div className="space-y-3 pt-2">
                  {/* Ink Preset Modes */}
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400 font-semibold block">Ink Detection Mode:</span>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'auto', label: 'Auto Detect' },
                        { id: 'blue_pen', label: 'Blue Pen' },
                        { id: 'black_pen', label: 'Black Ink' },
                        { id: 'stamp', label: 'Seal / Stamp' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setInkMode(m.id as any)}
                          className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                            inkMode === m.id
                              ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sliders */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Cutout Sensitivity (Background Removal):</span>
                      <strong className="font-mono text-amber-400">{threshold}</strong>
                    </div>
                    <input
                      type="range"
                      min="140"
                      max="245"
                      value={threshold}
                      onChange={(e) => setThreshold(parseInt(e.target.value, 10))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Ink Pigment Density (Contrast):</span>
                      <strong className="font-mono text-amber-400">{contrastBoost.toFixed(1)}x</strong>
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
            </div>
          )}

          {/* Form Metadata & Save Button */}
          {processedPng && (
            <form onSubmit={handleSaveSignature} className="space-y-3 pt-3 border-t border-slate-800">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Signatory Full Name"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white"
                />

                <Input
                  label="Designation / Authority"
                  required
                  placeholder="e.g. Authorized Signatory / CHA Agent"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Asset Role</label>
                <select
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border bg-slate-950 border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="signature">Handwritten Signature</option>
                  <option value="company_stamp">Round Agency Stamp / Seal</option>
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
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Right Column: Live Transparent Preview */}
        <div className={`p-6 rounded-2xl border space-y-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-amber-400">
              <ImageIcon className="w-4 h-4" /> Live Transparent Cutout Preview
            </h3>
            <span className="text-[10px] text-slate-500">Checkered = Alpha Transparent</span>
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

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Ink lines cleanly detected with transparent background. Ready for automatic stamping on BoE worksheets, invoices, and customs gate passes.
                </span>
              </div>
            </div>
          ) : (
            <div className="h-64 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col items-center justify-center p-6 text-center text-xs text-slate-500">
              <PenTool className="w-8 h-8 text-slate-700 mb-2" />
              <span>Draw on the signature pad or upload an image on the left to see the live transparent cutout here</span>
            </div>
          )}
        </div>
      </div>

      {/* Library of Saved Assets */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">
          Active Signature & Stamp Library ({signatures.length})
        </h3>

        {signatures.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
            No saved signature assets found. Draw or upload your first signature above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {signatures.map((sig) => (
              <div
                key={sig.id}
                className="p-4 rounded-2xl border flex flex-col justify-between gap-4 bg-slate-900 border-slate-800"
              >
                <div className="space-y-1.5">
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
                    src={sig.imageUrl || sig.processedPngUrl || sig.stampImageUrl}
                    alt={sig.signatoryName}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                  <span className="text-slate-500 font-mono text-[10px]">CBLR 2018 Ready</span>
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
