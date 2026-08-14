import React, { useState } from 'react';
import { UploadZone } from '../common/UploadZone';
import { ProcessingState } from '../common/ProcessingState';
import { ResultCard } from '../common/ResultCard';
import { PrivacyBadge } from '../common/PrivacyBadge';
import { ConverterConfig, ConversionResult, ProcessingProgress } from '../../types';
import { formatBytes } from '../../utils/fileUtils';
import { convertImagesToPdf } from '../../services/pdfService';
import { Images, ArrowUp, ArrowDown, Trash2, Plus, CheckCircle2, Sliders } from 'lucide-react';

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
}

export const ImageToPdfConverter: React.FC<{ config: ConverterConfig }> = ({ config }) => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'fit'>('a4');
  const [margin, setMargin] = useState<number>(20);
  const [progress, setProgress] = useState<ProcessingProgress>({
    status: 'idle',
    percentage: 0,
    stageMessage: ''
  });
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    const newItems: ImageItem[] = files.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      previewUrl: URL.createObjectURL(file)
    }));
    setImages((prev) => [...prev, ...newItems]);
    setError(null);
    setResult(null);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= images.length) return;
    const copy = [...images];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    setImages(copy);
  };

  const removeImage = (index: number) => {
    const item = images[index];
    URL.revokeObjectURL(item.previewUrl);
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (images.length === 0) return;

    setProgress({
      status: 'reading',
      percentage: 10,
      stageMessage: 'Preparing image batch...'
    });
    setError(null);

    try {
      const pdfBlob = await convertImagesToPdf(
        images.map((img) => ({ file: img.file })),
        { pageSize, margin },
        (pct, msg) => {
          setProgress({
            status: 'converting',
            percentage: pct,
            stageMessage: msg
          });
        }
      );

      const totalOriginalSize = images.reduce((acc, img) => acc + img.file.size, 0);
      const outputName = images.length === 1 
        ? images[0].file.name.replace(/\.[^/.]+$/, '') + '.pdf'
        : `combined-images-${images.length}-pages.pdf`;

      setResult({
        blob: pdfBlob,
        fileName: outputName,
        fileSize: pdfBlob.size,
        originalSize: totalOriginalSize,
        originalName: `${images.length} images`,
        mimeType: 'application/pdf'
      });

      setProgress({ status: 'complete', percentage: 100, stageMessage: 'Done!' });
    } catch (err: any) {
      console.error('Image to PDF error:', err);
      setError(`Conversion failed: ${err.message || 'Unable to compile PDF from images'}`);
      setProgress({ status: 'error', percentage: 0, stageMessage: 'Failed' });
    }
  };

  const handleReset = () => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
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
      ) : images.length === 0 ? (
        <div className="space-y-6">
          <UploadZone
            acceptedExtensions={config.acceptedExtensions}
            acceptedMimeTypes={config.acceptedMimeTypes}
            maxSizeBytes={config.maxFileSizeBytes}
            multiple={true}
            onFilesSelected={handleFilesSelected}
            title="Drop JPG, PNG, or WebP images here"
            subtitle="Upload single or multiple images to merge into a multi-page PDF."
            toolId={config.id}
          />
          <PrivacyBadge />
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Images className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm sm:text-base">
                  {images.length} Image{images.length > 1 ? 's' : ''} Selected
                </h4>
                <p className="text-xs text-slate-400">
                  Total {formatBytes(images.reduce((acc, i) => acc + i.file.size, 0))} • Reorder pages below
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-blue-400" />
                Add More
                <input
                  type="file"
                  multiple
                  accept={config.acceptedExtensions.join(',')}
                  onChange={(e) => {
                    if (e.target.files) handleFilesSelected(Array.from(e.target.files));
                  }}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-rose-400 underline ml-2"
              >
                Clear all
              </button>
            </div>
          </div>

          {/* Thumbnails list with reordering */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              PDF Page Order ({images.length} Pages)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1">
              {images.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/80 border border-slate-800 gap-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-[11px] font-bold text-slate-300 flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <img
                      src={item.previewUrl}
                      alt={`Page ${index + 1}`}
                      className="w-12 h-12 object-cover rounded-lg bg-black shrink-0 border border-slate-700"
                    />
                    <div className="overflow-hidden">
                      <p className="text-xs font-medium text-white truncate">{item.file.name}</p>
                      <p className="text-[10px] text-slate-400">{formatBytes(item.file.size)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => moveImage(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move page earlier"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveImage(index, 'down')}
                      disabled={index === images.length - 1}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move page later"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeImage(index)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-rose-400"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              PDF Page Format
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Page Dimensions</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPageSize('a4')}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                      pageSize === 'a4'
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    A4 Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => setPageSize('letter')}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                      pageSize === 'letter'
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    US Letter
                  </button>
                  <button
                    type="button"
                    onClick={() => setPageSize('fit')}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                      pageSize === 'fit'
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    Fit to Image
                  </button>
                </div>
              </div>

              {pageSize !== 'fit' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-300">Page Margin</span>
                    <span className="font-mono text-blue-400 font-bold">{margin} pt</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="5"
                    value={margin}
                    onChange={(e) => setMargin(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>No margin (0pt)</span>
                    <span>Generous (50pt)</span>
                  </div>
                </div>
              )}
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
              <span>Generate {images.length}-Page PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
