export type ConverterCategory = 'image' | 'document' | 'multimedia';

export interface ConverterConfig {
  id: string;
  route: string;
  name: string;
  shortDesc: string;
  fullDesc: string;
  category: ConverterCategory;
  fromFormat: string;
  toFormat: string;
  acceptedExtensions: string[];
  acceptedMimeTypes: string[];
  maxFileSizeBytes: number; // e.g. 100MB
  icon: string;
  badge?: string;
  tagline: string;
  howItWorks: string[];
  tips?: string[];
}

export type ProcessingStatus = 'idle' | 'preparing' | 'reading' | 'converting' | 'building' | 'complete' | 'error';

export interface ConversionResult {
  blob: Blob;
  fileName: string;
  fileSize: number;
  originalSize: number;
  originalName: string;
  mimeType: string;
  previewUrl?: string;
  textSnippet?: string;
  dimensions?: { width: number; height: number };
  duration?: number;
}

export interface ProcessingProgress {
  status: ProcessingStatus;
  percentage: number;
  stageMessage: string;
  detail?: string;
  error?: string;
}
