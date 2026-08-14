import React, { useState, useRef } from 'react';
import { UploadCloud, FileUp, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { formatBytes, validateFile } from '../../utils/fileUtils';
import { getSampleFileForTool } from '../../utils/sampleFiles';

interface UploadZoneProps {
  acceptedExtensions: string[];
  acceptedMimeTypes: string[];
  maxSizeBytes: number;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  title?: string;
  subtitle?: string;
  toolId?: string;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  acceptedExtensions,
  acceptedMimeTypes,
  maxSizeBytes,
  multiple = false,
  onFilesSelected,
  title = 'Drop your file here, or browse',
  subtitle,
  toolId
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setErrorMessage(null);

    const droppedFiles = Array.from(e.dataTransfer.files) as File[];
    processFiles(droppedFiles);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files) as File[];
      processFiles(selectedFiles);
    }
  };

  const handleLoadSample = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!toolId) return;
    setIsLoadingSample(true);
    setErrorMessage(null);
    try {
      const sampleFile = await getSampleFileForTool(toolId);
      onFilesSelected([sampleFile]);
    } catch (err: any) {
      setErrorMessage('Failed to generate interactive sample: ' + (err.message || err));
    } finally {
      setIsLoadingSample(false);
    }
  };

  const processFiles = (files: File[]) => {
    if (files.length === 0) return;

    const validFiles: File[] = [];
    for (const file of files) {
      const validation = validateFile(file, acceptedExtensions, acceptedMimeTypes, maxSizeBytes);
      if (!validation.valid) {
        setErrorMessage(validation.error || 'Invalid file.');
        return;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      onFilesSelected(multiple ? validFiles : [validFiles[0]]);
    }
  };

  const acceptString = acceptedExtensions.join(',');

  return (
    <div className="w-full space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        id="file-upload-dropzone"
        className={`relative group cursor-pointer border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all duration-200 ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.005] shadow-2xl shadow-indigo-500/20'
            : 'border-[#27272a] hover:border-[#3f3f46] bg-[#18181b] hover:bg-[#1a1a1e] shadow-sm'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={acceptString}
          onChange={handleInputChange}
          className="hidden"
          id="file-upload-hidden-input"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105 shadow-md ${
            isDragging 
              ? 'bg-indigo-600 text-white shadow-indigo-500/40 animate-bounce' 
              : 'bg-[#09090b] text-indigo-400 group-hover:text-indigo-300 border border-[#27272a]'
          }`}>
            {isDragging ? <FileUp className="w-8 h-8" /> : <UploadCloud className="w-8 h-8" />}
          </div>

          <div className="space-y-1 max-w-md">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-[#a1a1aa]">
              {subtitle || `Supports ${acceptedExtensions.join(', ').toUpperCase()} files up to ${formatBytes(maxSizeBytes)}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            {acceptedExtensions.map((ext) => (
              <span
                key={ext}
                className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#09090b] text-[#a1a1aa] border border-[#27272a]"
              >
                {ext.toUpperCase()}
              </span>
            ))}
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              id="upload-select-file-btn"
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Select {multiple ? 'Files' : 'File'}
            </button>

            {toolId && (
              <button
                type="button"
                id="upload-sample-file-btn"
                onClick={handleLoadSample}
                disabled={isLoadingSample}
                className="px-4 py-2 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/50 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoadingSample ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating sample...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Try Sample File</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inline Validation Error */}
      {errorMessage && (
        <div className="mt-3 p-3.5 rounded-lg bg-rose-950/40 border border-rose-900/50 text-rose-300 flex items-start gap-3 text-xs animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h5 className="font-semibold text-rose-200">Unable to load file</h5>
            <p className="text-[11px] text-rose-300/90 mt-0.5">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-[11px] text-rose-400 hover:text-rose-200 underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
