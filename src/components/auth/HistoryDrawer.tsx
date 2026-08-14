import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  Trash2, 
  ArrowRight, 
  HardDrive, 
  Sparkles,
  ShieldCheck,
  Search,
  ExternalLink,
  Filter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatBytes } from '../../utils/fileUtils';
import { CONVERTERS } from '../../config/converters';

interface HistoryDrawerProps {
  navigate?: (route: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({ navigate }) => {
  const { 
    historyDrawerOpen, 
    setHistoryDrawerOpen, 
    history, 
    deleteHistoryItem,
    isPro,
    setProModalOpen,
    currentUser
  } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'document' | 'video' | 'audio'>('all');

  if (!historyDrawerOpen) return null;

  const filteredHistory = history.filter((item) => {
    const matchesSearch = 
      item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.fromFormat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.toFormat.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterType === 'all') return true;

    const from = item.fromFormat.toLowerCase();
    const to = item.toFormat.toLowerCase();

    if (filterType === 'image') {
      return ['heic', 'webp', 'png', 'svg', 'jpg', 'jpeg'].some(f => from.includes(f) || to.includes(f));
    }
    if (filterType === 'document') {
      return ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv'].some(f => from.includes(f) || to.includes(f));
    }
    if (filterType === 'video' || filterType === 'audio') {
      return ['mp4', 'mov', 'mp3', 'wav', 'gif', 'webm', 'm4a'].some(f => from.includes(f) || to.includes(f));
    }
    return true;
  });

  const totalSavedBytes = history.reduce((acc, item) => acc + (item.fileSize || 0), 0);

  const handleLaunchTool = (item: any) => {
    if (!navigate) return;
    const matched = CONVERTERS.find(c => 
      c.fromFormat.toLowerCase().includes(item.fromFormat.toLowerCase()) ||
      c.toFormat.toLowerCase().includes(item.toFormat.toLowerCase())
    );
    if (matched) {
      navigate(matched.route);
      setHistoryDrawerOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
      <div 
        className="w-full max-w-md bg-[#18181b] border-l border-[#27272a] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 text-[#fafafa]"
        id="history-drawer"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#27272a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Conversion History
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-[#09090b] text-[#a1a1aa] border border-[#27272a]">
                  {history.length} {history.length === 1 ? 'record' : 'records'}
                </span>
              </div>
              <p className="text-[11px] text-[#71717a] font-mono">
                Persisted in Firestore user database
              </p>
            </div>
          </div>
          <button
            onClick={() => setHistoryDrawerOpen(false)}
            className="p-1 rounded-md text-[#a1a1aa] hover:text-white hover:bg-[#27272a] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pro Banner if not Pro */}
        {!isPro && (
          <div className="m-4 p-3.5 rounded-lg bg-gradient-to-r from-indigo-950/60 to-[#18181b] border border-indigo-500/30 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white font-mono">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>OmniConvert Pro</span>
              </div>
              <p className="text-[11px] text-[#a1a1aa]">
                Unlock unlimited conversion logs & priority WASM threads.
              </p>
            </div>
            <button
              onClick={() => {
                setHistoryDrawerOpen(false);
                setProModalOpen(true);
              }}
              className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] font-mono whitespace-nowrap cursor-pointer shadow-sm"
            >
              Upgrade
            </button>
          </div>
        )}

        {/* Search & Filter Bar */}
        {history.length > 0 && (
          <div className="px-4 pt-1 pb-3 space-y-2.5 border-b border-[#27272a]/60">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#71717a] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search history by name or format..."
                className="w-full bg-[#09090b] border border-[#27272a] focus:border-indigo-500 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#71717a] focus:outline-none font-mono"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px] font-mono">
              {(['all', 'image', 'document', 'video'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2.5 py-1 rounded capitalize transition-all cursor-pointer ${
                    filterType === t
                      ? 'bg-[#27272a] text-white border border-[#3f3f46]'
                      : 'bg-[#09090b] text-[#a1a1aa] border border-[#27272a] hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* List of History items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3 bg-[#09090b] rounded-xl border border-[#27272a]">
              <div className="w-12 h-12 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#71717a]">
                <Clock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-white">
                  {searchQuery ? 'No matching conversions' : 'No conversions recorded yet'}
                </h4>
                <p className="text-[11px] text-[#71717a] max-w-xs">
                  {searchQuery 
                    ? `No record matched "${searchQuery}".` 
                    : 'Whenever you convert an image, document, or video, your conversion records will automatically appear here.'}
                </p>
              </div>
            </div>
          ) : (
            filteredHistory.map((item) => {
              const dateStr = new Date(item.createdAt).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-lg bg-[#09090b] border border-[#27272a] hover:border-[#3f3f46] transition-all space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 uppercase">
                          {item.fromFormat} → {item.toFormat}
                        </span>
                        <span className="text-[10px] text-[#71717a] font-mono">{dateStr}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-white truncate font-mono mt-1">
                        {item.fileName}
                      </h4>
                      <p className="text-[10px] text-[#71717a] truncate">
                        Source: {item.originalName}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {navigate && (
                        <button
                          onClick={() => handleLaunchTool(item)}
                          className="p-1 rounded text-[#71717a] hover:text-indigo-400 hover:bg-[#18181b] transition-colors cursor-pointer"
                          title="Open converter module"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteHistoryItem(item.id)}
                        className="p-1 rounded text-[#71717a] hover:text-rose-400 hover:bg-[#18181b] transition-colors cursor-pointer opacity-80 group-hover:opacity-100"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#27272a] flex items-center justify-between text-[11px] font-mono">
                    <div className="flex items-center gap-1.5 text-[#a1a1aa]">
                      <HardDrive className="w-3 h-3 text-[#71717a]" />
                      <span>{formatBytes(item.originalSize)}</span>
                      <ArrowRight className="w-2.5 h-2.5 text-[#71717a]" />
                      <span className="text-emerald-400 font-semibold">{formatBytes(item.fileSize)}</span>
                    </div>

                    <span className="text-[10px] text-emerald-400 font-semibold uppercase">
                      ● Processed
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer with Stats */}
        <div className="p-4 border-t border-[#27272a] bg-[#09090b] flex items-center justify-between text-[10px] text-[#71717a] font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Encrypted Firestore Sync</span>
          </div>
          <span>Total Processed: {formatBytes(totalSavedBytes)}</span>
        </div>
      </div>
    </div>
  );
};
