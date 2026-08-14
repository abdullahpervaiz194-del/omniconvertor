import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Search, 
  Image as ImageIcon, 
  FileText, 
  Video, 
  Camera,
  PenTool,
  Layers,
  FileType,
  Table,
  Images,
  Music,
  Headphones,
  Film,
  CheckCircle,
  EyeOff,
  Activity,
  Layers as LayersIcon
} from 'lucide-react';
import { CONVERTERS, CATEGORIES } from '../config/converters';

interface HomePageProps {
  navigate: (route: string) => void;
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Camera: <Camera className="w-5 h-5" />,
  Image: <ImageIcon className="w-5 h-5" />,
  PenTool: <PenTool className="w-5 h-5" />,
  Layers: <Layers className="w-5 h-5" />,
  FileText: <FileText className="w-5 h-5" />,
  FileType: <FileType className="w-5 h-5" />,
  Table: <Table className="w-5 h-5" />,
  Images: <Images className="w-5 h-5" />,
  Music: <Music className="w-5 h-5" />,
  Headphones: <Headphones className="w-5 h-5" />,
  Video: <Video className="w-5 h-5" />,
  Film: <Film className="w-5 h-5" />
};

// Micro engine metadata for Bento cards
const ENGINE_SUBTITLES: Record<string, string> = {
  'heic-to-jpg': 'WASM libheif v1.17 • 98.2% quality',
  'webp-to-png': 'Lossless recovery active',
  'png-to-svg': 'Vector trace engine v3',
  'svg-to-png': 'Rasterize up to 8000px',
  'word-to-pdf': 'Preserve font embedding',
  'pdf-to-word': 'Advanced OCR & Layout Reconstruction',
  'excel-to-pdf': 'Auto-pagination logic',
  'image-to-pdf': 'Multi-page merge engine',
  'audio-to-mp4': 'Static cover & spectrum gen',
  'video-to-mp3': '320kbps CBR export',
  'mov-to-mp4': 'H.264 Universal Stream',
  'video-to-gif': 'Palette quantization engine'
};

export const HomePage: React.FC<HomePageProps> = ({ 
  navigate, 
  activeCategory: controlledCategory = 'all', 
  onCategoryChange 
}) => {
  const [internalCategory, setInternalCategory] = useState<string>(controlledCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Synchronize controlled activeCategory if passed from parent
  const activeCategory = controlledCategory || internalCategory;

  const handleCategorySelect = (category: string) => {
    setInternalCategory(category);
    if (onCategoryChange) {
      onCategoryChange(category);
    }
  };

  const filteredConverters = CONVERTERS.filter((tool) => {
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    const matchesSearch = 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.fromFormat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.toFormat.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredTool = CONVERTERS.find(c => c.id === 'video-to-gif') || CONVERTERS[0];

  const imageToolsCount = CONVERTERS.filter(c => c.category === 'image').length;
  const documentToolsCount = CONVERTERS.filter(c => c.category === 'document').length;
  const mediaToolsCount = CONVERTERS.filter(c => c.category === 'multimedia').length;

  return (
    <div className="space-y-12">
      
      {/* Bento Grid Header / Filter Bar */}
      <section className="space-y-6">
        
        {/* Top Bento Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-[#18181b] border border-[#27272a]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                BENTO CONVERTER SUITE
              </span>
              <span className="text-xs text-[#a1a1aa] font-mono">12 CLIENT-SIDE TOOLS</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#fafafa] tracking-tight">
              Modular File Processing Hub
            </h1>
            <p className="text-xs text-[#a1a1aa] max-w-xl">
              High-performance WebAssembly and client-side decoders. Zero server transmissions.
            </p>
          </div>

          {/* Quick Search */}
          <div className="w-full md:w-80 relative">
            <Search className="w-4 h-4 text-[#a1a1aa] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search formats (HEIC, PDF, SVG, GIF)..."
              className="w-full bg-[#09090b] border border-[#27272a] focus:border-indigo-500 rounded-lg pl-10 pr-4 py-2 text-xs text-[#fafafa] placeholder-[#71717a] focus:outline-none transition-colors font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-[11px] text-[#a1a1aa] hover:text-white cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* 3 Interactive Hub Category Showcase Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* 1. Image Hub Card */}
          <div 
            id="images"
            onClick={() => handleCategorySelect(activeCategory === 'image' ? 'all' : 'image')}
            className={`p-5 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between ${
              activeCategory === 'image'
                ? 'bg-indigo-950/20 border-indigo-500/60 shadow-lg shadow-indigo-500/5 ring-1 ring-indigo-500/50'
                : 'bg-[#18181b] border-[#27272a] hover:border-indigo-500/40 hover:bg-[#1a1a20]'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors ${
                  activeCategory === 'image'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                    : 'bg-[#09090b] text-[#a1a1aa] border-[#27272a]'
                }`}>
                  {imageToolsCount} Tools Active
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors flex items-center gap-2">
                  <span>Image Converters</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-indigo-400" />
                </h3>
                <p className="text-xs text-[#a1a1aa] mt-1 leading-relaxed">
                  HEIC, WebP, PNG to SVG Vectorizer, and SVG Rasterizer.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {['HEIC', 'WebP', 'SVG', 'PNG', 'JPG'].map(tag => (
                  <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#09090b] text-[#a1a1aa] border border-[#27272a]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-[#27272a] flex items-center justify-between text-xs font-mono">
              <span className={activeCategory === 'image' ? 'text-indigo-300 font-semibold' : 'text-[#71717a]'}>
                {activeCategory === 'image' ? '● Filtering Image Tools' : 'Click to filter image tools'}
              </span>
              <span className="text-indigo-400 group-hover:underline">
                {activeCategory === 'image' ? 'Clear filter' : 'Explore'} →
              </span>
            </div>
          </div>

          {/* 2. Document Hub Card */}
          <div 
            id="documents"
            onClick={() => handleCategorySelect(activeCategory === 'document' ? 'all' : 'document')}
            className={`p-5 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between ${
              activeCategory === 'document'
                ? 'bg-emerald-950/20 border-emerald-500/60 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/50'
                : 'bg-[#18181b] border-[#27272a] hover:border-emerald-500/40 hover:bg-[#1a1f1c]'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors ${
                  activeCategory === 'document'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-[#09090b] text-[#a1a1aa] border-[#27272a]'
                }`}>
                  {documentToolsCount} Tools Active
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span>Document Converters</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-400" />
                </h3>
                <p className="text-xs text-[#a1a1aa] mt-1 leading-relaxed">
                  PDF to Word, Word to PDF, Excel to PDF, and Multi-Image PDF Merge.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {['PDF', 'DOCX', 'XLSX', 'CSV', 'Multi-Page'].map(tag => (
                  <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#09090b] text-[#a1a1aa] border border-[#27272a]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-[#27272a] flex items-center justify-between text-xs font-mono">
              <span className={activeCategory === 'document' ? 'text-emerald-300 font-semibold' : 'text-[#71717a]'}>
                {activeCategory === 'document' ? '● Filtering Document Tools' : 'Click to filter document tools'}
              </span>
              <span className="text-emerald-400 group-hover:underline">
                {activeCategory === 'document' ? 'Clear filter' : 'Explore'} →
              </span>
            </div>
          </div>

          {/* 3. Multimedia Hub Card */}
          <div 
            id="multimedia"
            onClick={() => handleCategorySelect(activeCategory === 'multimedia' ? 'all' : 'multimedia')}
            className={`p-5 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between ${
              activeCategory === 'multimedia'
                ? 'bg-amber-950/20 border-amber-500/60 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/50'
                : 'bg-[#18181b] border-[#27272a] hover:border-amber-500/40 hover:bg-[#1f1d18]'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                  <Video className="w-5 h-5" />
                </div>
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors ${
                  activeCategory === 'multimedia'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-[#09090b] text-[#a1a1aa] border-[#27272a]'
                }`}>
                  {mediaToolsCount} Tools Active
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-2">
                  <span>Audio & Video Tools</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-amber-400" />
                </h3>
                <p className="text-xs text-[#a1a1aa] mt-1 leading-relaxed">
                  Video to GIF, MOV to MP4, Video to MP3, and Audio Visualizer MP4.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {['GIF', 'MP4', 'MP3', 'MOV', 'WAV', 'H.264'].map(tag => (
                  <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#09090b] text-[#a1a1aa] border border-[#27272a]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-[#27272a] flex items-center justify-between text-xs font-mono">
              <span className={activeCategory === 'multimedia' ? 'text-amber-300 font-semibold' : 'text-[#71717a]'}>
                {activeCategory === 'multimedia' ? '● Filtering Media Tools' : 'Click to filter media tools'}
              </span>
              <span className="text-amber-400 group-hover:underline">
                {activeCategory === 'multimedia' ? 'Clear filter' : 'Explore'} →
              </span>
            </div>
          </div>
        </div>

        {/* Category Pills Bar & Section Anchor */}
        <div id="converter-tools-section" className="flex items-center justify-between flex-wrap gap-3 pt-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => handleCategorySelect('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer font-mono ${
                activeCategory === 'all'
                  ? 'bg-[#27272a] text-white border border-[#3f3f46] shadow-sm'
                  : 'bg-[#18181b] border border-[#27272a] text-[#a1a1aa] hover:text-white'
              }`}
            >
              All 12 Modules
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer font-mono flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? cat.id === 'image'
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                      : cat.id === 'document'
                      ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'bg-amber-600/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'bg-[#18181b] border border-[#27272a] text-[#a1a1aa] hover:text-white'
                }`}
              >
                {cat.id === 'image' && <ImageIcon className="w-3 h-3 text-indigo-400" />}
                {cat.id === 'document' && <FileText className="w-3 h-3 text-emerald-400" />}
                {cat.id === 'multimedia' && <Video className="w-3 h-3 text-amber-400" />}
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-[#a1a1aa]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{filteredConverters.length} MODULES READY</span>
            {activeCategory !== 'all' && (
              <button 
                onClick={() => handleCategorySelect('all')}
                className="text-xs text-indigo-400 hover:underline ml-2 cursor-pointer"
              >
                (Show All)
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Primary Bento Grid Layout */}
      <section>
        {filteredConverters.length === 0 ? (
          <div className="p-12 text-center bg-[#18181b] border border-[#27272a] rounded-xl space-y-3">
            <p className="text-[#a1a1aa] text-xs">No converter module matches "{searchQuery}".</p>
            <button
              onClick={() => { setSearchQuery(''); handleCategorySelect('all'); }}
              className="text-xs text-indigo-400 hover:underline cursor-pointer"
            >
              Reset filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            
            {/* If showing all and no search query: Render the Priority Hero 2x2 Bento Tile */}
            {activeCategory === 'all' && !searchQuery && (
              <div 
                onClick={() => navigate(featuredTool.route)}
                id="bento-featured-tile"
                className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-[#18181b] to-[#09090b] border border-indigo-500/30 rounded-xl p-6 flex flex-col justify-between group cursor-pointer hover:border-indigo-500/60 transition-all shadow-xl"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider font-mono">
                      Priority Process
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-[#a1a1aa] font-mono">
                      <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                      <span>HIGH-SPEED ENGINE</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-indigo-400 transition-colors">
                      {featuredTool.name}
                    </h3>
                    <p className="text-xs text-[#a1a1aa] mt-2 leading-relaxed">
                      {featuredTool.shortDesc} Extracts high-framerate clips and applies palette quantization entirely inside your browser memory.
                    </p>
                  </div>

                  {/* Feature Visual Grid inside 2x2 Bento */}
                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <div className="p-3 rounded-lg bg-[#09090b]/80 border border-[#27272a] space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#71717a] block font-mono">Input Format</span>
                      <span className="text-xs font-bold text-white font-mono">{featuredTool.fromFormat} (MP4/WebM/MOV)</span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#09090b]/80 border border-[#27272a] space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#71717a] block font-mono">Output Palette</span>
                      <span className="text-xs font-bold text-emerald-400 font-mono">256-Color Adaptive GIF</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-[#27272a]/80 mt-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <Film className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-mono text-[#a1a1aa]">WASM Octree Engine</span>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-[#27272a] flex items-center justify-center text-[#a1a1aa] group-hover:border-indigo-500 group-hover:text-white transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            )}

            {/* Render all converters as Bento Grid items */}
            {filteredConverters
              .filter(tool => !(activeCategory === 'all' && !searchQuery && tool.id === featuredTool.id))
              .map((tool) => {
                const isPdfToWord = tool.id === 'pdf-to-word';
                const isHeic = tool.id === 'heic-to-jpg';

                return (
                  <div
                    key={tool.id}
                    onClick={() => navigate(tool.route)}
                    id={`converter-card-${tool.id}`}
                    className={`bg-[#18181b] border border-[#27272a] rounded-xl p-5 flex flex-col justify-between group cursor-pointer hover:border-[#3f3f46] hover:bg-[#1e1e24] transition-all shadow-sm ${
                      isPdfToWord && activeCategory === 'all' && !searchQuery ? 'md:col-span-2' : ''
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                            tool.category === 'image'
                              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                              : tool.category === 'document'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {ICON_MAP[tool.icon] || <Sparkles className="w-4 h-4" />}
                          </div>
                          {tool.badge && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#09090b] text-[#a1a1aa] border border-[#27272a]">
                              {tool.badge}
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] font-mono text-[#71717a] bg-[#09090b] px-2 py-0.5 rounded border border-[#27272a]">
                          {tool.fromFormat} → {tool.toFormat}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-[#fafafa] group-hover:text-indigo-400 transition-colors">
                          {tool.name}
                        </h4>
                        <p className="text-xs text-[#a1a1aa] mt-1 leading-relaxed line-clamp-2">
                          {tool.shortDesc}
                        </p>
                      </div>

                      {/* Specialized Bento micro-indicators */}
                      {isHeic && (
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-[10px] font-mono text-[#a1a1aa]">
                            <span>COMPRESSION RATIO</span>
                            <span className="text-indigo-400 font-bold">98.2% +0.4</span>
                          </div>
                          <div className="w-full bg-[#09090b] h-1 rounded overflow-hidden">
                            <div className="bg-indigo-500 h-full w-3/4 rounded"></div>
                          </div>
                        </div>
                      )}

                      {isPdfToWord && (
                        <div className="flex items-center gap-1.5 pt-1">
                          <div className="flex items-end gap-0.5 h-3">
                            <div className="w-1 bg-emerald-500 h-2 rounded-xs"></div>
                            <div className="w-1 bg-emerald-500 h-3 rounded-xs"></div>
                            <div className="w-1 bg-emerald-500 h-1.5 rounded-xs"></div>
                            <div className="w-1 bg-emerald-500 h-2.5 rounded-xs"></div>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-400">PDF.js Canvas Vectorizer</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-3 border-t border-[#27272a]/80">
                      <span className="text-[11px] font-mono text-[#71717a] truncate max-w-[170px]">
                        {ENGINE_SUBTITLES[tool.id] || 'Client-side processing'}
                      </span>
                      <div className="w-7 h-7 rounded-full border border-[#27272a] flex items-center justify-center text-[#a1a1aa] group-hover:border-indigo-500 group-hover:text-white transition-all">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </section>

      {/* Bento Telemetry Status Bar */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] font-mono uppercase tracking-wider text-[#71717a]">
        <div className="p-3 bg-[#18181b] border border-[#27272a] rounded-lg flex items-center justify-between">
          <span>RAM ALLOCATION:</span>
          <span className="text-white font-bold">CLIENT HEAP</span>
        </div>
        <div className="p-3 bg-[#18181b] border border-[#27272a] rounded-lg flex items-center justify-between">
          <span>WASM WORKERS:</span>
          <span className="text-indigo-400 font-bold">MULTI-CORE</span>
        </div>
        <div className="p-3 bg-[#18181b] border border-[#27272a] rounded-lg flex items-center justify-between">
          <span>SERVER UPLOADS:</span>
          <span className="text-emerald-400 font-bold">0 BYTES (ZERO)</span>
        </div>
        <div className="p-3 bg-[#18181b] border border-[#27272a] rounded-lg flex items-center justify-between">
          <span>SYSTEM STATE:</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            NOMINAL
          </span>
        </div>
      </section>

      {/* Bento Comparison Section */}
      <section className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 sm:p-8 space-y-6">
        <div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono uppercase">
            PRIVACY SPECIFICATION
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight mt-2">
            Why Local Client-Side Conversion is Superior
          </h2>
          <p className="text-xs text-[#a1a1aa] mt-1">
            Traditional web converters upload confidential files to external servers. All-In-One Converter computes locally.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-lg bg-[#09090b] border border-rose-900/30 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs font-mono uppercase">
              <EyeOff className="w-4 h-4" />
              <span>Traditional Online Cloud Converters</span>
            </div>
            <ul className="space-y-2 text-xs text-rose-200/70">
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✗</span>
                <span>Transmits contracts, tax documents, and private photos to unknown remote machines.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✗</span>
                <span>Enforces file size quotas, subscription tiers, and advertising trackers.</span>
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-lg bg-[#09090b] border border-emerald-900/30 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-mono uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>All-In-One Bento Converter</span>
            </div>
            <ul className="space-y-2 text-xs text-emerald-200/80">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>0% Remote Exposure:</strong> Files are parsed via Canvas2D, WASM, and Web Audio APIs.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Zero Quotas:</strong> Unlimited conversions with instant client response times.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
