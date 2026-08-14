import React from 'react';
import { Shield, Lock, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';
import { CONVERTERS, CATEGORIES } from '../../config/converters';

interface FooterProps {
  navigate: (route: string) => void;
  onSelectCategory?: (category: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate, onSelectCategory }) => {
  const handleCategoryClick = (catId: string) => {
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
    if (catId === 'image') navigate('/#images');
    else if (catId === 'document') navigate('/#documents');
    else if (catId === 'multimedia') navigate('/#multimedia');
    else navigate('/');
  };
  return (
    <footer className="bg-[#09090b] border-t border-[#27272a] text-[#a1a1aa] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Top Feature Bento 3-column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-8 border-b border-[#27272a]">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-[#18181b] border border-[#27272a]">
            <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white font-mono uppercase">100% Client Privacy</h4>
              <p className="text-[11px] text-[#a1a1aa] mt-1">
                Your files are decoded, converted, and rendered inside your browser heap memory. Nothing is sent to any remote server.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-[#18181b] border border-[#27272a]">
            <div className="w-8 h-8 rounded bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white font-mono uppercase">Hardware Accelerated</h4>
              <p className="text-[11px] text-[#a1a1aa] mt-1">
                Powered by WebAssembly, Canvas2D, Web Audio, and WebCodecs APIs for high-performance conversions.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-[#18181b] border border-[#27272a]">
            <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white font-mono uppercase">No Limits & No Paywalls</h4>
              <p className="text-[11px] text-[#a1a1aa] mt-1">
                No paywalls, no watermarks, no daily quotas, and no subscription traps. Pure client-side file utility.
              </p>
            </div>
          </div>
        </div>

        {/* Directory Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white text-xs font-bold font-mono">
                Ω
              </div>
              <span className="text-sm font-bold text-white">OmniConvert Hub</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#71717a]">
              The unified, privacy-first conversion hub. Convert images, documents, audio, and video directly inside your web browser.
            </p>
            <div className="inline-flex items-center gap-1.5 text-[10px] text-emerald-400 bg-[#18181b] border border-[#27272a] px-2.5 py-1 rounded font-mono">
              <CheckCircle2 className="w-3 h-3" />
              <span>Zero Document Retention</span>
            </div>
          </div>

          {CATEGORIES.map((cat) => {
            const catTools = CONVERTERS.filter((c) => c.category === cat.id);
            return (
              <div key={cat.id} className="space-y-2.5">
                <button
                  onClick={() => handleCategoryClick(cat.id)}
                  className="text-[11px] font-bold uppercase tracking-wider text-white font-mono hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] text-[#71717a] font-normal">({catTools.length})</span>
                </button>
                <ul className="space-y-1.5 text-xs">
                  {catTools.map((tool) => (
                    <li key={tool.id}>
                      <button
                        onClick={() => navigate(tool.route)}
                        className="hover:text-indigo-400 transition-colors text-[#a1a1aa] hover:underline cursor-pointer text-left text-[11px]"
                      >
                        {tool.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#27272a] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#71717a] font-mono">
          <p>© {new Date().getFullYear()} OmniConvert Bento Suite. All processing executes on your local hardware.</p>
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate('/pricing')}
              className="hover:text-indigo-400 transition-colors flex items-center gap-1 cursor-pointer text-indigo-300"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              Pricing & Proof Upload
            </button>
            <button
              onClick={() => navigate('/admin')}
              className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer text-[#a1a1aa]"
            >
              <Shield className="w-3 h-3 text-indigo-400" />
              Admin
            </button>
            <button
              onClick={() => navigate('/privacy')}
              className="hover:text-[#fafafa] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Lock className="w-3 h-3 text-emerald-400" />
              Privacy Architecture
            </button>
            <button
              onClick={() => navigate('/')}
              className="hover:text-[#fafafa] transition-colors cursor-pointer"
            >
              All 12 Modules
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
