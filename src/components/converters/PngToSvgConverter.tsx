import React, { useState } from 'react';
import { UploadZone } from '../common/UploadZone';
import { ProcessingState } from '../common/ProcessingState';
import { ResultCard } from '../common/ResultCard';
import { PrivacyBadge } from '../common/PrivacyBadge';
import { ConverterConfig, ConversionResult, ProcessingProgress } from '../../types';
import { replaceExtension, formatBytes, loadImageFromFile } from '../../utils/fileUtils';
import { traceImageToSvg, TracingOptions } from '../../utils/imageTracer';
import { Sliders, CheckCircle2, FileImage, Sparkles, Info } from 'lucide-react';

export const PngToSvgConverter: React.FC<{ config: ConverterConfig }> = ({ config }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [colorCount, setColorCount] = useState<number>(16);
  const [simplifyTolerance, setSimplifyTolerance] = useState<number>(2);
  const [progress, setProgress] = useState<ProcessingProgress>({
    status: 'idle',
    percentage: 0,
    stageMessage: ''
  });
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    const file = files[0];
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);
    setResult(null);
  };

  const handleConvert = async () => {
    if (!selectedFile) return;

    setProgress({
      status: 'reading',
      percentage: 15,
      stageMessage: 'Loading bitmap pixels...'
    });
    setError(null);

    try {
      const img = await loadImageFromFile(selectedFile);

      const options: TracingOptions = {
        colorCount,
        scale: 1,
        blurRadius: 0,
        simplifyTolerance,
        minArea: 4
      };

      const svgString = await traceImageToSvg(img, options, (pct, msg) => {
        setProgress({
          status: 'converting',
          percentage: pct,
          stageMessage: msg
        });
      });

      const outputBlob = new Blob([svgString], { type: 'image/svg+xml' });
      const outputName = replaceExtension(selectedFile.name, '.svg');

      setResult({
        blob: outputBlob,
        fileName: outputName,
        fileSize: outputBlob.size,
        originalSize: selectedFile.size,
        originalName: selectedFile.name,
        mimeType: 'image/svg+xml'
      });

      setProgress({ status: 'complete', percentage: 100, stageMessage: 'Done!' });
    } catch (err: any) {
      console.error('Vectorization error:', err);
      setError(`Vectorization failed: ${err.message || 'Could not trace bitmap'}`);
      setProgress({ status: 'error', percentage: 0, stageMessage: 'Failed' });
    }
  };

  const handleReset = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setSelectedFile(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
    setProgress({ status: 'idle', percentage: 0, stageMessage: '' });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {result ? (
        <ResultCard result={result} onReset={handleReset} />
      ) : progress.status !== 'idle' && progress.status !== 'error' ? (
        <ProcessingState progress={progress} />
      ) : !selectedFile ? (
        <div className="space-y-6">
          <UploadZone
            acceptedExtensions={config.acceptedExtensions}
            acceptedMimeTypes={config.acceptedMimeTypes}
            maxSizeBytes={config.maxFileSizeBytes}
            onFilesSelected={handleFilesSelected}
            title="Drop your PNG image or logo here"
            subtitle="Converts raster PNG into scalable SVG vector paths."
            toolId={config.id}
          />
          <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-800/40 text-blue-300 text-xs flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p>
              <strong>Best vector results:</strong> Logos, icons, digital illustrations, badges, and graphics with clean contrast vectorize best into SVG paths.
            </p>
          </div>
          <PrivacyBadge />
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-12 h-12 rounded-xl object-contain bg-slate-950 border border-slate-700 p-1" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <FileImage className="w-5 h-5" />
                </div>
              )}
              <div>
                <h4 className="font-semibold text-white text-sm sm:text-base font-mono">{selectedFile.name}</h4>
                <p className="text-xs text-slate-400">{formatBytes(selectedFile.size)}</p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-slate-200 underline"
            >
              Choose different file
            </button>
          </div>

          <div className="space-y-4">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              Vector Tracing Controls
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-300">Color Palette Fidelity</span>
                  <span className="font-mono text-blue-400 font-bold">{colorCount} colors</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="32"
                  step="2"
                  value={colorCount}
                  onChange={(e) => setColorCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>2 (Minimalist / Monochrome)</span>
                  <span>32 (Detailed artwork)</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-300">Path Smoothing</span>
                  <span className="font-mono text-blue-400 font-bold">Level {simplifyTolerance}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  step="1"
                  value={simplifyTolerance}
                  onChange={(e) => setSimplifyTolerance(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Sharp / Exact</span>
                  <span>Ultra-Smooth Curves</span>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div className="pt-4">
            <button
              onClick={handleConvert}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Trace & Generate SVG Vector</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
