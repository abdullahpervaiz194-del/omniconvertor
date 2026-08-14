import React, { useState } from 'react';
import { UploadZone } from '../common/UploadZone';
import { ProcessingState } from '../common/ProcessingState';
import { ResultCard } from '../common/ResultCard';
import { PrivacyBadge } from '../common/PrivacyBadge';
import { ConverterConfig, ConversionResult, ProcessingProgress } from '../../types';
import { replaceExtension, formatBytes, loadImageFromFile } from '../../utils/fileUtils';
import { Sliders, CheckCircle2, FileImage } from 'lucide-react';

export const WebpToPngConverter: React.FC<{ config: ConverterConfig }> = ({ config }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<'png' | 'jpeg'>('png');
  const [quality, setQuality] = useState<number>(0.92);
  const [backgroundFill, setBackgroundFill] = useState<'transparent' | 'white' | 'black'>('white');
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
      percentage: 25,
      stageMessage: 'Loading WebP bitmap...'
    });
    setError(null);

    try {
      const img = await loadImageFromFile(selectedFile);

      setProgress({
        status: 'converting',
        percentage: 60,
        stageMessage: `Rendering to ${targetFormat.toUpperCase()} canvas...`
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d')!;

      // Handle background fill if converting transparent WebP to JPG
      if (targetFormat === 'jpeg' || backgroundFill !== 'transparent') {
        ctx.fillStyle = backgroundFill === 'black' ? '#000000' : '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      setProgress({
        status: 'building',
        percentage: 90,
        stageMessage: 'Encoding image blob...'
      });

      const mime = targetFormat === 'png' ? 'image/png' : 'image/jpeg';
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Canvas export failed.'))),
          mime,
          targetFormat === 'jpeg' ? quality : undefined
        );
      });

      const newExt = targetFormat === 'png' ? '.png' : '.jpg';
      const outputName = replaceExtension(selectedFile.name, newExt);

      setResult({
        blob,
        fileName: outputName,
        fileSize: blob.size,
        originalSize: selectedFile.size,
        originalName: selectedFile.name,
        mimeType: mime
      });

      setProgress({ status: 'complete', percentage: 100, stageMessage: 'Done!' });
    } catch (err: any) {
      console.error('WebP conversion error:', err);
      setError(`Conversion failed: ${err.message || 'Corrupt or unreadable WebP image'}`);
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
            title="Drop your WebP image here"
            subtitle="Converts .webp web graphics to standard PNG or JPG files."
            toolId={config.id}
          />
          <PrivacyBadge />
        </div>
      ) : (
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-[#27272a]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <FileImage className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-xs sm:text-sm font-mono">{selectedFile.name}</h4>
                <p className="text-[11px] text-[#71717a] font-mono">{formatBytes(selectedFile.size)}</p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="text-xs text-[#a1a1aa] hover:text-white underline cursor-pointer font-mono"
            >
              Change file
            </button>
          </div>

          <div className="space-y-3">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#a1a1aa] flex items-center gap-1.5 font-mono">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              Raster Configuration
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-mono text-[#a1a1aa]">Target Format</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetFormat('png')}
                    className={`py-2 px-3 rounded-lg text-xs font-mono font-semibold border transition-all cursor-pointer ${
                      targetFormat === 'png'
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-[#09090b] border-[#27272a] text-[#a1a1aa] hover:bg-[#18181b]'
                    }`}
                  >
                    PNG (Transparency)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetFormat('jpeg')}
                    className={`py-2 px-3 rounded-lg text-xs font-mono font-semibold border transition-all cursor-pointer ${
                      targetFormat === 'jpeg'
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-[#09090b] border-[#27272a] text-[#a1a1aa] hover:bg-[#18181b]'
                    }`}
                  >
                    JPG (Compressed)
                  </button>
                </div>
              </div>

              {targetFormat === 'jpeg' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#a1a1aa]">JPG Quality</span>
                    <span className="font-mono text-indigo-400 font-bold">{Math.round(quality * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.0"
                    step="0.05"
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-[#09090b] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-[#71717a] font-mono">
                    <span>Smaller size</span>
                    <span>Best quality</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-900/50 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleConvert}
              className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs font-mono shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Convert to {targetFormat.toUpperCase()}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
