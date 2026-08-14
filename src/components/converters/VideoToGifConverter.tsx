import React, { useState, useRef, useEffect } from 'react';
import { UploadZone } from '../common/UploadZone';
import { ProcessingState } from '../common/ProcessingState';
import { ResultCard } from '../common/ResultCard';
import { PrivacyBadge } from '../common/PrivacyBadge';
import { ConverterConfig, ConversionResult, ProcessingProgress } from '../../types';
import { replaceExtension, formatBytes } from '../../utils/fileUtils';
import { GifEncoder } from '../../utils/gifEncoder';
import { Film, CheckCircle2, Sliders, Play, Pause, AlertTriangle } from 'lucide-react';

export const VideoToGifConverter: React.FC<{ config: ConverterConfig }> = ({ config }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(5);
  const [gifWidth, setGifWidth] = useState<number>(480);
  const [fps, setFps] = useState<number>(12);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<ProcessingProgress>({
    status: 'idle',
    percentage: 0,
    stageMessage: ''
  });
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFilesSelected = (files: File[]) => {
    const file = files[0];
    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setVideoUrl(url);
    setError(null);
    setResult(null);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration || 5;
      setDuration(dur);
      setStartTime(0);
      setEndTime(Math.min(dur, 6)); // Default 6s max for snappy GIF
    }
  };

  const handleConvert = async () => {
    if (!selectedFile || !videoRef.current) return;

    const clipDuration = Math.max(0.5, endTime - startTime);
    const totalFrames = Math.round(clipDuration * fps);

    setProgress({
      status: 'reading',
      percentage: 10,
      stageMessage: `Preparing to capture ${totalFrames} frames...`
    });
    setError(null);

    try {
      const video = videoRef.current;
      video.pause();

      const videoAspect = (video.videoWidth || 640) / (video.videoHeight || 480);
      const width = gifWidth;
      const height = Math.round(gifWidth / videoAspect);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

      const encoder = new GifEncoder(width, height);
      const frameInterval = 1 / fps;
      const delayMs = Math.round(1000 / fps);

      let currentSec = startTime;
      let frameCount = 0;

      while (currentSec <= endTime && frameCount < totalFrames) {
        // Seek video
        await new Promise<void>((resolve) => {
          const onSeeked = () => {
            video.removeEventListener('seeked', onSeeked);
            resolve();
          };
          video.addEventListener('seeked', onSeeked);
          video.currentTime = currentSec;
        });

        // Draw frame to canvas
        ctx.drawImage(video, 0, 0, width, height);
        const imgData = ctx.getImageData(0, 0, width, height);

        // Add to GIF encoder
        encoder.addFrame({
          data: imgData.data,
          width,
          height,
          delayMs
        });

        frameCount++;
        currentSec += frameInterval;

        const pct = Math.round(10 + (frameCount / totalFrames) * 80);
        setProgress({
          status: 'converting',
          percentage: pct,
          stageMessage: `Rendering GIF frame ${frameCount} of ${totalFrames}...`
        });
      }

      setProgress({
        status: 'building',
        percentage: 95,
        stageMessage: 'Compiling animated GIF file...'
      });

      const gifBlob = encoder.finish();
      const outputName = replaceExtension(selectedFile.name, '.gif');

      setResult({
        blob: gifBlob,
        fileName: outputName,
        fileSize: gifBlob.size,
        originalSize: selectedFile.size,
        originalName: selectedFile.name,
        mimeType: 'image/gif'
      });

      setProgress({ status: 'complete', percentage: 100, stageMessage: 'Done!' });
    } catch (err: any) {
      console.error('Video to GIF error:', err);
      setError(`GIF creation failed: ${err.message || 'Frame rendering error'}`);
      setProgress({ status: 'error', percentage: 0, stageMessage: 'Failed' });
    }
  };

  const handleReset = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setSelectedFile(null);
    setVideoUrl(null);
    setResult(null);
    setError(null);
    setProgress({ status: 'idle', percentage: 0, stageMessage: '' });
  };

  const clipLength = Math.max(0.1, Number((endTime - startTime).toFixed(1)));

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
            subtitle="Converts video moments into animated GIFs with custom trim and FPS controls."
            toolId={config.id}
          />
          <PrivacyBadge />
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm sm:text-base font-mono">{selectedFile.name}</h4>
                <p className="text-xs text-slate-400">
                  {formatBytes(selectedFile.size)} • Duration: {duration.toFixed(1)}s
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-slate-200 underline"
            >
              Choose different file
            </button>
          </div>

          {/* Video Preview Player */}
          {videoUrl && (
            <div className="rounded-2xl overflow-hidden bg-black border border-slate-800 flex justify-center max-h-[300px]">
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                onLoadedMetadata={handleLoadedMetadata}
                className="max-h-[300px] w-auto"
              />
            </div>
          )}

          {/* Trimming Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                Clip Scrubber & Trim Range
              </h5>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded-md">
                Selected Clip: {clipLength}s ({Math.round(clipLength * fps)} frames)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Start Time</span>
                  <span className="font-mono text-slate-400">{startTime.toFixed(1)}s</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, endTime - 0.5)}
                  step="0.1"
                  value={startTime}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setStartTime(val);
                    if (videoRef.current) videoRef.current.currentTime = val;
                  }}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">End Time</span>
                  <span className="font-mono text-slate-400">{endTime.toFixed(1)}s</span>
                </div>
                <input
                  type="range"
                  min={startTime + 0.5}
                  max={duration || 10}
                  step="0.1"
                  value={endTime}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setEndTime(val);
                    if (videoRef.current) videoRef.current.currentTime = val;
                  }}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>

            {clipLength > 10 && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800 text-amber-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Tip: Clips under 8-10 seconds generate smaller, faster-loading GIF files.</span>
              </div>
            )}
          </div>

          {/* Resolution & FPS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">GIF Width Resolution</label>
              <div className="grid grid-cols-3 gap-2">
                {[320, 480, 640].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setGifWidth(w)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                      gifWidth === w
                        ? 'bg-amber-600 border-amber-500 text-white shadow-md'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    {w}px
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Frame Rate (FPS)</label>
              <div className="grid grid-cols-3 gap-2">
                {[10, 15, 20].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFps(f)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                      fps === f
                        ? 'bg-amber-600 border-amber-500 text-white shadow-md'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    {f} FPS
                  </button>
                ))}
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
              <CheckCircle2 className="w-4 h-4" />
              <span>Generate Animated GIF ({clipLength}s @ {fps} FPS)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
