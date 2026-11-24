// =====================================================================
// CIVIL REGISTRY PORTAL - AI DOCUMENT SCANNER & AUTO-FILL MODAL (React)
// Supports Live Camera Capture (Web + Mobile), File Upload (PDF/JPG/PNG),
// Sample ID/Certificate Presets, and Per-Field Confidence Auto-Fill
// =====================================================================

import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw,
  FileCheck,
  Wand2,
} from 'lucide-react';
import { AI_SCAN_PRESETS } from '../services/firebase';
import { usePortal } from '../context/PortalContext';

export default function AIDocumentScannerModal({
  isOpen,
  onClose,
  onApplyExtractedFields,
  defaultPreset = 'philsys_id',
}) {
  const { scanDocumentForAutoFill, showToast } = usePortal();
  const [mode, setMode] = useState('preset'); // 'preset' | 'camera' | 'upload'
  const [selectedPreset, setSelectedPreset] = useState(defaultPreset);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setScanResult(null);
      setIsScanning(false);
    }
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setCameraError(
        'Camera access unavailable in this browser window. You can upload a photo/PDF or use the Sample ID Scan Presets below.'
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleRunScan = async () => {
    setIsScanning(true);
    try {
      const result = await scanDocumentForAutoFill({
        presetKey: selectedPreset,
        file: uploadedFile,
      });
      setScanResult(result);
      showToast(
        `Extracted ${Object.keys(result.fields || {}).length} fields (${result.overallScore}% optical clarity)`,
        'success',
        'AI Document Scan Complete'
      );
    } catch (err) {
      showToast(err.message || 'Failed to scan document', 'error', 'Scan Error');
    } finally {
      setIsScanning(false);
      stopCamera();
    }
  };

  const handleApplyToForm = () => {
    if (!scanResult?.fields) return;
    onApplyExtractedFields(scanResult);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="AI Document Scanner"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 overflow-y-auto modal-overlay"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 animate-fade-in my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0e2756] text-white flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-slate-900">
                Document Scanner & Automated Form Pre-Fill
              </h3>
              <p className="text-xs text-slate-500">
                Scan a Government ID, Live Birth, or Marriage Certificate to auto-fill application inputs
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close AI Document Scanner"
            className="text-slate-400 hover:text-slate-600 p-1 rounded"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Mode Switcher Tabs (Stacks cleanly on narrow mobile screens) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 mt-4 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setMode('preset');
            }}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mode === 'preset' ? 'bg-[#0e2756] text-white shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sample ID Presets
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('camera');
              startCamera();
            }}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mode === 'camera' ? 'bg-[#0e2756] text-white shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mobile / Web Camera
          </button>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setMode('upload');
            }}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mode === 'upload' ? 'bg-[#0e2756] text-white shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upload Scan (PDF/IMG)
          </button>
        </div>

        {/* Input Source Area */}
        <div className="mt-4 space-y-4">
          {mode === 'preset' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Sample Civil Registry Document to Simulate AI OCR Scan
              </label>
              <div className="space-y-2">
                {Object.entries(AI_SCAN_PRESETS).map(([key, item]) => (
                  <label
                    key={key}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer text-xs transition-all ${
                      selectedPreset === key
                        ? 'border-[#0e2756] bg-blue-50/60 font-semibold text-slate-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="ai_preset"
                        value={key}
                        checked={selectedPreset === key}
                        onChange={() => setSelectedPreset(key)}
                        className="text-[#0e2756]"
                      />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                      {item.overallScore}% Clarity
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {mode === 'camera' && (
            <div className="bg-slate-900 rounded-xl overflow-hidden relative min-h-[220px] flex flex-col items-center justify-center text-white p-4">
              {cameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full max-h-60 object-cover rounded-lg"
                  />
                  <div className="scan-beam" />
                  <div className="text-[11px] text-emerald-300 mt-2 font-mono">
                    Align ID or Birth Certificate inside frame and click Scan below
                  </div>
                </>
              ) : (
                <div className="text-center space-y-3 p-4">
                  <Camera className="w-10 h-10 text-blue-300 mx-auto" />
                  <p className="text-xs text-slate-300 max-w-md">
                    {cameraError || 'Use your device camera or native mobile camera capture:'}
                  </p>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-900 rounded-lg text-xs font-semibold cursor-pointer">
                    <Camera className="w-4 h-4 text-[#0e2756]" />
                    Open Mobile Camera / Capture Photo
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setUploadedFile(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                </div>
              )}
            </div>
          )}

          {mode === 'upload' && (
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center bg-slate-50 space-y-3">
              <Upload className="w-8 h-8 text-[#0e2756] mx-auto" />
              <div className="text-xs text-slate-600">
                Upload a clear scan or photo of your ID or Birth/Marriage Certificate (PDF, JPG, PNG up to 10 MB)
              </div>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                className="form-input text-xs max-w-sm mx-auto bg-white"
              />
              {uploadedFile && (
                <div className="text-xs font-semibold text-emerald-700">
                  Selected: {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>
          )}

          {/* Scan Trigger Button */}
          <div className="flex justify-end">
            <button
              type="button"
              disabled={isScanning}
              onClick={handleRunScan}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-[#0e2756] to-[#1e40af] text-white rounded-lg text-xs font-semibold shadow-md hover:brightness-110 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" /> Running Document OCR & Field Extraction…
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" aria-hidden="true" /> Run Document Scan
                </>
              )}
            </button>
          </div>
        </div>

        {/* Extracted Fields & Confidence Scores Preview */}
        {scanResult && (
          <div aria-live="polite" className="mt-5 pt-5 border-t border-slate-200 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-emerald-950">
                    {scanResult.documentType} — {scanResult.overallScore}% Optical Confidence
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-0.5">{scanResult.summary}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 uppercase tracking-wider">
                  Extracted Fields Ready for Auto-Fill
                </span>
                <span className="text-[11px] text-slate-500">
                  Fields &lt; 88% confidence are highlighted for review
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.entries(scanResult.fields || {}).map(([fieldKey, info]) => {
                  const pct = Math.round((info.confidence || 0.95) * 100);
                  const isLowConfidence = pct < 88;
                  return (
                    <div
                      key={fieldKey}
                      className={`p-3 rounded-lg border text-xs ${
                        isLowConfidence
                          ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold text-slate-500">
                          {info.label}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                            isLowConfidence
                              ? 'bg-amber-200/80 text-amber-900'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isLowConfidence && <AlertTriangle className="w-2.5 h-2.5" />}
                          {pct}%
                        </span>
                      </div>
                      <div className="font-bold text-sm truncate">{info.value}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyToForm}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow flex items-center gap-2"
              >
                <FileCheck className="w-4 h-4" /> Auto-Fill Form Inputs Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
