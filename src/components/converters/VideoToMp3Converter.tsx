import React, { useState } from 'react';
import { UploadZone } from '../common/UploadZone';
import { ProcessingState } from '../common/ProcessingState';
import { ResultCard } from '../common/ResultCard';
import { PrivacyBadge } from '../common/PrivacyBadge';
import { ConverterConfig, ConversionResult, ProcessingProgress } from '../../types';
import { replaceExtension, formatBytes } from '../../utils/fileUtils';
import { extractAudioFromVideoFile, audioBufferToMp3Blob, audioBufferToWavBlob } from '../../utils/mp3Encoder';
import { Headphones, CheckCircle2, Sliders, Music } from 'lucide-react';

export const VideoToMp3Converter: React.FC<{ config: ConverterConfig }> = ({ config }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<'mp3' | 'wav'>('mp3');
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
      percentage: 15,
      stageMessage: 'Loading video audio stream...'
    });
    setError(null);

    try {
      const { buffer, duration } = await extractAudioFromVideoFile(selectedFile, (pct, msg) => {
        setProgress({
          status: 'converting',
          percentage: pct,
          stageMessage: msg
        });
      });

      setProgress({
        status: 'building',
        percentage: 85,
        stageMessage: `Encoding ${targetFormat.toUpperCase()} audio file...`
      });

      const audioBlob = targetFormat === 'mp3' 
        ? audioBufferToMp3Blob(buffer) 
        : audioBufferToWavBlob(buffer);

      const newExt = targetFormat === 'mp3' ? '.mp3' : '.wav';
      const outputName = replaceExtension(selectedFile.name, newExt);

      setResult({
        blob: audioBlob,
        fileName: outputName,
        fileSize: audioBlob.size,
        originalSize: selectedFile.size,
        originalName: selectedFile.name,
        mimeType: targetFormat === 'mp3' ? 'audio/mpeg' : 'audio/wav',
        duration
      });

      setProgress({ status: 'complete', percentage: 100, stageMessage: 'Done!' });
    } catch (err: any) {
      console.error('Video to audio error:', err);
      setError(`Extraction failed: ${err.message || 'The video format or codec is unreadable'}`);
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
            title="Drop your Video file here"
            subtitle="Extracts audio soundtrack from MP4, MOV, WebM, AVI, and MKV video files."
            toolId={config.id}
          />
          <PrivacyBadge />
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Headphones className="w-5 h-5" />
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
              Audio Output Format
            </h5>

            <div className="grid grid-cols-2 gap-3 max-w-md">
              <button
                type="button"
                onClick={() => setTargetFormat('mp3')}
                className={`py-3 px-4 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 transition-all ${
                  targetFormat === 'mp3'
                    ? 'bg-amber-600 border-amber-500 text-white shadow-md'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <Music className="w-4 h-4" />
                <span>MP3 Audio (Compact)</span>
              </button>
              <button
                type="button"
                onClick={() => setTargetFormat('wav')}
                className={`py-3 px-4 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 transition-all ${
                  targetFormat === 'wav'
                    ? 'bg-amber-600 border-amber-500 text-white shadow-md'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <Headphones className="w-4 h-4" />
                <span>WAV (Lossless PCM)</span>
              </button>
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
              <span>Extract {targetFormat.toUpperCase()} Audio</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
