import React from 'react';
import { ArrowLeft, Sparkles, CheckCircle, Lightbulb, HelpCircle, ShieldCheck } from 'lucide-react';
import { ConverterConfig } from '../types';

// All 12 Converter components
import { HeicToJpgConverter } from '../components/converters/HeicToJpgConverter';
import { WebpToPngConverter } from '../components/converters/WebpToPngConverter';
import { PngToSvgConverter } from '../components/converters/PngToSvgConverter';
import { SvgToPngConverter } from '../components/converters/SvgToPngConverter';
import { PdfToWordConverter } from '../components/converters/PdfToWordConverter';
import { WordToPdfConverter } from '../components/converters/WordToPdfConverter';
import { ExcelToPdfConverter } from '../components/converters/ExcelToPdfConverter';
import { ImageToPdfConverter } from '../components/converters/ImageToPdfConverter';
import { AudioToMp4Converter } from '../components/converters/AudioToMp4Converter';
import { VideoToMp3Converter } from '../components/converters/VideoToMp3Converter';
import { MovToMp4Converter } from '../components/converters/MovToMp4Converter';
import { VideoToGifConverter } from '../components/converters/VideoToGifConverter';

interface ConverterPageProps {
  config: ConverterConfig;
  navigate: (route: string) => void;
}

export const ConverterPage: React.FC<ConverterPageProps> = ({ config, navigate }) => {
  const renderConverterComponent = () => {
    switch (config.id) {
      case 'heic-to-jpg':
        return <HeicToJpgConverter config={config} />;
      case 'webp-to-png':
        return <WebpToPngConverter config={config} />;
      case 'png-to-svg':
        return <PngToSvgConverter config={config} />;
      case 'svg-to-png':
        return <SvgToPngConverter config={config} />;
      case 'pdf-to-word':
        return <PdfToWordConverter config={config} />;
      case 'word-to-pdf':
        return <WordToPdfConverter config={config} />;
      case 'excel-to-pdf':
        return <ExcelToPdfConverter config={config} />;
      case 'image-to-pdf':
        return <ImageToPdfConverter config={config} />;
      case 'audio-to-mp4':
        return <AudioToMp4Converter config={config} />;
      case 'video-to-mp3':
        return <VideoToMp3Converter config={config} />;
      case 'mov-to-mp4':
        return <MovToMp4Converter config={config} />;
      case 'video-to-gif':
        return <VideoToGifConverter config={config} />;
      default:
        return <div>Converter component not found.</div>;
    }
  };

  return (
    <div className="space-y-8 py-2">
      
      {/* Bento Breadcrumb & Header */}
      <div className="space-y-4 max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#a1a1aa] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Bento Hub
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#18181b] border border-[#27272a]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                {config.category.toUpperCase()} MODULE
              </span>
              {config.badge && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#09090b] text-[#a1a1aa] border border-[#27272a]">
                  {config.badge}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-3xl font-bold text-white tracking-tight">
              {config.name}
            </h1>
            <p className="text-xs text-[#a1a1aa] leading-relaxed max-w-2xl">
              {config.fullDesc}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#09090b] border border-[#27272a] text-xs text-[#fafafa] font-mono self-start sm:self-center">
            <span className="text-[#a1a1aa]">{config.fromFormat}</span>
            <span className="text-[#71717a]">→</span>
            <span className="text-indigo-400 font-bold">{config.toFormat}</span>
          </div>
        </div>
      </div>

      {/* Main Converter Interactive Shell */}
      <div>
        {renderConverterComponent()}
      </div>

      {/* How it works & Tips Bento Grid */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        
        {/* Steps */}
        <div className="p-5 rounded-xl bg-[#18181b] border border-[#27272a] space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            Execution Pipeline
          </h3>
          <ul className="space-y-2.5 text-xs text-[#a1a1aa]">
            {config.howItWorks.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded bg-[#09090b] text-indigo-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-[#27272a]">
                  {idx + 1}
                </span>
                <span className="leading-relaxed text-[#fafafa]">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Local device guarantee */}
        <div className="p-5 rounded-xl bg-[#18181b] border border-[#27272a] space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Isolated Sandbox Memory
            </h3>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              When processing files with this module, all bitstream operations occur inside your browser runtime. Zero socket or HTTP transmissions occur.
            </p>
            {config.tips && config.tips.length > 0 && (
              <div className="p-2.5 rounded-lg bg-[#09090b] border border-indigo-500/20 text-indigo-200 text-xs flex items-start gap-2">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{config.tips[0]}</span>
              </div>
            )}
          </div>

          <div className="pt-2 text-[11px] text-[#71717a] font-mono flex items-center gap-2 border-t border-[#27272a]">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Max stream size: {(config.maxFileSizeBytes / (1024 * 1024)).toFixed(0)} MB</span>
          </div>
        </div>
      </div>
    </div>
  );
};
