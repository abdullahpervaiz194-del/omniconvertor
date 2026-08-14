import React from 'react';
import { ShieldCheck, Lock, HardDrive, CheckCircle } from 'lucide-react';

export const PrivacyBadge: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#09090b] border border-emerald-500/30 text-emerald-300 text-xs font-mono">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>100% Client-Side • Local Device Memory</span>
      </div>
    );
  }

  return (
    <div className="w-full p-4 rounded-xl bg-[#18181b] border border-[#27272a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#a1a1aa]">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
          <Lock className="w-3.5 h-3.5" />
        </div>
        <div>
          <span className="font-semibold text-white block font-mono">Sandbox Privacy Guarantee</span>
          <span className="text-[11px]">All stream execution runs 100% inside your browser using WebAssembly.</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] self-end sm:self-center">
        <CheckCircle className="w-3.5 h-3.5" />
        <span>0 bytes sent to servers</span>
      </div>
    </div>
  );
};
