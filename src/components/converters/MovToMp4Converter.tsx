import React, { useState } from 'react';
import { UploadZone } from '../common/UploadZone';
import { ProcessingState } from '../common/ProcessingState';
import { ResultCard } from '../common/ResultCard';
import { PrivacyBadge } from '../common/PrivacyBadge';
import { ConverterConfig, ConversionResult, ProcessingProgress } from '../../types';
import { replaceExtension, formatBytes } from '../../utils/fileUtils';
import { transcodeMovToMp4 } from '../../utils/mediaRecorderHelper';
import { Video, CheckCircle2, Sliders, Info } from 'lucide-react';

export const MovToMp4Converter: React.FC<{ config: ConverterConfig }> = ({ config }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resolution, setResolution] = useState<'1080' | '720' | '480'>('720');
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
      percentage: 10,
      stageMessage: 'Opening QuickTime MOV container...'
    });
    setError(null);

    const dims = {
      '1080': { w: 1920, h: 1080 },
      '720': { w: 1280, h: 720 },
      '480': { w: 854, h: 480 }
    }[resolution];

    try {
      const mp4Blob = await transcodeMovToMp4(
        selectedFile,
        dims.w,
        dims.h,
        (pct, msg) => {
          setProgress({
            status: 'converting',
            percentage: pct,
            stageMessage: msg
          });
        }
      );

      const outputName = replaceExtension(selectedFile.name, '.mp4');

      setResult({
        blob: mp4Blob,
        fileName: outputName,
        fileSize: mp4Blob.size,
        originalSize: selectedFile.size,
        originalName: selectedFile.name,
        mimeType: 'video/mp4'
      });

      setProgress({ status: 'complete', percentage: 100, stageMessage: 'Done!' });
    } catch (err: any) {
      console.error('MOV to MP4 error:', err);
      setError(`Transcoding failed: ${err.message || 'Browser could not decode MOV codec'}`);
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
            title="Drop your Apple QuickTime MOV video here"
            subtitle="Converts .mov recordings into universally compatible MP4 video format."
            toolId={config.id}
          />
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/40 text-amber-300 text-xs flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              Transcoding takes place directly in browser memory without sending large video files across the internet.
            </p>
          </div>
          <PrivacyBadge />
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Video className="w-5 h-5" />
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
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              Transcoding Options
            </h5>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Target Resolution</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setResolution('1080')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    resolution === '1080'
                      ? 'bg-amber-600 border-amber-500 text-white shadow-md'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  1080p Full HD
                </button>
                <button
                  type="button"
                  onClick={() => setResolution('720')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    resolution === '720'
                      ? 'bg-amber-600 border-amber-500 text-white shadow-md'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  720p HD (Fastest)
                </button>
                <button
                  type="button"
                  onClick={() => setResolution('480')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    resolution === '480'
                      ? 'bg-amber-600 border-amber-500 text-white shadow-md'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  480p SD (Compact)
                </button>
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
              className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Convert MOV to MP4</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
