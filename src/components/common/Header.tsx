import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Menu, 
  X, 
  Image as ImageIcon, 
  FileText, 
  Video, 
  Home, 
  Lock,
  Search,
  Crown,
  Shield
} from 'lucide-react';
import { CONVERTERS } from '../../config/converters';
import { UserMenu } from '../auth/UserMenu';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  currentRoute: string;
  selectedCategory?: string;
  navigate: (route: string) => void;
  onSelectCategory?: (category: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentRoute, 
  selectedCategory = 'all', 
  navigate,
  onSelectCategory 
}) => {
  const { setHistoryDrawerOpen, setProModalOpen, currentUser, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConverters = searchQuery.trim()
    ? CONVERTERS.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.fromFormat.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.toFormat.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleNav = (route: string) => {
    navigate(route);
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setSearchQuery('');
  };

  const handleCategoryNav = (cat: string) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    }
    if (cat === 'all') handleNav('/');
    else if (cat === 'image') handleNav('/#images');
    else if (cat === 'document') handleNav('/#documents');
    else if (cat === 'multimedia') handleNav('/#multimedia');
  };

  const isHome = currentRoute === '/';

  return (
    <header className="sticky top-0 z-50 bg-[#09090b]/90 backdrop-blur-md border-b border-[#27272a] text-[#fafafa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Engine Indicator */}
          <div 
            onClick={() => handleCategoryNav('all')}
            className="flex items-center gap-3 cursor-pointer group select-none"
            id="brand-logo-button"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform duration-200">
              Ω
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-semibold tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                  OmniConvert
                </span>
                <span className="text-[#71717a] font-normal text-xs">
                  v2.4.0
                </span>
              </div>
              <p className="text-[10px] text-[#a1a1aa] flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                CORE ENGINE: 100% LOCAL
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => handleCategoryNav('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                isHome && selectedCategory === 'all'
                  ? 'bg-[#27272a] text-white shadow-sm border border-[#3f3f46]' 
                  : 'text-[#a1a1aa] hover:text-white hover:bg-[#18181b]'
              }`}
              id="nav-home-btn"
            >
              <Home className="w-3.5 h-3.5 text-indigo-400" />
              Bento Hub
            </button>

            <button
              onClick={() => handleCategoryNav('image')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                isHome && selectedCategory === 'image'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-[#a1a1aa] hover:text-white hover:bg-[#18181b]'
              }`}
              id="nav-images-btn"
            >
              <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
              Images
            </button>

            <button
              onClick={() => handleCategoryNav('document')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                isHome && selectedCategory === 'document'
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-[#a1a1aa] hover:text-white hover:bg-[#18181b]'
              }`}
              id="nav-docs-btn"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              Documents
            </button>

            <button
              onClick={() => handleCategoryNav('multimedia')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                isHome && selectedCategory === 'multimedia'
                  ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-[#a1a1aa] hover:text-white hover:bg-[#18181b]'
              }`}
              id="nav-media-btn"
            >
              <Video className="w-3.5 h-3.5 text-amber-400" />
              Media
            </button>

            <button
              onClick={() => handleNav('/privacy')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentRoute === '/privacy' 
                  ? 'bg-[#27272a] text-white shadow-sm border border-[#3f3f46]' 
                  : 'text-[#a1a1aa] hover:text-white hover:bg-[#18181b]'
              }`}
              id="nav-privacy-btn"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              Privacy
            </button>

            <button
              onClick={() => handleNav('/pricing')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentRoute === '/pricing' 
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm' 
                  : 'text-[#a1a1aa] hover:text-white hover:bg-[#18181b]'
              }`}
              id="nav-pricing-btn"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              Pricing & Proof
            </button>

            {isAdmin && (
              <button
                onClick={() => handleNav('/admin')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentRoute === '/admin' 
                    ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40 shadow-sm' 
                    : 'text-amber-400 hover:text-amber-300 hover:bg-[#18181b]'
                }`}
                id="nav-admin-btn"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                Admin Panel
              </button>
            )}
          </nav>

          {/* Quick Search & User Menu */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="bg-[#18181b] hover:bg-[#27272a] text-[#fafafa] text-xs font-semibold py-1.5 px-3 rounded-md border border-[#27272a] flex items-center gap-2 transition-all cursor-pointer"
              id="quick-search-trigger"
            >
              <Search className="w-3.5 h-3.5 text-[#a1a1aa]" />
              <span>Search Tools</span>
              <kbd className="px-1.5 py-0.2 rounded bg-[#09090b] text-[10px] text-[#a1a1aa] border border-[#27272a] font-mono">⌘K</kbd>
            </button>

            {/* Firebase Auth & User Menu */}
            <UserMenu />
          </div>

          {/* Mobile hamburger & User trigger */}
          <div className="flex lg:hidden items-center gap-2">
            <UserMenu />

            <button
              onClick={() => setSearchOpen(true)}
              className="p-1.5 rounded-md bg-[#18181b] border border-[#27272a] text-[#a1a1aa] hover:text-white"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md bg-[#18181b] border border-[#27272a] text-[#a1a1aa] hover:text-white"
              aria-label="Toggle menu"
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#18181b] border-b border-[#27272a] px-4 pt-2 pb-6 space-y-1.5">
          <button
            onClick={() => handleCategoryNav('all')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md flex items-center gap-3 font-medium text-xs cursor-pointer ${
              isHome && selectedCategory === 'all'
                ? 'bg-[#27272a] text-white border border-[#3f3f46]'
                : 'text-[#fafafa] hover:bg-[#27272a]'
            }`}
          >
            <Home className="w-4 h-4 text-indigo-400" />
            Bento Hub (All 12 Tools)
          </button>
          <button
            onClick={() => handleCategoryNav('image')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md flex items-center gap-3 font-medium text-xs cursor-pointer ${
              isHome && selectedCategory === 'image'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-[#fafafa] hover:bg-[#27272a]'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-indigo-400" />
            Image Converters
          </button>
          <button
            onClick={() => handleCategoryNav('document')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md flex items-center gap-3 font-medium text-xs cursor-pointer ${
              isHome && selectedCategory === 'document'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                : 'text-[#fafafa] hover:bg-[#27272a]'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            Document Converters
          </button>
          <button
            onClick={() => handleCategoryNav('multimedia')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md flex items-center gap-3 font-medium text-xs cursor-pointer ${
              isHome && selectedCategory === 'multimedia'
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
                : 'text-[#fafafa] hover:bg-[#27272a]'
            }`}
          >
            <Video className="w-4 h-4 text-amber-400" />
            Audio & Video Tools
          </button>
          <button
            onClick={() => handleNav('/privacy')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md flex items-center gap-3 font-medium text-xs cursor-pointer ${
              currentRoute === '/privacy'
                ? 'bg-[#27272a] text-white border border-[#3f3f46]'
                : 'text-[#fafafa] hover:bg-[#27272a]'
            }`}
          >
            <Lock className="w-4 h-4 text-emerald-400" />
            Privacy Architecture
          </button>

          <button
            onClick={() => handleNav('/pricing')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md flex items-center gap-3 font-medium text-xs cursor-pointer ${
              currentRoute === '/pricing'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-[#fafafa] hover:bg-[#27272a]'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-400" />
            Pricing & Proof Upload
          </button>

          {isAdmin && (
            <button
              onClick={() => handleNav('/admin')}
              className={`w-full text-left px-3.5 py-2.5 rounded-md flex items-center gap-3 font-medium text-xs cursor-pointer ${
                currentRoute === '/admin'
                  ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40'
                  : 'text-amber-400 hover:bg-[#27272a]'
              }`}
            >
              <Shield className="w-4 h-4 text-amber-400" />
              Admin Panel
            </button>
          )}

          {currentUser && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setHistoryDrawerOpen(true);
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-md text-[#fafafa] hover:bg-[#27272a] flex items-center gap-3 font-medium text-xs border-t border-[#27272a]/60 pt-3"
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              Conversion History
            </button>
          )}

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setProModalOpen(true);
            }}
            className="w-full text-left px-3.5 py-2.5 rounded-md text-amber-300 hover:bg-[#27272a] flex items-center gap-3 font-medium text-xs font-mono"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            OmniConvert Pro
          </button>
        </div>
      )}

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="w-full max-w-xl bg-[#18181b] border border-[#27272a] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[#27272a] flex items-center gap-3">
              <Search className="w-4 h-4 text-[#a1a1aa]" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools (e.g. Video to GIF, HEIC, PDF to Word, MP3)..."
                className="w-full bg-transparent text-[#fafafa] placeholder-[#71717a] focus:outline-none text-sm"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded-md text-[#a1a1aa] hover:text-white hover:bg-[#27272a]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {(searchQuery ? filteredConverters : CONVERTERS).map((tool) => (
                <div
                  key={tool.id}
                  onClick={() => handleNav(tool.route)}
                  className="p-3 rounded-lg hover:bg-[#27272a] cursor-pointer flex items-center justify-between group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-[#09090b] border border-[#27272a] flex items-center justify-center text-indigo-400 group-hover:border-indigo-500/50">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[#fafafa] group-hover:text-indigo-400">
                        {tool.name}
                      </h4>
                      <p className="text-[11px] text-[#71717a] line-clamp-1">{tool.shortDesc}</p>
                    </div>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-[#09090b] text-[#a1a1aa] border border-[#27272a] font-mono">
                    {tool.fromFormat} → {tool.toFormat}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
