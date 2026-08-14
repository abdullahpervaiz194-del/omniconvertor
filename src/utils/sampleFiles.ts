/**
 * Interactive Sample File Generators
 * Allows users to test any conversion module instantly with 1 click without needing local files!
 */

import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

// 1. Create a rich Sample Canvas Image
export async function createSampleImageBlob(
  text: string = 'OmniConvert Sample',
  type: 'image/png' | 'image/webp' | 'image/jpeg' = 'image/png',
  width: number = 800,
  height: number = 600
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  // Background Gradient
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#4f46e5');
  grad.addColorStop(0.5, '#7c3aed');
  grad.addColorStop(1, '#db2777');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Geometric shapes
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.arc(width * 0.2, height * 0.3, 120, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(width * 0.8, height * 0.7, 180, 0, Math.PI * 2);
  ctx.fill();

  // Decorative grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 2;
  for (let x = 0; x < width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Text Box
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.roundRect 
    ? ctx.roundRect(width * 0.1, height * 0.35, width * 0.8, height * 0.3, 16)
    : ctx.fillRect(width * 0.1, height * 0.35, width * 0.8, height * 0.3);
  ctx.fill();

  // Typography
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(text, width / 2, height / 2 - 10);

  ctx.fillStyle = '#a5b4fc';
  ctx.font = '18px monospace';
  ctx.fillText('Interactive In-Browser Sample Asset', width / 2, height / 2 + 30);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to generate image blob'));
    }, type, 0.95);
  });
}

// 2. Create Sample SVG Text / Blob
export function createSampleSvgBlob(): Blob {
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#a855f7;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity="0.5"/>
    </filter>
  </defs>
  
  <rect width="800" height="600" rx="24" fill="url(#grad1)" />
  
  <circle cx="160" cy="140" r="80" fill="rgba(255,255,255,0.18)" />
  <circle cx="680" cy="460" r="120" fill="rgba(255,255,255,0.12)" />
  <polygon points="400,60 480,180 320,180" fill="rgba(255,255,255,0.22)" />
  
  <!-- Central Badge -->
  <g filter="url(#shadow)">
    <rect x="120" y="200" width="560" height="200" rx="16" fill="#0f172a" opacity="0.92" />
    <text x="400" y="280" fill="#38bdf8" font-size="34" font-weight="bold" font-family="monospace" text-anchor="middle">
      OmniConvert Vector Logo
    </text>
    <text x="400" y="325" fill="#e2e8f0" font-size="18" font-family="sans-serif" text-anchor="middle">
      Scalable 2D Vector Graphic with Alpha Transparency
    </text>
    <circle cx="400" cy="360" r="8" fill="#4ade80" />
  </g>
</svg>`;

  return new Blob([svgContent], { type: 'image/svg+xml' });
}

// 3. Create Sample PDF
export function createSamplePdfBlob(): Blob {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Header Banner
  doc.setFillColor(30, 27, 75);
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text('OmniConvert Sample Document', 20, 22);

  doc.setFontSize(10);
  doc.setTextColor(199, 210, 254);
  doc.text('Client-Side Extraction & OCR Verification Benchmark', 20, 32);

  // Body content
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.text('Executive Summary', 20, 55);

  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  const summary = 
    'This test document is generated locally to demonstrate real-time in-browser PDF parsing, ' +
    'text layer reconstruction, table analysis, and high-fidelity Word/OCR conversion without transmitting ' +
    'any bytes to external third-party cloud servers.';
  doc.text(doc.splitTextToSize(summary, 170), 20, 65);

  // Key Metrics Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(20, 90, 170, 10, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.text('Metric / Benchmark', 25, 96);
  doc.text('Status', 110, 96);
  doc.text('Latency', 150, 96);

  // Table rows
  const rows = [
    ['Client WASM Engine', 'Active', '12 ms'],
    ['Memory Footprint', 'Optimized', '4.2 MB'],
    ['Privacy Compliance', '100% Zero-Cloud', '0 ms']
  ];

  let y = 108;
  rows.forEach((row) => {
    doc.setTextColor(51, 65, 85);
    doc.text(row[0], 25, y);
    doc.setTextColor(16, 185, 129);
    doc.text(row[1], 110, y);
    doc.setTextColor(99, 102, 241);
    doc.text(row[2], 150, y);
    y += 10;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Generated via OmniConvert • 100% Client-Side Engine', 20, 280);

  return doc.output('blob');
}

// 4. Create Sample Excel (XLSX)
export function createSampleExcelBlob(): Blob {
  const wb = XLSX.utils.book_new();

  const data = [
    ['Quarterly Performance Report - 2026', '', '', '', ''],
    ['Region', 'Category', 'Units Sold', 'Unit Price ($)', 'Total Revenue ($)'],
    ['North America', 'Pro Subscription', 1420, 9.00, 12780.00],
    ['Europe', 'Pro Subscription', 980, 9.00, 8820.00],
    ['Asia Pacific', 'Enterprise License', 120, 99.00, 11880.00],
    ['Latin America', 'Pro Subscription', 450, 9.00, 4050.00],
    ['', '', '', 'Total:', 37530.00]
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{ wch: 18 }, { wch: 20 }, { wch: 14 }, { wch: 16 }, { wch: 18 }];

  XLSX.utils.book_append_sheet(wb, ws, 'Financial Summary');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
}

// 5. Create Sample Audio WAV
export function createSampleAudioWavBlob(durationSeconds: number = 3): Blob {
  const sampleRate = 44100;
  const numChannels = 1;
  const numSamples = durationSeconds * sampleRate;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // Write WAV Header
  function writeString(offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true); // 16 bits
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  // Write melodic synth tone (arpeggio sequence)
  const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const time = i / sampleRate;
    const noteIdx = Math.floor(time * 4) % notes.length;
    const freq = notes[noteIdx];
    const envelope = Math.sin(Math.PI * ((time * 4) % 1));
    const sample = Math.sin(2 * Math.PI * freq * time) * 0.5 * envelope;
    const intSample = Math.max(-1, Math.min(1, sample)) * 0x7fff;
    view.setInt16(offset, intSample, true);
    offset += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

// 6. Create Sample Video (WebM / MP4 recording of dynamic canvas)
export async function createSampleVideoBlob(durationMs: number = 3000): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  const stream = canvas.captureStream(30);
  let mimeType = 'video/webm;codecs=vp8,opus';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm';
  }

  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks: Blob[] = [];

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  recorder.start();

  const startTime = performance.now();
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(1, elapsed / durationMs);

      // Render video frame
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 640, 360);

      // Orbiting animated rings
      const cx = 320;
      const cy = 180;
      const angle = progress * Math.PI * 4;

      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, 70, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(cx + Math.cos(angle) * 70, cy + Math.sin(angle) * 70, 14, 0, Math.PI * 2);
      ctx.fill();

      // Text Countdown
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('OmniConvert Video Engine', cx, cy - 100);

      ctx.font = '16px monospace';
      ctx.fillStyle = '#38bdf8';
      const remainingSec = Math.max(0, ((durationMs - elapsed) / 1000)).toFixed(1);
      ctx.fillText(`Live Stream • ${remainingSec}s`, cx, cy + 110);

      if (progress >= 1) {
        clearInterval(interval);
        recorder.stop();
      }
    }, 1000 / 30);

    recorder.onstop = () => {
      resolve(new Blob(chunks, { type: 'video/webm' }));
    };
  });
}

// 7. Master Sample File Provider for any tool ID
export async function getSampleFileForTool(toolId: string): Promise<File> {
  switch (toolId) {
    case 'heic-to-jpg': {
      const blob = await createSampleImageBlob('HEIC Sample Photo', 'image/jpeg');
      return new File([blob], 'sample_portrait.heic', { type: 'image/heic' });
    }
    case 'webp-to-png': {
      const blob = await createSampleImageBlob('WEBP High-Res Image', 'image/webp');
      return new File([blob], 'sample_graphic.webp', { type: 'image/webp' });
    }
    case 'png-to-svg': {
      const blob = await createSampleImageBlob('Vector Logo Asset', 'image/png');
      return new File([blob], 'sample_icon.png', { type: 'image/png' });
    }
    case 'svg-to-png': {
      const blob = createSampleSvgBlob();
      return new File([blob], 'sample_vector.svg', { type: 'image/svg+xml' });
    }
    case 'word-to-pdf': {
      const docxText = 'This is a sample document for conversion to PDF.\n\nSection 1: Overview\nOmniConvert converts documents client-side.';
      const blob = new Blob([docxText], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      return new File([blob], 'sample_document.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    }
    case 'pdf-to-word': {
      const blob = createSamplePdfBlob();
      return new File([blob], 'sample_report.pdf', { type: 'application/pdf' });
    }
    case 'excel-to-pdf': {
      const blob = createSampleExcelBlob();
      return new File([blob], 'sample_financials.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    }
    case 'image-to-pdf': {
      const blob = await createSampleImageBlob('Multi-Page Image Sheet', 'image/png');
      return new File([blob], 'sample_scan.png', { type: 'image/png' });
    }
    case 'audio-to-mp4': {
      const blob = createSampleAudioWavBlob(4);
      return new File([blob], 'sample_track.wav', { type: 'audio/wav' });
    }
    case 'video-to-mp3': {
      const blob = await createSampleVideoBlob(3000);
      return new File([blob], 'sample_recording.mp4', { type: 'video/mp4' });
    }
    case 'mov-to-mp4': {
      const blob = await createSampleVideoBlob(3000);
      return new File([blob], 'sample_clip.mov', { type: 'video/quicktime' });
    }
    case 'video-to-gif':
    default: {
      const blob = await createSampleVideoBlob(3000);
      return new File([blob], 'sample_motion.mp4', { type: 'video/mp4' });
    }
  }
}
