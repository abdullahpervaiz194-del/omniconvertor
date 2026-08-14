import { ConverterConfig } from '../types';

export const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_DOC_SIZE = 75 * 1024 * 1024; // 75MB
export const MAX_MEDIA_SIZE = 150 * 1024 * 1024; // 150MB

export const CONVERTERS: ConverterConfig[] = [
  // 1. HEIC to JPG/PNG
  {
    id: 'heic-to-jpg',
    route: '/heic-to-jpg',
    name: 'HEIC to JPG / PNG',
    shortDesc: 'Convert Apple HEIC photos into universally compatible JPG or PNG images.',
    fullDesc: 'Transform Apple iPhone HEIC/HEIF live photos and burst shots into standard JPG or PNG images in seconds. No cloud upload needed.',
    category: 'image',
    fromFormat: 'HEIC',
    toFormat: 'JPG / PNG',
    acceptedExtensions: ['.heic', '.heif'],
    acceptedMimeTypes: ['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'],
    maxFileSizeBytes: MAX_IMAGE_SIZE,
    icon: 'Camera',
    badge: 'Popular',
    tagline: 'Make iPhone photos viewable anywhere without losing quality',
    howItWorks: [
      'Upload any Apple .HEIC or .HEIF photo.',
      'Select output format (JPG with adjustable quality or lossless PNG).',
      'The browser decodes the HEIC container directly and renders the image.',
      'Download your converted image instantly.'
    ],
    tips: ['JPG provides smaller file size while PNG preserves maximum crispness and alpha transparency.']
  },

  // 2. WebP to PNG/JPG
  {
    id: 'webp-to-png',
    route: '/webp-to-png',
    name: 'WebP to PNG / JPG',
    shortDesc: 'Convert modern WebP images to standard PNG or JPG files.',
    fullDesc: 'Quickly convert downloaded WebP web graphics to PNG with full transparency or high-quality JPG for older software and documents.',
    category: 'image',
    fromFormat: 'WebP',
    toFormat: 'PNG / JPG',
    acceptedExtensions: ['.webp'],
    acceptedMimeTypes: ['image/webp'],
    maxFileSizeBytes: MAX_IMAGE_SIZE,
    icon: 'Image',
    tagline: 'Make web graphics compatible with any image viewer or editor',
    howItWorks: [
      'Select or drop your .webp file.',
      'Choose PNG for transparent graphics or JPG with custom compression.',
      'Image is drawn on an internal high-precision canvas.',
      'Export and download your converted file immediately.'
    ],
    tips: ['Converting transparent WebP to JPG will automatically apply a clean white background.']
  },

  // 3. PNG to SVG
  {
    id: 'png-to-svg',
    route: '/png-to-svg',
    name: 'PNG to SVG',
    shortDesc: 'Vectorize raster PNG logos, icons, and artwork into scalable SVG vectors.',
    fullDesc: 'Convert bitmap PNG graphics into crisp, infinite-resolution SVG vector paths using local color-quantization and contour tracing.',
    category: 'image',
    fromFormat: 'PNG',
    toFormat: 'SVG',
    acceptedExtensions: ['.png'],
    acceptedMimeTypes: ['image/png'],
    maxFileSizeBytes: MAX_IMAGE_SIZE,
    icon: 'PenTool',
    badge: 'Vector Engine',
    tagline: 'Scale your logos and graphics to any billboard size with zero pixelation',
    howItWorks: [
      'Upload a clean PNG image, logo, icon, or drawing.',
      'Adjust tracing parameters (color count, blur, simplification, curve fidelity).',
      'Vector engine scans pixels, traces edges, and generates mathematical SVG paths.',
      'Preview real vector rendering and download standard .svg vector code.'
    ],
    tips: ['Best results are achieved with logos, line art, icons, and illustrations with distinct contrast.']
  },

  // 4. SVG to PNG
  {
    id: 'svg-to-png',
    route: '/svg-to-png',
    name: 'SVG to PNG / JPG',
    shortDesc: 'Rasterize vector SVG files to high-resolution PNG or JPG with custom scaling.',
    fullDesc: 'Render scalable vector graphics into pixel-perfect PNG or JPG images at any resolution up to 4K+ or custom dimensions.',
    category: 'image',
    fromFormat: 'SVG',
    toFormat: 'PNG / JPG',
    acceptedExtensions: ['.svg'],
    acceptedMimeTypes: ['image/svg+xml'],
    maxFileSizeBytes: MAX_IMAGE_SIZE,
    icon: 'Layers',
    tagline: 'Export vector graphics to crisp high-res raster images with custom DPI and sizes',
    howItWorks: [
      'Upload your vector .svg file.',
      'Select output resolution (Original, 512px, 1024px, 2048px, 4096px, or Custom).',
      'Select PNG (with transparency) or JPG with background fill.',
      'Download high-definition rasterized asset.'
    ],
    tips: ['Choose 2048px or 4096px for crisp presentation slides and print-ready assets.']
  },

  // 5. PDF to Word (.docx)
  {
    id: 'pdf-to-word',
    route: '/pdf-to-word',
    name: 'PDF to Word (.DOCX)',
    shortDesc: 'Extract structured text, headings, and paragraphs from PDF into editable DOCX.',
    fullDesc: 'Extract text, formatting hierarchy, line breaks, and page divisions from PDF documents and compile them into a genuine Microsoft Word (.docx) document.',
    category: 'document',
    fromFormat: 'PDF',
    toFormat: 'DOCX',
    acceptedExtensions: ['.pdf'],
    acceptedMimeTypes: ['application/pdf'],
    maxFileSizeBytes: MAX_DOC_SIZE,
    icon: 'FileText',
    badge: 'Essential',
    tagline: 'Unlock locked PDF text into a fully editable Word document',
    howItWorks: [
      'Upload any PDF containing selectable text.',
      'PDF engine analyzes pages, extracts layout flow, typography, and headings.',
      'Docx builder creates valid Word document structures with proper paragraphs.',
      'Download the clean, editable .docx file to edit in Word, Google Docs, or LibreOffice.'
    ],
    tips: ['Designed for digital text PDFs. Scanned image-only PDFs require OCR which is not embedded in basic text flow.']
  },

  // 6. Word (.docx) to PDF
  {
    id: 'word-to-pdf',
    route: '/word-to-pdf',
    name: 'Word (.DOCX) to PDF',
    shortDesc: 'Convert Microsoft Word documents into standard, printable PDF files.',
    fullDesc: 'Parse .docx document content, tables, headers, lists, and formatting, and render them directly into a print-ready, universally viewable PDF.',
    category: 'document',
    fromFormat: 'DOCX',
    toFormat: 'PDF',
    acceptedExtensions: ['.docx', '.doc'],
    acceptedMimeTypes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'],
    maxFileSizeBytes: MAX_DOC_SIZE,
    icon: 'FileType',
    tagline: 'Lock document layout and typography into an unalterable PDF format',
    howItWorks: [
      'Upload your .docx Word document.',
      'Parser reads XML runs, tables, headings, and document styling.',
      'PDF engine formats pagination with standard margins and typography.',
      'Download ready-to-share and print-ready PDF.'
    ]
  },

  // 7. Excel (.xlsx) to PDF
  {
    id: 'excel-to-pdf',
    route: '/excel-to-pdf',
    name: 'Excel (.XLSX) to PDF',
    shortDesc: 'Convert spreadsheets and workbooks into clean, paginated PDF tables.',
    fullDesc: 'Turn Excel workbooks, sheets, and CSV tables into beautifully formatted PDF documents with automatic column wrapping and pagination.',
    category: 'document',
    fromFormat: 'XLSX',
    toFormat: 'PDF',
    acceptedExtensions: ['.xlsx', '.xls', '.csv'],
    acceptedMimeTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ],
    maxFileSizeBytes: MAX_DOC_SIZE,
    icon: 'Table',
    tagline: 'Transform messy raw spreadsheets into professional, readable PDF reports',
    howItWorks: [
      'Upload your .xlsx, .xls, or .csv spreadsheet.',
      'Choose whether to convert all sheets or select specific sheets.',
      'Customize page orientation (Portrait vs. Landscape) and font scaling.',
      'Download paginated PDF with automatic headers and gridlines.'
    ],
    tips: ['Use Landscape orientation for wide spreadsheets with many columns.']
  },

  // 8. JPG / PNG to PDF
  {
    id: 'image-to-pdf',
    route: '/image-to-pdf',
    name: 'JPG / PNG to PDF',
    shortDesc: 'Merge multiple photos and images into a single multi-page PDF document.',
    fullDesc: 'Combine single or batch images into a cohesive multi-page PDF. Drag to reorder, configure page size (A4, Letter, Fit to Image), and set margins.',
    category: 'document',
    fromFormat: 'JPG / PNG',
    toFormat: 'PDF',
    acceptedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    acceptedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeBytes: MAX_DOC_SIZE,
    icon: 'Images',
    badge: 'Batch Support',
    tagline: 'Combine receipts, documents, and photos into one clean PDF file',
    howItWorks: [
      'Upload one or multiple photos (JPG, PNG, WebP).',
      'Drag and drop thumbnails to reorder pages as desired.',
      'Select page format (A4, Letter, Auto-Fit) and margins.',
      'Compile all images into a unified, high-res PDF file.'
    ],
    tips: ['Auto-Fit page size preserves each image’s original aspect ratio perfectly without borders.']
  },

  // 9. Audio to MP4
  {
    id: 'audio-to-mp4',
    route: '/audio-to-mp4',
    name: 'Audio to MP4',
    shortDesc: 'Turn podcasts, songs, and voice notes into MP4 videos with visualizer or artwork.',
    fullDesc: 'Convert MP3, WAV, or AAC audio files into video files ready for YouTube, Instagram, or TikTok. Includes customizable waveforms and custom background art.',
    category: 'multimedia',
    fromFormat: 'Audio (MP3/WAV)',
    toFormat: 'MP4 Video',
    acceptedExtensions: ['.mp3', '.wav', '.m4a', '.aac', '.ogg'],
    acceptedMimeTypes: ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/aac', 'audio/ogg'],
    maxFileSizeBytes: MAX_MEDIA_SIZE,
    icon: 'Music',
    badge: 'Visualizer',
    tagline: 'Create upload-ready videos from songs, podcasts, and audio clips',
    howItWorks: [
      'Upload your audio track (MP3, WAV, M4A).',
      'Choose a visualizer style or upload your own custom cover art / background.',
      'AudioContext and canvas stream synchronize audio with visual motion.',
      'Export and download as high-fidelity MP4 video.'
    ]
  },

  // 10. Video to MP3
  {
    id: 'video-to-mp3',
    route: '/video-to-mp3',
    name: 'Video to MP3',
    shortDesc: 'Extract crystal-clear audio tracks from MP4, WebM, MOV, or AVI video files.',
    fullDesc: 'Strip video streams and extract pure high-bitrate MP3 or WAV audio from any video recording, webinar, speech, or music video.',
    category: 'multimedia',
    fromFormat: 'Video (MP4/MOV)',
    toFormat: 'MP3 Audio',
    acceptedExtensions: ['.mp4', '.mov', '.webm', '.avi', '.mkv'],
    acceptedMimeTypes: ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo', 'video/x-matroska'],
    maxFileSizeBytes: MAX_MEDIA_SIZE,
    icon: 'Headphones',
    badge: 'Audio Extractor',
    tagline: 'Rip soundtrack, voice, or lecture audio from video clips with one click',
    howItWorks: [
      'Upload any video clip containing an audio stream.',
      'Choose output format (MP3 high bitrate or lossless WAV PCM).',
      'Browser audio decoder extracts channels and encodes audio frames.',
      'Listen to the audio preview and download your audio file.'
    ]
  },

  // 11. MOV to MP4
  {
    id: 'mov-to-mp4',
    route: '/mov-to-mp4',
    name: 'MOV to MP4',
    shortDesc: 'Transcode Apple QuickTime MOV videos to universally compatible MP4 video.',
    fullDesc: 'Convert Apple QuickTime .MOV recordings into widely compatible H.264/MP4 format playable on Windows, Android, TVs, and web browsers.',
    category: 'multimedia',
    fromFormat: 'MOV',
    toFormat: 'MP4',
    acceptedExtensions: ['.mov', '.quicktime'],
    acceptedMimeTypes: ['video/quicktime'],
    maxFileSizeBytes: MAX_MEDIA_SIZE,
    icon: 'Video',
    tagline: 'Make iPhone and Mac QuickTime videos playable on any TV, PC, or Android device',
    howItWorks: [
      'Upload your Apple QuickTime .mov video file.',
      'Select output resolution (Original, 1080p, 720p) and frame rate.',
      'Video pipeline transcodes container and streams in browser memory.',
      'Preview the video and download your universal MP4 file.'
    ]
  },

  // 12. Video to GIF
  {
    id: 'video-to-gif',
    route: '/video-to-gif',
    name: 'Video to GIF',
    shortDesc: 'Create lightweight, looped animated GIFs from any video clip with custom trim.',
    fullDesc: 'Trim video clips, set frame rates, adjust resolution width, and generate smooth animated GIFs with optimized color quantization.',
    category: 'multimedia',
    fromFormat: 'Video',
    toFormat: 'GIF',
    acceptedExtensions: ['.mp4', '.mov', '.webm', '.avi'],
    acceptedMimeTypes: ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'],
    maxFileSizeBytes: MAX_MEDIA_SIZE,
    icon: 'Film',
    badge: 'Animation Engine',
    tagline: 'Convert memorable video moments into shareable, lightweight animated GIFs',
    howItWorks: [
      'Upload any video clip.',
      'Set start and end trim timestamps using the interactive scrubber.',
      'Adjust GIF width (320px, 480px, 640px) and frame rate (10, 15, 24 FPS).',
      'Frame engine samples frames, quantizes color palette, and generates animated GIF.'
    ],
    tips: ['Keep duration under 10 seconds for optimal file size and smooth playback.']
  }
];

export const CATEGORIES = [
  {
    id: 'image' as const,
    name: 'Image Converters',
    desc: 'Transform image formats, vectorize bitmaps, resize and convert with transparency.',
    accent: 'blue',
    icon: 'Image'
  },
  {
    id: 'document' as const,
    name: 'Document Converters',
    desc: 'Extract, format, and generate Word, PDF, and Excel documents seamlessly.',
    accent: 'emerald',
    icon: 'FileText'
  },
  {
    id: 'multimedia' as const,
    name: 'Audio & Video Tools',
    desc: 'Transcode video, extract audio tracks, create GIFs, and produce visualizer videos.',
    accent: 'amber',
    icon: 'Video'
  }
];
