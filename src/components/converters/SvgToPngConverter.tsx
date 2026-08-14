import React, { useState } from 'react';
import { UploadZone } from '../common/UploadZone';
import { ProcessingState } from '../common/ProcessingState';
import { ResultCard } from '../common/ResultCard';
import { PrivacyBadge } from '../common/PrivacyBadge';
import { ConverterConfig, ConversionResult, ProcessingProgress } from '../../types';
import { replaceExtension, formatBytes, readAsText } from '../../utils/fileUtils';
import { Sliders, CheckCircle2, FileCode } from 'lucide-react';

export const SvgToPngConverter: React.FC<{ config: ConverterConfig }> = ({ config }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<'png' | 'jpeg'>('png');
  const [scalePreset, setScalePreset] = useState<'original' | '512' | '1024' | '2048' | '4096'>('1024');
  const [backgroundFill, setBackgroundFill] = useState<'transparent' | 'white' | 'black'>('transparent');
  const [progress, setProgress] = useState<ProcessingProgress>({
    status: 'idle',
    percentage: 0,
    stageMessage: ''
  });
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    setSelectedFile(files[0]);
    setError(null);
    setResult(null);
  };

  const handleConvert = async () => {
    if (!selectedFile) return;

    setProgress({
      status: 'reading',
      percentage: 20,
      stageMessage: 'Parsing SVG markup...'
    });
    setError(null);

    try {
      const svgText = await readAsText(selectedFile);

      // Verify valid SVG
      if (!svgText.includes('<svg') || !svgText.includes('</svg>')) {
        throw new Error('The file does not contain a valid <svg> root element.');
      }

      setProgress({
        status: 'converting',
        percentage: 50,
        stageMessage: 'Rendering vector onto high-resolution canvas...'
      });

      const blobSvg = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(blobSvg);

      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Browser failed to render SVG elements.'));
        img.src = svgUrl;
      });

      // Calculate target dimensions
      let targetWidth = img.naturalWidth || 800;
      let targetHeight = img.naturalHeight || 800;

      if (scalePreset !== 'original') {
        const dim = parseInt(scalePreset);
        const aspect = (img.naturalWidth || 800) / (img.naturalHeight || 800);
        if (aspect >= 1) {
          targetWidth = dim;
          targetHeight = Math.round(dim / aspect);
        } else {
          targetHeight = dim;
          targetWidth = Math.round(dim * aspect);
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d')!;

      // Background fill
      if (targetFormat === 'jpeg' || backgroundFill !== 'transparent') {
        ctx.fillStyle = backgroundFill === 'black' ? '#000000' : '#FFFFFF';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      URL.revokeObjectURL(svgUrl);

      setProgress({
        status: 'building',
        percentage: 90,
        stageMessage: 'Encoding raster image...'
      });

      const mime = targetFormat === 'png' ? 'image/png' : 'image/jpeg';
      const outputBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Failed to encode raster canvas'))),
          mime,
          targetFormat === 'jpeg' ? 0.95 : undefined
        );
      });

      const newExt = targetFormat === 'png' ? '.png' : '.jpg';
      const outputName = replaceExtension(selectedFile.name, newExt);

      setResult({
        blob: outputBlob,
        fileName: outputName,
        fileSize: outputBlob.size,
        originalSize: selectedFile.size,
        originalName: selectedFile.name,
        mimeType: mime,
        dimensions: { width: targetWidth, height: targetHeight }
      });

      setProgress({ status: 'complete', percentage: 100, stageMessage: 'Done!' });
    } catch (err: any) {
      console.error('SVG rasterization error:', err);
      setError(`Rasterization failed: ${err.message || 'Invalid SVG content'}`);
      setProgress({ status: 'error', percentage: 0, stageMessage: 'Failed' });
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
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
            title="Drop your SVG vector file here"
            subtitle="Rasterize scalable SVG graphics to crisp PNG or JPG images at any resolution."
            toolId={config.id}
          />
          <PrivacyBadge />
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <FileCode className="w-5 h-5" />
              </div>
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
              Raster Dimensions & Options
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Format</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setTargetFormat('png'); setBackgroundFill('transparent'); }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      targetFormat === 'png'
                        ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    PNG (Transparent)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTargetFormat('jpeg'); setBackgroundFill('white'); }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      targetFormat === 'jpeg'
                        ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    JPG (Solid)
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Target Resolution</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['512', '1024', '2048', '4096'] as const).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setScalePreset(preset)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                        scalePreset === preset
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                      }`}
                    >
                      {preset}px
                    </button>
                  ))}
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
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Export {targetFormat.toUpperCase()} ({scalePreset}px)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
