/**
 * File utility helpers for All-In-One Converter
 */

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export function replaceExtension(originalName: string, newExt: string): string {
  const cleanExt = newExt.startsWith('.') ? newExt : `.${newExt}`;
  const lastDot = originalName.lastIndexOf('.');
  const base = lastDot !== -1 ? originalName.substring(0, lastDot) : originalName;
  return `${sanitizeFileName(base)}${cleanExt}`;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = sanitizeFileName(filename);
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(
  file: File,
  acceptedExtensions: string[],
  acceptedMimeTypes: string[],
  maxSizeBytes: number
): ValidationResult {
  if (!file) {
    return { valid: false, error: 'No file was provided.' };
  }

  if (file.size === 0) {
    return { valid: false, error: 'The selected file is empty (0 bytes).' };
  }

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File exceeds maximum allowed size of ${formatBytes(maxSizeBytes)}. Your file is ${formatBytes(file.size)}.`
    };
  }

  const fileName = file.name.toLowerCase();
  const hasValidExt = acceptedExtensions.some(ext => fileName.endsWith(ext.toLowerCase()));
  const hasValidMime = acceptedMimeTypes.length === 0 || acceptedMimeTypes.some(mime => {
    if (mime.endsWith('/*')) {
      const prefix = mime.replace('/*', '');
      return file.type.startsWith(prefix);
    }
    return file.type.toLowerCase() === mime.toLowerCase();
  });

  if (!hasValidExt && !hasValidMime) {
    return {
      valid: false,
      error: `Unsupported file format. Please upload one of: ${acceptedExtensions.join(', ')}`
    };
  }

  return { valid: true };
}

export function loadImageFromFile(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image file. The file may be corrupt or an unsupported format.'));
    };
    img.src = url;
  });
}

export function readAsArrayBuffer(file: File | Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('Failed to read file contents.'));
    reader.readAsArrayBuffer(file);
  });
}

export function readAsText(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read text contents.'));
    reader.readAsText(file);
  });
}
