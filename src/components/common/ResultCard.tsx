import React, { useEffect, useState } from 'react';
import { 
  Download, 
  CheckCircle2, 
  RotateCcw, 
  FileCheck, 
  Sparkles, 
  Eye, 
  Code,
  HardDrive,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ConversionResult } from '../../types';
import { formatBytes, downloadBlob } from '../../utils/fileUtils';
import { useAuth } from '../../context/AuthContext';
import { Cloud, CloudCheck, Sparkles as SparklesIcon } from 'lucide-react';

interface ResultCardProps {
  result: ConversionResult;
  onReset: () => void;
  outputFormatLabel?: string;
  toolId?: string;
  fromFormat?: string;
  toFormat?: string;
  category?: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  onReset,
  outputFormatLabel,
  toolId = 'converter',
  fromFormat = 'file',
  toFormat = 'file',
  category = 'file'
}) => {
  const { currentUser, recordConversion, setAuthModalOpen } = useAuth();
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [svgCode, setSvgCode] = useState<string>('');
  const [showSvgCode, setShowSvgCode] = useState<boolean>(false);
  const [syncedToFirestore, setSyncedToFirestore] = useState<boolean>(false);

  useEffect(() => {
    // Trigger confetti celebration
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Ignored if canvas not ready
    }

    const url = URL.createObjectURL(result.blob);
    setPreviewUrl(url);

    // Auto-record conversion to Firestore if logged in
    if (currentUser) {
      recordConversion({
        fileName: result.fileName,
        originalName: result.originalName || result.fileName,
        toolId,
        fromFormat,
        toFormat,
        originalSize: result.originalSize || result.fileSize,
        fileSize: result.fileSize,
        category,
        status: 'completed',
      }).then(() => {
        setSyncedToFirestore(true);
      }).catch((err) => {
        console.warn('History recording error:', err);
      });
    }

    // If SVG, read text for code preview
    if (result.mimeType.includes('svg') || result.fileName.endsWith('.svg')) {
      result.blob.text().then(setSvgCode).catch(() => {});
    }

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [result, currentUser]);

  const handleDownload = () => {
    downloadBlob(result.blob, result.fileName);
  };

  const isImage = result.mimeType.startsWith('image/') && !result.fileName.endsWith('.svg');
  const isSvg = result.mimeType.includes('svg') || result.fileName.endsWith('.svg');
  const isVideo = result.mimeType.startsWith('video/');
  const isAudio = result.mimeType.startsWith('audio/');
  const isPdf = result.mimeType === 'application/pdf' || result.fileName.endsWith('.pdf');
  const isDocx = result.fileName.endsWith('.docx');

  const sizeDiff = result.fileSize - result.originalSize;
  const isSmaller = sizeDiff < 0;
  const savingsPercent = result.originalSize > 0 
    ? Math.abs(Math.round((sizeDiff / result.originalSize) * 100)) 
    : 0;

  return (
    <div className="w-full bg-[#18181b] border border-[#27272a] rounded-xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
      
      {/* Header Success Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272a]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Process Complete
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h3>
              {currentUser ? (
                <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {syncedToFirestore ? 'Saved in Firestore' : 'Syncing to Firestore...'}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="text-[10px] font-mono px-2 py-0.2 rounded bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 border border-indigo-500/30 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <SparklesIcon className="w-2.5 h-2.5" />
                  Sign In to Sync History
                </button>
              )}
            </div>
            <p className="text-xs text-[#a1a1aa] mt-0.5">
              Output verified and stream rendered locally in browser heap memory.
            </p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#09090b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-white text-xs font-medium border border-[#27272a] transition-colors cursor-pointer self-start sm:self-center"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Convert Another
        </button>
      </div>

      {/* File Info Bar - Bento 3-column stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-lg bg-[#09090b] border border-[#27272a]">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <FileCheck className="w-4 h-4 text-indigo-400 shrink-0" />
          <div className="overflow-hidden">
            <span className="text-[10px] uppercase font-bold text-[#71717a] block font-mono">FILE NAME</span>
            <span className="text-xs font-semibold text-white truncate block font-mono">
              {result.fileName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <HardDrive className="w-4 h-4 text-indigo-400 shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-bold text-[#71717a] block font-mono">OUTPUT SIZE</span>
            <span className="text-xs font-semibold text-white block font-mono">
              {formatBytes(result.fileSize)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="text-[#71717a]">
              {formatBytes(result.originalSize)}
            </span>
            <ArrowRight className="w-3 h-3 text-[#71717a]" />
            <span className="font-semibold text-emerald-400">
              {formatBytes(result.fileSize)}
            </span>
          </div>
          {isSmaller && savingsPercent > 0 && (
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              -{savingsPercent}%
            </span>
          )}
        </div>
      </div>

      {/* Preview Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#a1a1aa] flex items-center gap-1.5 font-mono">
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            Stream Preview
          </h4>

          {isSvg && (
            <button
              onClick={() => setShowSvgCode(!showSvgCode)}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer font-mono"
            >
              <Code className="w-3.5 h-3.5" />
              {showSvgCode ? 'Show Visual SVG' : 'Show SVG Code'}
            </button>
          )}
        </div>

        <div className="bg-[#09090b] rounded-lg border border-[#27272a] p-4 flex items-center justify-center min-h-[200px] max-h-[380px] overflow-auto">
          {isImage && previewUrl && (
            <img
              src={previewUrl}
              alt="Converted Output Preview"
              className="max-h-[320px] w-auto max-w-full rounded-md object-contain shadow-md"
            />
          )}

          {isSvg && previewUrl && (
            showSvgCode ? (
              <pre className="w-full text-xs font-mono text-emerald-300 p-4 bg-[#18181b] rounded-md overflow-x-auto max-h-[300px] border border-[#27272a]">
                {svgCode}
              </pre>
            ) : (
              <img
                src={previewUrl}
                alt="Converted SVG Vector Preview"
                className="max-h-[300px] w-auto max-w-full rounded-md object-contain"
              />
            )
          )}

          {isVideo && previewUrl && (
            <video
              src={previewUrl}
              controls
              playsInline
              className="max-h-[300px] w-full max-w-lg rounded-md shadow-lg bg-black"
            />
          )}

          {isAudio && previewUrl && (
            <div className="w-full max-w-md p-5 bg-[#18181b] border border-[#27272a] rounded-lg space-y-3 text-center">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white font-mono">{result.fileName}</p>
                <p className="text-[11px] text-[#71717a] mt-0.5">High-fidelity decoded stream</p>
              </div>
              <audio src={previewUrl} controls className="w-full" />
            </div>
          )}

          {isPdf && previewUrl && (
            <div className="w-full text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white font-mono">{result.fileName}</h5>
                <p className="text-[11px] text-[#71717a] mt-0.5">
                  Valid standard PDF document formatted locally
                </p>
              </div>
              <iframe
                src={previewUrl}
                title="PDF Document Preview"
                className="w-full h-64 rounded-md border border-[#27272a] hidden sm:block"
              />
            </div>
          )}

          {isDocx && (
            <div className="w-full text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-white font-mono">{result.fileName}</h5>
                <p className="text-xs text-[#a1a1aa] mt-1">
                  Microsoft Word (.docx) document generated with structured run elements.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Download CTA */}
      <div className="pt-1">
        <button
          onClick={handleDownload}
          id="download-result-btn"
          className="w-full py-3.5 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 flex items-center justify-center gap-2.5 transition-all cursor-pointer transform active:scale-[0.99]"
        >
          <Download className="w-4 h-4" />
          <span>Download {result.fileName}</span>
        </button>
      </div>
    </div>
  );
};
