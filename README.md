# All-In-One Converter

A modern, privacy-first, client-side web application for converting images, documents, audio, and video directly inside your web browser with zero server uploads.

> **"Your files. Your device. Your conversions."**

---

## 🚀 Key Features

* **100% Client-Side Privacy**: All file conversions, decoding, rendering, vector tracing, and transcoding happen locally on your CPU/GPU inside browser memory.
* **12 Fully Functional Converters**:
  1. **HEIC → JPG / PNG**: Apple iPhone photos to universal JPG/PNG using browser HEIC decoder.
  2. **WebP → PNG / JPG**: Modern web graphics to transparent PNG or compressed JPG.
  3. **PNG → SVG**: Raster-to-vector tracing with customizable color palette quantization and curve smoothing.
  4. **SVG → PNG / JPG**: High-resolution vector rasterization (up to 4096px 4K+) with custom DPI and alpha preservation.
  5. **PDF → Word (.DOCX)**: Extract structured digital text, headings, and paragraph blocks into genuine editable Microsoft Word files.
  6. **Word (.DOCX) → PDF**: Parse .docx XML structure, headings, and tables into print-ready A4 PDF documents.
  7. **Excel (.XLSX) → PDF**: Convert spreadsheet tables with auto-pagination, grid styling, and sheet selection.
  8. **JPG / PNG → PDF**: Merge single or batch photos into multi-page PDFs with drag-and-drop page reordering and margin controls.
  9. **Audio → MP4**: Turn MP3/WAV tracks into MP4 video with real-time waveform visualizers and custom background art.
  10. **Video → MP3 / WAV**: Strip video tracks and extract clean high-fidelity audio streams.
  11. **MOV → MP4**: Transcode Apple QuickTime recordings to universal H.264/MP4 format.
  12. **Video → GIF**: Create animated GIFs from video clips with interactive scrubber, time trim, width presets, and FPS controls.
* **Zero Advertisements & Zero Paywalls**: Fast, unencumbered utility tool.
* **Responsive UI**: Built with Tailwind CSS, supporting mobile, tablet, and desktop screens.

---

## 🛠️ Architecture & Libraries

* **Framework**: React 19 + TypeScript + Vite
* **Styling**: Tailwind CSS
* **Icons**: `lucide-react`
* **Micro-interactions**: `canvas-confetti`, `motion`
* **PDF Processing**: `pdfjs-dist`, `jspdf`, `jspdf-autotable`
* **Office Documents**: `docx` (Word builder), `mammoth` (Word parser), `xlsx` (SheetJS)
* **Image Processing**: `heic2any` (Apple HEIC decoder), HTML5 Canvas 2D
* **Vector Tracing Engine**: Pure TypeScript color quantization and contour path vectorizer
* **Media & Audio Engine**: Web Audio API `AudioContext`, Canvas Stream `MediaRecorder`, and pure JS LZW `GifEncoder`

---

## 📦 Installation & Local Development

```bash
# Clone the repository
git clone https://github.com/your-username/all-in-one-converter.git

# Install dependencies
npm install

# Start the local development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build
```

