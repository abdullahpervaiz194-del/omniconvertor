import React, { useState } from 'react';
import { UploadZone } from '../common/UploadZone';
import { ProcessingState } from '../common/ProcessingState';
import { ResultCard } from '../common/ResultCard';
import { PrivacyBadge } from '../common/PrivacyBadge';
import { ConverterConfig, ConversionResult, ProcessingProgress } from '../../types';
import { replaceExtension, formatBytes } from '../../utils/fileUtils';
import { convertPdfToDocx } from '../../services/pdfService';
import { FileText, CheckCircle2, Info, Sparkles } from 'lucide-react';

export const PdfToWordConverter: React.FC<{ config: ConverterConfig }> = ({ config }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
      stageMessage: 'Opening PDF document...'
    });
    setError(null);

    try {
      const docxBlob = await convertPdfToDocx(selectedFile, (pct, msg) => {
        setProgress({
          status: 'converting',
          percentage: pct,
          stageMessage: msg
        });
      });

      const outputName = replaceExtension(selectedFile.name, '.docx');

      setResult({
        blob: docxBlob,
        fileName: outputName,
        fileSize: docxBlob.size,
        originalSize: selectedFile.size,
        originalName: selectedFile.name,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

      setProgress({ status: 'complete', percentage: 100, stageMessage: 'Done!' });
    } catch (err: any) {
      console.error('PDF to Word error:', err);
      setError(`Conversion failed: ${err.message || 'Unable to parse PDF content'}`);
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
            title="Drop your PDF document here"
            subtitle="Extracts structured paragraphs, headings, and pages into editable Microsoft Word (.docx)."
            toolId={config.id}
          />
          
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-start gap-3">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-200">Text & Layout Extraction</p>
              <p className="mt-0.5 text-emerald-300/90">
                Extracts digital selectable text, headings, and paragraph blocks. (Scanned image-only documents without embedded text require optical character recognition).
              </p>
            </div>
          </div>

          <PrivacyBadge />
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <FileText className="w-5 h-5" />
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

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Microsoft Word (.docx) Structure Generator</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our client-side engine will parse the PDF typography, reconstruct logical paragraphs, and compile a clean .docx file compatible with Microsoft Word, Apple Pages, LibreOffice, and Google Docs.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div className="pt-4">
            <button
              onClick={handleConvert}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Convert to Word (.DOCX)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
