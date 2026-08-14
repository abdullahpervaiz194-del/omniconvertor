import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { UploadZone } from '../common/UploadZone';
import { ProcessingState } from '../common/ProcessingState';
import { ResultCard } from '../common/ResultCard';
import { PrivacyBadge } from '../common/PrivacyBadge';
import { ConverterConfig, ConversionResult, ProcessingProgress } from '../../types';
import { replaceExtension, formatBytes } from '../../utils/fileUtils';
import { convertExcelToPdf } from '../../services/pdfService';
import { Table, CheckCircle2, Sliders, Layers } from 'lucide-react';

export const ExcelToPdfConverter: React.FC<{ config: ConverterConfig }> = ({ config }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('all');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [progress, setProgress] = useState<ProcessingProgress>({
    status: 'idle',
    percentage: 0,
    stageMessage: ''
  });
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    const file = files[0];
    setSelectedFile(file);
    setError(null);
    setResult(null);

    // Read sheet names
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array', bookSheets: true });
      setSheetNames(wb.SheetNames || []);
      setSelectedSheet('all');
    } catch (e) {
      console.warn('Could not read sheets preview:', e);
    }
  };

  const handleConvert = async () => {
    if (!selectedFile) return;

    setProgress({
      status: 'reading',
      percentage: 15,
      stageMessage: 'Parsing workbook sheets...'
    });
    setError(null);

    try {
      const pdfBlob = await convertExcelToPdf(
        selectedFile,
        {
          orientation,
          selectedSheet: selectedSheet === 'all' ? undefined : selectedSheet,
          allSheets: selectedSheet === 'all'
        },
        (pct, msg) => {
          setProgress({
            status: 'converting',
            percentage: pct,
            stageMessage: msg
          });
        }
      );

      const outputName = replaceExtension(selectedFile.name, '.pdf');

      setResult({
        blob: pdfBlob,
        fileName: outputName,
        fileSize: pdfBlob.size,
        originalSize: selectedFile.size,
        originalName: selectedFile.name,
        mimeType: 'application/pdf'
      });

      setProgress({ status: 'complete', percentage: 100, stageMessage: 'Done!' });
    } catch (err: any) {
      console.error('Excel to PDF error:', err);
      setError(`Conversion failed: ${err.message || 'Unable to parse spreadsheet'}`);
      setProgress({ status: 'error', percentage: 0, stageMessage: 'Failed' });
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setSheetNames([]);
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
            title="Drop your Excel spreadsheet here"
            subtitle="Converts .xlsx, .xls, and .csv workbooks into clean, printable PDF tables."
            toolId={config.id}
          />
          <PrivacyBadge />
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Table className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm sm:text-base font-mono">{selectedFile.name}</h4>
                <p className="text-xs text-slate-400">{formatBytes(selectedFile.size)} • {sheetNames.length} sheet{sheetNames.length !== 1 ? 's' : ''}</p>
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
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              Page Layout & Sheets
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Page Orientation</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrientation('landscape')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      orientation === 'landscape'
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    Landscape (Recommended)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrientation('portrait')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      orientation === 'portrait'
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    Portrait
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Sheets to Convert</label>
                <select
                  value={selectedSheet}
                  onChange={(e) => setSelectedSheet(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All Sheets ({sheetNames.length})</option>
                  {sheetNames.map((name) => (
                    <option key={name} value={name}>
                      Sheet: {name}
                    </option>
                  ))}
                </select>
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
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Convert Excel to PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
