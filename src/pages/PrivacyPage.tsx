import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Cpu, 
  HardDrive, 
  EyeOff, 
  CheckCircle2, 
  ArrowLeft,
  Server,
  Sparkles
} from 'lucide-react';

interface PrivacyPageProps {
  navigate: (route: string) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ navigate }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2">
      
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#a1a1aa] hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Bento Hub
      </button>

      {/* Header Bento Box */}
      <div className="p-6 rounded-xl bg-[#18181b] border border-[#27272a] space-y-3">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>ZERO SERVER TRANSMISSION ARCHITECTURE</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
          Your files never leave your device.
        </h1>
        <p className="text-[#a1a1aa] text-xs sm:text-sm leading-relaxed max-w-2xl">
          OmniConvert Bento Suite was engineered on one uncompromising tenet: <strong>file transformations must execute purely within client browser runtime memory.</strong>
        </p>
      </div>

      {/* Bento 3-column Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-[#18181b] border border-[#27272a] space-y-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white font-mono uppercase">Zero Server Uploads</h3>
          <p className="text-xs text-[#a1a1aa] leading-relaxed">
            Your images, PDFs, Word docs, spreadsheets, and video files are decoded inside your browser sandbox. No file payload is ever sent over the internet.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#18181b] border border-[#27272a] space-y-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Cpu className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white font-mono uppercase">Hardware Compute</h3>
          <p className="text-xs text-[#a1a1aa] leading-relaxed">
            Powered by modern WebAssembly, Canvas 2D, Web Audio API, and native JavaScript decoders running directly on your CPU / GPU.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#18181b] border border-[#27272a] space-y-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <EyeOff className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white font-mono uppercase">Zero Telemetry</h3>
          <p className="text-xs text-[#a1a1aa] leading-relaxed">
            We don't inspect filenames, text contents, or photo metadata. Temporary browser memory buffers are cleared immediately after conversion.
          </p>
        </div>
      </div>

      {/* Technical Breakdown */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white uppercase font-mono tracking-wider">How Client-Side Conversion Works</h2>

        <div className="space-y-3 text-xs text-[#a1a1aa] leading-relaxed">
          <p>
            Historically, file conversion required heavy server software like ImageMagick, LibreOffice, and FFmpeg. Because running these required server infrastructure, users were forced to upload their confidential files to third-party web servers.
          </p>
          <p>
            With modern web standards (WebAssembly, TypedArrays, Canvas2D, and Web Audio), modern browsers can execute high-speed binary decoders and encoders directly in local RAM.
          </p>
        </div>

        <div className="pt-3 border-t border-[#27272a] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="flex items-start gap-2 text-[#fafafa] bg-[#09090b] p-3 rounded-lg border border-[#27272a]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>libheif WASM for HEIC stream decoding</span>
          </div>
          <div className="flex items-start gap-2 text-[#fafafa] bg-[#09090b] p-3 rounded-lg border border-[#27272a]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Client-side JS runtime for DOCX & PDF generation</span>
          </div>
          <div className="flex items-start gap-2 text-[#fafafa] bg-[#09090b] p-3 rounded-lg border border-[#27272a]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Raster pixel contour vectorization algorithms</span>
          </div>
          <div className="flex items-start gap-2 text-[#fafafa] bg-[#09090b] p-3 rounded-lg border border-[#27272a]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Native HTML5 Web Audio & Canvas frame extraction</span>
          </div>
        </div>
      </div>

      {/* Action Bento Card */}
      <div className="p-6 rounded-xl bg-[#18181b] border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white font-mono uppercase">Ready to convert files with complete privacy?</h3>
          <p className="text-xs text-[#a1a1aa] mt-1">Select from 12 image, document, audio, and video conversion modules.</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer whitespace-nowrap font-mono"
        >
          Explore All Modules
        </button>
      </div>
    </div>
  );
};
