import React, { useState } from 'react';
import { UploadZone } from '../common/UploadZone';
import { ProcessingState } from '../common/ProcessingState';
import { ResultCard } from '../common/ResultCard';
import { PrivacyBadge } from '../common/PrivacyBadge';
import { ConverterConfig, ConversionResult, ProcessingProgress } from '../../types';
import { replaceExtension, formatBytes, loadImageFromFile } from '../../utils/fileUtils';
import { convertAudioToVideo } from '../../utils/mediaRecorderHelper';
import { Music, CheckCircle2, Sliders, Image as ImageIcon, Sparkles } from 'lucide-react';

export const AudioToMp4Converter: React.FC<{ config: ConverterConfig }> = ({ config }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [visualizerType, setVisualizerType] = useState<'bars' | 'wave' | 'circle'>('bars');
  const [customArtwork, setCustomArtwork] = useState<File | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState<string>('#0f172a');
  const [accentColor, setAccentColor] = useState<string>('#3b82f6');
  const [title, setTitle] = useState<string>('');
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
    setTitle(file.name.replace(/\.[^/.]+$/, ''));
    setError(null);
    setResult(null);
  };

  const handleArtworkSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCustomArtwork(file);
      setArtworkPreview(URL.createObjectURL(file));
    }
  };

  const handleConvert = async () => {
    if (!selectedFile) return;

    setProgress({
      status: 'reading',
      percentage: 10,
      stageMessage: 'Decoding audio stream...'
    });
    setError(null);

    try {
      let bgImg: HTMLImageElement | null = null;
      if (customArtwork) {
        bgImg = await loadImageFromFile(customArtwork);
      }

      const videoBlob = await convertAudioToVideo(
        selectedFile,
        {
          visualizerType,
          backgroundImage: bgImg,
          backgroundColor,
          accentColor,
          title,
          fps: 30,
          width: 1280,
          height: 720
        },
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
        blob: videoBlob,
        fileName: outputName,
        fileSize: videoBlob.size,
        originalSize: selectedFile.size,
        originalName: selectedFile.name,
        mimeType: 'video/mp4'
      });

      setProgress({ status: 'complete', percentage: 100, stageMessage: 'Done!' });
    } catch (err: any) {
      console.error('Audio to MP4 error:', err);
      setError(`Conversion failed: ${err.message || 'Media recording failure'}`);
      setProgress({ status: 'error', percentage: 0, stageMessage: 'Failed' });
    }
  };

  const handleReset = () => {
    if (artworkPreview) URL.revokeObjectURL(artworkPreview);
    setSelectedFile(null);
    setCustomArtwork(null);
    setArtworkPreview(null);
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
            title="Drop your Audio file here"
            subtitle="Converts MP3, WAV, or M4A audio tracks into MP4 video with animated visualizer."
            toolId={config.id}
          />
          <PrivacyBadge />
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Music className="w-5 h-5" />
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
              Video Visualizer Settings (1280x720 720p HD)
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Visualizer Wave Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['bars', 'wave', 'circle'] as const).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setVisualizerType(style)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                        visualizerType === style
                          ? 'bg-amber-600 border-amber-500 text-white shadow-md'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Custom Title Display</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Track Title..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Visualizer Wave Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border-0 bg-transparent cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-400">{accentColor}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Cover Artwork (Optional)</label>
                <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-750 text-slate-300 text-xs cursor-pointer">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  <span className="truncate">{customArtwork ? customArtwork.name : 'Upload Background'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleArtworkSelected}
                    className="hidden"
                  />
                </label>
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
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-sm shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Render MP4 Video</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
